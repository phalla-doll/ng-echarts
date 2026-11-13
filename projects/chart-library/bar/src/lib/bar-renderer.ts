import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarRendererFactory } from './plot-controller';
import { createBarRangeSurface } from './bar-range-browser';

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export const createBarRenderer: BarRendererFactory = (host, onPoint, onRange) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let selection: Parameters<ReturnType<typeof createBarRangeSurface>['update']>[0] = null;
  const range = createBarRangeSurface(host, chart, onRange ?? (() => {}));
  const onClick = (event: unknown): void => {
    if (typeof event !== 'object' || event === null || !('data' in event) || !('seriesId' in event))
      return;
    const data: unknown = event.data;
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      typeof event.seriesId === 'string'
    ) {
      onPoint({ rowId: data.id, seriesId: event.seriesId });
    }
  };
  chart.on('click', onClick);
  return {
    update: (options) => {
      chart.setOption(options.chart, { notMerge: true, lazyUpdate: false });
      selection = options.range;
      range.update(selection);
    },
    resize: () => {
      range.resize();
      chart.resize();
      range.update(selection);
    },
    dispose: () => {
      range.dispose();
      chart.off('click', onClick);
      chart.dispose();
    },
  };
};
