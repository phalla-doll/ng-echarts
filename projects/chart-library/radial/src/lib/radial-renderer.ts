// Use exported per-chart entries to preserve independent lazy engine chunks.
import 'echarts/lib/chart/pie';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { RadialOption } from './radial-options';
use([CanvasRenderer]);
export const createRadialRenderer: ɵPlotRendererFactory<RadialOption> = (host) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  return {
    update: (options) => chart.setOption(options, { notMerge: true, lazyUpdate: false }),
    resize: () => chart.resize(),
    dispose: () => chart.dispose(),
  };
};
