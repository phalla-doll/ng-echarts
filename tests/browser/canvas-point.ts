import type { Locator } from '@playwright/test';

/** Count distinct solid bar groups from painted pixels, independent of ECharts internals. */
export async function solidBarGroups(chart: Locator): Promise<number> {
  return chart.evaluate((host) => {
    const canvas = host.querySelector('canvas')!;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    context.save();
    context.fillStyle = getComputedStyle(host.querySelector('.swatch')!).backgroundColor;
    const color = context.fillStyle;
    context.restore();
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const target = probe.getImageData(0, 0, 1, 1).data;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let groups = 0;
    let previous = false;
    for (let x = 0; x < canvas.width; x++) {
      let count = 0;
      for (let y = 0; y < canvas.height; y++) {
        const offset = (y * canvas.width + x) * 4;
        if (target.every((value, channel) => pixels[offset + channel] === value)) count++;
      }
      const painted = count > 8;
      if (painted && !previous) groups++;
      previous = painted;
    }
    return groups;
  });
}

/** Locate the quiet selection band even when every plotted measure is hidden or zero. */
export async function selectionBandCenter(chart: Locator): Promise<number | null> {
  return chart.evaluate((host) => {
    const canvas = host.querySelector('canvas')!;
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    const style = getComputedStyle(host.querySelector('nec-chart-frame')!);
    const probe = document.createElement('canvas').getContext('2d')!;
    const color = (token: string) => {
      probe.fillStyle = style.getPropertyValue(token).trim();
      probe.fillRect(0, 0, 1, 1);
      return probe.getImageData(0, 0, 1, 1).data;
    };
    const background = color('--nec-background');
    const border = color('--nec-border');
    const target = background.map((value, channel) =>
      Math.round(value * 0.7 + border[channel]! * 0.3),
    );
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const columns: number[] = [];
    for (let x = 0; x < canvas.width; x++) {
      let count = 0;
      for (let y = 0; y < canvas.height; y++) {
        const offset = (y * canvas.width + x) * 4;
        if (target.every((value, channel) => Math.abs(pixels[offset + channel]! - value) <= 1))
          count++;
      }
      if (count > canvas.height * 0.6) columns.push(x);
    }
    return columns.length ? (columns[0]! + columns.at(-1)!) / 2 / canvas.width : null;
  });
}

export async function firstGreenBarPoint(canvas: Locator): Promise<{ x: number; y: number }> {
  await canvas.scrollIntoViewIfNeeded();
  // Find an interior pixel in the first green bar; avoid private ECharts APIs or debug globals.
  return canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d', { willReadFrequently: true })!;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    const isGreen = (offset: number): boolean =>
      pixels[offset + 3] === 255 &&
      ((pixels[offset] === 4 && pixels[offset + 1] === 120 && pixels[offset + 2] === 87) ||
        (pixels[offset] === 16 && pixels[offset + 1] === 185 && pixels[offset + 2] === 129));
    for (let x = 0; x < element.width - 4; x++) {
      const ys: number[] = [];
      for (let y = 0; y < element.height; y++) {
        const offset = (y * element.width + x + 3) * 4;
        if (isGreen(offset)) ys.push(y);
      }
      if (ys.length > 8) {
        const rect = element.getBoundingClientRect();
        const y = ys[Math.floor(ys.length / 2)]!;
        const firstX = x + 3;
        let lastX = firstX;
        while (lastX + 1 < element.width) {
          const offset = (y * element.width + lastX + 1) * 4;
          if (!isGreen(offset)) break;
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
