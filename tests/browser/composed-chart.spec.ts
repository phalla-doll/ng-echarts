import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Locator } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

async function rosePoint(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const pixels = element
      .getContext('2d', { willReadFrequently: true })!
      .getImageData(0, 0, element.width, element.height).data;
    const box = element.getBoundingClientRect();
    for (let x = Math.floor(element.width * 0.18); x < element.width * 0.75; x++)
      for (let y = 0; y < element.height; y++) {
        const at = (y * element.width + x) * 4;
        const r = pixels[at]!,
          g = pixels[at + 1]!,
          b = pixels[at + 2]!;
        if (r > 120 && r > g * 2 && r > b * 1.3)
          return {
            x: box.x + (x * box.width) / element.width,
            y: box.y + (y * box.height) / element.height,
          };
      }
    throw new Error('Trend line not painted');
  });
}
test('hydrates a composed gallery with copyable typed source and responsive themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    }),
  );
  const response = await page.goto('/composed');
  const html = await response!.text();
  expect(html).toContain('Visits &amp; Trend');
  expect(html).not.toContain('<canvas');
  const block = page.locator('#visits-and-trend');
  await expect(block.locator('canvas')).toHaveCount(1);
  await expect(block.locator('.metric-total').first()).toContainText('7,170');
  await expect(block.locator('.metric-total').nth(1)).toContainText('535.3');
  await block.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(block.locator('.block-code')).toContainText('ComposedSeries<Visit>');
  await expect(block.locator('.block-code')).toContainText('"kind": "line"');
  await block.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(block.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  await block.getByRole('button', { name: 'Preview', exact: true }).click();
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
    }
  }
  const point = await firstGreenBarPoint(block.locator('canvas'));
  await page.mouse.move(point.x, point.y);
  await expect(block.locator('[data-nec-tooltip]')).toContainText('3-month mean');
  await block.locator('.legend button').first().click();
  await block.getByRole('button', { name: 'Reload Visits & Trend preview', exact: true }).click();
  await expect(block.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});
test('selects real bars and whole lines, preserves zeros/gaps, and retains hidden identities through kind changes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/composed-validation');
  const chart = page.locator('.primary-composed nec-composed-chart');
  const canvas = chart.locator('canvas');
  await expect(canvas).toHaveCount(1);
  const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
  let point = await firstGreenBarPoint(canvas);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.selection')).toHaveText('a/visits/100/plot');
  await page.getByRole('button', { name: 'Toggle trend points', exact: true }).click();
  point = await rosePoint(canvas);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.selection')).toHaveText(/\/trend\/-?\d+\/plot/);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(chart.locator('tbody')).toContainText('Missing');
  await chart.getByRole('button', { name: 'Select Trend for March: 0', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('c/trend/0/table');
  await chart.getByRole('button', { name: 'Select Visits for April: -60', exact: true }).click();
  await expect(page.locator('.selection')).toHaveText('d/visits/-60/table');
  const visits = chart.locator('.legend button').filter({ hasText: 'Visits' });
  await visits.click();
  await expect(page.locator('.legend-result')).toHaveText('visits/false');
  await page.getByRole('button', { name: 'Update composed values', exact: true }).click();
  const january = chart.getByRole('button', {
    name: 'Select Visits for January: 110',
    exact: true,
  });
  await january.focus();
  await page
    .getByRole('button', { name: 'Reorder composed inputs', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(january).toBeFocused();
  await page.getByRole('button', { name: 'Switch series kind', exact: true }).click();
  await expect(visits).toHaveAttribute('aria-pressed', 'false');
  await january.click();
  await expect(page.locator('.selection')).toHaveText('a/visits/110/table');
  await visits.click();
  await expect(chart.locator('.plot')).toHaveAttribute('_echarts_instance_', instance!);
  expect(errors).toEqual([]);
});
test('recovers mixed states, hydrates deferred controls, refreshes palettes and releases every native resource', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  await page.goto('/composed-validation');
  const chart = page.locator('.primary-composed nec-composed-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Invalid composed settings', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('kind');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Loading composed', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('Loading');
  await page.getByRole('button', { name: 'Error composed', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Sample composed error.');
  await page.getByRole('button', { name: 'Restore composed data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Empty composed data', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No chart data');
  await page.getByRole('button', { name: 'Restore composed data', exact: true }).click();
  await page.getByRole('button', { name: 'Hide composed host', exact: true }).click();
  await page.getByRole('button', { name: 'Hide composed host', exact: true }).click();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        chart.locator('canvas').evaluate((e) => Math.round(e.getBoundingClientRect().width)),
      )
      .toBe(Math.round((await chart.locator('.plot').boundingBox())!.width));
  }
  await page.getByRole('button', { name: 'Refresh palette', exact: true }).click();
  await expect(chart.locator('.swatch').first()).toHaveCSS('background-color', 'rgb(37, 99, 235)');
  for (let count = 0; count < 100; count++) {
    await page.getByRole('button', { name: 'Mount composed', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => ({ ...window.chartAudit, focus: window.chartFocusListeners })),
      )
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0, focus: 0 });
    await page.getByRole('button', { name: 'Mount composed', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(1);
  }
  await page
    .locator('.deferred-composed')
    .getByRole('button', { name: 'Show data table', exact: true })
    .click();
  await expect(page.locator('.deferred-composed canvas')).toHaveCount(1);
  await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  expect(errors).toEqual([]);
});

async function composedRendererAsset(): Promise<string> {
  const directory = 'dist/playground/browser';
  const candidates = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateComposedRenderer\b/.test(
        await readFile(join(directory, file), 'utf8'),
      )
    )
      candidates.push(file);
  expect(candidates).toHaveLength(1);
  return candidates[0]!;
}
test('retries a failed composed renderer import without exposing its exception', async ({
  page,
}) => {
  const asset = await composedRendererAsset();
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/composed-validation');
  const chart = page.locator('.primary-composed nec-composed-chart');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry chart', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('ignores a late composed renderer import after destruction and restores the latest inputs', async ({
  page,
}) => {
  const asset = await composedRendererAsset();
  const errors = collectBrowserErrors(page);
  let release!: () => void, requested!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve)),
    started = new Promise<void>((resolve) => (requested = resolve));
  await page.route(`**/${asset}`, async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  await page.goto('/composed-validation', { waitUntil: 'domcontentloaded' });
  await started;
  await page.getByRole('button', { name: 'Update composed values', exact: true }).click();
  await page.getByRole('button', { name: 'Mount composed', exact: true }).click();
  const finished = page.waitForResponse((response) => response.url().endsWith(asset));
  release();
  await finished;
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount composed', exact: true }).click();
  const chart = page.locator('.primary-composed nec-composed-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Visits for January: 110', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
