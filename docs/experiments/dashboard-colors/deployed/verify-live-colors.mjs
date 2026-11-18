import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium, firefox, webkit } = await import(
  pathToFileURL(resolve('node_modules/playwright/index.mjs'))
);
const { expect } = await import(pathToFileURL(resolve('node_modules/@playwright/test/index.mjs')));
const output = '/tmp/dashboard-colors-live';
const url = 'https://phalla-doll.github.io/ng-echarts/linked-dashboard/';
await mkdir(output, { recursive: true });
const sourceCommit = process.env.PAGES_EXPECTED_COMMIT;
assert(sourceCommit, 'Set PAGES_EXPECTED_COMMIT to the deployed source.');
const markerResponse = await fetch(new URL('../preview-build.json', url), { cache: 'no-store' });
assert(markerResponse.ok, 'Public marker must exist.');
const marker = await markerResponse.json();
assert.equal(marker.sourceBaseCommit, sourceCommit);
assert.equal(marker.includesWorkingTree, false);
const results = [];
for (const engine of [chromium, firefox, webkit]) {
  const browser = await engine.launch();
  const page = await browser.newPage({
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const dashboard = page.locator('app-composed-dashboard');
    await expect(dashboard.locator('canvas')).toHaveCount(2, { timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    for (const siteTheme of ['light', 'dark']) {
      const siteToggle = page.getByRole('button', { name: `Use ${siteTheme} theme`, exact: true });
      if (await siteToggle.count()) await siteToggle.click();
      await expect(dashboard).toHaveAttribute('data-theme', siteTheme);
      for (const theme of ['light', 'dark']) {
        if ((await dashboard.getAttribute('data-theme')) !== theme)
          await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
        await expect(dashboard).toHaveAttribute('data-theme', theme);
        const surface = theme === 'dark' ? 'rgb(17, 17, 17)' : 'rgb(255, 255, 255)';
        const palette =
          theme === 'dark'
            ? [
                [82, 183, 161],
                [150, 166, 207],
                [214, 183, 126],
              ]
            : [
                [47, 138, 120],
                [117, 136, 188],
                [181, 133, 58],
              ];
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 1100 });
          await page.mouse.move(0, 0);
          for (const selector of [
            '.dashboard-controls',
            '.dashboard-window-controls',
            '.chart-frame',
          ])
            for (const panel of await dashboard.locator(selector).all())
              await expect(panel).toHaveCSS('background-color', surface);
          for (const frame of await dashboard.locator('.chart-frame').all())
            await expect(frame).toHaveCSS('border-top-width', '1px');
          for (const host of await dashboard.locator('.dashboard-pair > *').all())
            await expect(host).toHaveCSS('border-top-width', '0px');
          const overview = dashboard.locator('nec-composed-chart');
          for (let index = 0; index < palette.length; index++)
            await expect(overview.locator('.swatch').nth(index)).toHaveCSS(
              'background-color',
              `rgb(${palette[index].join(', ')})`,
            );
          const painted = () =>
            overview.locator('canvas').evaluate((canvas, target) => {
              const pixels = canvas
                .getContext('2d', { willReadFrequently: true })
                .getImageData(0, 0, canvas.width, canvas.height).data;
              let matches = 0;
              for (let offset = 0; offset < pixels.length; offset += 4)
                if (
                  pixels[offset + 3] === 255 &&
                  target.every((channel, index) => Math.abs(pixels[offset + index] - channel) <= 2)
                )
                  matches++;
              return matches;
            }, palette[0]);
          await expect.poll(painted).toBeGreaterThan(100);
          await expect
            .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
            .toBeLessThanOrEqual(width);
          if (engine.name() === 'chromium' && siteTheme === theme) {
            // Theme changes replace logo/icon URLs; wait for their loaded images as well.
            await expect
              .poll(
                () =>
                  page
                    .locator('.site-shell img')
                    .evaluateAll((images) =>
                      images.every((image) => image.complete && image.naturalWidth > 0),
                    ),
                { timeout: 30000 },
              )
              .toBe(true);
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.screenshot({ path: `${output}/${theme}-${width}.png`, fullPage: true });
          }
          results.push({
            engine: engine.name(),
            siteTheme,
            dashboardTheme: theme,
            width,
            surface,
            palette,
            paintedSeriesPixels: await painted(),
            passed: true,
          });
        }
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
}
await writeFile(
  `${output}/live-colors.json`,
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      url,
      sourceCommit,
      artifactSha256: marker.artifact.sha256,
      cases: results.length,
      results,
      passed: true,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `PASS: ${results.length} public dashboard color/theme/width cases across three engines.`,
);
