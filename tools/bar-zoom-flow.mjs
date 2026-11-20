import { expect } from '@playwright/test';

export async function verifyBarZoom(page) {
  const chart = page.locator('nec-bar-chart');
  const plot = chart.locator('.plot');
  await expect(plot.locator('canvas')).toBeVisible({ timeout: 30_000 });
  const instance = await plot.getAttribute('_echarts_instance_');
  expect(instance).toBeTruthy();

  const from = page.getByRole('combobox', { name: 'From' });
  const to = page.getByRole('combobox', { name: 'To' });
  const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
  const zoomOut = page.getByRole('button', { name: 'Zoom out', exact: true });
  const earlier = page.getByRole('button', { name: 'Pan earlier', exact: true });
  const later = page.getByRole('button', { name: 'Pan later', exact: true });
  const arm = page.getByRole('button', { name: 'Chart range', exact: true });
  const reset = page.getByRole('button', { name: 'Reset window', exact: true });
  const status = page.getByRole('status').filter({ hasText: 'days visible' });
  const rows = chart.locator('tbody tr');

  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(rows).toHaveCount(8);
  await expect(zoomOut).toHaveAttribute('aria-disabled', 'true');
  await zoomIn.press('Enter');
  await expect(status).toHaveText('4 of 8 days visible, Nov 11 to Nov 14.');
  await expect(from).toHaveValue('nov-11');
  await expect(to).toHaveValue('nov-14');
  await expect(rows).toHaveCount(4);
  await expect(zoomIn).toBeFocused();

  await later.press('Space');
  await expect(status).toHaveText('4 of 8 days visible, Nov 13 to Nov 16.');
  await expect(later).toHaveAttribute('aria-disabled', 'true');
  await later.press('Enter');
  await expect(from).toHaveValue('nov-13');
  await earlier.press('Enter');
  await expect(status).toHaveText('4 of 8 days visible, Nov 9 to Nov 12.');
  await expect(earlier).toHaveAttribute('aria-disabled', 'true');
  await zoomOut.press('Enter');
  await expect(rows).toHaveCount(8);

  await from.selectOption('nov-10');
  await to.selectOption('nov-15');
  await expect(rows).toHaveCount(6);
  await arm.press('Enter');
  await expect(plot).toHaveAttribute('data-category-range', 'ready');
  await arm.press('Escape');
  await expect(arm).toHaveAttribute('aria-pressed', 'false');
  await expect(arm).toBeFocused();
  await expect(rows).toHaveCount(6);

  await plot.scrollIntoViewIfNeeded();
  await arm.press('Enter');
  await expect(plot).toHaveAttribute('data-category-range', 'ready');
  const box = await plot.boundingBox();
  expect(box).toBeTruthy();
  const point = (index) => [
    box.x + 54 + (box.width - 70) * ((index + 0.5) / 6),
    box.y + box.height * 0.4,
  ];
  await page.mouse.move(...point(3));
  await page.mouse.down();
  await page.mouse.move(...point(1), { steps: 8 });
  await expect(plot.locator('.nec-category-range-draft')).toBeVisible();
  await expect(rows).toHaveCount(6);
  await page.mouse.up();
  await expect(status).toHaveText('3 of 8 days visible, Nov 11 to Nov 13.');
  await expect(from).toHaveValue('nov-11');
  await expect(to).toHaveValue('nov-13');
  await expect(rows).toHaveCount(3);
  await expect(rows.filter({ hasText: 'Nov 13' }).getByRole('button')).toHaveCount(0);
  await expect(arm).toHaveAttribute('aria-pressed', 'false');
  await expect(arm).toBeFocused();

  await to.selectOption('nov-11');
  await expect(rows).toHaveCount(1);
  await expect(chart.getByRole('button', { name: 'Select Shipments for Nov 11: 0' })).toBeVisible();
  await expect(zoomIn).toHaveAttribute('aria-disabled', 'true');
  await expect(arm).toHaveAttribute('aria-disabled', 'true');
  await reset.press('Enter');
  await expect(rows).toHaveCount(8);
  await expect(plot).toHaveAttribute('_echarts_instance_', instance);
  await page.setViewportSize({ width: 320, height: 900 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(320);
}
