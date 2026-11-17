import type { LineSeriesOption } from 'echarts/charts';

export function alphaColor(
  color: string,
  factor: number,
  fallback = 'transparent',
  complete = true,
): string {
  if (/^#[\da-f]{6}$/i.test(color))
    return `rgba(${[1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)).join(',')},${factor})`;
  const rgba = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/);
  // Preserve the bar prefix parser; area colors require a complete token.
  if (!rgba || (complete && !/^\s*\)$/.test(color.slice(rgba[0].length)))) return fallback;
  return `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Number(rgba[4] ?? 1) * factor})`;
}
export function buildAreaFill(
  color: string,
  gradient: boolean,
  horizontal = false,
): LineSeriesOption['areaStyle'] {
  return {
    opacity: 1,
    color: gradient
      ? {
          type: 'linear',
          x: horizontal ? 1 : 0,
          y: 0,
          x2: 0,
          y2: horizontal ? 0 : 1,
          colorStops: [
            { offset: 0, color: alphaColor(color, 0.22) },
            { offset: 1, color: alphaColor(color, 0.04) },
          ],
        }
      : alphaColor(color, 0.16),
  };
}
