import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ɵcurvePoint, type ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { ComposedOption } from './composed-options';
use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);
export const createComposedRenderer: ɵPlotRendererFactory<ComposedOption> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: ComposedOption | null = null;
  const click = (event: unknown): void => {
    const point = ɵcurvePoint(event, current, (x) => chart.convertFromPixel({ xAxisIndex: 0 }, x));
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
