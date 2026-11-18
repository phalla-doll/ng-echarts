import { expect } from '@playwright/test';

/** Runs unchanged against workspace, installed CSR/SSR and the displayed candidate example. */
export async function verifyDashboardRange(page) {
  await page.setViewportSize({ width: 1440, height: 1200 });
  const dashboard = page.locator('app-composed-dashboard');
  // The application owns armed state while the optional browser module is still downloading.
  let release, requested;
  const gate = new Promise((resolve) => (release = resolve));
  const pending = new Promise((resolve) => (requested = resolve));
  const hold = async (route) => {
    requested(route.request().url());
    await gate;
    await route.continue();
  };
  await page.route('**/*.js', hold);
  const armPending = dashboard.getByRole('button', { name: 'Select overview range', exact: true });
  await armPending.click();
  const moduleUrl = await pending;
  await expect(armPending).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(armPending).toHaveAttribute('aria-pressed', 'false');
  release();
  await page.evaluate(async (url) => {
    await import(url);
  }, moduleUrl);
  await page.unroute('**/*.js', hold);
  await expect(dashboard.locator('nec-composed-chart .plot')).not.toHaveAttribute(
    'data-category-range',
    'ready',
  );
  await page.getByRole('button', { name: 'Restore months', exact: true }).click();
  await dashboard.getByRole('combobox', { name: 'Month', exact: true }).selectOption('');
  const from = dashboard.getByRole('combobox', { name: 'From', exact: true });
  const to = dashboard.getByRole('combobox', { name: 'To', exact: true });
  await from.selectOption('jan');
  await to.selectOption('apr');
  const gesture = async (detail) => {
    const button = dashboard.getByRole('button', {
      name: detail ? 'Select detail range' : 'Select overview range',
      exact: true,
    });
    await button.click();
    const plot = dashboard.locator(detail ? 'nec-bar-chart .plot' : 'nec-composed-chart .plot');
    await expect(plot).toHaveAttribute('data-category-range', 'ready');
    await plot.scrollIntoViewIfNeeded();
    const box = await plot.boundingBox();
    const at = (index) =>
      detail
        ? [box.x + box.width * 0.65, box.y + 12 + (box.height - 42) * ((index + 0.5) / 4)]
        : [box.x + 54 + (box.width - 70) * ((index + 0.5) / 4), box.y + box.height * 0.4];
    await page.mouse.move(...at(1));
    await page.mouse.down();
    await page.mouse.move(...at(2), { steps: 8 });
    await expect(plot.locator('.nec-category-range-draft')).toBeVisible();
    await expect(from).toHaveValue('jan');
    await page.mouse.up();
    await expect(from).toHaveValue('feb');
    await expect(to).toHaveValue('mar');
    await expect(button).toBeFocused();
    await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
    await expect(plot.locator('.nec-category-range-draft')).toHaveCount(0);
  };
  await dashboard
    .getByRole('combobox', { name: 'Overview style', exact: true })
    .selectOption('area');
  await gesture(false);
  await dashboard.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  await dashboard.getByRole('combobox', { name: 'Device', exact: true }).selectOption('desktop');
  await gesture(true);
  await dashboard.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  const arm = dashboard.getByRole('button', { name: 'Select overview range', exact: true });
  await arm.focus();
  await page.keyboard.press('Enter');
  await expect(dashboard.locator('nec-composed-chart .plot')).toHaveAttribute(
    'data-category-range',
    'ready',
  );
  await page.keyboard.press('Escape');
  await expect(arm).toHaveAttribute('aria-pressed', 'false');
  await expect(arm).toBeFocused();
  await expect(from).toHaveValue('jan');
  await expect(to).toHaveValue('apr');
}
