import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const output = new URL('../docs/experiments/captures/bar-reference/', import.meta.url);
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
          await page.goto(`http://127.0.0.1:4174/?width=${width}&theme=${theme}`);
        } else {
          await page.goto('http://localhost:4175');
          if (theme === 'dark')
            await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
          await page.locator('.workspace').evaluate((element, value) => {
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
          dpr: devicePixelRatio,
        }));
        assert.equal(metadata.host.width, width);
        assert.deepEqual(errors, []);
        const filename = `${implementation}-${theme}-${width}.png`;
        await host.screenshot({ path: new URL(filename, output).pathname });
        captures.push({ implementation, theme, width, filename, ...metadata });
        await page.close();
      }
    }
  }
  await writeFile(
    new URL('manifest.json', output),
    `${JSON.stringify({ source, browser: browser.version(), reducedMotion: 'reduce', sourceExampleUnmodified: true, captures }, null, 2)}\n`,
  );
  console.log(
    'Captured 12 pinned upstream/Angular comparisons at exact 320, 768, and 1440px host widths.',
  );
} finally {
  await browser?.close();
  for (const server of servers) server.process.kill('SIGTERM');
}
