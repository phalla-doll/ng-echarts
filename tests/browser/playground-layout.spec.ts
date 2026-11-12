import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

test('opens the mobile navigation with keyboard support and closes it after routing', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/playground');
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#page-content')).toBeFocused();
  await page.getByRole('link', { name: 'Chart settings', exact: true }).click();
  await expect(page.locator('#chart-settings')).toBeFocused();
  await page.getByRole('link', { name: 'Back to example', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bar charts', exact: true })).toBeVisible();
  const navigation = page.getByRole('navigation', { name: 'Playground pages' });
  await expect(navigation).toBeHidden();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(navigation).toBeVisible();
  const active = navigation.getByRole('link', { name: 'Playground', exact: true });
  await expect(active).toHaveAttribute('aria-current', 'page');
  await active.focus();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await navigation.getByRole('link', { name: 'Lifecycle validation', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Bar lifecycle validation', exact: true }),
  ).toBeVisible();
  await expect(navigation).toBeHidden();
  await expect(page.getByTestId('primary').locator('canvas')).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});

test('keeps code, preview, theme, copy feedback, and reset controls in sync', async ({ page }) => {
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
  await page.goto('/playground');
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Horizontal layout', exact: true }).click();
  await page.getByRole('button', { name: 'Stack series', exact: true }).click();
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
  await expect(page.locator('.site-shell')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Angular code', exact: true }).click();
  await expect(page.locator('pre')).toContainText('layout="horizontal"');
  await expect(page.locator('pre')).toContainText('[stacked]="true"');
  await expect(page.locator('pre')).toContainText('theme="dark"');
  await expect(page.locator('nec-bar-chart')).toBeHidden();
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Clipboard access is unavailable' }),
  ).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    }),
  );
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset controls', exact: true }).click();
  await expect(page.locator('pre')).toContainText('layout="vertical"');
  await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('nec-bar-chart canvas')).toBeVisible();
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Horizontal layout', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  expect(errors).toEqual([]);
});
