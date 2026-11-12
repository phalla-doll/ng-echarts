import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, realpath, rm, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
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
  // Compile the actual copied gallery examples, not a second hand-maintained template.
  const examples = await build({
    entryPoints: [join(root, 'projects/playground/src/app/bar-blocks.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { barBlocks, barExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(examples.outputFiles[0].contents).toString('base64')}`
  );
  const configPath = join(consumer, 'tsconfig.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const documentation = await build({
    entryPoints: [join(root, 'projects/playground/src/app/documentation-content.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { quickStartExample } = await import(
    `data:text/javascript;base64,${Buffer.from(documentation.outputFiles[0].contents).toString('base64')}`
  );
  await writeFile(join(consumer, 'quick-start-example.ts'), quickStartExample);
  config.files.push('quick-start-example.ts');
  const barGuide = await readFile(join(root, 'docs/BAR_CHART_API.md'), 'utf8');
  const barApiExample = barGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(barApiExample, 'Bar API guide must contain its compilable integration example');
  await writeFile(join(consumer, 'bar-api-example.ts'), barApiExample);
  config.files.push('bar-api-example.ts');
  for (const dark of [false, true]) {
    for (const block of barBlocks) {
      const file = `${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), barExampleSource(block, dark));
      config.files.push(file);
    }
  }
  await writeFile(configPath, JSON.stringify(config));
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
  const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest.exports).sort(), [
    '.',
    './bar',
    './core',
    './package.json',
  ]);
  assert.equal(manifest.sideEffects, false);
  for (const entry of ['.', './core', './bar']) {
    for (const field of ['types', 'default']) {
      assert(
        await readFile(join(installed, manifest.exports[entry][field])),
        `${entry} ${field} must ship`,
      );
    }
  }
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
  assert(
    /Type '\(_value: number\) => number' is not assignable to type 'ValueFormatter'/.test(
      `${invalid.stdout}${invalid.stderr}`,
    ),
    `Expected the invalid value-formatter diagnostic:\n${invalid.stdout}\n${invalid.stderr}`,
  );
  assert(
    /Type '\{ readonly style: "invalid"; \}' is not assignable to type 'NumberFormatOptions'/.test(
      `${invalid.stdout}${invalid.stderr}`,
    ),
    `Expected the invalid number-format-options diagnostic:\n${invalid.stdout}\n${invalid.stderr}`,
  );
  console.log(
    'PASS: packed library and ECharts declarations compile in isolation; invalid keys and formatters/options are rejected (skipLibCheck=false).',
  );
} finally {
  await rm(consumer, { recursive: true, force: true });
}
