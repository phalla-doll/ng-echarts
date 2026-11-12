import { firstGreenBarPoint } from './canvas-point';
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
  await page.goto('/playground');
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test('hydrates one chart and emits equivalent pointer and keyboard table selections', async ({
  page,
}) => {
  const point = await firstGreenBarPoint(page.locator('nec-bar-chart canvas'));
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
