import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';
import { firstGreenBarPoint } from './canvas-point';

test('keeps dual-axis native values, labels, identities and errors coherent through replacement', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/composed-validation');
  const chart = page.locator('.primary-composed nec-composed-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
  await page.getByRole('button', { name: 'Use dual axes', exact: true }).click();
  await expect(chart.locator('.scale-context')).toHaveText(
    'left axis: Revenue (USD). right axis: Conversion (%)',
  );
  const canvas = chart.locator('canvas');
  await canvas.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const rose = async () =>
    canvas.evaluate((element: HTMLCanvasElement) => {
      const pixels = element
        .getContext('2d', { willReadFrequently: true })!
        .getImageData(0, 0, element.width, element.height).data;
      const box = element.getBoundingClientRect();
      for (let x = Math.floor(element.width * 0.33); x < element.width * 0.4; x++)
        for (let y = 8; y < element.height - 8; y++) {
          const at = (y * element.width + x) * 4;
          if (
            pixels[at]! > 120 &&
            pixels[at]! > pixels[at + 1]! * 2 &&
            pixels[at]! > pixels[at + 2]! * 1.3
          )
            return {
              x: box.x + (x * box.width) / element.width,
              y: box.y + (y * box.height) / element.height,
            };
        }
      return null;
    });
  await expect.poll(rose).not.toBeNull();
  const plotted = (await rose())!;
  await page.mouse.click(plotted.x, plotted.y);
  await expect(page.locator('.selection')).toHaveText('b/trend/0.18/plot');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  const revenue = chart.getByRole('button', {
    name: 'Select Revenue (USD, left axis) for January: $1,200',
    exact: true,
  });
  await revenue.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('a/visits/1200/table');
  const conversion = chart.getByRole('button', {
    name: 'Select Conversion (%, right axis) for January: 12%',
    exact: true,
  });
  await conversion.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.selection')).toHaveText('a/trend/0.12/table');
  await expect(conversion).toBeFocused();
  await expect(chart.locator('tbody')).toContainText('Missing');
  await chart
    .getByRole('button', { name: 'Select Conversion (%, right axis) for March: 0%', exact: true })
    .click();
  await expect(page.locator('.selection')).toHaveText('c/trend/0/table');
  await chart.locator('.legend button').filter({ hasText: 'Revenue' }).click();
  await expect(chart.locator('.legend button').filter({ hasText: 'Revenue' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await revenue.focus();
  await page
    .getByRole('button', { name: 'Horizontal composed', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(
    chart.getByRole('button', {
      name: 'Select Revenue (USD, bottom axis) for January: $1,200',
      exact: true,
    }),
  ).toBeFocused();
  await expect(chart.locator('.scale-context')).toHaveText(
    'bottom axis: Revenue (USD). top axis: Conversion (%)',
  );
  await expect(chart.locator('.plot')).toHaveAttribute('_echarts_instance_', instance!);
  await page.getByRole('button', { name: 'Cross-axis stack', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('stack');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Use dual axes', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(chart.locator('.legend button').filter({ hasText: 'Revenue' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Invalid axis formatter', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('formatting');
  await page.getByRole('button', { name: 'Restore composed data', exact: true }).click();
  await expect(chart.locator('.scale-context')).toHaveCount(0);
  await expect(chart.locator('canvas')).toHaveCount(1);
  await chart.getByRole('button', { name: 'Select Trend for January: 80', exact: true }).click();
  await expect(page.locator('.selection')).toHaveText('a/trend/80/table');
  expect(errors).toEqual([]);
});

test('renders independent-scale examples with correct summaries and copyable source in both themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/composed');
  const block = page.locator('#revenue-and-conversion');
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator('canvas')).toHaveCount(1);
  await expect(block.locator('.metric-total').first()).toContainText('$3,000');
  await expect(block.locator('.metric-total').nth(1)).toContainText('20%');
  await expect(block.locator('.block-metrics')).not.toContainText('3-month mean');
  for (const theme of ['light', 'dark']) {
    const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
    if (await toggle.count()) await toggle.click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await expect(block.locator('.scale-context')).toContainText('USD');
    }
  }
  const chart = block.locator('nec-composed-chart');
  const canvas = chart.locator('canvas');
  const point = await firstGreenBarPoint(canvas);
  await page.mouse.click(point.x, point.y);
  await expect(block.getByRole('status')).toHaveText('January: revenue = 1200 (plot)');
  await block.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(block.locator('.block-code')).toContainText('[valueAxes]="valueAxes"');
  await expect(block.locator('.block-code')).toContainText('"axisId": "conversion"');
  expect(errors).toEqual([]);
});
