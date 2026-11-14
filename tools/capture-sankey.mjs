import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';
const base = process.argv[2] ?? 'http://localhost:4197/';
const output = 'docs/experiments/captures/sankey';
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4197' },
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
  for (const theme of ['dark', 'light'])
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('sankey/', base).href);
      const chart = page.locator('nec-sankey-chart');
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
      assert.equal(await chart.locator('tbody tr').count(), 13);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      const path = `${output}/${theme}-${width}.png`;
      captures.push({
        theme,
        width,
        path,
        sha256: hash(await page.screenshot({ path, fullPage: true })),
      });
      if (width === 320) {
        await chart.locator('.flow-data > summary').click();
        await chart
          .getByRole('button', { name: 'Select flow Direct to Trial: 0', exact: true })
          .focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.flow-selection')).toHaveText('Direct to Trial: 0 visits');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
        const path = `${output}/${theme}-320-data.png`;
        captures.push({
          theme,
          width,
          case: 'native zero action',
          path,
          sha256: hash(await page.screenshot({ path, fullPage: true })),
        });
        await chart.locator('.flow-data > summary').click();
        await page.locator('.radial-controls > summary').click();
        for (const [name, button] of [
          ['zero', 'Show recorded zeros'],
          ['empty', 'Empty graph'],
          ['error', 'Invalid cycle'],
        ]) {
          await page.getByRole('button', { name: button, exact: true }).click();
          await expect(chart.locator('canvas')).toHaveCount(0);
          const path = `${output}/${theme}-320-${name}.png`;
          captures.push({
            theme,
            width,
            case: name,
            path,
            sha256: hash(await page.locator('#visitor-journey').screenshot({ path })),
          });
        }
      }
    }
  assert.deepEqual(errors, []);
  const files = [
    'sankey-chart.ts',
    'sankey-chart.html',
    'sankey-chart.css',
    'sankey-model.ts',
    'sankey-options.ts',
    'sankey-browser.ts',
    'sankey-renderer.ts',
  ]
    .map((file) => `projects/chart-library/sankey/src/lib/${file}`)
    .concat(
      ['sankey-blocks.ts', 'sankey-blocks.html', 'sankey-blocks.css', 'sankey-examples.ts'].map(
        (file) => `projects/playground/src/app/${file}`,
      ),
    );
  const source = Object.fromEntries(
    await Promise.all(files.map(async (path) => [path, hash(await readFile(path))])),
  );
  await writeFile(
    `${output}/manifest.json`,
    await format(
      JSON.stringify({ capturedAt: new Date().toISOString(), source, captures, errors }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    'PASS: eight Sankey theme/width views plus native zero, empty and error captures, without page overflow or browser errors.',
  );
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
