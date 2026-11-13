import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, readlink, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

export const markerName = 'preview-build.json';
export const publicReceiptName = 'preview-verification.json';
export const browsers = ['chromium', 'firefox', 'webkit'];
export const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const git = (root, args, raw = false) => {
  const result = execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  return raw ? result : result.trim();
};
const ordered = (items) => [...items].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const sourceFields = (source) => ({
  sourceBaseCommit: source.sourceBaseCommit,
  sourceTree: source.sourceTree,
  sourceSha256: source.sourceSha256,
  includesWorkingTree: source.includesWorkingTree,
});
export function assertSameSource(expected, actual) {
  assert.deepEqual(
    sourceFields(actual),
    sourceFields(expected),
    'Pages source changed or build is stale. Rebuild from the intended commit.',
  );
}

export async function sourceFingerprint(root, paths) {
  const records = [];
  for (const path of ordered(paths)) {
    let info;
    try {
      info = await lstat(join(root, path));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      records.push([path, 'missing']);
      continue;
    }
    if (info.isSymbolicLink()) {
      const target = await readlink(join(root, path));
      const destination = relative(root, resolve(dirname(join(root, path)), target));
      assert(
        !isAbsolute(target) &&
          destination !== '..' &&
          !destination.startsWith('../') &&
          !isAbsolute(destination),
        `Pages source symlink must stay inside the snapshot: ${path}`,
      );
      records.push([path, 'symlink', target]);
      continue;
    }
    assert(info.isFile(), `Pages source must be a regular file: ${path}`);
    records.push([
      path,
      info.mode & 0o111 ? 'executable' : 'file',
      digest(await readFile(join(root, path))),
    ]);
  }
  return digest(JSON.stringify(records));
}
export async function captureSource(root) {
  const sourceBaseCommit = git(root, ['rev-parse', 'HEAD']);
  const sourceTree = git(root, ['rev-parse', 'HEAD^{tree}']);
  const before = git(root, ['status', '--porcelain=v1', '--untracked-files=all']);
  const paths = ordered(
    new Set(
      git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], true)
        .split('\0')
        .filter(Boolean),
    ),
  );
  const sourceSha256 = await sourceFingerprint(root, paths);
  const after = git(root, ['status', '--porcelain=v1', '--untracked-files=all']);
  assert.equal(
    git(root, ['rev-parse', 'HEAD']),
    sourceBaseCommit,
    'Commit changed while capturing Pages source.',
  );
  assert.equal(before, after, 'Working tree changed while capturing Pages source.');
  return { sourceBaseCommit, sourceTree, sourceSha256, includesWorkingTree: Boolean(after), paths };
}

