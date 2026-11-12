import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { cpus, platform, release } from 'node:os';
import { chromium } from 'playwright';
import { format, resolveConfig } from 'prettier';
const root = new URL('../', import.meta.url);
const server = spawn(process.execPath, ['dist/playground/server/server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: '0' },
  stdio: 'pipe',
});
let log = '',
  browser;
server.stdout.on('data', (data) => (log += data));
server.stderr.on('data', (data) => (log += data));
try {
  const deadarea = Date.now() + 30000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null && Date.now() < deadarea, log);
    await delay(100);
  }
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (document.querySelector('nec-area-chart canvas')) {
        window.areaFirstCanvasAt = performance.now();
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto(`http://localhost:${port}/area-benchmark`);
  await page.waitForFunction(() => window.angularBarBenchmark);
  const results = [];
  for (const count of [200, 2000])
    for (const mode of ['mount', 'update']) {
      const samples = await page.evaluate(
        ([mode, count]) => window.angularBarBenchmark.run(mode, count),
        [mode, count],
      );
      const p95 = [...samples].sort((a, b) => a - b)[28];
      results.push({ count, series: 3, mode, samples, p95 });
      if (count === 200) assert(p95 <= 200, `Area ${mode} exceeds 200 ms target: ${p95}`);
    }
  const table = [];
  for (const count of [200, 2000])
    table.push({
      count,
      samples: await page.evaluate((count) => window.angularBarBenchmark.table(count), count),
    });
  assert.deepEqual(errors, []);
  const coldNavigationToFirstCanvasMs = await page.evaluate(() => window.areaFirstCanvasAt);
  assert(
    Number.isFinite(coldNavigationToFirstCanvasMs),
    'Area benchmark must observe its actual first canvas',
  );
  const evidence = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    machine: { platform: platform(), release: release(), cpu: cpus()[0].model },
    browser: browser.version(),
    method:
      'Actual Angular AreaChart: disabled animation, stacked gradients, points off, straight curves, 768x320 visible host, 1 warm-up + 30 samples; p95=29th sorted; ECharts finished checks row count and updated first value; timer includes input validation/options/lifecycle; Angular/RxJS already bootstrapped',
    dpr: 1,
    coldNavigationToFirstCanvasMs,
    results,
    table,
    passed: true,
  };
  await writeFile(
    new URL('docs/experiments/data/area-benchmark.json', root),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(new URL('.prettierrc', root).pathname)),
      parser: 'json',
    }),
  );
  console.log(
    'PASS: Angular area normal/stress mount/update and expanded tables measured.',
    JSON.stringify(results.map(({ count, mode, p95 }) => ({ count, mode, p95 }))),
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
