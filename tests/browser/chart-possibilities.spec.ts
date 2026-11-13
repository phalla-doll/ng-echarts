import { renderGallery, renderConcepts } from '../../tools/browser-gallery.mjs';
import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

test('serves the concept gallery with filters, keyboard data access, theme sync, and bubble mode', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/chart-possibilities');
  const html = await response!.text();
  expect(html).toContain('Chart possibilities');
  expect(html).toContain('Twelve proposed additions to the library');
  const frame = page.frameLocator('app-chart-possibilities iframe');
  await expect(frame.locator('.card')).toHaveCount(12);
  await renderConcepts(page);
  await expect(frame.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  await expect(page.getByRole('status')).toBeHidden();
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(frame.locator('.topbar')).toBeHidden();
  await expect(frame.locator('.intro')).toBeHidden();

  await frame.getByRole('button', { name: 'Find patterns', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(frame.locator('.card:visible')).toHaveCount(2);
  await expect(frame.getByRole('status')).toHaveText('2 chart ideas');
  const filteredHeight = await page
    .locator('iframe')
    .evaluate((el) => el.getBoundingClientRect().height);
  await frame.getByRole('button', { name: 'Bubble', exact: true }).click();
  await expect(frame.getByRole('button', { name: 'Bubble', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const scatter = frame.locator('#scatter');
  await scatter.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(scatter.getByRole('table')).toBeVisible();
  await expect(scatter.locator('tbody tr')).toHaveCount(18);
  await expect(scatter.getByRole('table')).toContainText('Orders');
  await frame.getByRole('button', { name: 'All charts', exact: true }).click();
  await expect(frame.locator('.card:visible')).toHaveCount(12);
  await expect
    .poll(() => page.locator('iframe').evaluate((el) => el.getBoundingClientRect().height))
    .toBeGreaterThan(filteredHeight);
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(frame.getByRole('button', { name: 'Bubble', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('link', { name: 'Chart possibilities', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await renderConcepts(page);
  await expect(frame.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  expect(errors).toEqual([]);
});

test('fits mobile layouts and leaves the embedded gallery when navigating away', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/chart-possibilities');
  const frame = page.frameLocator('app-chart-possibilities iframe');
  await renderConcepts(page);
  await expect(frame.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  for (const light of [false, true]) {
    if (light) await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await expect
        .poll(() => frame.locator('html').evaluate((el) => el.scrollWidth <= el.clientWidth))
        .toBe(true);
      await expect
        .poll(() =>
          page.locator('iframe').evaluate((el: HTMLIFrameElement) => {
            const body = el.contentDocument!.body;
            return Math.abs(
              body.getBoundingClientRect().height - el.getBoundingClientRect().height,
            );
          }),
        )
        .toBeLessThanOrEqual(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('link', { name: 'Bar Blocks', exact: true }).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await renderGallery(page);
  await expect(page.locator('app-bar-block canvas')).toHaveCount(4);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('link', { name: 'Chart possibilities', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Playground pages' })).toBeHidden();
  await renderConcepts(page);
  await expect(frame.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  await expect(frame.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});

test('keeps the standalone document usable without a network connection', async ({
  page,
  context,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/chart-possibilities');
  const target = await page
    .getByRole('link', { name: 'Open standalone gallery', exact: true })
    .getAttribute('href');
  await page.goto(`/${target!}`);
  await renderConcepts(page);
  await expect(page.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  await context.setOffline(true);
  await page.getByRole('button', { name: /theme$/ }).click();
  await page.getByRole('button', { name: 'Track goals', exact: true }).click();
  await expect(page.locator('.card:visible')).toHaveCount(3);
  await page.locator('#radial summary').click();
  await expect(page.locator('#radial table')).toBeVisible();
  await expect(page.locator('#radial tbody')).toContainText('74');
  expect(errors).toEqual([]);
});
