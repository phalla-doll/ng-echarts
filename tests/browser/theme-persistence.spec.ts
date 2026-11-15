import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

test('remembers the selected theme across refreshes and new pages, including chart rendering', async ({
  page,
  context,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/components');
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Use dark theme', exact: true })).toBeVisible();
  await expect(page.locator('.site-shell')).not.toHaveClass(/\bdark\b/);

  await page.goto('/playground');
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
  await expect(page.locator('nec-bar-chart .chart-frame')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  const otherPage = await context.newPage();
  const otherErrors = collectBrowserErrors(otherPage);
  await otherPage.goto('/installation');
  await expect(
    otherPage.getByRole('button', { name: 'Use dark theme', exact: true }),
  ).toBeVisible();
  await otherPage.close();

  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Use light theme', exact: true })).toBeVisible();
  await expect(page.locator('.site-shell')).toHaveClass(/\bdark\b/);
  await expect(page.locator('nec-bar-chart .chart-frame')).toHaveCSS(
    'background-color',
    'rgb(10, 10, 10)',
  );
  expect([...errors, ...otherErrors]).toEqual([]);
});

test('ignores an invalid saved theme and replaces it with the next selection', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/components');
  await page.evaluate(() => localStorage.setItem('ng-echarts-theme', 'invalid'));
  await page.reload();
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Use dark theme', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const blocked of ['access', 'write']) {
  test(`keeps the theme toggle usable when storage ${blocked} is blocked`, async ({ page }) => {
    const errors = collectBrowserErrors(page);
    await page.addInitScript((blocked) => {
      const denied = () => {
        throw new DOMException('Storage disabled for test', 'SecurityError');
      };
      if (blocked === 'access') Object.defineProperty(window, 'localStorage', { get: denied });
      else Storage.prototype.setItem = denied;
    }, blocked);
    await page.goto('/components');
    await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    await expect(page.locator('.site-shell')).not.toHaveClass(/\bdark\b/);
    await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
    await expect(page.locator('.site-shell')).toHaveClass(/\bdark\b/);
    expect(errors).toEqual([]);
  });
}
