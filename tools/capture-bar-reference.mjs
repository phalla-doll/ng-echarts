import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { writeCaptureGallery } from './capture-gallery.mjs';

const output = new URL('../docs/experiments/captures/bar-variants/', import.meta.url);
const source = JSON.parse(
  await readFile(new URL('./reference/source-manifest.json', import.meta.url), 'utf8'),
);
const servers = [
  {
    process: spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4175' },
      stdio: 'pipe',
    }),
    url: 'http://localhost:4175',
    title: 'ng-echarts playground',
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
      { cwd: new URL('./reference', import.meta.url), stdio: 'pipe' },
    ),
    url: 'http://127.0.0.1:4174',
    title: 'Pinned EvilCharts reference',
  },
];
let browser;
try {
  for (const server of servers) {
    let log = '';
    server.process.stdout.on('data', (data) => {
      log += data;
    });
    server.process.stderr.on('data', (data) => {
      log += data;
    });
    const deadline = Date.now() + 30_000;
    while (true) {
      assert(server.process.exitCode === null, `Server exited: ${log}`);
      try {
        const response = await fetch(server.url, { signal: AbortSignal.timeout(1000) });
        if (response.ok && (await response.text()).includes(server.title)) break;
      } catch {
        /* Retry only while the child is starting. */
      }
      assert(Date.now() < deadline, `Server did not start: ${log}`);
      await delay(100);
    }
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  const captures = [];
  for (const variant of ['grouped', 'stacked', 'horizontal', 'gradient']) {
    for (const width of [320, 768, 1440]) {
      for (const theme of ['light', 'dark']) {
        for (const implementation of ['upstream', 'angular']) {
          const page = await browser.newPage({
            viewport: { width: width + 40, height: 1000 },
            deviceScaleFactor: 1,
            reducedMotion: 'reduce',
          });
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          if (implementation === 'upstream') {
            await page.goto(
              `http://127.0.0.1:4174/?width=${width}&theme=${theme}&variant=${variant}`,
            );
          } else {
            await page.goto('http://localhost:4175/comparison');
            if (variant !== 'grouped')
              await page
                .getByRole('button', {
                  name: `${variant[0].toUpperCase()}${variant.slice(1)} reference`,
                  exact: true,
                })
                .click();
            if (theme === 'dark')
              await page
                .getByRole('button', { name: 'Toggle comparison theme', exact: true })
                .click();
            await page.locator('.comparison-host').evaluate((element, value) => {
              element.style.maxWidth = 'none';
              element.style.width = `${value}px`;
            }, width);
          }
          await page.locator('canvas').waitFor();
          await page.evaluate(async () => {
            await document.fonts.ready;
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
          });
          const host = page.locator(implementation === 'upstream' ? '#reference' : 'nec-bar-chart');
          const metadata = await host.evaluate((element) => ({
            host: element.getBoundingClientRect().toJSON(),
            canvas: element.querySelector('canvas')?.getBoundingClientRect().toJSON(),
            font: getComputedStyle(element).fontFamily,
            tokens: Object.fromEntries(
              ['background', 'text', 'muted', 'border'].map((token) => [
                token,
                (
                  getComputedStyle(element).getPropertyValue(`--nec-${token}`) ||
                  getComputedStyle(element).getPropertyValue(
                    {
                      background: '--background',
                      text: '--foreground',
                      muted: '--muted-foreground',
                      border: '--border',
                    }[token],
                  )
                ).trim(),
              ]),
            ),
            dpr: devicePixelRatio,
          }));
          assert.equal(metadata.host.width, width);
          assert.deepEqual(errors, []);
          const filename = `${variant}-${implementation}-${theme}-${width}.png`;
          await host.screenshot({ path: new URL(filename, output).pathname });
          captures.push({ variant, implementation, theme, width, filename, ...metadata });
          if (width === 320 || width === 768) {
            const canvas = page.locator('canvas');
            await canvas.scrollIntoViewIfNeeded();
            const point = await canvas.evaluate((element, horizontal) => {
              const context = element.getContext('2d', { willReadFrequently: true });
              const pixels = context.getImageData(0, 0, element.width, element.height).data;
              if (horizontal) {
                for (let y = 0; y < element.height; y++) {
                  const xs = [];
                  for (let x = 0; x < element.width; x++) {
                    const offset = (y * element.width + x) * 4;
                    if (
                      pixels[offset + 2] > pixels[offset] * 2 &&
                      pixels[offset + 2] > pixels[offset + 1] * 1.2 &&
                      pixels[offset + 3] === 255
                    )
                      xs.push(x);
                  }
                  if (xs.length > 8) {
                    const rect = element.getBoundingClientRect();
                    return {
                      x: rect.x + (xs[Math.floor(xs.length / 2)] * rect.width) / element.width,
                      y: rect.y + ((y + 2) * rect.height) / element.height,
                    };
                  }
                }
                throw new Error('First horizontal bar was not painted');
              }
              for (let x = 0; x < element.width - 4; x++) {
                const ys = [];
                for (let y = 0; y < element.height; y++) {
                  const offset = (y * element.width + x + 3) * 4;
                  const green = pixels[offset + 1];
                  if (
                    ((green > pixels[offset] * 2 && green > pixels[offset + 2] * 1.2) ||
                      (pixels[offset + 2] > pixels[offset] * 2 &&
                        pixels[offset + 2] > green * 1.2)) &&
                    pixels[offset + 3] === 255
                  )
                    ys.push(y);
                }
                if (ys.length > 8) {
                  const rect = element.getBoundingClientRect();
                  return {
                    x: rect.x + ((x + 4) * rect.width) / element.width,
                    y: rect.y + (ys[Math.floor(ys.length / 2)] * rect.height) / element.height,
                  };
                }
              }
              throw new Error('First green bar was not painted');
            }, variant === 'horizontal');
            await page.mouse.move(point.x, point.y);
            await page.getByText('January', { exact: true }).waitFor();
            const tooltipFilename = `${variant}-${implementation}-${theme}-${width}-tooltip.png`;
            await host.screenshot({ path: new URL(tooltipFilename, output).pathname });
            captures.push({
              variant,
              implementation,
              theme,
              width,
              filename: tooltipFilename,
              tooltip: 'January',
              ...metadata,
            });
          }
          assert.deepEqual(errors, []);
          await page.close();
        }
      }
    }
  }
  await writeFile(
    new URL('manifest.json', output),
    `${JSON.stringify(
      {
        source,
        browser: browser.version(),
        reducedMotion: 'reduce',
        sourceExampleUnmodified: true,
        angularRoute: '/comparison',
        categoryTicks: 'first three characters; full tooltip/table labels',
        comparisonThemeSha256: createHash('sha256')
          .update(
            await readFile(
              new URL('../projects/playground/src/app/comparison.css', import.meta.url),
            ),
          )
          .digest('hex'),
        captures,
      },
      null,
      2,
    )}\n`,
  );
  await writeCaptureGallery(output, captures);
  console.log(
    `Captured ${captures.length} grouped/stacked/horizontal/gradient views, including tooltips at 320 and 768px.`,
  );
} finally {
  await browser?.close();
  for (const server of servers) server.process.kill('SIGTERM');
}
