import { renderGallery } from '../../tools/browser-gallery.mjs';
import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

declare global {
  interface Window {
    galleryClipboard: string;
  }
}

test('hydrates bar blocks without table controls and keeps code, copying, preview reset, theme, and plot events usable', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    window.galleryClipboard = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.galleryClipboard = text;
        },
      },
    });
  });
  const response = await page.goto('/');
  const html = await response!.text();
  expect(html).toContain('Bar Blocks');
  expect(html).toContain('Horizontal Comparison');
  expect(html).not.toContain('<canvas');
  expect(html).not.toContain('Show data table');
  await renderGallery(page);
  await expect(page.locator('app-bar-block canvas')).toHaveCount(4);
  await expect(page.locator('app-bar-block .table-toggle')).toHaveCount(0);
  await expect(page.locator('app-bar-block table')).toHaveCount(0);
  await expect(page.locator('.site-shell')).toHaveClass(
    /gallery-layout.*dark|dark.*gallery-layout/,
  );
  await expect(page.locator('.site-shell')).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  const first = page.locator('#device-visits');
  await expect(first.locator('.block-metrics')).toContainText('7,170');
  await expect(first.locator('.block-metrics')).toContainText('4,293');
  await first.locator('.legend button').first().click();
  await expect(first.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'false');
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(first.locator('canvas')).toBeHidden();
  await expect(first.locator('.block-code')).toContainText('theme="dark"');
  await first.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(first.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.galleryClipboard)).toContain('export class DeviceVisits');
  expect(await page.evaluate(() => window.galleryClipboard)).toContain('"desktop": 342');
  expect(await page.evaluate(() => window.galleryClipboard)).toContain('[showDataTable]="false"');
  await page.getByRole('button', { name: 'Copy Page', exact: true }).click();
  expect(await page.evaluate(() => window.galleryClipboard)).toContain('# Bar Blocks');
  expect(await page.evaluate(() => window.galleryClipboard)).toContain('layout="horizontal"');
  await first.getByRole('button', { name: 'Reload Device Visits preview', exact: true }).click();
  await expect(first.locator('canvas')).toBeVisible();
  await expect(first.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'true');
  await renderGallery(page);
  await expect(page.locator('app-bar-block canvas')).toHaveCount(4);
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await expect(page.locator('.site-shell')).not.toHaveClass(/\bdark\b/);
  const point = await firstGreenBarPoint(first.locator('canvas'));
  await page.mouse.click(point.x, point.y);
  await expect(first.getByRole('status')).toHaveText('January: desktop = 342 (plot)');
  await expect(first.locator('.table-toggle')).toHaveCount(0);
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(first.locator('.block-code')).toContainText('theme="light"');
  await expect(first.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('fits the gallery in both themes and supports mobile navigation and denied clipboard access', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard disabled for test');
        },
      },
    }),
  );
  await page.goto('/');
  await renderGallery(page);
  await expect(page.locator('app-bar-block canvas')).toHaveCount(4);
  for (const light of [false, true]) {
    if (light) await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      for (const chart of await page.locator('app-bar-block nec-bar-chart').all()) {
        await expect
          .poll(() => chart.evaluate((element) => element.scrollWidth <= element.clientWidth))
          .toBe(true);
      }
    }
  }
  await page
    .locator('#device-visits')
    .getByRole('button', { name: 'Copy Device Visits example', exact: true })
    .click();
  await expect(
    page
      .locator('#device-visits')
      .getByRole('status')
      .filter({ hasText: 'Clipboard access is unavailable' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const navigation = page.getByRole('navigation', { name: 'Playground pages' });
  await expect(navigation).toBeHidden();
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#page-content')).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(navigation.getByRole('link', { name: 'Bar Blocks', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await navigation.getByRole('link', { name: 'Bar Blocks', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('disposes gallery resources when navigating between the gallery, playground, and cleanup page', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  await page.goto('/');
  await renderGallery(page);
  await expect(page.locator('canvas')).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => window.chartAudit.observedTargets)).toBe(4);
  await page.getByRole('link', { name: 'Playground', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bar charts', exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.chartAudit.observedTargets)).toBe(1);
  await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  await page.getByRole('link', { name: 'Bar Blocks', exact: true }).click();
  await renderGallery(page);
  await expect(page.locator('canvas')).toHaveCount(4);
  await expect.poll(() => page.evaluate(() => window.chartAudit.observedTargets)).toBe(4);
  expect(errors).toEqual([]);
});
