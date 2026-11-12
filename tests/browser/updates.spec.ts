import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

test('restores a usable focus target after removal without stealing external focus', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/updates');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await page.getByRole('button', { name: 'Select Mobile for February: 491', exact: true }).focus();
  const replace = page.getByRole('button', { name: 'Replace rows and series', exact: true });
  await replace.evaluate((element: HTMLButtonElement) => element.click());
  const toggle = page.getByRole('button', { name: 'Hide data table', exact: true });
  await expect(toggle).toBeFocused();
  await page
    .getByRole('button', { name: 'Select Computers for New month: 0', exact: true })
    .focus();
  await page
    .getByRole('button', { name: 'Invalidate data', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  await expect(page.getByRole('alert')).toBeFocused();
  await page.getByRole('button', { name: 'Restore inputs', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Restore inputs', exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});

test('retains identities, focus, visibility, and original-row events through batched updates', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/updates');
  const chart = page.locator('nec-bar-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  const desktop = chart.locator('.legend button').filter({ hasText: 'Desktop' });
  await desktop.click();
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  const january = page.getByRole('button', {
    name: 'Select Desktop for January: 342',
    exact: true,
  });
  await january.focus();
  // DOM click leaves focus on the row action, testing track-by identity rather than control focus.
  await page
    .getByRole('button', { name: 'Reorder rows and series', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  await expect(january).toBeFocused();
  await expect(chart.locator('tbody tr').first()).toContainText('December');
  await expect(chart.locator('thead th').nth(1)).toHaveText('Mobile');
  await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  await page
    .getByRole('button', { name: 'Rename labels', exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  const renamed = page.getByRole('button', {
    name: 'Select Computers for Same month: 342',
    exact: true,
  });
  await expect(renamed).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.selection')).toHaveText('jan/desktop/342/Same month/table');
  await expect(chart.locator('tbody th').filter({ hasText: 'Same month' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Replace rows and series', exact: true }).click();
  await expect(chart.locator('tbody tr')).toHaveCount(2);
  await expect(chart.locator('.legend button').filter({ hasText: 'Computers' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(chart.locator('.legend button').filter({ hasText: 'New series' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(chart.locator('tbody')).toContainText('Missing');
  await page
    .getByRole('button', { name: 'Select New series for New month: -7', exact: true })
    .click();
  await expect(page.locator('.selection')).toHaveText('new/new-series/-7/New month/table');
  await page
    .getByRole('button', { name: 'Select Computers for New month: 0', exact: true })
    .click();
  await expect(page.locator('.selection')).toHaveText('new/desktop/0/New month/table');
  await page.getByRole('button', { name: 'Invalidate data', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('finite numbers');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await expect(chart.locator('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore inputs', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(chart.locator('tbody tr')).toHaveCount(12);
  await expect(chart.locator('.legend button').filter({ hasText: 'Desktop' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(chart.locator('.legend button').filter({ hasText: 'Mobile' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(errors).toEqual([]);
});
