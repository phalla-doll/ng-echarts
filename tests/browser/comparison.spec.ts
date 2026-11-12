import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';

declare global {
  interface Window {
    comparisonTickText: string[];
  }
}

test('fits the comparison plot and controls at all review widths in both themes', async ({
  page,
}) => {
  await page.goto('/comparison');
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark')
      await page.getByRole('button', { name: 'Toggle comparison theme', exact: true }).click();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width: width + 40, height: 1000 });
      const chart = page.locator('nec-bar-chart');
      await expect
        .poll(() => chart.evaluate((element) => element.getBoundingClientRect().width))
        .toBe(width);
      await expect
        .poll(() =>
          chart.locator('canvas').evaluate((element) => element.getBoundingClientRect().width),
        )
        .toBeLessThanOrEqual(width);
      for (const selector of ['.legend', '.chart-frame']) {
        const fits = await chart
          .locator(selector)
          .evaluate((element) => element.scrollWidth <= element.clientWidth);
        expect(fits, `${selector} overflows at ${width}px in ${theme}`).toBe(true);
      }
    }
  }
});

test('hydrates formatted ticks, retains full tooltip/table labels, and recovers formatter errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || /NG05\d+/.test(message.text())) errors.push(message.text());
  });
  await page.addInitScript(() => {
    window.comparisonTickText = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      window.comparisonTickText.push(text);
      if (maxWidth === undefined) fillText.call(this, text, x, y);
      else fillText.call(this, text, x, y, maxWidth);
    };
  });
  const response = await page.goto('/comparison');
  const html = await response!.text();
  expect(html).toContain('Device visits by month');
  expect(html).not.toContain('<canvas');
  const canvas = page.locator('nec-bar-chart canvas');
  await expect(canvas).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.comparisonTickText)).toContain('Jan');
  expect(await page.evaluate(() => window.comparisonTickText)).not.toContain('January');
  const point = await firstGreenBarPoint(canvas);
  await page.mouse.move(point.x, point.y);
  await expect(page.locator('nec-bar-chart strong')).toHaveText('January');
  await expect(page.locator('nec-bar-chart .plot')).toContainText('Desktop: 342');
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Select Desktop for January: 342', exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.comparisonTickText = [];
  });
  await page.getByRole('button', { name: 'Abbreviate category ticks', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.comparisonTickText)).toContain('January');
  await page.getByRole('button', { name: 'Simulate formatter error', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Category tick formatting failed. Use a function that returns text.',
  );
  await expect(canvas).toHaveCount(0);
  await expect(page.locator('nec-bar-chart table')).toHaveCount(0);
  await expect(page.locator('nec-bar-chart')).not.toContainText('Internal formatter details');
  await page.getByRole('button', { name: 'Simulate formatter error', exact: true }).click();
  await expect(canvas).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Select Desktop for January: 342', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Toggle comparison theme', exact: true }).click();
  await expect(page.locator('.legend .swatch').first()).toHaveCSS(
    'background-color',
    'rgb(16, 185, 129)',
  );
  expect(errors).toEqual([]);
});
