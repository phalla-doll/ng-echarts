import { renderGallery } from '../../tools/browser-gallery.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Locator } from '@playwright/test';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

async function paintedLine(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d', { willReadFrequently: true })!;
    const bytes = context.getImageData(0, 0, element.width, element.height).data;
    const columns: number[][] = Array.from({ length: element.width }, () => []);
    for (let y = 0; y < element.height; y++)
      for (let x = 0; x < element.width; x++) {
        const at = (y * element.width + x) * 4,
          r = bytes[at]!,
          g = bytes[at + 1]!,
          b = bytes[at + 2]!;
        if (g >= 80 && g > r * 1.5 && g > b * 1.2) columns[x]!.push(y);
      }
    const first = columns.findIndex((items) => items.length > 0),
      last = columns.findLastIndex((items) => items.length > 0);
    if (first < 0) throw new Error('Green line not painted');
    const middle = Math.round((first + last) / 2);
    const centerGap = columns.slice(middle - 8, middle + 9).every((items) => items.length === 0);
    const x = columns.findIndex(
      (items, index) => index >= first + Math.round((last - first) / 12) && items.length > 0,
    );
    const y = columns[x]![Math.floor(columns[x]!.length / 2)]!;
    const box = element.getBoundingClientRect();
    return {
      centerGap,
      x: box.x + (x * box.width) / element.width,
      y: box.y + (y * box.height) / element.height,
    };
  });
}

test('hydrates a line gallery with copyable examples, matching themes, and narrow layouts', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { lineClipboard: string }).lineClipboard = text;
        },
      },
    }),
  );
  const response = await page.goto('/line');
  const html = await response!.text();
  expect(html).toContain('Line Blocks');
  expect(html).not.toContain('<canvas');
  expect(html).not.toContain('Show data table');
  await renderGallery(page);
  await expect(page.locator('nec-line-chart canvas')).toHaveCount(4);
  const first = page.locator('#straight-lines');
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(first.locator('.block-code')).toContainText('@mantha911/ng-echarts/line');
  await first.getByRole('button', { name: 'Copy code', exact: true }).click();
  expect(
    await page.evaluate(() => (window as unknown as { lineClipboard: string }).lineClipboard),
  ).toContain('[showPoints]="true"');
  await first.getByRole('button', { name: 'Preview', exact: true }).click();
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      for (const chart of await page.locator('nec-line-chart').all())
        await expect
          .poll(() => chart.evaluate((element) => element.scrollWidth <= element.clientWidth))
          .toBe(true);
    }
  }
  await first.getByRole('button', { name: 'Reload Device Trends preview', exact: true }).click();
  await renderGallery(page);
  await expect(page.locator('nec-line-chart canvas')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('paints real missing-value gaps and emits updated pointer/keyboard values with points on or off', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/line-validation');
  const chart = page.locator('.primary-line nec-line-chart'),
    canvas = chart.locator('canvas');
  await expect(canvas).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  for (const points of [true, false]) {
    await chart.getByRole('button', { name: 'Select Mobile for May: -20', exact: true }).click();
    await expect(page.locator('.selection')).toHaveText('e/mobile/-20/table');
    if (!points) await page.getByRole('button', { name: 'Show points', exact: true }).click();
    await expect.poll(async () => (await paintedLine(canvas)).centerGap).toBe(true);
    const point = await paintedLine(canvas);
    await page.mouse.click(point.x, point.y);
    await expect(page.locator('.selection')).toHaveText(/a\/desktop\/100\/plot/);
  }
  await page.getByRole('button', { name: 'Smooth lines', exact: true }).click();
  await expect.poll(async () => (await paintedLine(canvas)).centerGap).toBe(true);
  await expect(chart.locator('tbody tr')).toHaveCount(5);
  await expect(chart.locator('tbody')).toContainText('Missing');
  await chart.getByRole('button', { name: 'Select Mobile for May: -20', exact: true }).click();
  await expect(page.locator('.selection')).toHaveText('e/mobile/-20/table');
  await chart.getByRole('button', { name: 'Select Mobile for March: 0', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('c/mobile/0/table');
  await chart.locator('.legend button').first().click();
  await expect(page.locator('.legend-result')).toHaveText('desktop/false');
  await page.getByRole('button', { name: 'Update line values', exact: true }).click();
  await page.getByRole('button', { name: 'Smooth lines', exact: true }).click();
  const january = chart.getByRole('button', {
    name: 'Select Desktop for January: 110',
    exact: true,
  });
  await january.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('a/desktop/110/table');
  await page
    .getByRole('button', { name: 'Reorder line inputs', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  await expect(january).toBeFocused();
  await expect(chart.locator('.legend button').filter({ hasText: 'Desktop' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Currency values', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Desktop for January: $110.00', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('recovers line states, replays deferred hydration, and disposes chart-owned resources', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  const response = await page.goto('/line-validation');
  expect(await response!.text()).toContain('Deferred line');
  const chart = page.locator('.primary-line nec-line-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Loading line', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Error line', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Sample line error.');
  await page.getByRole('button', { name: 'Restore line data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Invalid line data', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('finite numbers');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Empty line data', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No chart data');
  await page.getByRole('button', { name: 'Restore line data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Hide line host', exact: true }).click();
  await page.getByRole('button', { name: 'Hide line host', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (let index = 0; index < 100; index++) {
    const previousPlot = await chart.locator('.plot').elementHandle();
    await page.getByRole('button', { name: 'Mount line', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(0);
    expect(await previousPlot!.getAttribute('_echarts_instance_')).toBe('');
    await previousPlot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    await expect(page.locator('[data-nec-tooltip]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
    await page.getByRole('button', { name: 'Mount line', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(2);
  }
  await testInfo.attach('line-100-cycles.json', {
    body: JSON.stringify({
      family: 'line',
      browser: testInfo.project.name,
      cycles: 100,
      zeroResourcesAfterEveryDestroy: true,
      zeroFocusListenersAfterEveryDestroy: true,
      disposedInstanceAfterEveryDestroy: true,
    }),
    contentType: 'application/json',
  });
  const deferred = page.locator('.deferred-line');
  await expect(deferred.locator('canvas')).toHaveCount(0);
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

async function lineRendererAsset(): Promise<string> {
  const directory = 'dist/playground/browser';
  const candidates = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateLineRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      candidates.push(file);
  expect(candidates).toHaveLength(1);
  return candidates[0]!;
}
test('retries a failed line renderer import without exposing its exception', async ({ page }) => {
  const asset = await lineRendererAsset();
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/line-validation');
  const chart = page.locator('.primary-line nec-line-chart');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry chart', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('ignores a late line renderer import after destruction and restores the latest inputs', async ({
  page,
}) => {
  const asset = await lineRendererAsset();
  const errors = collectBrowserErrors(page);
  let release!: () => void, requested!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve)),
    started = new Promise<void>((resolve) => (requested = resolve));
  await page.route(`**/${asset}`, async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  await page.goto('/line-validation', { waitUntil: 'domcontentloaded' });
  await started;
  await page.getByRole('button', { name: 'Update line values', exact: true }).click();
  await page.getByRole('button', { name: 'Mount line', exact: true }).click();
  const finished = page.waitForResponse((response) => response.url().endsWith(asset));
  release();
  await finished;
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount line', exact: true }).click();
  const chart = page.locator('.primary-line nec-line-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Desktop for January: 110', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
