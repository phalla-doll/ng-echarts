import { PieChart } from 'echarts/charts';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { RadialOption } from './radial-options';
use([PieChart, CanvasRenderer]);
export const createRadialRenderer: ɵPlotRendererFactory<RadialOption> = (host) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  return {
    update: (options) => chart.setOption(options, { notMerge: true, lazyUpdate: false }),
    resize: () => chart.resize(),
    dispose: () => chart.dispose(),
  };
};
