// Use exported per-chart entries to preserve independent lazy engine chunks.
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ɵcurvePoint, type ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { ComposedOption } from './composed-options';
use([GridComponent, TooltipComponent, CanvasRenderer]);
export const createComposedRenderer: ɵPlotRendererFactory<ComposedOption> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: ComposedOption | null = null;
  const click = (event: unknown): void => {
    const axis = current?.yAxis;
    const horizontal = !Array.isArray(axis) && axis?.type === 'category';
    const point = ɵcurvePoint(
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
};
