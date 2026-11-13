import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  digest,
  assertSameSource,
  captureSource,
  invalidateBuild,
  sealBuild,
  sourceFingerprint,
} from './pages-provenance.mjs';
import { withPagesLock } from './pages-lock.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function copySource(root, source, destination) {
  if (source.includesWorkingTree) {
    for (const path of source.paths) {
      await mkdir(dirname(join(destination, path)), { recursive: true });
      await cp(join(root, path), join(destination, path), { verbatimSymlinks: true }).catch(
        (error) => {
          if (error.code !== 'ENOENT') throw error;
        },
      );
    }
  } else {
    // Extract the recorded Git tree, never a potentially changing live checkout.
    const archive = spawn('git', ['archive', '--format=tar', source.sourceBaseCommit], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    const extract = spawn('tar', ['-xf', '-', '-C', destination], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    archive.stdout.pipe(extract.stdin);
    const done = (child) =>
      new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code) => resolve(code));
      });
    assert.deepEqual(
      await Promise.all([done(archive), done(extract)]),
      [0, 0],
      'Unable to copy committed Pages source.',
    );
  }
  assert.equal(
    await sourceFingerprint(destination, source.paths),
    source.sourceSha256,
    'Isolated Pages source differs from captured input. Rebuild it.',
  );
  assertSameSource(source, await captureSource(root));
}
export async function validateConceptAsset(root, browser) {
  let source;
  try {
    source = await readFile(join(root, 'docs/experiments/chart-style-gallery.html'));
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  const expected = digest(source);
  const wrapper = await readFile(
    join(root, 'projects/playground/src/app/chart-possibilities.ts'),
    'utf8',
  );
  const revision = wrapper.match(/concepts\/chart-style-gallery\.html\?v=([a-f0-9]{12})/u)?.[1];
  assert.equal(
    revision,
    expected.slice(0, 12),
    'Gallery asset revision is stale. Update standaloneUrl to its source SHA-256 prefix.',
  );
  assert.equal(
    digest(await readFile(join(browser, 'concepts/chart-style-gallery.html'))),
    expected,
    'Bundled concept gallery differs from its source.',
  );
}
function compile(directory) {
  const run = (args) =>
    execFileSync('npm', args, { cwd: directory, env: process.env, stdio: 'inherit' });
  run(['run', 'build:lib']);
  run(['exec', '--', 'ng', 'build', 'playground', '--configuration', 'production,pages']);
  execFileSync(process.execPath, ['tools/prepare-pages.mjs'], {
    cwd: directory,
    env: process.env,
    stdio: 'inherit',
  });
}
export async function buildPages(root, build = compile) {
  return withPagesLock(root, 'build', async () => {
    const output = join(root, 'dist/pages');
    await invalidateBuild(join(output, 'browser'));
    const source = await captureSource(root);
    const node = (await readFile(join(root, '.nvmrc'), 'utf8')).trim().replace(/^v/, '');
    const npm = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
    assert.equal(process.versions.node, node, 'Use the pinned Node version for Pages.');
    assert.equal(
      `npm@${npm}`,
      JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).packageManager,
      'Use the pinned npm version for Pages.',
    );
    const startedAt = new Date().toISOString();
    const temporary = await realpath(await mkdtemp(join(tmpdir(), 'ng-echarts-pages-build-')));
    const token = randomUUID();
    const stage = join(root, `dist/.pages-stage-${token}`),
      previous = join(root, `dist/.pages-previous-${token}`);
    let installed = false;
    try {
      console.log(
        `Building Pages from ${source.sourceBaseCommit} (${source.includesWorkingTree ? 'working tree; local checks only' : 'clean committed source'}).`,
      );
      await copySource(root, source, temporary);
      await symlink(
        await realpath(join(root, 'node_modules')),
        join(temporary, 'node_modules'),
        'dir',
      );
      await build(temporary);
      await validateConceptAsset(temporary, join(temporary, 'dist/pages/browser'));
      assert.equal(
        await sourceFingerprint(temporary, source.paths),
        source.sourceSha256,
        'Build modified its source inputs.',
      );
      const marker = await sealBuild(
        root,
        join(temporary, 'dist/pages/browser'),
        source,
        { node: process.version, npm },
        startedAt,
      );
      await cp(join(temporary, 'dist/pages'), stage, { recursive: true });
      await rename(output, previous).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
      try {
        await rename(stage, output);
        installed = true;
      } catch (error) {
        await rename(previous, output).catch(() => {});
        throw error;
      }
      console.log(
        `Sealed ${marker.artifact.fileCount} Pages files; SHA-256 ${marker.artifact.sha256}.`,
      );
      return marker;
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(stage, { recursive: true, force: true });
      if (installed) await rm(previous, { recursive: true, force: true });
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  await buildPages(root);