/** Includes every emitted file, including notices and .nojekyll; excludes only its own marker. */
export async function artifactFingerprint(directory) {
  const files = [];
  async function visit(relative = '') {
    for (const name of ordered(await readdir(join(directory, relative)))) {
      const path = relative ? `${relative}/${name}` : name;
      if (path === markerName) continue;
      const info = await lstat(join(directory, path));
      assert(!info.isSymbolicLink(), `Pages artifact cannot contain symlinks: ${path}`);
      if (info.isDirectory()) await visit(path);
      else {
        assert(info.isFile(), `Unsupported Pages artifact entry: ${path}`);
        const bytes = await readFile(join(directory, path));
        files.push({ path, bytes: bytes.length, sha256: digest(bytes) });
      }
    }
  }
  await visit();
  assert(
    files.some((file) => file.path === 'index.html'),
    'Pages artifact must contain index.html.',
  );
  return {
    sha256: digest(JSON.stringify(files)),
    fileCount: files.length,
    bytes: files.reduce((sum, file) => sum + file.bytes, 0),
    files,
  };
}
export const receiptPath = (directory) => join(dirname(directory), 'pages-verification.json');
export async function invalidateBuild(directory) {
  await rm(join(directory, markerName), { force: true });
  await rm(receiptPath(directory), { force: true });
}
export async function sealBuild(root, directory, source, toolchain, buildStartedAt) {
  assertSameSource(source, await captureSource(root));
  const baseHref = JSON.parse(await readFile(join(root, 'angular.json'), 'utf8')).projects
    .playground.architect.build.configurations.pages.baseHref;
  const artifact = await artifactFingerprint(directory);
  assert(
    !artifact.files.some((file) => file.path === publicReceiptName),
    'Build output uses a reserved verification metadata filename.',
  );
  const marker = {
    schemaVersion: 1,
    buildStartedAt,
    builtAt: new Date().toISOString(),
    ...sourceFields(source),
    toolchain,
    baseHref,
    artifact,
  };
  await writeFile(join(directory, markerName), JSON.stringify(marker, null, 2) + '\n');
  return marker;
}
export function parseMarker(bytes) {
  let marker;
  try {
    marker = JSON.parse(bytes);
  } catch (cause) {
    throw new Error('Missing or invalid build-time Pages provenance. Run npm run build:pages.', {
      cause,
    });
  }
  assert.equal(marker.schemaVersion, 1, 'Legacy Pages marker cannot be published; rebuild it.');
  assert(
    /^[a-f0-9]{40,64}$/.test(marker.sourceBaseCommit) && /^[a-f0-9]{64}$/.test(marker.sourceSha256),
    'Invalid Pages source identity.',
  );
  assert(
    typeof marker.includesWorkingTree === 'boolean' && Number.isFinite(Date.parse(marker.builtAt)),
    'Invalid Pages build metadata.',
  );
  assert(
    marker.artifact && /^[a-f0-9]{64}$/.test(marker.artifact.sha256),
    'Invalid Pages artifact identity.',
  );
  assert(
    Array.isArray(marker.artifact.files) &&
      marker.artifact.files.length === marker.artifact.fileCount,
    'Invalid Pages asset inventory.',
  );
  for (const file of marker.artifact.files) {
    assert(
      typeof file.path === 'string' &&
        !file.path.includes('\\') &&
        !file.path.startsWith('/') &&
        file.path.split('/').every((part) => part && part !== '.' && part !== '..'),
      'Invalid Pages asset path.',
    );
    assert(
      Number.isSafeInteger(file.bytes) && file.bytes >= 0 && /^[a-f0-9]{64}$/.test(file.sha256),
      'Invalid Pages asset digest.',
    );
  }
  assert.equal(
    digest(JSON.stringify(marker.artifact.files)),
    marker.artifact.sha256,
    'Pages inventory digest is invalid.',
  );
  return marker;
}
export async function readMarker(directory) {
  try {
    return parseMarker(await readFile(join(directory, markerName), 'utf8'));
  } catch (cause) {
    throw new Error('Missing or invalid build-time Pages provenance. Run npm run build:pages.', {
      cause,
    });
  }
}
export async function validateBuild(root, directory, { clean = false, verified = false } = {}) {
  const marker = await readMarker(directory);
  const source = await captureSource(root);
  assertSameSource(marker, source);
  assert.deepEqual(
    await artifactFingerprint(directory),
    marker.artifact,
    'Pages artifact changed after build. Rebuild and recheck it.',
  );
  if (clean)
    assert(
      !marker.includesWorkingTree && !source.includesWorkingTree,
      'Publishing requires a clean committed build. Commit source changes, then rebuild/check.',
    );
  if (verified) {
    let receipt;
    try {
      receipt = JSON.parse(await readFile(receiptPath(directory), 'utf8'));
    } catch (cause) {
      throw new Error(
        'Pages artifact has no successful local verification receipt. Run npm run check:pages.',
        { cause },
      );
    }
    validateReceipt(receipt, digest(await readFile(join(directory, markerName))));
  }
  return marker;
}
export function validateReceipt(receipt, markerSha256) {
  assert.equal(receipt.schemaVersion, 1);
  assert.equal(
    receipt.markerSha256,
    markerSha256,
    'Verification receipt belongs to another Pages build. Recheck it.',
  );
  assert.deepEqual(
    receipt.browsers,
    browsers,
    'All three local browser checks must pass before publishing.',
  );
  assert(Number.isFinite(Date.parse(receipt.checkedAt)), 'Invalid Pages verification time.');
}
export async function recordVerification(root, directory, initialMarker) {
  const marker = await validateBuild(root, directory);
  assert.deepEqual(marker, initialMarker, 'Pages build changed while browser checks were running.');
  await writeFile(
    receiptPath(directory),
    JSON.stringify(
      {
        schemaVersion: 1,
        checkedAt: new Date().toISOString(),
        markerSha256: digest(await readFile(join(directory, markerName))),
        browsers,
      },
      null,
      2,
    ) + '\n',
  );
}
export function assertRemoteCommit(marker, remoteCommit) {
  assert.equal(
    marker.sourceBaseCommit,
    remoteCommit,
    'Pages source is not the current pushed main commit. Push/update main, then rebuild/check.',
  );
}

/** Public checks pin the source and compare every served asset with the build inventory. */
export async function verifyPublicBuild(
  root,
  site,
  expectedCommit = process.env.PAGES_EXPECTED_COMMIT ?? git(root, ['rev-parse', 'HEAD']),
) {
  const response = await fetch(new URL(markerName, site), { cache: 'no-store' });
  assert(response.ok, 'Public Pages marker is missing.');
  const bytes = await response.text(),
    marker = parseMarker(bytes);
  assert.equal(
    marker.sourceBaseCommit,
    expectedCommit,
    'Public Pages is serving another source commit.',
  );
  assert.equal(
    marker.includesWorkingTree,
    false,
    'Public Pages must identify a clean committed build.',
  );
  const local = await readMarker(join(root, 'dist/pages/browser')).catch(() => null);
  if (local?.sourceBaseCommit === expectedCommit)
    assert.deepEqual(
      marker,
      local,
      'Public Pages is serving another build of the intended commit.',
    );
  const proof = await fetch(new URL(publicReceiptName, site), { cache: 'no-store' });
  assert(proof.ok, 'Public Pages verification receipt is missing.');
  validateReceipt(await proof.json(), digest(bytes));
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (cursor < marker.artifact.files.length) {
        const file = marker.artifact.files[cursor++];
        const url = new URL(file.path.split('/').map(encodeURIComponent).join('/'), site);
        const asset = await fetch(url, { cache: 'no-store' });
        assert(asset.ok, `Public Pages asset missing: ${file.path}`);
        const data = Buffer.from(await asset.arrayBuffer());
        assert.equal(data.length, file.bytes, `Public Pages asset size differs: ${file.path}`);
        assert.equal(digest(data), file.sha256, `Public Pages asset digest differs: ${file.path}`);
      }
    }),
  );
  return marker;
}
