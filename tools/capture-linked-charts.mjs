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
const output = resolve(process.argv[3] ?? 'docs/experiments/captures/linked');
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
      await page.getByLabel('Show device share for').selectOption('feb');
      await expect(page.locator('.detail h2')).toHaveText('Device share · February');
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      const name = `linked-${theme}-${width}.png`;
      captures.push({
        name,
        sha256: hash(await page.screenshot({ path: resolve(output, name), fullPage: true })),
      });
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
    'projects/playground/src/app/linked-visits.ts',
    'projects/playground/src/app/linked-visits.html',
    'projects/playground/src/app/linked-visits.css',
    'projects/playground/src/app/linked-charts.ts',
    'projects/playground/src/app/linked-charts.css',
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
