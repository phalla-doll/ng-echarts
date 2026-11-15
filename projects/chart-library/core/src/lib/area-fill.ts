import type { LineSeriesOption } from 'echarts/charts';

function alphaColor(color: string, factor: number): string {
  if (/^#[\da-f]{6}$/i.test(color))
    return `rgba(${[1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)).join(',')},${factor})`;
  const rgba = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  return rgba
    ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Number(rgba[4] ?? 1) * factor})`
    : 'transparent';
}
export function buildAreaFill(color: string, gradient: boolean): LineSeriesOption['areaStyle'] {
  return {
    opacity: 1,
    color: gradient
      ? {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: alphaColor(color, 0.22) },
            { offset: 1, color: alphaColor(color, 0.04) },
          ],
        }
      : alphaColor(color, 0.16),
  };
}
