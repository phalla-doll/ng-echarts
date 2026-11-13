import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';
const base = process.argv[2] ?? 'http://localhost:4198/';
const output = 'docs/experiments/captures/calendar';
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4198' },
      stdio: 'pipe',
    });
let log = '',
  browser;
server?.stdout.on('data', (bytes) => (log += bytes));
server?.stderr.on('data', (bytes) => (log += bytes));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
try {
  if (server) {
    const end = Date.now() + 30000;
    while (true) {
      assert(server.exitCode === null && Date.now() < end, log);
      try {
        if ((await fetch(base)).ok) break;
      } catch {}
      await delay(100);
    }
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await mkdir(output, { recursive: true });
  const captures = [];
  const additional = [];
  for (const theme of ['dark', 'light'])
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('calendar/', base).href);
      const chart = page.locator('nec-calendar-heatmap');
      await expect(chart.locator('canvas').first()).toBeVisible();
      if (
        (await page.locator('.site-shell').getAttribute('class')).includes('dark') !==
        (theme === 'dark')
      )
        await page.getByRole('button', { name: /Use (light|dark) theme/ }).click();
      await page.mouse.move(0, 0);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      assert.equal(await chart.locator('tbody tr').count(), 366);
      const geometry = await chart
        .locator('.plot')
        .evaluate((e) => ({ width: e.clientWidth, height: e.clientHeight }));
      assert.equal(geometry.height, geometry.width < 560 ? 566 : 152);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      const path = `${output}/${theme}-${width}.png`;
      captures.push({
        theme,
        width,
        path,
        geometry,
        sha256: hash(await page.screenshot({ path, fullPage: true })),
      });
      if (width === 320) {
        await chart.locator('.calendar-data > summary').click();
        await chart.locator('.calendar-month').first().locator('summary').click();
        await chart.getByRole('button', { name: 'Select 2024-01-01: 0', exact: true }).focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.calendar-selection')).toHaveText('2024-01-01: 0 contributions');
        await page.screenshot({ path: `${output}/${theme}-320-data.png`, fullPage: true });
        await chart.locator('.calendar-data > summary').click();
        await page.locator('.radial-controls > summary').click();
        for (const [name, button] of [
          ['zero', 'Show recorded zeros'],
          ['empty', 'Missing values'],
          ['error', 'Invalid date'],
        ]) {
          await page.getByRole('button', { name: button, exact: true }).click();
          if (name === 'zero') await expect(chart.locator('canvas').first()).toBeVisible();
          if (name === 'empty')
            await expect(chart.getByRole('status')).toHaveText(
              'No calendar observations available.',
            );
          if (name === 'error') await expect(chart.getByRole('alert')).toContainText('Gregorian');
          await page
            .locator('#daily-contributions')
            .screenshot({ path: `${output}/${theme}-320-${name}.png` });
        }
      }
    }
  const apia = await browser.newContext({
    timezoneId: 'Pacific/Apia',
    viewport: { width: 320, height: 1000 },
    reducedMotion: 'reduce',
  });
  try {
    const fallback = await apia.newPage();
    await fallback.goto(new URL('calendar/', base).href);
    const chart = fallback.locator('nec-calendar-heatmap');
    await expect(chart.locator('canvas').first()).toBeVisible();
    const year = fallback.getByRole('spinbutton', { name: 'Year', exact: true });
    await year.fill('2011');
    await year.press('Tab');
    await expect(chart.getByRole('status')).toContainText('This timezone skips a date in 2011.');
    await expect(chart.locator('canvas')).toHaveCount(0);
    await chart.locator('.calendar-data > summary').click();
    await chart.locator('.calendar-month').last().locator('summary').click();
    await chart.getByRole('button', { name: 'Select 2011-12-30: 13', exact: true }).focus();
    await fallback.keyboard.press('Enter');
    await expect(fallback.locator('.calendar-selection')).toHaveText(
      '2011-12-30: 13 contributions',
    );
    const path = `${output}/dark-320-skipped-date.png`;
    additional.push({
      case: 'skipped-date native fallback',
      timezone: 'Pacific/Apia',
      year: 2011,
      path,
      sha256: hash(await fallback.screenshot({ path, fullPage: true })),
    });
  } finally {
    await apia.close();
  }
  assert.deepEqual(errors, []);
  const source = Object.fromEntries(
    await Promise.all(
      [
        'projects/chart-library/calendar/src/lib/calendar-heatmap.ts',
        'projects/chart-library/calendar/src/lib/calendar-heatmap.html',
        'projects/chart-library/calendar/src/lib/calendar-heatmap.css',
        'projects/chart-library/calendar/src/lib/calendar-options.ts',
        'projects/chart-library/calendar/src/lib/calendar-browser.ts',
        'projects/chart-library/calendar/src/lib/calendar-renderer.ts',
        'projects/chart-library/calendar/src/lib/calendar-model.ts',
        'projects/playground/src/app/calendar-blocks.ts',
        'projects/playground/src/app/calendar-blocks.html',
        'projects/playground/src/app/calendar-blocks.css',
        'projects/playground/src/app/calendar-examples.ts',
      ].map(async (path) => [path, hash(await readFile(path))]),
    ),
  );
  await writeFile(
    `${output}/manifest.json`,
    await format(
      JSON.stringify({
        capturedAt: new Date().toISOString(),
        source,
        captures,
        additional,
        errors,
      }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    'PASS: eight calendar theme/width captures, native data, recorded-zero/empty/error states, correct responsive layout and no page overflow or browser errors.',
  );
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
