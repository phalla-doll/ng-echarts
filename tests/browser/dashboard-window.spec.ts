import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors } from './resource-audit';

test('shares the visible category window and raw plot selection in both chart directions', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-dashboard');
  const dashboard = page.locator('app-composed-dashboard');
  await expect(dashboard.locator('canvas')).toHaveCount(2);
  await dashboard.getByRole('combobox', { name: 'From', exact: true }).selectOption('feb');
  await dashboard.getByRole('combobox', { name: 'To', exact: true }).selectOption('feb');
  await dashboard.getByRole('combobox', { name: 'Device', exact: true }).selectOption('desktop');
  await expect(dashboard.locator('.dashboard-window')).toHaveText(
    'Viewing February–February · 1 of 4 months.',
  );
  const detail = dashboard.locator('nec-bar-chart canvas');
  const detailPoint = await firstGreenBarPoint(detail);
  await page.mouse.click(detailPoint.x, detailPoint.y);
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('feb');
  await expect(dashboard.locator('.dashboard-action')).toHaveText(
    'February: desktop, 200 visits (plot).',
  );
  await dashboard.getByRole('button', { name: 'Reset dashboard month', exact: true }).click();
  const overview = dashboard.locator('nec-composed-chart canvas');
  const overviewPoint = await firstGreenBarPoint(overview);
  await page.mouse.click(overviewPoint.x, overviewPoint.y);
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('feb');
  await expect(dashboard.locator('.dashboard-action')).toHaveText(
    'February: Desktop, 200 visits (plot).',
  );
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('feb');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('feb');
  await expect(dashboard.getByRole('button', { name: 'Show data table', exact: true })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});
