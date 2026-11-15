import type { LineSeriesOption } from 'echarts/charts';
import {
  ɵbuildCurveOptions,
  ɵbuildAreaFill,
  type ɵCartesianContext,
  type ɵCurveOption,
} from '@mantha911/ng-echarts/core';
export type AreaOption = ɵCurveOption;
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
        areaStyle: ɵbuildAreaFill(color, gradient),
      };
    }),
  };
}
