import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { LineOption } from './line-options';
use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export const createLineRenderer: ɵPlotRendererFactory<LineOption> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: LineOption | null = null;
  const click = (event: unknown): void => {
    if (!record(event)) return;
    if (
      record(event['data']) &&
      typeof event['data']['id'] === 'string' &&
      typeof event['seriesId'] === 'string'
    ) {
      onPoint({ rowId: event['data']['id'], seriesId: event['seriesId'] });
      return;
    }
    // Whole-line clicks (including when markers are hidden) select the nearest category
    // on that painted series. Gaps have no painted path and missing cells never emit.
    if (
      event['selfType'] !== 'line' ||
      typeof event['seriesIndex'] !== 'number' ||
      !record(event['event'])
    )
      return;
    const x = event['event']['offsetX'];
    if (typeof x !== 'number' || !Number.isFinite(x)) return;
    const category = chart.convertFromPixel({ xAxisIndex: 0 }, x);
    if (typeof category !== 'number' || !Number.isFinite(category)) return;
    const series = Array.isArray(current?.series)
      ? current.series[event['seriesIndex']]
      : undefined;
    const data = series?.data;
    if (!Array.isArray(data) || data.length === 0 || typeof series?.id !== 'string') return;
    const point: unknown = data[Math.max(0, Math.min(data.length - 1, Math.round(category)))];
    if (
      record(point) &&
      typeof point['id'] === 'string' &&
      typeof point['value'] === 'number' &&
      Number.isFinite(point['value'])
    )
      onPoint({ rowId: point['id'], seriesId: series.id });
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
