import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const base = process.argv[2] ?? 'http://localhost:4193/';
const output = 'docs/experiments/captures/radar';
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4193' },
      stdio: 'pipe',
    });
let log = '';
server?.stdout.on('data', (data) => (log += data));
server?.stderr.on('data', (data) => (log += data));
let browser;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
try {
  if (server) {
    const deadline = Date.now() + 30000;
    while (true) {
      assert(server.exitCode === null && Date.now() < deadline, log);
      try {
        if ((await fetch(base)).ok) break;
      } catch {}
      await delay(100);
    }
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await mkdir(output, { recursive: true });
  const captures = [];
  for (const theme of ['dark', 'light'])
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('radar/', base).href);
      await expect(page.locator('nec-radar-chart canvas')).toHaveCount(1);
      if (theme === 'light') {
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
        await expect(page.locator('.site-shell')).not.toHaveClass(/dark/);
      }
      await page.evaluate(() => document.fonts.ready);
      const plotWidth = await page.locator('nec-radar-chart .plot').evaluate((e) => e.clientWidth);
      await expect
        .poll(() =>
          page.locator('nec-radar-chart canvas').evaluate((e) => e.getBoundingClientRect().width),
        )
        .toBe(plotWidth);
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false);
      const path = `${output}/${theme}-${width}.png`;
      const bytes = await page.screenshot({ path, fullPage: true });
      captures.push({ theme, width, plotWidth, overflow, path, sha256: hash(bytes) });
      if (width === 320) {
        await page.getByRole('button', { name: 'Show data table', exact: true }).click();
        await expect(page.locator('nec-radar-chart tbody tr')).toHaveCount(6);
        await page
          .locator('nec-radar-chart')
          .screenshot({ path: `${output}/${theme}-320-table.png` });
      }
    }
  assert.deepEqual(errors, []);
  const manifest = {
    capturedAt: new Date().toISOString(),
    source: Object.fromEntries(
      await Promise.all(
        [
          'projects/chart-library/radar/src/lib/radar-chart.ts',
          'projects/chart-library/radar/src/lib/radar-options.ts',
          'projects/chart-library/radar/src/lib/radar-renderer.ts',
          'projects/playground/src/app/radar-blocks.html',
        ].map(async (path) => [path, hash(await readFile(path))]),
      ),
    ),
    captures,
    errors,
  };
  await writeFile(
    `${output}/manifest.json`,
    await format(JSON.stringify(manifest), {
      ...(await resolveConfig('.prettierrc')),
      parser: 'json',
    }),
  );
  console.log(
    'PASS: eight radar theme/width captures, exact table rows and no page overflow or browser errors.',
  );
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
