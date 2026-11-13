import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, firefox, webkit } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const base = process.argv[2] ?? 'http://localhost:4184/';
const output = resolve(process.argv[3] ?? 'docs/experiments/captures/focus-refinement');
const captureImages = process.env['FOCUS_CAPTURE_IMAGES'] !== '0';
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4184' },
      stdio: 'pipe',
    });
let log = '';
server?.stdout.on('data', (data) => (log += data));
server?.stderr.on('data', (data) => (log += data));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const checks = [],
  captures = [],
  engines = [],
  errors = [];
let browser;
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
  for (const engine of [chromium, firefox, webkit]) {
    browser = await engine.launch();
    const page = await browser.newPage({ reducedMotion: 'reduce', deviceScaleFactor: 2 });
    engines.push({ name: engine.name(), version: browser.version() });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    const focus = async (locator, target, theme, width, inset = false, forced = false) => {
      await expect(locator).toBeVisible();
      await page.keyboard.press('Tab');
      await locator.focus();
      await expect(locator).toBeFocused();
      await expect(locator).toHaveCSS('outline-style', 'solid');
      await expect(locator).toHaveCSS('outline-width', forced ? '2px' : '1px');
      await expect(locator).toHaveCSS('outline-offset', inset ? '-2px' : '2px');
      if (!forced) await expect(locator).toHaveCSS('outline-color', 'rgb(115, 115, 115)');
      checks.push({
        engine: engine.name(),
        route: new URL(page.url()).pathname,
        theme,
        width,
        target,
        forced,
        style: await locator.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            width: style.outlineWidth,
            offset: style.outlineOffset,
            color: style.outlineColor,
            focusVisible: element.matches(':focus-visible'),
          };
        }),
      });
    };
    const capture = async (locator, name) => {
      if (engine !== chromium || !captureImages) return;
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      const viewport = page.viewportSize();
      const x = Math.max(0, box.x - 6),
        y = Math.max(0, box.y - 6);
      const clip = {
        x,
        y,
        width: Math.min(box.width + 12, viewport.width - x),
        height: Math.min(box.height + 12, viewport.height - y),
      };
      captures.push({
        name,
        sha256: hash(await page.screenshot({ path: resolve(output, name), clip })),
      });
    };
    for (const theme of ['dark', 'light']) {
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(new URL('linked/', base).href);
        await expect(page.locator('canvas')).toHaveCount(2);
        const switchTheme = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
        if (await switchTheme.count()) await switchTheme.click();
        await page.evaluate(() => document.fonts.ready);
        const month = page.getByRole('combobox', { name: 'Month', exact: true });
        await month.selectOption('dec');
        await focus(month, 'month', theme, width);
        await capture(page.locator('.linked-toolbar'), `month-${theme}-${width}.png`);
        await focus(
          page.getByRole('button', { name: 'Reset month filter', exact: true }),
          'reset',
          theme,
          width,
        );
        const chart = page.locator('.overview nec-bar-chart');
        await focus(chart.locator('.legend button').first(), 'chart-legend', theme, width);
        await capture(chart.locator('.legend'), `legend-${theme}-${width}.png`);
        await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
        await focus(chart.locator('.table-scroll'), 'table-scroll', theme, width, true);
        await focus(chart.locator('tr[aria-current] button').last(), 'table-value', theme, width);
        await capture(chart.locator('tr[aria-current]'), `table-${theme}-${width}.png`);
        const summary = page.getByText('Standalone Angular example', { exact: true });
        await focus(summary, 'details-summary', theme, width);
        await page.keyboard.press('Enter');
        await focus(page.locator('.linking-guide pre'), 'linked-code', theme, width, true);
        await capture(page.locator('.linking-guide pre'), `code-${theme}-${width}.png`);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
        if (width === 320) {
          await focus(
            page.getByRole('button', { name: 'Open navigation', exact: true }),
            'mobile-menu',
            theme,
            width,
          );
        } else {
          await focus(
            page
              .getByRole('navigation', { name: 'Playground pages' })
              .getByRole('link', { name: 'Linked Charts', exact: true }),
            'navigation-link',
            theme,
            width,
          );
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const route of ['', 'line/', 'area/', 'pie/', 'composed/']) {
        await page.goto(new URL(route, base).href);
        await expect(page.locator('canvas').first()).toBeVisible();
        await focus(
          page.locator('.legend button').first(),
          `${route || 'bar/'}legend`,
          theme,
          1440,
        );
      }
      await page.goto(new URL('installation/', base).href);
      await focus(
        page.locator('app-source-snippet pre').first(),
        'documentation-code',
        theme,
        1440,
        true,
      );
      await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#page-content')).toBeFocused();
      await expect(page.locator('#page-content')).toHaveCSS('outline-style', 'none');
      await page.goto(new URL('comparison/', base).href);
      await focus(
        page.locator('.comparison-page .controls button').first(),
        'comparison-control',
        theme,
        1440,
      );
      await page.goto(new URL('comparison/?reference=1', base).href);
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Toggle comparison theme', exact: true }).click();
      await focus(page.locator('.reference-mode button').first(), 'reference-control', theme, 1440);
      await page.goto(new URL('playground/', base).href);
      const code = page.getByRole('button', { name: 'Angular code', exact: true });
      await focus(code, 'workbench-control', theme, 1440);
      await page.keyboard.press('Enter');
      await focus(
        page.locator('pre[aria-label="Angular template"]'),
        'workbench-code',
        theme,
        1440,
        true,
      );
    }
    await page.goto(new URL('linked/', base).href);
    await expect(page.locator('canvas')).toHaveCount(2);
    await page.emulateMedia({ forcedColors: 'active' });
    const supported = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    engines.at(-1).forcedColorsEmulated = supported;
    if (supported) {
      await focus(
        page.getByRole('combobox', { name: 'Month', exact: true }),
        'forced-month',
        'system',
        1440,
        false,
        true,
      );
      await page.locator('.overview .table-toggle').click();
      await focus(
        page.locator('.overview .table-scroll'),
        'forced-table-scroll',
        'system',
        1440,
        true,
        true,
      );
    }
    await browser.close();
    browser = null;
  }
  assert.deepEqual(errors, []);
  const sources = [];
  for (const path of [
    'projects/playground/src/site-focus.css',
    'projects/playground/src/styles.css',
    'projects/playground/src/site-controls.css',
    'projects/playground/src/gallery-shell.css',
    'projects/playground/src/app/linked-visits.css',
    'projects/playground/src/app/linked-charts.css',
    'projects/playground/src/app/comparison.css',
    'projects/playground/src/app/source-snippet.ts',
    'tools/capture-focus-refinement.mjs',
  ]) {
    sources.push({ path, sha256: hash(await readFile(path)) });
  }
  await writeFile(
    resolve(output, 'manifest.json'),
    await format(
      JSON.stringify({
        recordedAt: new Date().toISOString(),
        base,
        node: process.version,
        deviceScaleFactor: 2,
        engines,
        sources,
        checks,
        captures,
        errors,
      }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    `PASS: ${checks.length} focus checks; ${captures.length} captures; ${engines.length} engines; no overflow or browser errors.`,
  );
} finally {
  await browser?.close();
  server?.kill();
}
