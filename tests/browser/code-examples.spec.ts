import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

declare global {
  interface Window {
    codeClipboard: string;
  }
}

test('keeps syntax-colored examples copyable and text copy buttons on one line', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    window.codeClipboard = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => (window.codeClipboard = text) },
    });
  });
  const response = await page.goto('/');
  expect(await response!.text()).toContain('hljs-keyword');
  await expect(page.locator('canvas')).toHaveCount(4);
  for (const light of [false, true]) {
    if (light) await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [1440, 768, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const block of await page.locator('app-bar-block').all()) {
        await block.getByRole('button', { name: 'Code', exact: true }).click();
        const code = block.locator('.block-code code');
        await expect(code.locator('.hljs-keyword').first()).toBeVisible();
        const colors = await code.evaluate((element) => ({
          base: getComputedStyle(element).color,
          keyword: getComputedStyle(element.querySelector('.hljs-keyword')!).color,
          string: getComputedStyle(element.querySelector('.hljs-string')!).color,
          font: getComputedStyle(element).fontFamily,
        }));
        expect(colors.keyword).not.toBe(colors.base);
        expect(colors.keyword).not.toBe(colors.string);
        expect(colors.font).toContain('Google Sans Code');
        const button = block.locator('.code-heading button');
        const geometry = await button.evaluate((element) => {
          const text = [...element.childNodes].find(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          )!;
          const range = document.createRange();
          range.setStart(text, text.textContent!.search(/\S/));
          range.setEnd(text, text.textContent!.trimEnd().length);
          const label = range.getBoundingClientRect();
          const icon = element.querySelector('app-site-icon')!.getBoundingClientRect();
          const bounds = element.getBoundingClientRect();
          return {
            lines: range.getClientRects().length,
            contains: bounds.left <= icon.left && bounds.right >= label.right,
            gap: label.left - icon.right,
            centers: Math.abs(icon.y + icon.height / 2 - (label.y + label.height / 2)),
          };
        });
        expect(geometry.lines).toBe(1);
        expect(geometry.contains).toBe(true);
        expect(geometry.gap).toBeGreaterThan(0);
        expect(geometry.centers).toBeLessThanOrEqual(2);
        await button.click();
        expect(await page.evaluate(() => window.codeClipboard)).toBe(await code.textContent());
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  }
  expect(
    await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some(
        (face) =>
          face.family.replaceAll('"', '') === 'Google Sans Code' && face.status === 'loaded',
      );
    }),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('highlights setup docs and Angular templates without hydration errors', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/get-started');
  await expect(page.locator('app-source-snippet .hljs-keyword').first()).toBeVisible();
  await page.getByRole('link', { name: 'Installation', exact: true }).first().click();
  await expect(page.locator('app-source-snippet .hljs-built_in').first()).toBeVisible();
  await page.getByRole('link', { name: 'Playground', exact: true }).click();
  await page.getByRole('button', { name: 'Angular code', exact: true }).click();
  await expect(page.locator('.source-panel .hljs-name').first()).toHaveText('nec-bar-chart');
  await expect(page.locator('.source-panel .hljs-attr').first()).toBeVisible();
  await page.locator('pre[aria-label="Angular template"]').focus();
  await expect(page.locator('pre[aria-label="Angular template"]')).toBeFocused();
  expect(errors).toEqual([]);
});
