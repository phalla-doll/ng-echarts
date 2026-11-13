import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

for (const family of ['line', 'area', 'pie']) {
  test(`${family} refreshes explicit palette tokens and recovers hidden/narrow plots without replacing its renderer`, async ({
    page,
  }) => {
    const errors = collectBrowserErrors(page);
    await page.goto(`/${family}-validation`);
    const chart = page.locator(`.primary-${family} nec-${family}-chart`);
    const plot = chart.locator('.plot');
    const canvas = plot.locator('canvas');
    await expect(canvas).toHaveCount(1);
    const instance = await plot.getAttribute('_echarts_instance_');
    expect(instance).toBeTruthy();
    const bluePixels = () =>
      canvas.evaluate((element: HTMLCanvasElement) => {
        const bytes = element
          .getContext('2d', { willReadFrequently: true })!
          .getImageData(0, 0, element.width, element.height).data;
        let count = 0;
        for (let at = 0; at < bytes.length; at += 4) {
          if (
            Math.abs(bytes[at]! - 37) < 4 &&
            Math.abs(bytes[at + 1]! - 99) < 4 &&
            Math.abs(bytes[at + 2]! - 235) < 4
          )
            count++;
        }
        return count;
      });
    expect(await bluePixels()).toBe(0);
    await page.getByRole('button', { name: 'Refresh palette', exact: true }).click();
    await expect(chart.locator('.swatch').first()).toHaveCSS(
      'background-color',
      'rgb(37, 99, 235)',
    );
    await expect.poll(bluePixels).toBeGreaterThan(20);
    const hide = page.getByRole('button', { name: `Hide ${family} host`, exact: true });
    await hide.click();
    await expect(plot).toHaveJSProperty('clientWidth', 0);
    await hide.click();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() =>
          canvas.evaluate((element) => {
            const plot = element.closest<HTMLElement>('.plot')!;
            return (
              Math.round(element.getBoundingClientRect().width) === plot.clientWidth &&
              plot.clientWidth > 0
            );
          }),
        )
        .toBe(true);
      await expect(
        chart.getByRole('button', { name: 'Show data table', exact: true }),
      ).toBeVisible();
    }
    await expect(plot).toHaveAttribute('_echarts_instance_', instance!);
    await expect(canvas).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
