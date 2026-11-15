import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/experiments/captures/composed-dashboard');
const server = spawn(process.execPath, ['dist/playground/server/server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: '0' },
  stdio: 'pipe',
});
let log = '',
  browser;
server.stdout.on('data', (data) => (log += data));
server.stderr.on('data', (data) => (log += data));
const captures = [];
try {
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null && Date.now() < deadline, log);
    await delay(100);
  }
  browser = await chromium.launch();
  const page = await browser.newPage({
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await mkdir(output, { recursive: true });
  for (const route of ['linked-dashboard', 'composed']) {
    await page.goto(`http://localhost:${port}/${route}`);
    const region = page.locator(
      route === 'composed' ? '#horizontal-visits-and-target' : 'app-dashboard-pilot',
    );
    await region.scrollIntoViewIfNeeded();
    await expect(region.locator('canvas')).toHaveCount(route === 'composed' ? 1 : 2);
    await page.evaluate(() => document.fonts.ready);
    for (const theme of ['light', 'dark']) {
      const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
      if (await toggle.count()) await toggle.click();
      for (const kind of route === 'composed' ? ['horizontal'] : ['bar', 'area']) {
        if (route !== 'composed') {
          await region
            .getByRole('combobox', { name: 'Overview style', exact: true })
            .selectOption(kind);
          await region.getByRole('combobox', { name: 'Month', exact: true }).selectOption('feb');
        }
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          await region.evaluate((element) => element.scrollIntoView({ block: 'center' }));
          await expect
            .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
            .toBeLessThanOrEqual(width);
          for (const canvas of await region.locator('canvas').all()) {
            await expect
              .poll(() =>
                canvas.evaluate((element) =>
                  Math.abs(element.width - element.getBoundingClientRect().width),
                ),
              )
              .toBeLessThan(1);
          }
          // The gallery's finite initial animation is independent of reduced motion hydration.
          await page.waitForTimeout(350);
          const name = `${route}-${kind}-${theme}-${width}.png`;
          const bytes = await region.screenshot({
            path: resolve(output, name),
            // Fixed shell controls are outside the cropped component and otherwise
            // appear midway through a mobile image taller than the viewport.
            style: '.site-header, .menu-button, .skip-link { visibility: hidden !important; }',
          });
          captures.push({
            name,
            route,
            kind,
            theme,
            width,
            sha256: createHash('sha256').update(bytes).digest('hex'),
          });
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(output, 'manifest.json'),
    await format(
      JSON.stringify({
        recordedAt: new Date().toISOString(),
        browser: browser.version(),
        method:
          'Cropped component captures; unrelated fixed shell controls hidden only during each screenshot; rendered chart/control layout unchanged.',
        captures,
        browserErrors: errors,
        passed: true,
      }),
      { ...(await resolveConfig(resolve(root, '.prettierrc'))), parser: 'json' },
    ),
  );
  console.log(
    `PASS: ${captures.length} dashboard/horizontal captures; all widths fit; no browser/HTTP errors.`,
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
