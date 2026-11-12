import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { PieOption } from './pie-options';
use([PieChart, TooltipComponent, CanvasRenderer]);
export const createPieRenderer: ɵPlotRendererFactory<PieOption> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: PieOption | null = null;
  const click = (event: unknown): void => {
    if (!current || typeof event !== 'object' || event === null) return;
    const e = event as Record<string, unknown>;
    if (typeof e['seriesId'] !== 'string' || typeof e['data'] !== 'object' || e['data'] === null)
      return;
    const data = e['data'] as Record<string, unknown>;
    if (typeof data['id'] === 'string' && typeof data['value'] === 'number' && data['value'] > 0)
      onPoint({ rowId: data['id'], seriesId: e['seriesId'] });
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
