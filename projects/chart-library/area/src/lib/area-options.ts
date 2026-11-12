import type { LineSeriesOption } from 'echarts/charts';
import {
  ɵbuildCurveOptions,
  type ɵCartesianContext,
  type ɵCurveOption,
} from '@ng-echarts/chart-library/core';
export type AreaOption = ɵCurveOption;
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
export function buildAreaOptions<T>(
  context: ɵCartesianContext<T>,
  smooth: boolean,
  showPoints: boolean,
  stacked: boolean,
  gradient: boolean,
): AreaOption {
  const options = ɵbuildCurveOptions(context, smooth, showPoints);
  if (!Array.isArray(options.series)) throw new Error('Expected curve series');
  return {
    ...options,
    series: options.series.map((item): LineSeriesOption => {
      const color = typeof item.lineStyle?.color === 'string' ? item.lineStyle.color : '#047857';
      return {
        ...item,
        stack: stacked ? 'total' : undefined,
        stackStrategy: 'samesign',
        triggerEvent: true,
        areaStyle: {
          opacity: 1,
          color: gradient
            ? {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: alphaColor(color, 0.1) },
                  { offset: 1, color: alphaColor(color, 0) },
                ],
              }
            : alphaColor(color, 0.1),
        },
      };
    }),
  };
}
