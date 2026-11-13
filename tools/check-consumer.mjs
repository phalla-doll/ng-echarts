import { consumerArtifact } from './consumer-artifact.mjs';
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
  // Pack the production build or copy the exact candidate; never resolve workspace source aliases.
  const packed = await consumerArtifact(root, consumer);
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
  const lines = await build({
    entryPoints: [join(root, 'projects/playground/src/app/line-blocks.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { lineBlocks, lineExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(lines.outputFiles[0].contents).toString('base64')}`
  );
  const areas = await build({
    entryPoints: [join(root, 'projects/playground/src/app/area-blocks.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { areaBlocks, areaExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(areas.outputFiles[0].contents).toString('base64')}`
  );
  const composedBuild = await build({
    entryPoints: [join(root, 'projects/playground/src/app/composed-blocks.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { composedBlocks, composedExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(composedBuild.outputFiles[0].contents).toString('base64')}`
  );
  const configPath = join(consumer, 'tsconfig.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const composedGuide = await readFile(join(root, 'docs/COMPOSED_CHART_API.md'), 'utf8');
  const composedExample = composedGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(composedExample, 'Composed guide must contain its integration example');
  await writeFile(join(consumer, 'composed-api-example.ts'), composedExample);
  config.files.push('composed-api-example.ts');
  for (const dark of [false, true])
    for (const block of composedBlocks) {
      const file = `${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), composedExampleSource(block, dark));
      config.files.push(file);
    }
  const linkedBuild = await build({
    entryPoints: [join(root, 'projects/playground/src/app/linked-example-source.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { linkedExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(linkedBuild.outputFiles[0].contents).toString('base64')}`
  );
  const linkedGuide = await readFile(join(root, 'docs/LINKED_CHARTS.md'), 'utf8');
  assert.equal(
    linkedGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1],
    linkedExampleSource,
    'Linked guide and displayed example must stay identical',
  );
  await writeFile(join(consumer, 'linked-example.ts'), linkedExampleSource);
  config.files.push('linked-example.ts');
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
  const integrationGuide = await readFile(join(root, 'docs/INTEGRATION_GUIDE.md'), 'utf8');
  const integrationExample = integrationGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(integrationExample, 'Integration guide must contain its full application');
  await writeFile(join(consumer, 'integration-example.ts'), integrationExample);
  config.files.push('integration-example.ts');
  const barGuide = await readFile(join(root, 'docs/BAR_CHART_API.md'), 'utf8');
  const barApiExample = barGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(barApiExample, 'Bar API guide must contain its compilable integration example');
  await writeFile(join(consumer, 'bar-api-example.ts'), barApiExample);
  config.files.push('bar-api-example.ts');
  const lineGuide = await readFile(join(root, 'docs/LINE_CHART_API.md'), 'utf8');
  const lineApiExample = lineGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(lineApiExample, 'Line API guide must contain a compilable integration example');
  await writeFile(join(consumer, 'line-api-example.ts'), lineApiExample);
  config.files.push('line-api-example.ts');
  for (const dark of [false, true]) {
    for (const block of barBlocks) {
      const file = `${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), barExampleSource(block, dark));
      config.files.push(file);
    }
  }
  for (const dark of [false, true])
    for (const block of lineBlocks) {
      const file = `${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), lineExampleSource(block, dark));
      config.files.push(file);
    }
  const areaGuide = await readFile(join(root, 'docs/AREA_CHART_API.md'), 'utf8');
  const areaApiExample = areaGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(areaApiExample, 'Area API guide must contain a compilable integration example');
  await writeFile(join(consumer, 'area-api-example.ts'), areaApiExample);
  config.files.push('area-api-example.ts');
  for (const dark of [false, true])
    for (const block of areaBlocks) {
      const file = `area-${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), areaExampleSource(block, dark));
      config.files.push(file);
    }
  const pies = await build({
    entryPoints: [join(root, 'projects/playground/src/app/pie-blocks.ts')],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
  });
  const { pieBlocks, pieExampleSource } = await import(
    `data:text/javascript;base64,${Buffer.from(pies.outputFiles[0].contents).toString('base64')}`
  );
  const pieGuide = await readFile(join(root, 'docs/PIE_CHART_API.md'), 'utf8');
  const pieApiExample = pieGuide.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(pieApiExample, 'Pie guide must have a compilable example');
  await writeFile(join(consumer, 'pie-api-example.ts'), pieApiExample);
  config.files.push('pie-api-example.ts');
  for (const dark of [false, true])
    for (const block of pieBlocks) {
      const file = `pie-${block.id}-${dark ? 'dark' : 'light'}.ts`;
      await writeFile(join(consumer, file), pieExampleSource(block, dark));
      config.files.push(file);
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
  const packagedReadme = await readFile(join(installed, 'README.md'), 'utf8');
  const packagedExample = packagedReadme.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
  assert(packagedExample, 'Packaged README must contain a complete first-chart example');
  await writeFile(join(consumer, 'packaged-readme-example.ts'), packagedExample);
  config.files.push('packaged-readme-example.ts');
  await writeFile(configPath, JSON.stringify(config));
  assert.deepEqual(Object.keys(manifest.exports).sort(), [
    '.',
    './area',
    './bar',
    './composed',
    './core',
    './line',
    './package.json',
    './pie',
  ]);
  assert.equal(manifest.sideEffects, false);
  for (const entry of ['.', './core', './bar', './line', './area', './pie', './composed']) {
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
  assert(
    /Type 'string' is not assignable to type 'boolean'/.test(`${invalid.stdout}${invalid.stderr}`),
    'Line smooth must reject nonboolean template inputs',
  );
  assert(invalid.status !== 0, 'Invalid category keys must fail Angular template compilation');
  const diagnostics = `${invalid.stdout}${invalid.stderr}`.replace(/\x1b\[[0-9;]*m/g, '');
  const invalidSource = await readFile(join(consumer, 'invalid-consumer.ts'), 'utf8');
  for (const [component, binding] of [
    ['InvalidSeriesConsumer', '[series]="badSeries"'],
    ['InvalidLine', '[series]="series"'],
    ['InvalidLine', '[smooth]="\'yes\'"'],
    ['InvalidArea', '[series]="series"'],
    ['InvalidArea', '[stacked]="\'yes\'"'],
    ['InvalidPie', '[measure]="{'],
    ['InvalidPie', '[innerRadius]="\'wrong\'"'],
    ...['Kind', 'Options', 'Measure', 'MissingKind'].map((name) => [
      `InvalidComposed${name}`,
      '[series]="series"',
    ]),
  ]) {
    const classAt = invalidSource.indexOf(`export class ${component} `);
    assert(classAt >= 0, `Missing negative fixture ${component}`);
    const templateAt = invalidSource.lastIndexOf('@Component', classAt);
    const bindingAt = invalidSource.indexOf(binding, templateAt);
    assert(bindingAt >= templateAt && bindingAt < classAt, `Missing ${component} ${binding}`);
    const line = invalidSource.slice(0, bindingAt).split('\n').length;
    assert(
      new RegExp(`invalid-consumer\\.ts:${line}:\\d+ - error TS2322`).test(diagnostics),
      `Expected a type error for ${component} ${binding} at line ${line}:\n${diagnostics}`,
    );
  }
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
