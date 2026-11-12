import type { Locator } from '@playwright/test';

export async function firstGreenBarPoint(canvas: Locator): Promise<{ x: number; y: number }> {
  await canvas.scrollIntoViewIfNeeded();
  // Find an interior pixel in the first green bar; avoid private ECharts APIs or debug globals.
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d', { willReadFrequently: true })!;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    for (let x = 0; x < element.width - 4; x++) {
      const ys: number[] = [];
      for (let y = 0; y < element.height; y++) {
        const offset = (y * element.width + x + 3) * 4;
        if (
          pixels[offset] === 4 &&
          pixels[offset + 1] === 120 &&
          pixels[offset + 2] === 87 &&
          pixels[offset + 3] === 255
        )
          ys.push(y);
      }
      if (ys.length > 8) {
        const rect = element.getBoundingClientRect();
        const y = ys[Math.floor(ys.length / 2)]!;
        const firstX = x + 3;
        let lastX = firstX;
        while (lastX + 1 < element.width) {
          const offset = (y * element.width + lastX + 1) * 4;
          if (pixels[offset] !== 4 || pixels[offset + 1] !== 120 || pixels[offset + 2] !== 87)
            break;
          lastX++;
        }
        // Use the bar interior; WebKit rounds fractional pointer coordinates at painted edges.
        return {
          x: rect.x + (((firstX + lastX) / 2) * rect.width) / element.width,
          y: rect.y + (y * rect.height) / element.height,
        };
      }
    }
    throw new Error('First green bar was not painted');
  });
}
