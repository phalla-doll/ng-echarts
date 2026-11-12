import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors } from './resource-audit';

declare global {
  interface Window {
    numericTickText: string[];
  }
}

test('shares locale, currency, and custom numeric text across axis, tooltip, table, and raw events', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    window.numericTickText = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      window.numericTickText.push(text);
      if (maxWidth === undefined) fillText.call(this, text, x, y);
      else fillText.call(this, text, x, y, maxWidth);
    };
  });
  const response = await page.goto('/formatting');
  expect(await response!.text()).toContain('Formatted values');
  const chart = page.locator('nec-bar-chart');
  const canvas = chart.locator('canvas');
  await expect(canvas).toHaveCount(1);
  await page.getByRole('button', { name: 'Euro currency', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.numericTickText)).toContain('€0.00');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Amount for January: €1,234.50', exact: true }),
  ).toBeVisible();
  await expect(chart.locator('tbody')).toContainText('Missing');
  await expect(chart.locator('tbody tr').nth(2).locator('button')).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle German locale', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Amount for January: 1.234,50 €', exact: true }),
  ).toBeVisible();
  await chart
    .getByRole('button', { name: 'Select Amount for February: 0,00 €', exact: true })
    .click();
  await expect(page.locator('.selection')).toHaveText('feb/amount/0/table');
  await page.evaluate(() => {
    window.numericTickText = [];
  });
  await page.getByRole('button', { name: 'Custom value labels', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.numericTickText)).toContain('<0> units');
  await expect(
    chart.getByRole('button', { name: 'Select Amount for April: <-42> units', exact: true }),
  ).toBeVisible();
  const point = await firstGreenBarPoint(canvas);
  await page.mouse.move(point.x, point.y);
  const tooltip = chart.locator('[data-nec-tooltip]');
  await expect(tooltip).toContainText('<1234.5> units');
  expect(await tooltip.innerHTML()).toContain('&lt;1234.5&gt;');
  await page.mouse.click(point.x, point.y);
  await expect(page.locator('.selection')).toHaveText('jan/amount/1234.5/plot');
  expect(errors).toEqual([]);
});

test('hydrates configuration errors, contains invalid formatters and generated ticks, and recovers latest settings', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/formatting?invalid=locale');
  const message = 'The chart locale or number format options are invalid.';
  expect(await response!.text()).toContain(message);
  const chart = page.locator('nec-bar-chart');
  await expect(chart.getByRole('alert')).toHaveText(message);
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Default numbers', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await page.getByRole('button', { name: 'Invalid value formatter', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText(
    'Value formatting failed. Use a pure function that returns text.',
  );
  await expect(chart.locator('canvas')).toHaveCount(0);
  await expect(chart.locator('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('Loading chart…');
  await page.getByRole('button', { name: 'Application error', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Sample application error.');
  await page.getByRole('button', { name: 'Application error', exact: true }).click();
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await page.getByRole('button', { name: 'Invalid number options', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText(message);
  await page.getByRole('button', { name: 'Invalid axis formatter', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText(
    'Unable to render chart. Try again or update the data.',
  );
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Euro currency', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(
    chart.getByRole('button', { name: 'Select Amount for January: €1,234.50', exact: true }),
  ).toBeVisible();
  await expect(chart).not.toContainText('Private');
  expect(errors).toEqual([]);
});
