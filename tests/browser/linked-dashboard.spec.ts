import { expect, test } from '@playwright/test';
import { verifyDashboard } from '../../tools/dashboard-flow.mjs';
import { collectBrowserErrors } from './resource-audit';
import { firstGreenBarPoint } from './canvas-point';

test('links composed values and native month selection through updates, replacement, legends and themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/dashboard-validation');
  await verifyDashboard(page);
  await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('commits an actual stacked bar hit and exposes the exact compiled example', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-dashboard');
  const dashboard = page.locator('app-composed-dashboard');
  const canvas = dashboard.locator('nec-composed-chart canvas');
  await expect(canvas).toHaveCount(1);
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => firstGreenBarPoint(canvas)).not.toBeNull();
  const point = (await firstGreenBarPoint(canvas))!;
  await page.mouse.click(point.x, point.y);
  await expect(dashboard.locator('.dashboard-action')).toHaveText(
    'January: Desktop, 120 visits (plot).',
  );
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('jan');
  await page.getByText('Standalone Angular dashboard source', { exact: true }).click();
  await expect(page.getByLabel('Composed linked dashboard Angular source')).toContainText(
    'export class App',
  );
  await expect(page.getByLabel('Composed linked dashboard Angular source')).toContainText(
    'export class ComposedDashboard',
  );
  expect(errors).toEqual([]);
});
