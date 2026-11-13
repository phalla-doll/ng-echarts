import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';

// Pass a deployed base URL to review the same matrix against GitHub Pages.
const external = process.argv[2];
const base = external ?? 'http://localhost:4181/';
const output = resolve(process.argv[3] ?? 'docs/experiments/captures/visual-audit/after');
const server = external
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4181' },
      stdio: 'pipe',
    });
let log = '';
server?.stdout.on('data', (chunk) => (log += chunk));
server?.stderr.on('data', (chunk) => (log += chunk));
let browser;
const sha = (data) => createHash('sha256').update(data).digest('hex');
const captures = [];
const measurements = [];
try {
  if (server) {
    const deadline = Date.now() + 30_000;
    while (true) {
      assert(server.exitCode === null, log);
      try {
        if ((await fetch(base)).ok) break;
      } catch {
        // Wait for this script's production SSR server.
      }
      assert(Date.now() < deadline, `Server startup timed out: ${log}`);
      await delay(100);
    }
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  const context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  const capture = async (name, locator = page, options = {}) => {
    if (locator !== page) {
      await locator.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    }
    const bytes = await locator.screenshot({ path: resolve(output, name), ...options });
    captures.push({ name, sha256: sha(bytes) });
  };
  for (const route of ['', 'line', 'area', 'pie']) {
    const family = route || 'bar';
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(new URL(route, base).href);
    await expect(page.locator('.gallery canvas')).toHaveCount(route === 'pie' ? 3 : 4);
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ['dark', 'light']) {
      if (theme === 'light')
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
        for (const canvas of await page.locator('.gallery canvas').all()) {
          await expect
            .poll(() =>
              canvas.evaluate((element) =>
                Math.abs(element.width - element.getBoundingClientRect().width),
              ),
            )
            .toBeLessThan(1);
        }
        // Covers the engine's maximum 300 ms initial animation, including its first-frame handoff.
        await page.waitForTimeout(400);
        await page.evaluate(() => window.scrollTo(0, 0));
        await capture(`${family}-${theme}-${width}.png`);
        measurements.push(
          await page.evaluate(
            ({ family, theme, width }) => ({
              family,
              theme,
              width,
              scrollWidth: document.documentElement.scrollWidth,
              blocks: [...document.querySelectorAll('.block-section')].map((block) => ({
                id: block.id,
                metrics: block
                  .querySelector('.block-metrics')
                  .textContent.trim()
                  .replace(/\s+/g, ' '),
                plot: block.querySelector('.plot').getBoundingClientRect().toJSON(),
                legend: [...block.querySelectorAll('.legend button')].map((button) => ({
                  height: button.getBoundingClientRect().height,
                  color: getComputedStyle(button.querySelector('.swatch')).backgroundColor,
                })),
              })),
            }),
            { family, theme, width },
          ),
        );
        if (width === 1440 || width === 320) {
          const card = page.locator('.block-card').first();
          await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));
          const point = await card.locator('canvas').evaluate((canvas) => {
            const pixels = canvas
              .getContext('2d')
              .getImageData(0, 0, canvas.width, canvas.height).data;
            let nearest;
            let distance = Infinity;
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const offset = (y * canvas.width + x) * 4;
                const channels = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
                if (Math.max(...channels) - Math.min(...channels) < 70) continue;
                const candidate = (x - canvas.width / 2) ** 2 + (y - canvas.height / 2) ** 2;
                if (candidate < distance) {
                  nearest = { x, y };
                  distance = candidate;
                }
              }
            }
            if (!nearest) throw new Error('No painted series pixel');
            const box = canvas.getBoundingClientRect();
            return { x: box.x + nearest.x, y: box.y + nearest.y };
          });
          await page.mouse.move(point.x, point.y);
          const tooltip = card.locator('[data-nec-tooltip]');
          await expect(tooltip).toBeVisible();
          const bounds = await card.locator('.plot').boundingBox();
          await expect
            .poll(async () => {
              const box = await tooltip.locator('..').boundingBox();
              return (
                box &&
                box.x >= bounds.x - 1 &&
                box.y >= bounds.y - 1 &&
                box.x + box.width <= bounds.x + bounds.width + 1 &&
                box.y + box.height <= bounds.y + bounds.height + 1
              );
            })
            .toBe(true);
          await capture(`${family}-${theme}-${width}-tooltip.png`, card);
          await page.mouse.move(0, 0);
          await expect(tooltip).toBeHidden();
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await capture(`${family}-${theme}-320-full.png`, page, { fullPage: true });
      const last = page.locator('.block-section').last();
      // The lower horizontal axis and outside radial labels need their own narrow captures.
      if (family === 'bar' || family === 'pie')
        await capture(`${family}-${theme}-320-last.png`, last);
      const first = page.locator('.block-section').first();
      await first.locator('.integration-heading button').focus();
      await page.keyboard.press('Tab');
      await capture(`${family}-${theme}-320-code.png`, first.locator('.integration-card'));
      if (family === 'bar') {
        await first.locator('.legend button').first().click();
        await expect(first.locator('.legend button').first()).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        await page.mouse.move(0, 0);
        await page.waitForTimeout(400);
        await capture(`bar-${theme}-320-hidden.png`, first.locator('.block-card'));
        await first.locator('.legend button').first().click();
      }
    }
  }
  assert.deepEqual(errors, []);
  const sourcePaths = [
    'projects/playground/src/gallery-shell.css',
    'projects/playground/src/app/bar-block.css',
    'projects/playground/src/app/bar-block.html',
    'projects/playground/src/app/pie-block.html',
    'projects/chart-library/core/src/lib/cartesian-options.ts',
    'tools/capture-visual-audit.mjs',
  ];
  const sources = [];
  for (const path of sourcePaths) sources.push({ path, sha256: sha(await readFile(path)) });
  await writeFile(
    resolve(output, 'manifest.json'),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        base,
        browser: browser.version(),
        node: process.version,
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
        viewportHeights: 1000,
        sources,
        captures,
        measurements,
        errors,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Captured ${captures.length} images; ${measurements.length} family/theme/width combinations; no browser or HTTP errors. ${output}`,
  );
} finally {
  await browser?.close();
  server?.kill();
}
