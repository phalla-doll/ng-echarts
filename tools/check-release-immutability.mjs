import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixture = await mkdtemp(join(tmpdir(), 'ng-echarts-release-immutability-'));
try {
  for (const directory of ['tools', 'dist/releases'])
    await mkdir(join(fixture, directory), { recursive: true });
  for (const file of ['prepare-local-release.mjs', 'local-release-artifact.mjs'])
    await cp(join(root, 'tools', file), join(fixture, 'tools', file));
  await cp(join(root, '.nvmrc'), join(fixture, '.nvmrc'));
  await cp(join(root, 'projects/chart-library'), join(fixture, 'projects/chart-library'), {
    recursive: true,
  });
  await cp(join(root, 'dist/chart-library'), join(fixture, 'dist/chart-library'), {
    recursive: true,
  });
  await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  const manifest = await readFile(join(root, 'dist/releases/release-manifest.json'));
  const { artifact } = JSON.parse(manifest);
  const files = [artifact.filename, `${artifact.filename}.sha256`, 'release-manifest.json'];
  const before = new Map();
  for (const file of files) {
    const bytes = await readFile(join(root, 'dist/releases', file));
    before.set(file, bytes);
    await writeFile(join(fixture, 'dist/releases', file), bytes);
  }
  const result = spawnSync(process.execPath, ['tools/prepare-local-release.mjs'], {
    cwd: fixture,
    encoding: 'utf8',
    env: process.env,
  });
  assert.notEqual(result.status, 0, 'Repeated preparation must reject an existing candidate');
  assert.match(result.stderr, /EEXIST/, 'Refusal must occur at the exclusive archive copy');
  for (const file of files)
    assert.deepEqual(
      await readFile(join(fixture, 'dist/releases', file)),
      before.get(file),
      `${file} was changed by repeated preparation`,
    );
  console.log('PASS: repeated preparation refuses to replace the archive, checksum or manifest.');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
