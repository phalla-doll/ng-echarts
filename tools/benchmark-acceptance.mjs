import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { cpus, platform, release, totalmem } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
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
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null && Date.now() < deadline, log);
    await delay(100);
  }
  browser = await chromium.launch();
  const families = [];
  for (const family of ['bar', 'line', 'area', 'pie']) {
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript((family) => {
        const observer = new MutationObserver(() => {
          if (document.querySelector(`nec-${family}-chart canvas`)) {
            window.firstCanvasAt = performance.now();
            observer.disconnect();
          }
        });
        observer.observe(document, { childList: true, subtree: true });
      }, family);
      await page.goto(`http://localhost:${port}/${family === 'bar' ? '' : `${family}-`}benchmark`);
      await page.waitForFunction(() => window.angularBarBenchmark);
      const results = [],
        table = [];
      const counts = family === 'pie' ? [12, 100] : [200, 2000];
      for (const count of counts) {
        for (const mode of ['mount', 'update', 'legend', 'resize']) {
          const samples = await page.evaluate(
            ([mode, count]) =>
              mode === 'mount' || mode === 'update'
                ? window.angularBarBenchmark.run(mode, count)
                : window.angularBarBenchmark.profile(mode, count),
            [mode, count],
          );
          assert.equal(samples.length, 30);
          assert(samples.every((value) => Number.isFinite(value) && value >= 0));
          const p95 = [...samples].sort((a, b) => a - b)[28];
          results.push({ count, mode, samples, p95 });
          if (count === counts[0] && ['mount', 'update'].includes(mode))
            assert(p95 <= 200, `${family} ${mode} exceeds 200 ms: ${p95}`);
          console.log(`${family} ${count} ${mode}: p95 ${p95.toFixed(1)} ms`);
        }
        table.push({
          count,
          samples: await page.evaluate((count) => window.angularBarBenchmark.table(count), count),
        });
      }
      assert.deepEqual(errors, []);
      assert.equal(await page.locator('canvas').count(), 0);
      const coldNavigationToFirstCanvasMs = await page.evaluate(() => window.firstCanvasAt);
      assert(Number.isFinite(coldNavigationToFirstCanvasMs));
      families.push({
        family,
        series: family === 'pie' ? 1 : 3,
        coldNavigationToFirstCanvasMs,
        results,
        table,
      });
    } finally {
      await context.close();
    }
  }
  const evidence = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    machine: {
      platform: platform(),
      release: release(),
      cpu: cpus()[0].model,
      logicalCpus: cpus().length,
      memoryBytes: totalmem(),
    },
    browser: browser.version(),
    method: {
      build: 'production SSR playground, actual Angular components, lazy Canvas renderer',
      fixture:
        '768x320 plot profile; resize alternates host width 768/640; DPR 1; animation disabled; reduced motion; table collapsed',
      variants:
        'bar grouped solid vertical; line straight with points; area stacked gradient; pie donut ratio 0.6 with labels off',
      samples:
        'Each operation: one warm-up and 30 measured samples; p95 = 29th sorted sample. Counts are 200/2000 Cartesian and 12/100 pie.',
      mountAndUpdate:
        'Timer starts before component creation/input assignment (validation/options/lifecycle included), ends on ECharts finished for expected first value and row count; input generation excluded.',
      legend:
        'Native first legend button click to ECharts finished with expected first series/category presence and aria-pressed state; alternating hide/show. Includes Angular validation/options/rendering.',
      resize:
        'Host CSS width assignment to ResizeObserver/controller/ECharts finished with matching canvas plot width. Initial observer deliveries settle before sampling.',
      cold: 'Fresh browser context per family; navigation-to-first-canvas includes SSR, hydration, lazy loading and automation handoff; separate observation, not a warm sample or full-paint signal.',
      table:
        'Actual native toggle through Angular afterNextRender with all numeric cells present; one warm-up, three samples; separate from chart paint.',
      thresholds:
        'Normal mount/update <=200ms p95; interaction, resize, cold, table and stress are reported observations without invented pass thresholds.',
    },
    families,
    passed: true,
  };
  await writeFile(
    new URL('docs/experiments/data/ng14-benchmark.json', root),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(new URL('.prettierrc', root).pathname)),
      parser: 'json',
    }),
  );
  console.log('PASS: all four families measured; normal mount/update meet the target.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
