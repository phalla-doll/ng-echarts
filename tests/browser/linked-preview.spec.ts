import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors } from './resource-audit';

test('previews device share from a real bar without changing the committed filter or chart instances', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/linked');
  const overview = page.locator('.overview nec-bar-chart');
  const detail = page.locator('.detail nec-pie-chart');
  await expect(page.locator('canvas')).toHaveCount(2);
  const ids = () =>
    page
      .locator('app-linked-visits .plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  const initial = await ids();
  const point = await firstGreenBarPoint(overview.locator('canvas'));
  await page.mouse.move(point.x, point.y);
  await expect(detail.getByRole('heading')).toHaveText('Device share · All months');
  await page.mouse.move(0, 0);
  await page.getByRole('checkbox', { name: 'Preview months', exact: true }).check();
  await page.mouse.move(point.x, point.y);
  await expect(detail.getByRole('heading')).toHaveText('Device share · Preview: January');
  await expect(
    detail.getByRole('button', { name: 'Desktop 342 65% Visible', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');
  await expect(page.locator('.linked-status')).toContainText('All months: 11,463 visits');
  await expect(overview.locator('tr[aria-current]')).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(detail.getByRole('heading')).toHaveText('Device share · All months');
  await page.mouse.click(point.x, point.y);
  await expect(detail.getByRole('heading')).toHaveText('Device share · January');
  await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue(
    'month:jan',
  );
  await expect(page.locator('.preview-context')).not.toContainText('Preview ·');
  expect(await ids()).toEqual(initial);
  expect(errors).toEqual([]);
});

test('offers keyboard previews, restores the selected range on blur, and cancels stale context', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-validation');
  await expect(page.locator('canvas')).toHaveCount(2);
  const overview = page.locator('.overview nec-bar-chart');
  const heading = page.locator('.detail').getByRole('heading');
  const period = page.getByRole('combobox', { name: 'Period', exact: true });
  await period.selectOption('__range__');
  await page.getByRole('checkbox', { name: 'Preview months', exact: true }).check();
  await overview.getByRole('button', { name: 'Show data table', exact: true }).click();
  const zero = overview.getByRole('button', { name: 'Select Mobile for February: 0', exact: true });
  await zero.focus();
  await expect(heading).toHaveText('Device share · Preview: February');
  await expect(zero).toBeFocused();
  await expect(page.locator('.linked-status')).toContainText('January–April: 500 visits');
  await expect(page.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('jan');
  await expect(page.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
  await page.keyboard.press('Escape');
  await expect(heading).toHaveText('Device share · January–April');
  await zero.blur();
  await zero.focus();
  await expect(heading).toContainText('Preview: February');
  // Programmatic fixture updates leave focus in place, exercising stale-model cancellation.
  await page
    .getByRole('button', { name: 'Update linked values', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(heading).toHaveText('Device share · January–April');
  await zero.blur();
  await zero.focus();
  await page.keyboard.press('Enter');
  await expect(heading).toHaveText('Device share · February');
  await expect(period).toHaveValue('month:feb');
  await expect(zero).toBeFocused();
  await period.focus();
  await expect(heading).toHaveText('Device share · February');
  await page.getByRole('button', { name: 'Select range', exact: true }).click();
  await zero.focus();
  await expect(heading).toHaveText('Device share · February');
  await page.keyboard.press('Escape');
  await expect(heading).toHaveText('Device share · February');
  await zero.blur();
  await zero.focus();
  await expect(heading).toContainText('Preview: February');
  await page
    .getByRole('button', { name: 'Remove February', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(heading).toHaveText('Device share · All months');
  expect(errors).toEqual([]);
});
