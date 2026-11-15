import { expect, test, type Locator } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

/** First painted observation in top-to-bottom category order, without engine internals. */
async function paintedPoint(chart: Locator, seriesIndex: number, interior = false) {
  await chart.locator('canvas').evaluate((canvas) => canvas.scrollIntoView({ block: 'center' }));
  return chart.evaluate(
    (host, { seriesIndex, interior }) => {
      const canvas = host.querySelector('canvas')!;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const probe = document.createElement('canvas').getContext('2d')!;
      probe.fillStyle = getComputedStyle(
        host.querySelectorAll('.swatch')[seriesIndex]!,
      ).backgroundColor;
      probe.fillRect(0, 0, 1, 1);
      const target = probe.getImageData(0, 0, 1, 1).data;
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const matches = (x: number, y: number) => {
        const at = (y * canvas.width + x) * 4;
        return [0, 1, 2].every((c) => Math.abs(pixels[at + c]! - target[c]!) < 3);
      };
      const inset = interior ? 4 : 0;
      const box = canvas.getBoundingClientRect();
      // This fixture has five categories. Stay in January's band so a later
      // painted row cannot satisfy readiness while the first row is updating.
      for (let y = 8 + inset; y < canvas.height * 0.28; y++) {
        for (let x = 12 + inset; x < canvas.width - 12 - inset; x++) {
          if (
            matches(x, y) &&
            (!interior || (matches(x - inset, y - inset) && matches(x + inset, y + inset)))
          ) {
            return {
              x: box.x + (x * box.width) / canvas.width,
              y: box.y + (y * box.height) / canvas.height,
            };
          }
        }
      }
      return null;
    },
    { seriesIndex, interior },
  );
}

async function areaInterior(chart: Locator) {
  await chart.locator('canvas').evaluate((canvas) => canvas.scrollIntoView({ block: 'center' }));
  return chart.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas
      .getContext('2d', { willReadFrequently: true })!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    const fill = (x: number, y: number) => {
      const at = (y * canvas.width + x) * 4;
      return (
        pixels[at]! > 220 &&
        pixels[at + 1]! > 150 &&
        pixels[at + 2]! > 150 &&
        pixels[at]! - pixels[at + 1]! > 12 &&
        pixels[at]! - pixels[at + 2]! > 8
      );
    };
    const box = canvas.getBoundingClientRect();
    let depth = 0;
    let candidates: { x: number; y: number }[] = [];
    for (let y = 16; y < canvas.height * 0.28; y++) {
      for (let x = 16; x < canvas.width - 16; x++) {
        if (!fill(x, y)) continue;
        let radius = 0;
        for (let distance = 1; distance <= 8; distance++) {
          if (
            ![-1, 0, 1].every((dx) =>
              [-1, 0, 1].every((dy) => fill(x + dx * distance, y + dy * distance)),
            )
          )
            break;
          radius = distance;
        }
        if (radius > depth) {
          depth = radius;
          candidates = [];
        }
        if (radius === depth && depth > 0) candidates.push({ x, y });
      }
    }
    const point = candidates[Math.floor(candidates.length / 2)];
    return point
      ? {
          x: box.x + (point.x * box.width) / canvas.width,
          y: box.y + (point.y * box.height) / canvas.height,
        }
      : null;
  });
}

test('rotates stacked bars and unmarked line hits while preserving native raw values, legends and the renderer', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/composed-validation');
  const chart = page.locator('.primary-composed nec-composed-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
  await page.getByRole('button', { name: 'Horizontal composed', exact: true }).click();
  await page.getByRole('button', { name: 'Use stacked bars', exact: true }).click();
  await expect.poll(() => paintedPoint(chart, 1, true)).not.toBeNull();
  const segment = (await paintedPoint(chart, 1, true))!;
  await page.mouse.click(segment.x, segment.y);
  await expect(page.locator('.selection')).toHaveText('a/mobile/40/plot');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  for (const [label, result] of [
    ['Select Visits for April: -60', 'd/visits/-60/table'],
    ['Select Mobile for March: 0', 'c/mobile/0/table'],
  ]) {
    await chart.getByRole('button', { name: label, exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.selection')).toHaveText(result);
  }
  await page.getByRole('button', { name: 'Restore composed data', exact: true }).click();
  await page.getByRole('button', { name: 'Horizontal composed', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle trend points', exact: true }).click();
  const visits = chart.locator('.legend button').filter({ hasText: 'Visits' });
  await visits.click();
  await expect.poll(() => paintedPoint(chart, 0, true)).toBeNull();
  await expect.poll(() => paintedPoint(chart, 1)).not.toBeNull();
  const line = (await paintedPoint(chart, 1))!;
  await page.mouse.click(line.x, line.y);
  await expect(page.locator('.selection')).toHaveText('a/trend/80/plot');
  await page.getByRole('button', { name: 'Horizontal composed', exact: true }).click();
  await expect(visits).toHaveAttribute('aria-pressed', 'false');
  await expect(chart.locator('.plot')).toHaveAttribute('_echarts_instance_', instance!);
  await page.getByRole('button', { name: 'Invalid composed layout', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('layout');
  await page.getByRole('button', { name: 'Restore composed data', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(visits).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('renders horizontal areas and long regional labels at all responsive widths and themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/composed');
  const block = page.locator('#horizontal-visits-and-target');
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator('canvas')).toHaveCount(1);
  await expect(block.locator('.block-metrics')).toContainText('Target');
  await expect(block.locator('.metric-total').nth(2)).toContainText('1,020');
  await expect(block.locator('.block-metrics')).not.toContainText('3-month mean');
  for (const theme of ['light', 'dark']) {
    const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
    if (await toggle.count()) await toggle.click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await expect(block.locator('canvas')).toHaveCount(1);
    }
  }
  await block.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(block.locator('.block-code')).toContainText('layout="horizontal"');
  await page.goto('/composed-validation');
  const light = page.getByRole('button', { name: 'Use light theme', exact: true });
  if (await light.count()) await light.click();
  const chart = page.locator('.primary-composed nec-composed-chart');
  await page.getByRole('button', { name: 'Horizontal composed', exact: true }).click();
  await page.getByRole('button', { name: 'Use stacked areas', exact: true }).click();
  await expect.poll(() => areaInterior(chart)).not.toBeNull();
  const upper = (await areaInterior(chart))!;
  await page.mouse.click(upper.x, upper.y);
  await expect(page.locator('.selection')).toHaveText('a/mobile/40/plot');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await chart.getByRole('button', { name: 'Select Mobile for January: 40', exact: true }).click();
  await expect(page.locator('.selection')).toHaveText('a/mobile/40/table');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Toggle area fill', exact: true }).click();
  await page.getByRole('button', { name: 'Switch series kind', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
