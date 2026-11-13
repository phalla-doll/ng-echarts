import { renderGallery } from '../../tools/browser-gallery.mjs';
import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors } from './resource-audit';

declare global {
  interface Window {
    chartFontRequests: number;
    chartTextPaints: { text: string; font: string; loaded: boolean }[];
  }
}

for (const deviceScaleFactor of [1, 2]) {
  test(`loads Inter before painting chart labels at ${deviceScaleFactor}x density`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      deviceScaleFactor,
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    let releaseFont!: () => void;
    const heldFont = new Promise<void>((resolve) => (releaseFont = resolve));
    await context.route('**/fonts/inter-latin.woff2', async (route) => {
      await heldFont;
      await route.continue();
    });
    await page.addInitScript(() => {
      window.chartFontRequests = 0;
      window.chartTextPaints = [];
      const load = document.fonts.load.bind(document.fonts);
      document.fonts.load = (font, text) => {
        window.chartFontRequests++;
        return load(font, text);
      };
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        window.chartTextPaints.push({
          text,
          font: this.font,
          loaded: document.fonts.check('12px Inter'),
        });
        if (maxWidth === undefined) fillText.call(this, text, x, y);
        else fillText.call(this, text, x, y, maxWidth);
      };
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect.poll(() => page.evaluate(() => window.chartFontRequests)).toBeGreaterThan(0);
      await expect(page.locator('nec-bar-chart canvas')).toHaveCount(0);
      releaseFont();
      await renderGallery(page);
      await expect(page.locator('nec-bar-chart canvas')).toHaveCount(4);
      const paints = await page.evaluate(() => window.chartTextPaints);
      expect(paints.some((paint) => paint.text === 'Jan')).toBe(true);
      expect(paints.every((paint) => paint.font.includes('Inter') && paint.loaded)).toBe(true);
      for (const canvas of await page.locator('nec-bar-chart canvas').all()) {
        const dimensions = await canvas.evaluate((element: HTMLCanvasElement) => ({
          width: element.width,
          height: element.height,
          cssWidth: element.getBoundingClientRect().width,
          cssHeight: element.getBoundingClientRect().height,
        }));
        expect(Math.abs(dimensions.width - dimensions.cssWidth * deviceScaleFactor)).toBeLessThan(
          1,
        );
        expect(Math.abs(dimensions.height - dimensions.cssHeight * deviceScaleFactor)).toBeLessThan(
          1,
        );
      }
      const canvas = page.locator('#device-visits canvas');
      const point = await firstGreenBarPoint(canvas);
      await page.mouse.move(point.x, point.y);
      const tooltip = page.locator('[data-nec-tooltip]').first();
      await expect(tooltip).toBeVisible();
      expect(await tooltip.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
        'Inter',
      );
      expect(errors).toEqual([]);
    } finally {
      releaseFont();
      await context.close();
    }
  });
}
