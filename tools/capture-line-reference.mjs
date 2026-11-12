import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { format, resolveConfig } from 'prettier';
import { writeCaptureGallery } from './capture-gallery.mjs';
const root = new URL('../', import.meta.url),
  output = new URL('docs/experiments/captures/line-variants/', root);
const source = JSON.parse(
  await readFile(new URL('./reference/source-manifest.json', import.meta.url), 'utf8'),
);
const servers = [
  {
    process: spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      cwd: root,
      env: { ...process.env, PORT: '4175' },
      stdio: 'pipe',
    }),
    url: 'http://localhost:4175',
  },
  {
    process: spawn(
      process.execPath,
      [
        'node_modules/vite/bin/vite.js',
        'preview',
        '--host',
        '127.0.0.1',
        '--port',
        '4174',
        '--strictPort',
      ],
      { cwd: new URL('./reference/', import.meta.url), stdio: 'pipe' },
    ),
    url: 'http://127.0.0.1:4174',
  },
];
let browser;
try {
  for (const server of servers) {
    let log = '';
    server.process.stdout.on('data', (data) => (log += data));
    server.process.stderr.on('data', (data) => (log += data));
    const deadline = Date.now() + 30000;
    while (true) {
      assert(server.process.exitCode === null, log);
      try {
        if ((await fetch(server.url, { signal: AbortSignal.timeout(1000) })).ok) break;
      } catch {}
      assert(Date.now() < deadline, log);
      await delay(100);
    }
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  const captures = [];
  const variants = [
    { name: 'straight', reference: 'line-default', button: 'Straight reference' },
    { name: 'smooth', reference: 'line-smooth', button: 'Smooth reference' },
    { name: 'minimal', reference: 'line-solid', button: 'Minimal reference' },
  ];
  for (const variant of variants)
    for (const width of [320, 768, 1440])
      for (const theme of ['light', 'dark'])
        for (const implementation of ['upstream', 'angular']) {
          const page = await browser.newPage({
            viewport: { width: width + 40, height: 1000 },
            deviceScaleFactor: 1,
            reducedMotion: 'reduce',
          });
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          if (implementation === 'upstream')
            await page.goto(
              `${servers[1].url}/?width=${width}&theme=${theme}&variant=${variant.reference}`,
            );
          else {
            await page.goto(`${servers[0].url}/line-comparison`);
            await page.getByRole('button', { name: variant.button, exact: true }).click();
            if (theme === 'dark')
              await page
                .getByRole('button', { name: 'Toggle line comparison theme', exact: true })
                .click();
            await page.locator('.comparison-host').evaluate((element, width) => {
              element.style.maxWidth = 'none';
              element.style.width = `${width}px`;
            }, width);
          }
          await page.locator('canvas').waitFor();
          await page.evaluate(async () => {
            await document.fonts.ready;
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
          });
          const host = page.locator(
            implementation === 'upstream' ? '#reference' : 'nec-line-chart',
          );
          const metadata = await host.evaluate((element) => ({
            host: element.getBoundingClientRect().toJSON(),
            canvas: element.querySelector('canvas')?.getBoundingClientRect().toJSON(),
            font: getComputedStyle(element).fontFamily,
            dpr: devicePixelRatio,
          }));
          assert.equal(metadata.host.width, width);
          assert.deepEqual(errors, []);
          const filename = `${variant.name}-${implementation}-${theme}-${width}.png`;
          await host.screenshot({ path: new URL(filename, output).pathname });
          const sha256 = createHash('sha256')
            .update(await readFile(new URL(filename, output)))
            .digest('hex');
          captures.push({
            variant: variant.name,
            implementation,
            theme,
            width,
            filename,
            sha256,
            ...metadata,
          });
          await page.close();
        }
  for (const theme of ['dark', 'light'])
    for (const width of [390, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      await page.goto(`${servers[0].url}/line`);
      if (theme === 'light')
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      await page.locator('nec-line-chart canvas').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const filename = `gallery-${theme}-${width}.png`;
      await page.screenshot({ path: new URL(filename, output).pathname });
      captures.push({
        variant: 'gallery',
        implementation: 'angular',
        theme,
        width,
        filename,
        sha256: createHash('sha256')
          .update(await readFile(new URL(filename, output)))
          .digest('hex'),
      });
      await page.close();
    }
  const sourceHashes = {};
  for (const path of [
    'projects/chart-library/core/src/lib/cartesian-chart.ts',
    'projects/chart-library/line/src/lib/line-options.ts',
    'projects/chart-library/line/src/lib/line-renderer.ts',
    'projects/playground/src/app/line-blocks.ts',
  ])
    sourceHashes[path] = createHash('sha256')
      .update(await readFile(new URL(path, root)))
      .digest('hex');
  await writeFile(
    new URL('manifest.json', output),
    await format(
      JSON.stringify({
        recordedAt: new Date().toISOString(),
        browser: browser.version(),
        motion: 'reduce',
        source,
        sourceHashes,
        captures,
      }),
      { ...(await resolveConfig(new URL('.prettierrc', root).pathname)), parser: 'json' },
    ),
  );
  await writeCaptureGallery(
    output,
    captures.filter((capture) => capture.variant !== 'gallery'),
    { title: 'Line comparison evidence', report: 'NG11_LINE_CHART.md' },
  );
  console.log(`PASS: ${captures.length} line/reference/gallery captures.`);
} finally {
  await browser?.close();
  for (const server of servers) server.process.kill('SIGTERM');
}
