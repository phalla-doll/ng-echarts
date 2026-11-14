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
        // ECharts lifts hovered RGB channels by 10% (at most 24 byte values).
        // Accept that emphasis while still rejecting the 35%-opacity context bars.
        if (
          pixels[offset + 3] === 255 &&
          Math.abs(pixels[offset]! - target[0]!) <= 24 &&
          Math.abs(pixels[offset + 1]! - target[1]!) <= 24 &&
          Math.abs(pixels[offset + 2]! - target[2]!) <= 24
        )
          count++;
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
    // WebKit dithers even a constant-color gradient stop by one channel value.
    // Keep that paint connected without accepting translucent context bars.
    const matches = (offset: number, r: number, g: number, b: number): boolean =>
      Math.abs(pixels[offset]! - r) <= 2 &&
      Math.abs(pixels[offset + 1]! - g) <= 2 &&
      Math.abs(pixels[offset + 2]! - b) <= 2;
    const isGreen = (offset: number): boolean =>
      pixels[offset + 3] === 255 && (matches(offset, 4, 120, 87) || matches(offset, 16, 185, 129));
    for (let x = 0; x < element.width - 4; x++) {
      const ys: number[] = [];
      for (let y = 0; y < element.height; y++) {
        const offset = (y * element.width + x + 3) * 4;
        if (isGreen(offset)) ys.push(y);
      }
      if (ys.length > 8) {
        const rect = element.getBoundingClientRect();
        // Use the centroid of one connected painted interior. A column shared
        // by horizontal bars can have its median on a fractional shape edge;
        // a single row may also contain only a sliver of a gradient/corner.
        const seed = ys[Math.floor(ys.length / 2)]! * element.width + x + 3;
        const pending = [seed];
        const visited = new Set([seed]);
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        while (pending.length) {
          const pixel = pending.pop()!;
          const px = pixel % element.width;
          const py = Math.floor(pixel / element.width);
          sumX += px + 0.5;
          sumY += py + 0.5;
          count++;
          const neighbors = [
            ...(px > 0 ? [pixel - 1] : []),
            ...(px + 1 < element.width ? [pixel + 1] : []),
            ...(py > 0 ? [pixel - element.width] : []),
            ...(py + 1 < element.height ? [pixel + element.width] : []),
          ];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && isGreen(neighbor * 4)) {
              visited.add(neighbor);
              pending.push(neighbor);
            }
          }
        }
        return {
          x: rect.x + ((sumX / count) * rect.width) / element.width,
          y: rect.y + ((sumY / count) * rect.height) / element.height,
        };
      }
    }
    throw new Error('First green bar was not painted');
  });
}
