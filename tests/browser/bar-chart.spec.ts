import { expect, test, type Page } from '@playwright/test';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const collected: string[] = [];
  errors.set(page, collected);
  page.on('pageerror', (error) => collected.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || /NG05\d+/.test(message.text()))
      collected.push(message.text());
  });
  await page.goto('/');
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test('hydrates one chart and emits equivalent pointer and keyboard table selections', async ({
  page,
}) => {
  const canvas = page.locator('nec-bar-chart canvas');
  // Find an interior pixel in the first green bar; avoid private ECharts APIs or debug globals.
  const point = await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d', { willReadFrequently: true })!;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    for (let x = 0; x < element.width - 4; x++) {
      const ys: number[] = [];
      for (let y = 0; y < element.height; y++) {
        const offset = (y * element.width + x + 3) * 4;
        if (
          pixels[offset] === 4 &&
          pixels[offset + 1] === 120 &&
          pixels[offset + 2] === 87 &&
          pixels[offset + 3] === 255
        )
          ys.push(y);
      }
      if (ys.length > 8) {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x + ((x + 3) * rect.width) / element.width,
          y: rect.y + (ys[Math.floor(ys.length / 2)]! * rect.height) / element.height,
        };
      }
    }
    throw new Error('First green bar was not painted');
  });
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.selection')).toHaveText('January: desktop = 342 (plot)');
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(12);
  const action = page.getByRole('button', { name: 'Select Desktop for January: 342', exact: true });
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('January: desktop = 342 (table)');
});

test('honors state precedence and restores current data without stale actions', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(page.getByText('Loading chart…', { exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Show data table', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Update values', exact: true }).click();
  await page.getByRole('button', { name: 'Error state', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Sample application error');
  await page.getByRole('button', { name: 'Error state', exact: true }).click();
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Select Desktop for January: 442', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Empty data', exact: true }).click();
  await expect(page.getByText('No chart data available.', { exact: true })).toBeVisible();
  await expect(page.locator('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Empty data', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('keeps legend focus and the full table when every series is hidden', async ({ page }) => {
  const desktop = page.locator('.legend button').filter({ hasText: 'Desktop' });
  await desktop.focus();
  await page.keyboard.press('Space');
  await expect(desktop).toBeFocused();
  await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  const mobile = page.locator('.legend button').filter({ hasText: 'Mobile' });
  await mobile.click();
  await expect(mobile).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await expect(page.locator('canvas')).toHaveCount(1);
  await desktop.click();
  await expect(desktop).toHaveAttribute('aria-pressed', 'true');
});

test('switches themes/layouts, resizes hidden surfaces, and remounts one instance', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
  await expect(page.locator('.legend .swatch').first()).toHaveCSS(
    'background-color',
    'rgb(16, 185, 129)',
  );
  await page.getByRole('button', { name: 'Horizontal layout', exact: true }).click();
  await page.getByRole('button', { name: 'Stack series', exact: true }).click();
  await page.getByRole('button', { name: 'Gradient fills', exact: true }).click();
  const chart = page.locator('nec-bar-chart');
  await chart.evaluate((element: HTMLElement) => {
    element.style.display = 'none';
  });
  await expect(chart).toBeHidden();
  await chart.evaluate((element: HTMLElement) => {
    element.style.display = 'block';
    element.style.width = '320px';
  });
  await expect
    .poll(() => page.locator('canvas').evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThanOrEqual(320);
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: 'Show chart', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Show chart', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(1);
  }
});
