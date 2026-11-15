import type { EChartsType, EChartsCoreOption } from 'echarts/core';
import { curvePoint } from './curve-point';
import type { PlotPoint, PlotRenderer } from './plot-controller';

/** Browser-only coordination; callers own lazy engine registration and initialization. */
export function createCurveRenderer<Option extends EChartsCoreOption>(
  chart: EChartsType,
  onPoint: (point: PlotPoint) => void,
): PlotRenderer<Option> {
  let current: Option | null = null;
  const click = (event: unknown): void => {
    const axis = current?.['yAxis'] as { type?: string } | undefined;
    const horizontal = axis?.type === 'category';
    const point = curvePoint(
      event,
      current,
      (coordinate) =>
        chart.convertFromPixel(horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }, coordinate),
      horizontal,
    );
    if (point) onPoint(point);
  };
  chart.on('click', click);
  return {
    update: (options) => {
      current = options;
      chart.setOption(options, { notMerge: true, lazyUpdate: false });
    },
    resize: () => chart.resize(),
    dispose: () => {
      current = null;
      chart.off('click', click);
      chart.dispose();
    },
  };
}
