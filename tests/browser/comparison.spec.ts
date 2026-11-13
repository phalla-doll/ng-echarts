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
  await page.goto('/comparison?reference=1');
  for (const variant of ['Grouped', 'Stacked', 'Horizontal', 'Gradient']) {
    await page.getByRole('button', { name: `${variant} reference`, exact: true }).click();
    const main = page.locator('app-comparison main');
    if (await main.evaluate((element) => element.classList.contains('dark')))
      await page.getByRole('button', { name: 'Toggle comparison theme', exact: true }).click();
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
    await page.getByRole('button', { name: 'Show data table', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(variant === 'Horizontal' ? 6 : 12);
    await expect(
      page.getByRole('button', {
        name: `Select Desktop for January: ${variant === 'Horizontal' ? 186 : 342}`,
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Hide data table', exact: true }).click();
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
  const response = await page.goto('/comparison?reference=1');
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
  await expect(page.locator('nec-bar-chart .plot')).toContainText(/Desktop\s*342/);
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

for (const route of ['/comparison', '/line-comparison', '/area-comparison', '/pie-comparison']) {
  test(`${route} follows the shared site layout, navigation, and theme`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    const galleryHeading = await page.locator('h1').boundingBox();
    await page.goto(route);
    const shell = page.locator('.site-shell');
    await expect(shell).not.toHaveClass(/focus-layout/);
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Visual comparison', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.comparison-page')).toHaveClass(/utility-page/);
    expect((await page.locator('h1').boundingBox())!.x).toBe(galleryHeading!.x);
    expect((await page.locator('h1').boundingBox())!.y).toBe(galleryHeading!.y);
    await expect(page.locator('.comparison-host')).toHaveCSS('font-family', /Inter/);
    await expect(page.getByRole('button', { name: /Toggle .*comparison theme/ })).toBeHidden();
    const variant = page
      .getByRole('group', { name: /variants/ })
      .getByRole('button')
      .nth(1);
    await variant.click();
    await expect(variant).toHaveAttribute('aria-pressed', 'true');
    for (const [theme, background] of [
      ['dark', 'rgb(10, 10, 10)'],
      ['light', 'rgb(255, 255, 255)'],
    ]) {
      if (theme === 'light')
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      await expect(shell).toHaveCSS('background-color', background!);
      await expect(page.locator('.chart-frame')).toHaveCSS('background-color', background!);
      const swatch = page.locator('.legend .swatch').first();
      await expect(swatch).toHaveCSS(
        'background-color',
        route === '/pie-comparison'
          ? theme === 'dark'
            ? 'rgb(96, 165, 250)'
            : 'rgb(59, 130, 246)'
          : theme === 'dark'
            ? 'rgb(16, 185, 129)'
            : 'rgb(4, 120, 87)',
      );
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'Playground pages' })
      .getByRole('link', { name: 'Bar Blocks', exact: true })
      .click();
    await expect(page.locator('.site-shell')).not.toHaveClass(/\bdark\b/);
    await expect(page.locator('h1')).toHaveText('Bar Blocks');
    await page.goto(`${route}?reference=1`);
    await expect(page.locator('.site-shell')).toHaveClass(/focus-layout/);
    await expect(page.locator('.comparison-page')).toHaveClass(/reference-mode/);
    await expect(page.locator('.comparison-host')).not.toHaveCSS('font-family', /Inter/);
    await expect(page.locator('.chart-frame')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.getByRole('button', { name: /Toggle .*comparison theme/ }).click();
    await expect(page.locator('.chart-frame')).not.toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.site-shell')).toHaveClass(/\bdark\b/);
    expect(errors).toEqual([]);
  });
}
