import { renderGallery } from '../../tools/browser-gallery.mjs';
import { expect, test, type Locator } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
test('renders copyable pie blocks with the pinned pie data and clean responsive themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { pieClipboard: string }).pieClipboard = text;
        },
      },
    }),
  );
  const response = await page.goto('/pie');
  const html = await response!.text();
  expect(html).toContain('Donut Blocks');
  expect(html).not.toContain('<canvas');
  expect(html).not.toContain('Show data table');
  await renderGallery(page);
  await expect(page.locator('nec-pie-chart canvas')).toHaveCount(3);
  const first = page.locator('#browser-share');
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await first.getByRole('button', { name: 'Copy code', exact: true }).click();
  const source = await page.evaluate(
    () => (window as unknown as { pieClipboard: string }).pieClipboard,
  );
  expect(source).toContain('@ng-echarts/chart-library/pie');
  expect(source).toContain('"visitors": 275');
  expect(source).toContain('[innerRadius]="0"');
  await first.getByRole('button', { name: 'Preview', exact: true }).click();
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      for (const chart of await page.locator('nec-pie-chart').all())
        await expect
          .poll(() => chart.evaluate((element) => element.scrollWidth <= element.clientWidth))
          .toBe(true);
    }
  }
  await first.getByRole('button', { name: 'Reload Browser Share preview', exact: true }).click();
  await renderGallery(page);
  await expect(page.locator('nec-pie-chart canvas')).toHaveCount(3);
  expect(errors).toEqual([]);
});
async function piePixel(canvas: Locator) {
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d', { willReadFrequently: true })!;
    const [r, g, b] = context.getImageData(
      Math.floor(element.width / 2) + 8,
      Math.floor(element.height / 2) - 8,
      1,
      1,
    ).data;
    return g! > 120 && r! < 100 && b! > 70;
  });
}
test('renders a real donut hole and emits raw stable category events through updates and hiding', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/pie-validation');
  const chart = page.locator('.primary-pie nec-pie-chart'),
    canvas = chart.locator('canvas');
  await expect(canvas).toHaveCount(1);
  await expect.poll(() => piePixel(canvas)).toBe(true);
  const box = (await canvas.boundingBox())!;
  const radius = Math.min(box.width, box.height) * 0.4;
  const angle = (Math.PI * 100) / 380;
  await page.mouse.click(
    box.x + box.width / 2 + Math.cos(angle) * radius * 0.75,
    box.y + box.height / 2 - Math.sin(angle) * radius * 0.75,
  );
  await expect(page.locator('.selection')).toHaveText('a/visits/100/plot');
  await page.getByRole('button', { name: 'Donut view', exact: true }).click();
  await expect.poll(() => piePixel(canvas)).toBe(false);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await chart.getByRole('button', { name: 'Select Visits for April: 0', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('d/visits/0/table');
  await expect(chart.locator('tbody')).toContainText('Missing');
  await expect(chart.locator('tbody tr')).toHaveCount(5);
  const january = chart.locator('.legend button').filter({ hasText: 'January' });
  await january.click();
  await expect(page.locator('.legend-result')).toHaveText('a/false');
  await page.getByRole('button', { name: 'Update pie values', exact: true }).click();
  const value = chart.getByRole('button', { name: 'Select Visits for January: 110', exact: true });
  await value.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('a/visits/110/table');
  await page
    .getByRole('button', { name: 'Reorder pie inputs', exact: true })
    .evaluate((e: HTMLButtonElement) => e.click());
  await expect(value).toBeFocused();
  await expect(january).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Currency values', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Visits for January: $110.00', exact: true }),
  ).toBeVisible();
  // Keep each locator stable while Angular updates aria-pressed after a click.
  // Re-querying a filtered first() can race its final removal on slower CI hosts.
  for (const category of await chart.locator('.legend button').all()) {
    if ((await category.getAttribute('aria-pressed')) !== 'true') continue;
    await category.click();
    await expect(category).toHaveAttribute('aria-pressed', 'false');
  }
  await expect(chart.getByRole('status')).toContainText('No visible positive');
  await january.click();
  await expect(chart.getByRole('status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Category labels', exact: true }).click();
  expect(errors).toEqual([]);
});
test('recovers pie states, hydrates deferred controls, and disposes observers and instances', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  const response = await page.goto('/pie-validation');
  expect(await response!.text()).toContain('Deferred pie');
  const chart = page.locator('.primary-pie nec-pie-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  for (const [control, message] of [
    ['Loading pie', 'Loading chart'],
    ['Error pie', 'Sample pie error'],
  ]) {
    await page.getByRole('button', { name: control, exact: true }).click();
    await expect(chart).toContainText(message);
    await expect(chart.locator('canvas')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Restore pie data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Zero pie data', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No chart data');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Negative pie data', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('nonnegative');
  await page.getByRole('button', { name: 'Invalid pie data', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('finite numbers');
  await page.getByRole('button', { name: 'Empty pie data', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No chart data');
  await page.getByRole('button', { name: 'Restore pie data', exact: true }).click();
  await page.getByRole('button', { name: 'Hide pie host', exact: true }).click();
  await page.getByRole('button', { name: 'Hide pie host', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  for (let index = 0; index < 100; index++) {
    const previousPlot = await chart.locator('.plot').elementHandle();
    await page.getByRole('button', { name: 'Mount pie', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(0);
    expect(await previousPlot!.getAttribute('_echarts_instance_')).toBe('');
    await previousPlot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    await expect(page.locator('[data-nec-tooltip]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
    await page.getByRole('button', { name: 'Mount pie', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(2);
  }
  await testInfo.attach('pie-100-cycles.json', {
    body: JSON.stringify({
      family: 'pie',
      browser: testInfo.project.name,
      cycles: 100,
      zeroResourcesAfterEveryDestroy: true,
      zeroFocusListenersAfterEveryDestroy: true,
      disposedInstanceAfterEveryDestroy: true,
    }),
    contentType: 'application/json',
  });
  const deferred = page.locator('.deferred-pie');
  await deferred.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(deferred.locator('canvas')).toHaveCount(1);
  await expect(deferred.locator('table')).toBeVisible();
  await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  expect(errors).toEqual([]);
});
async function pieRendererAsset() {
  const directory = 'dist/playground/browser';
  const candidates = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreatePieRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      candidates.push(file);
  expect(candidates).toHaveLength(1);
  return candidates[0]!;
}
test('retries a pie renderer import failure', async ({ page }) => {
  const asset = await pieRendererAsset(),
    errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/pie-validation');
  const chart = page.locator('.primary-pie nec-pie-chart');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry chart', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('ignores late pie imports after destruction and remounts with current data', async ({
  page,
}) => {
  const asset = await pieRendererAsset(),
    errors = collectBrowserErrors(page);
  let release!: () => void, requested!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve)),
    started = new Promise<void>((resolve) => (requested = resolve));
  await page.route(`**/${asset}`, async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  await page.goto('/pie-validation', { waitUntil: 'domcontentloaded' });
  await started;
  await page.getByRole('button', { name: 'Update pie values', exact: true }).click();
  await page.getByRole('button', { name: 'Mount pie', exact: true }).click();
  const finished = page.waitForResponse((response) => response.url().endsWith(asset));
  release();
  await finished;
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount pie', exact: true }).click();
  const chart = page.locator('.primary-pie nec-pie-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Visits for January: 110', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
