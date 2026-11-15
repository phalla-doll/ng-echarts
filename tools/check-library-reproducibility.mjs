import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'ng-echarts-repro-'));
const run = async (name, args, cwd) => {
  const child = spawn(name, args, {
    cwd,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
    stdio: 'pipe',
  });
  let output = '';
  child.stdout.on('data', (value) => (output += value));
  child.stderr.on('data', (value) => (output += value));
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  assert.equal(code, 0, output);
  return output;
};
const pack = async (cwd) => {
  const result = JSON.parse(
    await run(
      'npm',
      [
        'pack',
        './dist/chart-library',
        '--ignore-scripts',
        '--pack-destination',
        temporary,
        '--json',
      ],
      cwd,
    ),
  )[0];
  return createHash('sha256')
    .update(await readFile(join(temporary, result.filename)))
    .digest('hex');
};
try {
  const expectedNode = (await readFile(join(root, '.nvmrc'), 'utf8')).trim();
  assert.equal(process.versions.node, expectedNode);
  assert.equal((await run('npm', ['--version'], root)).trim(), '11.19.1');
  const warm = await pack(root);
  const clean = [];
  for (const index of [1, 2]) {
    const directory = join(temporary, `clean-${index}`);
    await mkdir(join(directory, 'projects'), { recursive: true });
    await cp(join(root, 'projects/chart-library'), join(directory, 'projects/chart-library'), {
      recursive: true,
    });
    // The root tsconfig references the playground projects during declaration bundling.
    await cp(join(root, 'projects/playground'), join(directory, 'projects/playground'), {
      recursive: true,
    });
    for (const name of ['angular.json', 'tsconfig.json', 'package.json', 'package-lock.json'])
      await cp(join(root, name), join(directory, name));
    await symlink(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
    await run(
      process.execPath,
      [
        join(root, 'node_modules/@angular/cli/bin/ng.js'),
        'build',
        'chart-library',
        '--configuration',
        'production',
      ],
      directory,
    );
    const sha256 = await pack(directory);
    clean.push({ index, sha256 });
    assert.equal(
      sha256,
      warm,
      'Clean and warm package bytes differ; do not prepare an immutable candidate yet.',
    );
  }
  const version = JSON.parse(
    await readFile(join(root, 'projects/chart-library/package.json'), 'utf8'),
  ).version;
  const record = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    npm: '11.19.1',
    platform: process.platform,
    version,
    method:
      'Pack the current build, then compile/pack in two independent roots without build caches, sharing only the pinned installed dependencies. Compare complete tarball SHA-256; cross-platform CI comparison is separate.',
    warmSha256: warm,
    clean,
    passed: true,
  };
  await writeFile(
    join(root, `docs/experiments/data/reproducibility-${version}-${process.platform}.json`),
    await format(JSON.stringify(record), {
      ...(await resolveConfig(join(root, '.prettierrc'))),
      parser: 'json',
    }),
  );
  console.log(`PASS: warm and two independent clean ${version} packages match ${warm}.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
