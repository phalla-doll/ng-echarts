import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';
const base = process.argv[2] ?? 'http://localhost:4182/';
const output = resolve(
  process.argv[3] ?? process.env.LINKED_CAPTURE_OUTPUT ?? 'docs/experiments/captures/linked',
);
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4182' },
      stdio: 'pipe',
    });
let log = '',
  browser;
server?.stdout.on('data', (data) => (log += data));
server?.stderr.on('data', (data) => (log += data));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const captures = [],
  measurements = [];
try {
  if (server) {
    const deadline = Date.now() + 30_000;
    while (true) {
      assert(server.exitCode === null && Date.now() < deadline, log);
      try {
        if ((await fetch(base)).ok) break;
      } catch {}
      await delay(100);
    }
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const theme of ['dark', 'light']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(new URL('linked/', base).href);
    await expect(page.locator('canvas')).toHaveCount(2);
    const wanted = `Use ${theme === 'light' ? 'dark' : 'light'} theme`;
    if (!(await page.getByRole('button', { name: wanted, exact: true }).count()))
      await page.getByRole('button', { name: `Use ${theme} theme`, exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('');
      await expect(
        page.getByRole('button', { name: 'Reset period filter', exact: true }),
      ).toHaveCount(0);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      if (width === 1440 || width === 320) {
        await page.evaluate(() => window.scrollTo(0, 0));
        const initial = `linked-${theme}-${width}-all-months-filter.png`;
        captures.push({
          name: initial,
          sha256: hash(
            await page.locator('.linked-toolbar').screenshot({ path: resolve(output, initial) }),
          ),
        });
        if (width === 1440) {
          const initialPage = `linked-${theme}-${width}-all-months.png`;
          captures.push({
            name: initialPage,
            sha256: hash(
              await page.screenshot({ path: resolve(output, initialPage), fullPage: true }),
            ),
          });
        }
      }
      await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('month:feb');
      await expect(page.locator('.detail h2')).toHaveText('Device share · February');
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      if (width === 1440 || width === 320) {
        const selected = `linked-${theme}-${width}-selected-filter.png`;
        captures.push({
          name: selected,
          sha256: hash(
            await page.locator('.linked-toolbar').screenshot({ path: resolve(output, selected) }),
          ),
        });
      }
      await page.waitForTimeout(400);
      if (width === 1440 || width === 320) {
        const overview = `linked-${theme}-${width}-selected-overview.png`;
        captures.push({
          name: overview,
          sha256: hash(
            await page.locator('.overview').screenshot({ path: resolve(output, overview) }),
          ),
        });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const name = `linked-${theme}-${width}.png`;
      captures.push({
        name,
        sha256: hash(await page.screenshot({ path: resolve(output, name), fullPage: true })),
      });
      await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('__range__');
      await page.getByRole('combobox', { name: 'From', exact: true }).selectOption('feb');
      const to = page.getByRole('combobox', { name: 'To', exact: true });
      await to.selectOption('apr');
      await expect(page.locator('.linked-status')).toContainText('February–April: 3,189 visits');
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await page.waitForTimeout(250);
      await page.evaluate(() => window.scrollTo(0, 0));
      const rangePage = `linked-${theme}-${width}-range.png`;
      captures.push({
        name: rangePage,
        sha256: hash(await page.screenshot({ path: resolve(output, rangePage), fullPage: true })),
      });
      await to.focus();
      const rangeToolbar = `linked-${theme}-${width}-range-focus.png`;
      const toolbar = await page.locator('.linked-toolbar').boundingBox();
      assert(toolbar);
      captures.push({
        name: rangeToolbar,
        sha256: hash(
          await page.screenshot({
            path: resolve(output, rangeToolbar),
            clip: {
              x: toolbar.x - 4,
              y: toolbar.y - 4,
              width: toolbar.width + 8,
              height: toolbar.height + 8,
            },
          }),
        ),
      });
      if (width === 320) {
        await page
          .locator('.overview')
          .getByRole('button', { name: 'Show data table', exact: true })
          .click();
        await expect(page.locator('.overview .selected-row')).toHaveCount(3);
        await expect(page.locator('.overview tr[aria-current]')).toHaveCount(0);
        const rangeTable = `linked-${theme}-${width}-range-table.png`;
        await page.evaluate(() => window.scrollTo(0, 0));
        captures.push({
          name: rangeTable,
          sha256: hash(
            await page.screenshot({ path: resolve(output, rangeTable), fullPage: true }),
          ),
        });
        await page
          .locator('.overview')
          .getByRole('button', { name: 'Hide data table', exact: true })
          .click();
      }
      measurements.push({
        theme,
        width,
        scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
        status: await page.locator('.linked-status').textContent(),
      });
    }
    await page
      .locator('.overview')
      .getByRole('button', { name: 'Show data table', exact: true })
      .click();
    const action = page
      .locator('.overview')
      .getByRole('button', { name: 'Select Mobile for March: 290', exact: true });
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(action).toBeFocused();
    await expect(page.locator('.overview tr[aria-current=true]')).toContainText('March');
    const name = `linked-${theme}-320-keyboard.png`;
    captures.push({
      name,
      sha256: hash(await page.screenshot({ path: resolve(output, name) })),
    });
    await page.getByText('Standalone Angular example', { exact: true }).click();
    await page.locator('pre').focus();
    const code = `linked-${theme}-320-code.png`;
    captures.push({
      name: code,
      sha256: hash(
        await page.locator('.linking-guide').screenshot({ path: resolve(output, code) }),
      ),
    });
  }
  assert.deepEqual(errors, []);
  const sources = [];
  for (const path of [
    'projects/chart-library/bar/src/lib/bar-chart.ts',
    'projects/chart-library/bar/src/lib/bar-options.ts',
    'projects/chart-library/core/src/lib/cartesian-chart.ts',
    'projects/chart-library/core/src/lib/cartesian-chart.html',
    'projects/chart-library/core/src/lib/cartesian-chart.css',
    'projects/playground/src/app/linked-period.ts',
    'projects/playground/src/app/linked-visits.ts',
    'projects/playground/src/app/linked-visits.html',
    'projects/playground/src/app/linked-visits.css',
    'projects/playground/src/app/linked-charts.ts',
    'projects/playground/src/app/linked-charts.css',
    'projects/playground/src/app/linked-example-source.ts',
    'projects/playground/src/styles.css',
    'tools/capture-linked-charts.mjs',
  ])
    sources.push({ path, sha256: hash(await readFile(path)) });
  await writeFile(
    resolve(output, 'manifest.json'),
    await format(
      JSON.stringify({
        recordedAt: new Date().toISOString(),
        base,
        browser: browser.version(),
        node: process.version,
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
        sources,
        captures,
        measurements,
        errors,
      }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    `PASS: ${captures.length} linked captures; ${measurements.length} theme/width combinations; no browser or HTTP errors.`,
  );
} finally {
  await browser?.close();
  server?.kill();
}
