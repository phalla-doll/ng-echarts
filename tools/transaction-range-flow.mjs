import { expect } from '@playwright/test';

export async function verifyTransactionRange(page) {
  const chart = page.locator('nec-bar-chart');
  const plot = chart.locator('.plot');
  await expect(plot.locator('canvas')).toBeVisible({ timeout: 30_000 });
  const instance = await plot.getAttribute('_echarts_instance_');
  expect(instance).toBeTruthy();
  const from = page.getByRole('combobox', { name: 'From' });
  const to = page.getByRole('combobox', { name: 'To' });
  const arm = page.getByRole('button', { name: 'Chart range' });
  const reset = page.getByRole('button', { name: 'Reset range' });
  const table = page.getByRole('table', { name: 'Transactions in selected range' });
  const rows = table.locator('tbody tr');
  const status = page.getByRole('status').filter({ hasText: /transactions from/ });

  await expect(rows).toHaveCount(5);
  await from.press('t');
  await expect(from).toHaveValue('tue');
  await to.selectOption('wed');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1)).toContainText('Fee adjustment');
  await expect(rows.nth(1).last()).toContainText('$0.00');
  await expect(status).toHaveText('2 transactions from Tue, Nov 17 through Wed, Nov 18.');

  await to.selectOption('mon');
  await expect(from).toHaveValue('mon');
  await expect(rows).toHaveCount(1);
  await from.selectOption('wed');
  await expect(to).toHaveValue('wed');
  await expect(rows).toHaveText('No transactions in this range.');
  await reset.click();

  await arm.press('Enter');
  await expect(plot).toHaveAttribute('data-category-range', 'ready');
  await plot.scrollIntoViewIfNeeded();
  const box = await plot.boundingBox();
  expect(box).toBeTruthy();
  const point = (index) => [
    box.x + 54 + (box.width - 70) * ((index + 0.5) / 5),
    box.y + box.height * 0.4,
  ];
  await page.mouse.move(...point(2));
  await page.mouse.down();
  await page.mouse.move(...point(1), { steps: 8 });
  await expect(plot.locator('.nec-category-range-draft')).toBeVisible();
  await expect(rows).toHaveCount(5);
  await page.mouse.up();
  await expect(from).toHaveValue('tue');
  await expect(to).toHaveValue('wed');
  await expect(rows).toHaveCount(2);
  await expect(arm).toBeFocused();
  await expect(arm).toHaveAttribute('aria-pressed', 'false');

  await arm.press('Enter');
  await expect(plot).toHaveAttribute('data-category-range', 'ready');
  await arm.press('Escape');
  await expect(arm).toHaveAttribute('aria-pressed', 'false');
  await expect(rows).toHaveCount(2);
  await reset.click();
  await expect(rows).toHaveCount(5);

  await page.setViewportSize({ width: 320, height: 900 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(320);
  await expect(plot).toHaveAttribute('_echarts_instance_', instance);
}
