import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

declare global {
  interface Window {
    visualAxisPaints: { text: string; left: number; right: number }[];
  }
}

test('keeps narrow horizontal-axis numbers readable in the rendered canvas', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.addInitScript(() => {
    window.visualAxisPaints = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (this.canvas.closest('#horizontal-comparison') && /^\d/.test(text)) {
        const point = new DOMPoint(x, y).matrixTransform(this.getTransform());
        const width = this.measureText(text).width;
        const left =
          point.x -
          (this.textAlign === 'center' ? width / 2 : this.textAlign === 'right' ? width : 0);
        window.visualAxisPaints.push({ text, left, right: left + width });
      }
      if (maxWidth === undefined) fillText.call(this, text, x, y);
      else fillText.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto('/');
  await page.locator('#horizontal-comparison').scrollIntoViewIfNeeded();
  await expect(page.locator('#horizontal-comparison canvas')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => new Set(window.visualAxisPaints.map((p) => p.text)).size))
    .toBeGreaterThanOrEqual(3);
  const labels = await page.evaluate(() =>
    [...new Map(window.visualAxisPaints.map((label) => [label.text, label])).values()].sort(
      (a, b) => a.left - b.left,
    ),
  );
  for (let index = 1; index < labels.length; index++) {
    expect(labels[index]!.left - labels[index - 1]!.right).toBeGreaterThanOrEqual(8);
  }
});

for (const [route, selector] of [
  ['/', 'nec-bar-chart'],
  ['/line', 'nec-line-chart'],
  ['/area', 'nec-area-chart'],
  ['/pie', 'nec-pie-chart'],
]) {
  test(`keeps ${selector} mobile controls, readable code, and theme changes usable`, async ({
    page,
  }) => {
    const errors = collectBrowserErrors(page);
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto(route!);
    const block = page.locator('.block-section').first();
    await expect(block.locator('canvas')).toBeVisible();
    for (const light of [false, true]) {
      if (light) await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(320);
      const legend = block.locator('.legend button').first();
      expect((await legend.boundingBox())!.height).toBeGreaterThanOrEqual(40);
      await legend.focus();
      await page.keyboard.press('Space');
      await expect(legend).toHaveAttribute('aria-pressed', 'false');
      await expect(legend).toHaveCSS('border-top-style', 'dashed');
      await expect(legend.locator('.swatch')).toHaveCSS('opacity', '0.35');
      await page.keyboard.press('Space');
      await expect(legend).toHaveAttribute('aria-pressed', 'true');
      const code = block.locator('.integration-card pre');
      await block.locator('.integration-heading button').focus();
      await page.keyboard.press('Tab');
      await expect(code).toBeFocused();
      await expect(code).toHaveCSS('font-size', '12px');
      await expect(code).toHaveCSS('outline-style', 'solid');
      await expect
        .poll(() => code.evaluate((element) => element.scrollWidth <= element.clientWidth))
        .toBe(true);
      await expect(code).toContainText(`@ng-echarts/chart-library/${selector!.slice(4, -6)}`);
      await block.getByRole('button', { name: 'Code', exact: true }).click();
      await expect(block.locator('canvas')).toBeHidden();
      await expect(block.locator('.block-code')).toContainText(
        light ? 'theme="light"' : 'theme="dark"',
      );
      await block.getByRole('button', { name: 'Preview', exact: true }).click();
      await expect(block.locator('canvas')).toBeVisible();
      if (selector === 'nec-pie-chart') {
        await expect(block.locator('.block-metrics')).toContainText('925');
        await expect(block.locator('.metric-marker')).toHaveCount(0);
      } else {
        const markers = await block
          .locator('.metric-marker')
          .evaluateAll((elements) =>
            elements.map((element) => getComputedStyle(element).backgroundColor),
          );
        await expect
          .poll(() =>
            block
              .locator('.swatch')
              .evaluateAll((elements) =>
                elements.map((element) => getComputedStyle(element).backgroundColor),
              ),
          )
          .toEqual(markers);
      }
    }
    expect(errors).toEqual([]);
  });
}
