import { expect } from '@playwright/test';

/** The same user journey runs in the playground and the isolated npm consumer. */
export async function verifyDashboard(page) {
  const dashboard = page.locator('app-composed-dashboard');
  const overview = dashboard.locator('nec-composed-chart');
  const detail = dashboard.locator('nec-bar-chart');
  const month = dashboard.getByRole('combobox', { name: 'Month', exact: true });
  await expect(dashboard.locator('canvas')).toHaveCount(2);
  const instances = await dashboard
    .locator('.plot')
    .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  await overview.getByRole('button', { name: 'Show data table', exact: true }).click();
  await detail.getByRole('button', { name: 'Show data table', exact: true }).click();
  const action = overview.getByRole('button', {
    name: 'Select Mobile for February: 0',
    exact: true,
  });
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(action).toBeFocused();
  await expect(month).toHaveValue('feb');
  await expect(dashboard.locator('.dashboard-action')).toHaveText(
    'February: Mobile, 0 visits (table).',
  );
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 200', exact: true }),
  ).toBeVisible();
  await dashboard
    .getByRole('combobox', { name: 'Overview style', exact: true })
    .selectOption('area');
  await expect(month).toHaveValue('feb');
  await overview.locator('.legend button').filter({ hasText: 'Mobile' }).click();
  await expect(overview.locator('.legend button').filter({ hasText: 'Mobile' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(detail.locator('.legend button')).toHaveAttribute('aria-pressed', 'true');
  await action.focus();
  await page.keyboard.press('Space');
  await expect(month).toHaveValue('feb');
  await page.getByRole('button', { name: 'Refresh visits', exact: true }).click();
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 210', exact: true }),
  ).toBeVisible();
  await expect(month).toHaveValue('feb');
  await expect(dashboard.locator('.dashboard-action')).toBeEmpty();
  await page.getByRole('button', { name: 'Reverse months', exact: true }).click();
  await expect(month).toHaveValue('feb');
  await dashboard.getByRole('button', { name: 'Reset dashboard month', exact: true }).focus();
  // Simulate a host data replacement without moving focus away from the reset control.
  await page
    .getByRole('button', { name: 'Remove February', exact: true })
    .evaluate((button) => button.click());
  await expect(month).toHaveValue('');
  await expect(month).toBeFocused();
  await expect(dashboard.locator('.dashboard-context')).toHaveText('All months selected.');
  await month.selectOption('mar');
  await expect(detail.locator('tbody')).toContainText('Missing');
  await expect(dashboard.locator('.dashboard-missing')).toHaveText(
    '1 missing device observation. Recorded sums may be partial.',
  );
  await dashboard.getByRole('button', { name: 'Reset dashboard month', exact: true }).click();
  await expect(month).toBeFocused();
  await expect(month).toHaveValue('');
  const darkTheme = page.getByRole('button', { name: 'Dark theme', exact: true });
  if ((await darkTheme.getAttribute('aria-pressed')) !== 'true') await darkTheme.click();
  await expect(dashboard.locator('.chart-frame').first()).toHaveCSS(
    'background-color',
    'rgb(24, 32, 44)',
  );
  await darkTheme.click();
  await expect(dashboard.locator('.chart-frame').first()).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(dashboard.locator('.plot')).toHaveCount(2);
  expect(
    await dashboard
      .locator('.plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
  ).toEqual(instances);
  await page.getByRole('button', { name: 'Clear months', exact: true }).click();
  await expect(dashboard.locator('canvas')).toHaveCount(0);
  await expect(dashboard.locator('.dashboard-context')).toHaveText('No months available.');
  await page.getByRole('button', { name: 'Restore months', exact: true }).click();
  await expect(dashboard.locator('canvas')).toHaveCount(2);
  await expect(overview.locator('.legend button').filter({ hasText: 'Mobile' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
}
