import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

export const releaseRoot = resolve(import.meta.dirname, '..');
export const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function command(name, args, cwd = releaseRoot) {
  const result = spawnSync(name, args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  assert.equal(result.status, 0, `${name} ${args.join(' ')} failed:\n${result.stderr}`);
  return result.stdout;
}
export async function inspectRelease(path) {
  const bytes = await readFile(path);
  const entries = command('tar', ['-tzf', path]).trim().split('\n');
  assert(
    entries.every((name) => name.startsWith('package/') && !name.split('/').includes('..')),
    'Unsafe archive entry',
  );
  assert(
    command('tar', ['-tvzf', path])
      .trim()
      .split('\n')
      .every((line) => !/^[lh]/.test(line)),
    'Release must not contain links',
  );
  const files = entries
    .filter((name) => !name.endsWith('/'))
    .map((name) => name.slice(8))
    .sort();
  assert(
    files.every(
      (name) =>
        !/(^|\/)(node_modules|src|test|tests|\.git|\.env)(\/|$)|\.(spec|test)\.|\.ts$/.test(
          name.replace(/\.d\.ts$/, '.dts'),
        ),
    ),
    'Development/private files must not ship',
  );
  const read = (name) => command('tar', ['-xOzf', path, `package/${name}`]);
  const manifest = JSON.parse(read('package.json'));
  const source = JSON.parse(
    await readFile(join(releaseRoot, 'projects/chart-library/package.json'), 'utf8'),
  );
  assert.equal(manifest.name, '@ng-echarts/chart-library');
  assert.equal(manifest.version, source.version);
  assert.match(manifest.version, /^\d+\.\d+\.\d+-rc\.\d+$/);
  assert.equal(manifest.private, true);
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.description, source.description);
  assert.deepEqual(manifest.repository, source.repository);
  for (const field of ['homepage', 'bugs', 'keywords'])
    assert.deepEqual(manifest[field], source[field]);
  assert(!manifest.devDependencies, 'Development dependencies must not enter the package manifest');
  assert.deepEqual(manifest.peerDependencies, source.peerDependencies);
  assert.deepEqual(manifest.dependencies, { tslib: '^2.3.0' });
  assert.equal(manifest.sideEffects, false);
  assert.deepEqual(Object.keys(manifest.exports).sort(), [
    '.',
    './area',
    './bar',
    './composed',
    './core',
    './line',
    './package.json',
    './pie',
    './radar',
    './radial',
  ]);
  for (const entry of [
    '.',
    './core',
    './bar',
    './line',
    './area',
    './pie',
    './composed',
    './radar',
    './radial',
  ]) {
    for (const condition of ['types', 'default']) {
      assert(
        files.includes(manifest.exports[entry][condition].replace(/^\.\//, '')),
        `Missing ${entry}/${condition}`,
      );
    }
  }
  const assets = [
    'LICENSE',
    'README.md',
    'CHANGELOG.md',
    'THIRD_PARTY_NOTICES.md',
    'third-party/provenance.json',
    'third-party/evilcharts-LICENSE.txt',
    'third-party/angular-LICENSE.txt',
    'third-party/echarts-LICENSE.txt',
    'third-party/echarts-NOTICE.txt',
    'third-party/zrender-LICENSE.txt',
    'third-party/rxjs-LICENSE.txt',
    'third-party/tslib-LICENSE.txt',
    'third-party/tslib-CopyrightNotice.txt',
  ];
  for (const asset of assets) {
    assert(files.includes(asset), `Missing ${asset}`);
    assert.equal(
      digest(Buffer.from(read(asset))),
      digest(await readFile(join(releaseRoot, 'projects/chart-library', asset))),
      `${asset} changed in packing`,
    );
  }
  assert(read('README.md').includes(`ng-echarts-chart-library-${manifest.version}.tgz`));
  assert(read('LICENSE').includes('Copyright (c) 2026 Phalla'));
  assert(read('third-party/evilcharts-LICENSE.txt').includes('Copyright (c) 2026 Gurbinder'));
  const notices = JSON.parse(read('third-party/provenance.json'));
  for (const notice of notices.entries) {
    assert.equal(digest(Buffer.from(read(`third-party/${notice.file}`))), notice.sha256);
    if (notice.source.startsWith('node_modules/')) {
      assert.equal(digest(await readFile(join(releaseRoot, notice.source))), notice.sha256);
      const installed = JSON.parse(
        await readFile(join(releaseRoot, 'node_modules', notice.package, 'package.json'), 'utf8'),
      );
      assert.equal(installed.version, notice.version);
      assert.equal(installed.license, notice.license);
    }
  }
  return {
    filename: basename(path),
    name: manifest.name,
    version: manifest.version,
    license: manifest.license,
    private: manifest.private,
    sha256: digest(bytes),
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    bytes: bytes.length,
    exports: manifest.exports,
    peerDependencies: manifest.peerDependencies,
    dependencies: manifest.dependencies,
    assets,
    notices: notices.entries,
    files: files.map((name) => ({ path: name, sha256: digest(Buffer.from(read(name))) })),
  };
}
