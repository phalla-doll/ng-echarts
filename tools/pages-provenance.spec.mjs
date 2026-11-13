import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import {
  cp,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { afterEach, test } from 'node:test';
import { buildPages, copySource, validateConceptAsset } from './build-pages.mjs';
import {
  assertRemoteCommit,
  captureSource,
  markerName,
  publicReceiptName,
  digest,
  readMarker,
  receiptPath,
  recordVerification,
  sealBuild,
  validateBuild,
  verifyPublicBuild,
} from './pages-provenance.mjs';
import { withPagesLock } from './pages-lock.mjs';
import { conceptAssets } from './concept-assets.mjs';
const roots = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});
function git(root, ...args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'pages-provenance-test-'));
  roots.push(root);
  await writeFile(join(root, '.gitignore'), '/dist\n/node_modules\n');
  await writeFile(join(root, '.nvmrc'), process.versions.node);
  await writeFile(join(root, 'package.json'), JSON.stringify({ packageManager: 'npm@11.19.1' }));
  await writeFile(
    join(root, 'angular.json'),
    JSON.stringify({
      projects: {
        playground: { architect: { build: { configurations: { pages: { baseHref: '/demo/' } } } } },
      },
    }),
  );
  await writeFile(join(root, 'source.txt'), 'committed input');
  await mkdir(join(root, 'node_modules'));
  git(root, 'init', '--initial-branch=main');
  git(root, 'config', 'user.name', 'Preview test');
  git(root, 'config', 'user.email', 'preview@example.invalid');
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'fixture');
  return root;
}
const directory = (root) => join(root, 'dist/pages/browser');
async function compile(root) {
  await mkdir(directory(root), { recursive: true });
  await writeFile(join(directory(root), 'index.html'), '<base href="/demo/">checked output');
  await writeFile(join(directory(root), '.nojekyll'), '');
}
async function sealed() {
  const root = await fixture();
  await compile(root);
  const source = await captureSource(root);
  const marker = await sealBuild(
    root,
    directory(root),
    source,
    { node: process.version, npm: '11.19.1' },
    new Date().toISOString(),
  );
  return { root, marker };
}
test('isolated builds stamp their original commit and leave source/index unchanged', async () => {
  const root = await fixture();
  const before = git(root, 'rev-parse', 'HEAD');
  const marker = await buildPages(root, async (frozen) => {
    assert.notEqual(frozen, root);
    assert.equal(await readFile(join(frozen, 'source.txt'), 'utf8'), 'committed input');
    await compile(frozen);
  });
  assert.equal(marker.sourceBaseCommit, before);
  assert.equal(marker.includesWorkingTree, false);
  assert.equal(git(root, 'status', '--porcelain'), '');
  assert.equal(git(root, 'rev-parse', 'HEAD'), before);
  assert.equal(marker.artifact.fileCount, 2);
  await validateBuild(root, directory(root));
});
test('clean copies use the recorded Git tree even if the live checkout changes', async () => {
  const root = await fixture(),
    source = await captureSource(root),
    copy = await mkdtemp(join(tmpdir(), 'pages-copy-'));
  roots.push(copy);
  await writeFile(join(root, 'source.txt'), 'later input');
  await assert.rejects(copySource(root, source, copy), /source changed|stale/);
  assert.equal(await readFile(join(copy, 'source.txt'), 'utf8'), 'committed input');
});
test('source mutation during compilation invalidates the build instead of relabeling it', async () => {
  const root = await fixture();
  await buildPages(root, compile);
  await assert.rejects(
    buildPages(root, async (frozen) => {
      await writeFile(join(root, 'source.txt'), 'changed during build');
      await compile(frozen);
    }),
    /source changed|stale/,
  );
  await assert.rejects(readMarker(directory(root)), /Missing or invalid/);
});
test('dirty local builds can be checked but never promoted by a later commit', async () => {
  const root = await fixture();
  await writeFile(join(root, 'source.txt'), 'draft');
  const marker = await buildPages(root, compile);
  assert.equal(marker.includesWorkingTree, true);
  await recordVerification(root, directory(root), marker);
  await assert.rejects(
    validateBuild(root, directory(root), { clean: true, verified: true }),
    /clean committed build/,
  );
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'draft committed');
  await assert.rejects(validateBuild(root, directory(root)), /source changed|stale/);
});
test('an identical-file commit still makes an earlier artifact stale', async () => {
  const { root } = await sealed();
  git(root, 'commit', '--allow-empty', '-m', 'new source revision');
  await assert.rejects(validateBuild(root, directory(root)), /source changed|stale/);
});
for (const [name, change] of [
  ['modified file', async (root) => writeFile(join(directory(root), 'index.html'), 'tampered')],
  ['extra file', async (root) => writeFile(join(directory(root), 'extra.js'), 'extra')],
  ['deleted file', async (root) => rm(join(directory(root), '.nojekyll'))],
  ['symlink', async (root) => symlink(join(root, 'source.txt'), join(directory(root), 'link'))],
])
  test(`artifact integrity rejects ${name}`, async () => {
    const { root } = await sealed();
    await change(root);
    await assert.rejects(validateBuild(root, directory(root)), /artifact changed|symlink/);
  });
