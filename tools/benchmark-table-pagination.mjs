import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { cpus, platform, release } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { format, resolveConfig } from 'prettier';

const root = resolve(import.meta.dirname, '..');
const build = resolve(root, process.env['CHART_LIBRARY_BENCHMARK_BUILD'] ?? 'dist/playground');
const server = spawn(process.execPath, [resolve(build, 'server/server.mjs')], {
  cwd: root,
  env: { ...process.env, PORT: '0' },
  stdio: 'pipe',
});
let log = '',
  browser;
server.stdout.on('data', (data) => (log += data));
server.stderr.on('data', (data) => (log += data));
const summarize = (samples) => {
  const sorted = [...samples].sort((a, b) => a - b);
  return { samples, medianMs: sorted[15], p95Ms: sorted[28] };
};
try {
  let port;
  const deadline = Date.now() + 30_000;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null && Date.now() < deadline, log);
    await delay(100);
  }
  browser = await chromium.launch();
  const families = [];
  for (const family of ['bar', 'line', 'area', 'composed', 'pie']) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://localhost:${port}/${family === 'bar' ? '' : `${family}-`}benchmark`);
      await page.waitForFunction(() => window.angularBarBenchmark);
      const count = family === 'pie' ? 100 : 2000;
      const samples = { complete: [], paged: [] };
      for (let round = 0; round < 10; round++) {
        for (const mode of round % 2 ? ['paged', 'complete'] : ['complete', 'paged']) {
          const values = await page.evaluate(
            ({ count, size }) => window.angularBarBenchmark.table(count, size),
            { count, size: mode === 'complete' ? null : 50 },
          );
          assert.equal(values.length, 3);
          assert(values.every((value) => Number.isFinite(value) && value >= 0));
          samples[mode].push(...values);
        }
      }
      assert.deepEqual(errors, []);
      assert.equal(await page.locator('canvas').count(), 0);
      const result = {
        family,
        count,
        series: family === 'pie' ? 1 : 3,
        pageSize: 50,
        complete: summarize(samples.complete),
        paged: summarize(samples.paged),
      };
      families.push(result);
      console.log(
        `${family}: complete ${result.complete.p95Ms.toFixed(1)} ms; paged ${result.paged.p95Ms.toFixed(1)} ms p95`,
      );
    } finally {
      await context.close();
    }
  }
  const evidence = {
    recordedAt: new Date().toISOString(),
    version: JSON.parse(await readFile(resolve(root, 'projects/chart-library/package.json')))
      .version,
    node: process.version,
    browser: browser.version(),
    machine: { platform: platform(), release: release(), cpu: cpus()[0].model },
    method: {
      build:
        'Production Angular components; 768x320 plot; DPR 1; animation disabled; no CPU/network throttling',
      samples:
        'Ten alternating complete/paged pairs per family; each operation warms once then takes three samples, totaling thirty measured samples per mode',
      timing:
        'Native Show data table click through Angular afterNextRender; all expected current-page cells present. Includes row construction and DOM creation, excludes subsequent layout/paint',
      scope:
        'Same source build, data and chart options in both modes; pagination size 50. Pie retains its separate 100-category stress fixture',
    },
    families,
  };
  await writeFile(
    resolve(root, 'docs/experiments/data/table-pagination-performance.json'),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(resolve(root, '.prettierrc'))),
      parser: 'json',
    }),
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
