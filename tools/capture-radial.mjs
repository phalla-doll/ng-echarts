import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';
const base = process.argv[2] ?? 'http://localhost:4199/';
const output = 'docs/experiments/captures/radial';
const server = process.argv[2]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4199' },
      stdio: 'pipe',
    });
let log = '',
  browser;
server?.stdout.on('data', (data) => (log += data));
server?.stderr.on('data', (data) => (log += data));
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
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await mkdir(output, { recursive: true });
  const captures = [];
  for (const theme of ['dark', 'light'])
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL('radial/', base).href);
      await expect(page.locator('nec-radial-progress canvas')).toHaveCount(2);
      if (theme === 'light') {
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
        await expect(page.locator('.site-shell')).not.toHaveClass(/dark/);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      const nativeValues = await page
        .locator('nec-radial-progress progress')
        .evaluateAll((elements) =>
          elements.map((e) => ({ value: e.getAttribute('value'), max: e.getAttribute('max') })),
        );
      assert.deepEqual(nativeValues, [
        { value: '6800', max: '10000' },
        { value: '9', max: '12' },
      ]);
      const geometry = await page
        .locator('nec-radial-progress .progress-label')
        .evaluateAll((labels) =>
          labels.map((e) => {
            const a = e.getBoundingClientRect(),
              b = e.parentElement.getBoundingClientRect();
            return {
              labelFits:
                a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom,
              percent: e.querySelector('strong').textContent,
              values: e.querySelector('span').textContent,
            };
          }),
        );
      assert(geometry.every((g) => g.labelFits));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false);
      const path = `${output}/${theme}-${width}.png`;
      captures.push({
        theme,
        width,
        path,
        overflow,
        geometry,
        sha256: hash(await page.screenshot({ path, fullPage: true })),
      });
      if (width === 320) {
        const primary = page.locator('#monthly-goal');
        await primary.locator('summary').click();
        for (const [name, button] of [
          ['zero', 'Show zero'],
          ['complete', 'Complete goal'],
          ['empty', 'Missing value'],
        ]) {
          await primary.getByRole('button', { name: button, exact: true }).click();
          if (name === 'empty')
            await expect(primary.getByRole('status')).toHaveText('No progress data available.');
          else
            await expect(primary.locator('.progress-label strong')).toHaveText(
              name === 'zero' ? '0%' : '100%',
            );
          await primary.screenshot({ path: `${output}/${theme}-320-${name}.png` });
        }
      }
    }
  assert.deepEqual(errors, []);
  const source = Object.fromEntries(
    await Promise.all(
      [
        'projects/chart-library/radial/src/lib/radial-progress.ts',
        'projects/chart-library/radial/src/lib/radial-options.ts',
        'projects/playground/src/app/radial-block.html',
        'projects/playground/src/app/radial-blocks.html',
        'projects/playground/src/app/radial-examples.ts',
      ].map(async (path) => [path, hash(await readFile(path))]),
    ),
  );
  await writeFile(
    `${output}/manifest.json`,
    await format(
      JSON.stringify({ capturedAt: new Date().toISOString(), source, captures, errors }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    'PASS: eight radial theme/width captures, native values, zero/full/empty states, fitted labels and no page overflow or browser errors.',
  );
} finally {
  await browser?.close();
  server?.kill('SIGTERM');
}
