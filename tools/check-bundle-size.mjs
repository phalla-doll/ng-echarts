import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { transformAsync } from '@babel/core';
import angularLinker from '@angular/compiler-cli/linker/babel';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { format, resolveConfig } from 'prettier';

const root = join(import.meta.dirname, '..');
const formatOptions = { ...(await resolveConfig(join(root, '.prettierrc'))), parser: 'json' };
const directory = join(root, 'dist/linked-package-budget');
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
const scenarios = [
  { name: 'bar', entry: '/bar', symbol: 'BarChart', engine: true, families: ['bar'] },
  { name: 'line', entry: '/line', symbol: 'LineChart', engine: true, families: ['line'] },
  { name: 'core', entry: '/core', symbol: 'ChartFrame', engine: false },
  {
    name: 'root',
    entry: '',
    symbol: 'BarChart, LineChart, ChartFrame',
    engine: true,
    families: ['bar', 'line'],
  },
  {
    name: 'root-frame',
    entry: '',
    symbol: 'ChartFrame',
    engine: false,
    allowOrphanChunks: true,
    families: ['bar', 'line'],
  },
];
const results = [];
for (const scenario of scenarios) {
  const outdir = join(directory, scenario.name);
  const result = await build({
    stdin: {
      contents: `export { ${scenario.symbol} } from '@ng-echarts/chart-library${scenario.entry}';`,
      resolveDir: join(root, 'dist/chart-library'),
      sourcefile: `${scenario.name}-consumer.js`,
    },
    outdir,
    bundle: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: 'es2022',
    external: ['@angular/*', 'rxjs', 'rxjs/*'],
    legalComments: 'eof',
    metafile: true,
    write: false,
    plugins: [
      {
        name: 'angular-package-linker',
        setup(builder) {
          builder.onLoad({ filter: /chart-library\/fesm2022\/.*\.mjs$/ }, async ({ path }) => ({
            contents: (
              await transformAsync(await readFile(path, 'utf8'), {
                filename: path,
                configFile: false,
                babelrc: false,
                plugins: [angularLinker],
              })
            ).code,
            loader: 'js',
          }));
        },
      },
    ],
  });
  const outputs = result.metafile.outputs;
  const eagerOutputs = new Set();
  function visit(path, visited, dynamic) {
    if (visited.has(path)) return;
    visited.add(path);
    for (const dependency of outputs[path].imports) {
      if (!dependency.external && (dynamic || dependency.kind !== 'dynamic-import'))
        visit(dependency.path, visited, dynamic);
    }
  }
  const entry = Object.entries(outputs).find(([, output]) =>
    output.entryPoint?.endsWith('-consumer.js'),
  );
  assert(entry, `Missing ${scenario.name} entry output`);
  visit(entry[0], eagerOutputs, false);
  const reachableOutputs = new Set();
  visit(entry[0], reachableOutputs, true);
  const contributingInputs = (entries) =>
    [
      ...new Set(
        entries.flatMap(([, output]) =>
          Object.entries(output.inputs)
            .filter(([, input]) => input.bytesInOutput > 0)
            .map(([name]) => name),
        ),
      ),
    ].sort();
  const inputs = contributingInputs(Object.entries(outputs));
  const eagerInputs = contributingInputs(
    Object.entries(outputs).filter(([path]) => eagerOutputs.has(path)),
  );
  const reachableInputs = contributingInputs(
    Object.entries(outputs).filter(([path]) => reachableOutputs.has(path)),
  );
  const reachableEngineInputs = reachableInputs.filter((name) =>
    /node_modules\/(echarts|zrender)\//.test(name),
  );
  const engineInputs = inputs.filter((name) => /node_modules\/(echarts|zrender)\//.test(name));
  const eagerEngineInputs = eagerInputs.filter((name) =>
    /node_modules\/(echarts|zrender)\//.test(name),
  );
  assert.equal(eagerEngineInputs.length, 0, `${scenario.name} eagerly includes the chart engine`);
  const chartInputs = inputs.filter((name) => /echarts\/lib\/chart\//.test(name));
  // ECharts core owns this registry even when no custom chart is registered.
  const sharedRegistry = chartInputs.filter((name) =>
    name.endsWith('/custom/customSeriesRegister.js'),
  );
  const families = [
    ...new Set(
      chartInputs
        .filter((name) => !sharedRegistry.includes(name))
        .flatMap((name) => name.match(/echarts\/lib\/chart\/([^/]+)\//)?.[1] ?? []),
    ),
  ].sort();
  if (scenario.engine || (scenario.allowOrphanChunks && engineInputs.length)) {
    assert(engineInputs.length > 0, `${scenario.name} must retain its lazy engine`);
    for (const family of scenario.families)
      assert(families.includes(family), `${scenario.name} must retain ${family} rendering`);
    assert(
      families.every((name) => [...scenario.families, 'helper'].includes(name)),
      `${scenario.name} includes unrelated charts: ${families}`,
    );
    assert(
      !inputs.some((name) => /(?:installSVGRenderer|svg\/Painter)\.js$/.test(name)),
      `${scenario.name} includes the SVG renderer`,
    );
    assert(
      inputs.some((name) => /installCanvasRenderer\.js$/.test(name)),
      `${scenario.name} must include Canvas`,
    );
  }
  if (!scenario.engine) {
    assert.equal(
      scenario.allowOrphanChunks ? reachableEngineInputs.length : engineInputs.length,
      0,
      `${scenario.name} must exclude ECharts and ZRender entirely`,
    );
    assert(
      !reachableInputs.some((name) => /chart-library-(?:bar|line)/.test(name)),
      `${scenario.name} must exclude bar implementation`,
    );
  }
  assert(
    !inputs.some((name) => /node_modules\/(?:react|react-dom|highlight\.js)\//.test(name)),
    'Demo/React dependencies must not enter library output',
  );
  if (scenario.engine)
    assert(reachableEngineInputs.length > 0, `${scenario.name} must reach its lazy engine`);
  await mkdir(outdir, { recursive: true });
  const files = [];
  for (const output of result.outputFiles) {
    await writeFile(output.path, output.contents);
    files.push({
      name: output.path.slice(outdir.length + 1),
      raw: output.contents.length,
      gzip: gzipSync(output.contents).length,
      brotli: brotliCompressSync(output.contents).length,
    });
  }
  const total = files.reduce(
    (sum, file) => ({
      raw: sum.raw + file.raw,
      gzip: sum.gzip + file.gzip,
      brotli: sum.brotli + file.brotli,
    }),
    { raw: 0, gzip: 0, brotli: 0 },
  );
  const budget =
    scenario.engine || scenario.allowOrphanChunks
      ? { gzip: 200_000, brotli: 175_000 }
      : { gzip: 10_000, brotli: 9_000 };
  const passed = total.gzip <= budget.gzip && total.brotli <= budget.brotli;
  assert(passed, `${scenario.name} exceeded its measured budget: ${JSON.stringify(total)}`);
  results.push({
    name: scenario.name,
    import: `@ng-echarts/chart-library${scenario.entry}`,
    exports: scenario.symbol,
    files,
    total,
    budget,
    eagerEngineModules: eagerEngineInputs.length,
    engineModules: engineInputs.length,
    reachableEngineModules: reachableEngineInputs.length,
    orphanFiles: Object.keys(outputs)
      .filter((path) => !reachableOutputs.has(path))
      .map((path) => path.split('/').at(-1)),
    chartFamilies: families.filter((name) => name !== 'helper'),
    sharedRegistryModules: sharedRegistry,
    contributingInputs: inputs,
    passed,
  });
  console.log(
    `PASS: ${scenario.name} ${total.gzip} gzip / ${total.brotli} Brotli bytes; ${engineInputs.length} engine modules, none eager.`,
  );
}
const recordedAt = new Date().toISOString();
const method =
  'Resolve public package imports, Angular-link, bundle/minify/split with Angular/RxJS peers external; count only modules contributing bytes to output; traverse static imports separately from lazy chunks; sum independently compressed JavaScript chunks';
const bar = results.find((result) => result.name === 'bar');
await writeFile(
  join(root, 'docs/experiments/data/bar-bundle-size.json'),
  await format(
    JSON.stringify({
      recordedAt,
      method,
      files: bar.files,
      total: bar.total,
      budget: bar.budget,
      passed: bar.passed,
    }),
    formatOptions,
  ),
);
await writeFile(
  join(root, 'docs/experiments/data/package-boundaries.json'),
  await format(
    JSON.stringify({ recordedAt, method, scenarios: results, passed: true }),
    formatOptions,
  ),
);

const line = results.find((result) => result.name === 'line');
await writeFile(
  join(root, 'docs/experiments/data/line-bundle-size.json'),
  await format(
    JSON.stringify({
      recordedAt,
      method,
      files: line.files,
      total: line.total,
      budget: line.budget,
      passed: line.passed,
    }),
    formatOptions,
  ),
);