test('missing and legacy markers cannot be used as build provenance', async () => {
  const root = await fixture();
  await compile(root);
  await assert.rejects(validateBuild(root, directory(root)), /Missing or invalid/);
  await writeFile(
    join(directory(root), markerName),
    JSON.stringify({ sourceBaseCommit: git(root, 'rev-parse', 'HEAD') }),
  );
  await assert.rejects(validateBuild(root, directory(root)), /Missing or invalid/);
});
test('only a complete receipt for the exact sealed build allows publishing', async () => {
  const { root, marker } = await sealed();
  await assert.rejects(validateBuild(root, directory(root), { verified: true }), /receipt/);
  await recordVerification(root, directory(root), marker);
  await validateBuild(root, directory(root), { clean: true, verified: true });
  const receipt = JSON.parse(await readFile(receiptPath(directory(root)), 'utf8'));
  receipt.browsers.pop();
  await writeFile(receiptPath(directory(root)), JSON.stringify(receipt));
  await assert.rejects(
    validateBuild(root, directory(root), { verified: true }),
    /three local browser/,
  );
  await recordVerification(root, directory(root), marker);
  marker.builtAt = new Date(Date.parse(marker.builtAt) + 1000).toISOString();
  await writeFile(join(directory(root), markerName), JSON.stringify(marker));
  await assert.rejects(
    validateBuild(root, directory(root), { verified: true }),
    /another Pages build/,
  );
});
test('source or output changes during browser checks cannot receive a receipt', async () => {
  const { root, marker } = await sealed();
  await writeFile(join(directory(root), 'index.html'), 'changed');
  await assert.rejects(recordVerification(root, directory(root), marker), /artifact changed/);
  await assert.rejects(readFile(receiptPath(directory(root))), /ENOENT/);
});
test('a publisher rejects a different pushed main commit', async () => {
  const { marker } = await sealed();
  assertRemoteCommit(marker, marker.sourceBaseCommit);
  assert.throws(() => assertRemoteCommit(marker, '0'.repeat(40)), /current pushed main/);
});
test('the operation lock blocks concurrent work and releases after failures', async () => {
  const root = await fixture();
  await assert.rejects(
    withPagesLock(root, 'build', async () => withPagesLock(root, 'deploy', async () => {})),
    /already running/,
  );
  await withPagesLock(root, 'check', async () => {});
  await assert.rejects(
    withPagesLock(root, 'build', async () => {
      throw new Error('compile failed');
    }),
    /compile failed/,
  );
  await withPagesLock(root, 'check', async () => {});
});
test('public checks verify clean source and every served byte without creating a local receipt', async () => {
  const { root, marker } = await sealed();
  await writeFile(
    join(directory(root), publicReceiptName),
    JSON.stringify({
      schemaVersion: 1,
      checkedAt: new Date().toISOString(),
      markerSha256: digest(await readFile(join(directory(root), markerName))),
      browsers: ['chromium', 'firefox', 'webkit'],
    }),
  );
  const server = createServer(async (req, res) => {
    try {
      res.end(
        await readFile(
          join(
            directory(root),
            new URL(req.url, 'http://localhost').pathname.slice('/demo/'.length),
          ),
        ),
      );
    } catch {
      res.writeHead(404).end();
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = new URL(`http://127.0.0.1:${server.address().port}/demo/`);
  try {
    const proofPath = join(directory(root), publicReceiptName);
    const proofBytes = await readFile(proofPath);
    await rm(proofPath);
    await assert.rejects(
      verifyPublicBuild(root, url, marker.sourceBaseCommit),
      /receipt is missing/,
    );
    await writeFile(
      proofPath,
      JSON.stringify({
        schemaVersion: 1,
        markerSha256: '0'.repeat(64),
        browsers: ['chromium', 'firefox', 'webkit'],
      }),
    );
    await assert.rejects(
      verifyPublicBuild(root, url, marker.sourceBaseCommit),
      /another Pages build/,
    );
    await writeFile(proofPath, proofBytes);
    await verifyPublicBuild(root, url, marker.sourceBaseCommit);
    await assert.rejects(readFile(receiptPath(directory(root))), /ENOENT/);
    await assert.rejects(verifyPublicBuild(root, url, '0'.repeat(40)), /another source commit/);
    await writeFile(join(directory(root), 'index.html'), 'tampered output');
    await assert.rejects(
      verifyPublicBuild(root, url, marker.sourceBaseCommit),
      /asset size differs|asset digest differs/,
    );
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('a dead owner lock is recovered without weakening active-owner exclusion', async () => {
  const root = await fixture();
  const child = spawn(process.execPath, ['-e', '']);
  await once(child, 'exit');
  await mkdir(join(root, 'dist'), { recursive: true });
  await writeFile(
    join(root, 'dist/.pages-operation.lock'),
    JSON.stringify({ pid: child.pid, operation: 'build' }),
  );
  await withPagesLock(root, 'check', async () => {});
});
test('the actual publisher rejects unverified and stale input before contacting GitHub', async () => {
  const root = await fixture();
  const repository = fileURLToPath(new URL('../', import.meta.url));
  await mkdir(join(root, 'tools'));
  await mkdir(join(root, 'fake-bin'));
  for (const name of ['deploy-pages.mjs', 'pages-provenance.mjs', 'pages-lock.mjs'])
    await cp(join(repository, 'tools', name), join(root, 'tools', name));
  const called = join(root, 'gh-called');
  await writeFile(
    join(root, 'fake-bin/gh'),
    '#!/usr/bin/env node\nrequire("node:fs").writeFileSync(process.env.PAGES_TEST_GH_LOG,"called");\n',
  );
  await chmod(join(root, 'fake-bin/gh'), 0o755);
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'publisher fixture');
  await compile(root);
  const marker = await sealBuild(
    root,
    directory(root),
    await captureSource(root),
    { node: process.version, npm: '11.19.1' },
    new Date().toISOString(),
  );
  const run = () =>
    spawnSync(process.execPath, ['tools/deploy-pages.mjs'], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: join(root, 'fake-bin') + ':' + process.env.PATH,
        PAGES_TEST_GH_LOG: called,
      },
    });
  let result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /receipt/);
  await assert.rejects(readFile(called), /ENOENT/);
  await recordVerification(root, directory(root), marker);
  await writeFile(join(root, 'source.txt'), 'stale source');
  result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source changed|stale/);
  await assert.rejects(readFile(called), /ENOENT/);
  result = spawnSync(process.execPath, ['tools/deploy-pages.mjs', '--preflight'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: join(root, 'fake-bin') + ':' + process.env.PATH,
      PAGES_TEST_GH_LOG: called,
    },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /clean committed build/);
  await assert.rejects(readFile(called), /ENOENT/);
});

test('concept asset validation catches stale URL revisions and mismatched bundled bytes', async () => {
  const root = await fixture();
  const source = Buffer.from('<html>concept source</html>');
  await mkdir(join(root, 'docs/experiments'), { recursive: true });
  await mkdir(join(root, 'projects/playground/src/app'), { recursive: true });
  await mkdir(join(directory(root), 'concepts'), { recursive: true });
  await writeFile(join(root, 'docs/experiments/chart-style-gallery.html'), source);
  const wrapper = join(root, 'projects/playground/src/app/chart-possibilities.ts'),
    asset = join(directory(root), 'concepts/chart-style-gallery.html');
  await writeFile(wrapper, "const url='concepts/chart-style-gallery.html?v=000000000000';");
  await writeFile(asset, source);
  await assert.rejects(validateConceptAsset(root, directory(root)), /asset revision is stale/);
  await writeFile(
    wrapper,
    `const url='concepts/chart-style-gallery.html?v=${digest(source).slice(0, 12)}';`,
  );
  await validateConceptAsset(root, directory(root));
  await writeFile(asset, 'wrong document');
  await assert.rejects(validateConceptAsset(root, directory(root)), /differs from its source/);
});

test('concept validation also rejects tampered generated engines and embedded documents', async () => {
  const root = await fixture();
  const source =
    '<style>src:url(data:font/woff2;base64,YWJj)</style><!-- concept-engine:start --><script>const engine = "$&";</script><!-- concept-engine:end --><script>application()</script>';
  await mkdir(join(root, 'docs/experiments'), { recursive: true });
  await mkdir(join(root, 'projects/playground/src/app'), { recursive: true });
  await mkdir(join(directory(root), 'concepts'), { recursive: true });
  await writeFile(join(root, 'docs/experiments/chart-style-gallery.html'), source);
  await writeFile(
    join(root, 'projects/playground/src/app/chart-possibilities.ts'),
    `const url='concepts/chart-style-gallery.html?v=${digest(source).slice(0, 12)}';`,
  );
  const assets = conceptAssets(source);
  for (const [name, value] of Object.entries(assets.files))
    await writeFile(join(directory(root), 'concepts', name), value);
  await validateConceptAsset(root, directory(root));
  const engine = join(directory(root), 'concepts', assets.engineName);
  await writeFile(engine, 'tampered');
  await assert.rejects(
    validateConceptAsset(root, directory(root)),
    /Generated concept asset differs/,
  );
  await writeFile(engine, assets.files[assets.engineName]);
  await writeFile(join(directory(root), 'concepts/chart-style-gallery-embedded.html'), 'tampered');
  await assert.rejects(
    validateConceptAsset(root, directory(root)),
    /Generated concept asset differs/,
  );
});

test('relative source aliases stay inside the isolated copy and external aliases are refused', async () => {
  const root = await fixture();
  await symlink('source.txt', join(root, 'alias.txt'));
  git(root, 'add', '.');
  git(root, 'commit', '-m', 'relative alias');
  await buildPages(root, async (frozen) => {
    assert.equal(await realpath(join(frozen, 'alias.txt')), join(frozen, 'source.txt'));
    assert.equal(await readFile(join(frozen, 'alias.txt'), 'utf8'), 'committed input');
    await compile(frozen);
  });
  await symlink('/tmp', join(root, 'outside'));
  await assert.rejects(captureSource(root), /symlink must stay inside/);
});
