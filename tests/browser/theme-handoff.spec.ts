import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

for (const family of [
  'bar',
  'line',
  'area',
  'composed',
  'pie',
  'radar',
  'radial',
  'calendar',
  'sankey',
]) {
  test(`${family} inherits frame colors before hydration and keeps them when the plot loads`, async ({
    page,
    browserName,
  }, testInfo) => {
    const errors = collectBrowserErrors(page);
    let release!: () => void;
    const scripts = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/*.js', async (route) => {
      await scripts;
      await route.continue();
    });
    await page.goto(family === 'bar' ? '/' : `/${family}`, { waitUntil: 'commit' });
    const chart = page.locator('.gallery-chart').first();
    const frame = chart.locator('.chart-frame');
    try {
      await expect(frame).toBeVisible();
      await expect(chart.locator('canvas')).toHaveCount(0);
      if (family === 'composed' && browserName === 'chromium') {
        const path = testInfo.outputPath('before-hydration.png');
        await page.locator('.block-card').first().screenshot({ path });
        await testInfo.attach('before-hydration', {
          path,
          contentType: 'image/png',
        });
      }
      await expect(frame).toHaveCSS('background-color', 'rgb(10, 10, 10)');
      await expect(frame).toHaveCSS('color', 'rgb(245, 245, 245)');
      await expect(frame.locator('header p')).toHaveCSS('color', 'rgb(163, 163, 163)');
    } finally {
      release();
    }
    await expect(chart.locator('canvas').first()).toBeVisible();
    for (const [theme, background, text] of [
      ['dark', 'rgb(10, 10, 10)', 'rgb(245, 245, 245)'],
      ['light', 'rgb(255, 255, 255)', 'rgb(23, 23, 23)'],
    ]) {
      if (theme === 'light')
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      await expect(frame).toHaveCSS('background-color', background!);
      await expect(frame).toHaveCSS('color', text!);
      await expect
        .poll(() =>
          chart
            .locator('canvas')
            .first()
            .evaluate((canvas: HTMLCanvasElement) => {
              const [r, g, b] = canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data;
              return `rgb(${r}, ${g}, ${b})`;
            }),
        )
        .toBe(background);
    }
    if (family === 'composed' && browserName === 'chromium') {
      await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
      await expect(frame).toHaveCSS('background-color', 'rgb(10, 10, 10)');
      const path = testInfo.outputPath('after-hydration.png');
      await page.locator('.block-card').first().screenshot({ path });
      await testInfo.attach('after-hydration', {
        path,
        contentType: 'image/png',
      });
    }
    expect(errors).toEqual([]);
  });
}

test.describe('CSS theme defaults without client JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const [theme, route, background, text, muted, border] of [
    [
      'dark',
      '/composed',
      'rgb(24, 32, 44)',
      'rgb(237, 242, 250)',
      'rgb(178, 191, 210)',
      'rgb(59, 74, 97)',
    ],
    [
      'light',
      '/comparison?reference=1',
      'rgb(255, 255, 255)',
      'rgb(24, 32, 44)',
      'rgb(83, 97, 118)',
      'rgb(214, 220, 229)',
    ],
  ]) {
    test(`${theme} preserves unthemed defaults and accepts partial inherited overrides`, async ({
      page,
    }) => {
      await page.goto(route!);
      const chart = page.locator('nec-composed-chart, nec-bar-chart').first();
      // Remove the demo's custom theme to exercise the library defaults from SSR.
      await chart.evaluate((element: HTMLElement) => {
        for (const token of ['background', 'text', 'muted', 'border'])
          element.style.setProperty(`--nec-${token}`, 'initial');
      });
      const frame = chart.locator('.chart-frame');
      await expect(frame).toHaveCSS('background-color', background!);
      await expect(frame).toHaveCSS('color', text!);
      await expect(frame.locator('header p')).toHaveCSS('color', muted!);
      await expect(frame.locator('.legend button').first()).toHaveCSS('border-top-color', border!);
      await chart.evaluate((element: HTMLElement) => {
        element.style.setProperty('--test-surface', '#172d3f');
        element.style.setProperty('--nec-background', 'var(--test-surface)');
      });
      await expect(frame).toHaveCSS('background-color', 'rgb(23, 45, 63)');
      await expect(frame).toHaveCSS('color', text!);
      await expect(chart.locator('canvas')).toHaveCount(0);
    });
  }
});
