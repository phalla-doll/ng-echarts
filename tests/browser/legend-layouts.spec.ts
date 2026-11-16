import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { renderGallery } from '../../tools/browser-gallery.mjs';
import { collectBrowserErrors } from './resource-audit';

test('keeps chip/list legends responsive, aligned and keyboard-operable without resetting the chart', async ({
  page,
}, testInfo) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/pie');
  await renderGallery(page);
  const block = page.locator('#browser-share');
  const chart = block.locator('nec-pie-chart');
  const legend = chart.locator('.legend');
  const chrome = legend.getByRole('button').filter({ hasText: 'Chrome' });
  const safari = legend.getByRole('button').filter({ hasText: 'Safari' });
  await expect(legend).not.toHaveClass(/legend-list/);
  await expect(chrome.locator('.legend-share')).toHaveText('29.7%');
  const canvas = await chart.locator('canvas').elementHandle();
  await chrome.focus();
  await page.keyboard.press('Space');
  await expect(chrome).toBeFocused();
  await expect(chrome).toHaveAttribute('aria-pressed', 'false');
  await expect(safari.locator('.legend-share')).toHaveText('30.8%');
  await block.getByRole('button', { name: 'Aligned list', exact: true }).click();
  await expect(legend).toHaveClass(/legend-list/);
  await expect(chrome).toHaveAttribute('aria-pressed', 'false');
  expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
  await chrome.focus();
  await page.keyboard.press('Enter');
  await expect(chrome).toBeFocused();
  await expect(chrome).toHaveAttribute('aria-pressed', 'true');

  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const layout of ['Inline chips', 'Aligned list']) {
        await block.getByRole('button', { name: layout, exact: true }).click();
        await expect
          .poll(() => legend.evaluate((element) => element.scrollWidth <= element.clientWidth))
          .toBe(true);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
        for (const button of await legend.getByRole('button').all()) {
          await expect
            .poll(() => button.evaluate((element) => element.scrollWidth <= element.clientWidth))
            .toBe(true);
        }
        if (layout === 'Aligned list') {
          const edges = await legend
            .locator('.legend-value')
            .evaluateAll((elements) =>
              elements.map((element) => element.getBoundingClientRect().right),
            );
          expect(Math.max(...edges) - Math.min(...edges)).toBeLessThan(1);
          const shares = await legend
            .locator('.legend-share')
            .evaluateAll((elements) =>
              elements.map((element) => element.getBoundingClientRect().right),
            );
          expect(Math.max(...shares) - Math.min(...shares)).toBeLessThan(1);
        }
        if (testInfo.project.name === 'chromium' && [390, 1440].includes(width)) {
          await mkdir('docs/experiments/rc28/visual', { recursive: true });
          await chart.screenshot({
            path: `docs/experiments/rc28/visual/${layout === 'Inline chips' ? 'chips' : 'list'}-${theme}-${width}.png`,
          });
        }
      }
    }
  }
  // Stress the layout independently of data formatting, including unbroken labels.
  await page.setViewportSize({ width: 320, height: 1000 });
  await legend
    .locator('.legend-label')
    .first()
    .evaluate((element) => {
      element.textContent = 'BrowserWithAnUnbrokenVeryLongCategoryName';
    });
  await legend
    .locator('.legend-value')
    .first()
    .evaluate((element) => {
      element.textContent = '999,999,999,999,999.99 USD';
    });
  for (const layout of ['Inline chips', 'Aligned list']) {
    await block.getByRole('button', { name: layout, exact: true }).click();
    for (const button of await legend.getByRole('button').all()) {
      await expect
        .poll(() => button.evaluate((element) => element.scrollWidth <= element.clientWidth))
        .toBe(true);
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(320);
  }
  await block.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(block.locator('.block-code')).toContainText('legendLayout="list"');
  expect(errors).toEqual([]);
});
