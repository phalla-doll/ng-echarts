import { expect, test } from '@playwright/test';
import { renderGallery } from '../../tools/browser-gallery.mjs';
import { collectBrowserErrors } from './resource-audit';

test('omits table controls and table markup from every gallery preview', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  for (const route of [
    '/',
    '/line',
    '/area',
    '/pie',
    '/composed',
    '/radar',
    '/radial',
    '/calendar',
    '/sankey',
    '/linked',
    '/linked-dashboard',
  ]) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      const html = await response!.text();
      expect(html).not.toMatch(
        /<(?:button|summary)[^>]*>\s*(?:Show data table|Explore daily data|Explore flow data)\s*</,
      );
      if (['/', '/line', '/area', '/pie', '/composed'].includes(route)) await renderGallery(page);
      await expect(page.locator('.gallery canvas').first()).toBeVisible();
      await expect(page.locator('.gallery .table-toggle')).toHaveCount(0);
      await expect(page.locator('.gallery table')).toHaveCount(0);
      if (['/radar', '/calendar', '/sankey'].includes(route)) {
        await page.getByRole('button', { name: 'Code', exact: true }).first().click();
        await expect(page.locator('.block-code')).toContainText('[showDataTable]="false"');
      }
    });
  }
  expect(errors).toEqual([]);
});
