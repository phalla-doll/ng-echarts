import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumer = await realpath(await mkdtemp(join(tmpdir(), 'ng-echarts-consumer-')));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: process.env });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

try {
  // The library must be built first; never resolve its source through workspace aliases.
  const packed = JSON.parse(
    run('npm', ['pack', './dist/chart-library', '--pack-destination', consumer, '--json'], root),
  )[0];
  assert(
    packed.files.some((file) => file.path.endsWith('.d.ts')),
    'Package must include declarations',
  );
  assert(!packed.files.some((file) => file.path.endsWith('.spec.ts')), 'Do not ship tests');
  assert(
    packed.files.some((file) => file.path === 'third-party/evilcharts-LICENSE.txt'),
    'Package must preserve the upstream MIT notice',
  );
  await cp(join(root, 'tools/consumer-fixtures/declarations'), consumer, { recursive: true });
  run('npm', ['ci', '--no-audit', '--no-fund'], consumer);
  run(
    'npm',
    [
      'install',
      '--no-save',
      '--package-lock=false',
      '--no-audit',
      '--no-fund',
      `./${packed.filename}`,
    ],
    consumer,
  );
  const installed = await realpath(join(consumer, 'node_modules/@ng-echarts/chart-library'));
  assert(
    !relative(consumer, installed).startsWith('..'),
    'Installed package must stay inside isolated consumer',
  );
  run(
    process.execPath,
    ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', 'tsconfig.json'],
    consumer,
  );
  const invalid = spawnSync(
    process.execPath,
    ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', 'tsconfig.invalid.json'],
    { cwd: consumer, encoding: 'utf8', env: process.env },
  );
  assert(invalid.status !== 0, 'Invalid category keys must fail Angular template compilation');
  assert(
    /Type '"count"' is not assignable/.test(`${invalid.stdout}${invalid.stderr}`),
    `Expected the invalid category-key diagnostic:\n${invalid.stdout}\n${invalid.stderr}`,
  );
  assert(
    /Type '"category"' is not assignable to type '"count"'/.test(
      `${invalid.stdout}${invalid.stderr}`,
    ),
    `Expected the invalid numeric-key diagnostic:\n${invalid.stdout}\n${invalid.stderr}`,
  );
  assert(
    /Type '\(_category: string\) => number' is not assignable to type 'CategoryTickFormatter'/.test(
      `${invalid.stdout}${invalid.stderr}`,
    ),
    `Expected the invalid category-formatter diagnostic:\n${invalid.stdout}\n${invalid.stderr}`,
  );
  console.log(
    'PASS: packed library and ECharts declarations compile in isolation; invalid keys and category formatter are rejected (skipLibCheck=false).',
  );
} finally {
  await rm(consumer, { recursive: true, force: true });
}
