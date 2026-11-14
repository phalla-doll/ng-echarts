import { format, resolveConfig } from 'prettier';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { build } from 'esbuild';
import { cpus, platform, release, totalmem } from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const root = join(import.meta.dirname, '..');
const directory = join(root, 'dist/renderer-benchmark');
await mkdir(directory, { recursive: true });
const bundles = {};
for (const renderer of ['canvas', 'svg']) {
  await build({
    entryPoints: [join(root, `tools/bench/${renderer}.ts`)],
    alias: { '@mantha911/ng-echarts/core': join(root, 'tools/bench/core-policy.ts') },
    outfile: join(directory, `${renderer}.js`),
    bundle: true,
    minify: true,
    target: 'es2022',
    format: 'esm',
    legalComments: 'eof',
    metafile: true,
  });
  const bytes = await readFile(join(directory, `${renderer}.js`));
  bundles[renderer] = {
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes).length,
    includes: 'modular bar engine + model/options + benchmark harness; excludes Angular',
  };
}
const staticServer = createServer(async (request, response) => {
  const renderer = request.url.includes('svg') ? 'svg' : 'canvas';
  if (request.url.endsWith('.js')) {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(await readFile(join(directory, `${renderer}.js`)));
  } else
    response.end(
      `<html><body style="margin:20px;font-family:system-ui"><div id="plot" style="width:768px;height:320px"></div><script type="module" src="/${renderer}.js"></script></body></html>`,
    );
});
await new Promise((resolve) => staticServer.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${staticServer.address().port}`;
const server = spawn(process.execPath, ['dist/playground/server/server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: '0' },
  stdio: 'pipe',
});
let log = '';
server.stdout.on('data', (data) => {
  log += data;
});
server.stderr.on('data', (data) => {
  log += data;
});
let browser;
const p95 = (samples) => [...samples].sort((a, b) => a - b)[28];
try {
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null && Date.now() < deadline, log);
    await delay(100);
  }
  browser = await chromium.launch();
  const evidence = {
    recordedAt: new Date().toISOString(),
    machine: {
      platform: platform(),
      os: release(),
      architecture: process.arch,
      cpu: cpus()[0].model,
      logicalCpus: cpus().length,
      memoryBytes: totalmem(),
    },
    browser: browser.version(),
    mode: 'production',
    hostWidth: 768,
    height: 320,
    dpr: 1,
    animation: false,
    table: 'collapsed for render timings',
    warmup: 1,
    sampleCount: 30,
    p95: '29th sorted sample',
    completion: 'ECharts finished; Angular callback filters the updated first value and row count',
    bundles,
    results: [],
    cold: [],
    additional: [],
    angular: [],
  };
  for (const renderer of ['canvas', 'svg']) {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const start = Date.now();
    await page.goto(`${url}/${renderer}`);
    await page.waitForFunction(() => window.rendererBenchmark);
    evidence.cold.push({ renderer, navigationToHarnessReadyMs: Date.now() - start });
    for (const count of [200, 2000]) {
      for (const operation of ['mount', 'update']) {
        const samples = await page.evaluate(
          ([count, operation]) => window.rendererBenchmark.run(count, operation),
          [count, operation],
        );
        evidence.results.push({
          renderer,
          count,
          series: 3,
          operation,
          samples,
          p95: p95(samples),
        });
        console.log(`${renderer} ${count}x3 ${operation}: p95 ${p95(samples).toFixed(2)}ms`);
      }
      evidence.additional.push({
        renderer,
        count,
        ...(await page.evaluate((count) => window.rendererBenchmark.costs(count), count)),
      });
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => window.rendererBenchmark.render(theme), theme);
      await page.locator('#plot').screenshot({
        path: join(root, `docs/experiments/captures/renderer-${renderer}-${theme}.png`),
      });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const coldPage = await browser.newPage({ reducedMotion: 'reduce' });
  const coldStart = Date.now();
  await coldPage.goto(`http://localhost:${port}/playground`);
  await coldPage.locator('nec-bar-chart canvas').waitFor();
  evidence.cold.push({
    renderer: 'angular-canvas',
    navigationToCanvasMs: Date.now() - coldStart,
    scripts: await coldPage.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .filter((entry) => entry.name.endsWith('.js'))
        .map((entry) => ({
          file: entry.name.split('/').pop(),
          duration: entry.duration,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
        })),
    ),
  });
  await coldPage.close();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://localhost:${port}/benchmark`);
  await page.waitForFunction(() => window.angularBarBenchmark);
  for (const count of [200, 2000]) {
    for (const operation of ['mount', 'update']) {
      const samples = await page.evaluate(
        ([count, operation]) => window.angularBarBenchmark.run(operation, count),
        [count, operation],
      );
      evidence.angular.push({
        renderer: 'canvas',
        count,
        series: 3,
        operation,
        samples,
        p95: p95(samples),
        targetApplies: count === 200,
        passed: count === 200 ? p95(samples) <= 200 : null,
      });
      console.log(`Angular Canvas ${count}x3 ${operation}: p95 ${p95(samples).toFixed(2)}ms`);
    }
    const samples = await page.evaluate((count) => window.angularBarBenchmark.table(count), count);
    evidence.additional.push({ renderer: 'angular-canvas', count, expandedTableSamples: samples });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    join(root, 'docs/experiments/data/bar-benchmark.json'),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(join(root, '.prettierrc'))),
      parser: 'json',
    }),
  );
  assert(
    evidence.angular.filter((result) => result.targetApplies).every((result) => result.passed),
    'Normal Angular fixture exceeded the proposed 200ms p95 target',
  );
  console.log(
    'PASS: renderer comparison and actual Angular normal mount/update targets; raw samples saved.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  staticServer.close();
}
