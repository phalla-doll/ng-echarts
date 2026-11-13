import { renderGallery } from '../../tools/browser-gallery.mjs';
import { expect, test, type Locator } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
async function paintedArea(canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const ctx = element.getContext('2d', { willReadFrequently: true })!,
      bytes = ctx.getImageData(0, 0, element.width, element.height).data;
    const green: number[][] = Array.from({ length: element.width }, () => []),
      pink: number[][] = Array.from({ length: element.width }, () => []),
      tint: number[][] = Array.from({ length: element.width }, () => []);
    for (let y = 0; y < element.height; y++)
      for (let x = 0; x < element.width; x++) {
        const at = (y * element.width + x) * 4,
          r = bytes[at]!,
          g = bytes[at + 1]!,
          b = bytes[at + 2]!;
        if (g > 140 && r < 80 && b > 80) green[x]!.push(y);
        if (r > 180 && g < 115 && b > 45 && b < 150) pink[x]!.push(y);
        if (g - r > 5 && g - b > 2) tint[x]!.push(y);
      }
    const first = green.findIndex((values) => values.length > 0),
      last = green.findLastIndex((values) => values.length > 0);
    if (first < 0) throw new Error('Area outline not painted');
    const median = (list: number[]) => list[Math.floor(list.length / 2)];
    const at = (columns: number[][], fraction: number) => {
      const x = Math.round(first + (last - first) * fraction);
      const list = [...columns[x - 1]!, ...columns[x]!, ...columns[x + 1]!].sort((a, b) => a - b);
      return median(list);
    };
    const middle = Math.round((first + last) / 2),
      gap = tint.slice(middle - 7, middle + 8).every((values) => values.length === 0);
    const x = green.findIndex(
      (values, index) => index >= first + Math.round((last - first) / 12) && values.length > 0,
    );
    const ys = tint[x]!;
    const y = ys[Math.floor(ys.length / 2)]!;
    const rect = element.getBoundingClientRect();
    return {
      gap,
      positiveX: rect.x + (Math.round(first + (last - first) / 4) * rect.width) / element.width,
      positiveY:
        rect.y + (((at(green, 0.25)! + at(pink, 0.25)!) / 2) * rect.height) / element.height,
      negativeX: rect.x + (Math.round(first + (last - first) * 0.75) * rect.width) / element.width,
      negativeY:
        rect.y + (((at(green, 0.75)! + at(pink, 0.75)!) / 2) * rect.height) / element.height,
      greenB: at(green, 0.25),
      pinkB: at(pink, 0.25),
      greenD: at(green, 0.75),
      pinkD: at(pink, 0.75),
      x: rect.x + (x * rect.width) / element.width,
      y: rect.y + (y * rect.height) / element.height,
    };
  });
}
test('renders copyable area blocks with the pinned area data and clean responsive themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { areaClipboard: string }).areaClipboard = text;
        },
      },
    }),
  );
  const response = await page.goto('/area');
  const html = await response!.text();
  expect(html).toContain('Area Blocks');
  expect(html).not.toContain('<canvas');
  expect(html).not.toContain('Show data table');
  await renderGallery(page);
  await expect(page.locator('nec-area-chart canvas')).toHaveCount(4);
  const first = page.locator('#gradient-areas');
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await first.getByRole('button', { name: 'Copy code', exact: true }).click();
  const source = await page.evaluate(
    () => (window as unknown as { areaClipboard: string }).areaClipboard,
  );
  expect(source).toContain('@ng-echarts/chart-library/area');
  expect(source).toContain('"mobile": 245');
  expect(source).toContain('[gradient]="true"');
  await first.getByRole('button', { name: 'Preview', exact: true }).click();
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      for (const chart of await page.locator('nec-area-chart').all())
        await expect
          .poll(() => chart.evaluate((element) => element.scrollWidth <= element.clientWidth))
          .toBe(true);
    }
  }
  await first.getByRole('button', { name: 'Reload Gradient Areas preview', exact: true }).click();
  await renderGallery(page);
  await expect(page.locator('nec-area-chart canvas')).toHaveCount(4);
  expect(errors).toEqual([]);
});
test('paints positive/negative stacks and actual fill gaps while emitting raw values', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/area-validation');
  const chart = page.locator('.primary-area nec-area-chart'),
    canvas = chart.locator('canvas');
  await expect(canvas).toHaveCount(1);
  await expect
    .poll(async () => {
      const p = await paintedArea(canvas);
      return p.pinkB! < p.greenB! && p.pinkD! > p.greenD!;
    })
    .toBe(true);
  await expect.poll(async () => (await paintedArea(canvas)).gap).toBe(true);
  const point = await paintedArea(canvas);
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.selection')).toHaveText('a/desktop/100/plot');
  await page.mouse.click(point.positiveX, point.positiveY);
  await expect(page.locator('.selection')).toHaveText('b/mobile/70/plot');
  await page.mouse.click(point.negativeX, point.negativeY);
  await expect(page.locator('.selection')).toHaveText('d/mobile/-40/plot');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await chart.getByRole('button', { name: 'Select Mobile for April: -40', exact: true }).click();
  await expect(page.locator('.selection')).toHaveText('d/mobile/-40/table');
  await chart.getByRole('button', { name: 'Select Mobile for March: 0', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('c/mobile/0/table');
  await page.getByRole('button', { name: 'Stack areas', exact: true }).click();
  await expect
    .poll(async () => {
      const p = await paintedArea(canvas);
      return p.pinkB! > p.greenB! && p.pinkD! < p.greenD!;
    })
    .toBe(true);
  await page.getByRole('button', { name: 'Smooth areas', exact: true }).click();
  await page.getByRole('button', { name: 'Gradient fills', exact: true }).click();
  await expect.poll(async () => (await paintedArea(canvas)).gap).toBe(true);
  const desktop = chart.locator('.legend button').filter({ hasText: 'Desktop' });
  await desktop.click();
  await expect(page.locator('.legend-result')).toHaveText('desktop/false');
  await page.getByRole('button', { name: 'Update area values', exact: true }).click();
  const january = chart.getByRole('button', {
    name: 'Select Desktop for January: 110',
    exact: true,
  });
  await january.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('a/desktop/110/table');
  await page
    .getByRole('button', { name: 'Reorder area inputs', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  await expect(january).toBeFocused();
  await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Currency values', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Desktop for January: $110.00', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('recovers area states, hydrates deferred controls, and disposes observers and instances', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  const response = await page.goto('/area-validation');
  expect(await response!.text()).toContain('Deferred area');
  const chart = page.locator('.primary-area nec-area-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  for (const [control, message] of [
    ['Loading area', 'Loading chart'],
    ['Error area', 'Sample area error'],
  ]) {
    await page.getByRole('button', { name: control, exact: true }).click();
    await expect(chart).toContainText(message);
    await expect(chart.locator('canvas')).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Restore area data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Invalid area data', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('finite numbers');
  await page.getByRole('button', { name: 'Empty area data', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No chart data');
  await page.getByRole('button', { name: 'Restore area data', exact: true }).click();
  await page.getByRole('button', { name: 'Hide area host', exact: true }).click();
  await page.getByRole('button', { name: 'Hide area host', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  for (let index = 0; index < 100; index++) {
    const previousPlot = await chart.locator('.plot').elementHandle();
    await page.getByRole('button', { name: 'Mount area', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(0);
    expect(await previousPlot!.getAttribute('_echarts_instance_')).toBe('');
    await previousPlot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    await expect(page.locator('[data-nec-tooltip]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
    await page.getByRole('button', { name: 'Mount area', exact: true }).click();
    await expect(chart.locator('canvas')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(2);
  }
  await testInfo.attach('area-100-cycles.json', {
    body: JSON.stringify({
      family: 'area',
      browser: testInfo.project.name,
      cycles: 100,
      zeroResourcesAfterEveryDestroy: true,
      zeroFocusListenersAfterEveryDestroy: true,
      disposedInstanceAfterEveryDestroy: true,
    }),
    contentType: 'application/json',
  });
  const deferred = page.locator('.deferred-area');
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
async function areaRendererAsset() {
  const directory = 'dist/playground/browser';
  const candidates = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateAreaRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      candidates.push(file);
  expect(candidates).toHaveLength(1);
  return candidates[0]!;
}
test('retries an area renderer import failure', async ({ page }) => {
  const asset = await areaRendererAsset(),
    errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/area-validation');
  const chart = page.locator('.primary-area nec-area-chart');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry chart', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('ignores late area imports after destruction and remounts with current data', async ({
  page,
}) => {
  const asset = await areaRendererAsset(),
    errors = collectBrowserErrors(page);
  let release!: () => void, requested!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve)),
    started = new Promise<void>((resolve) => (requested = resolve));
  await page.route(`**/${asset}`, async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  await page.goto('/area-validation', { waitUntil: 'domcontentloaded' });
  await started;
  await page.getByRole('button', { name: 'Update area values', exact: true }).click();
  await page.getByRole('button', { name: 'Mount area', exact: true }).click();
  const finished = page.waitForResponse((response) => response.url().endsWith(asset));
  release();
  await finished;
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount area', exact: true }).click();
  const chart = page.locator('.primary-area nec-area-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Desktop for January: 110', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
