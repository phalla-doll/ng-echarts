import { HeatmapChart } from 'echarts/charts';
import {
  CalendarComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import { buildCalendarOptions, type CalendarView } from './calendar-options';
use([
  HeatmapChart,
  CalendarComponent,
  TooltipComponent,
  VisualMapPiecewiseComponent,
  CanvasRenderer,
]);
export const createCalendarRenderer: ɵPlotRendererFactory<CalendarView> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: CalendarView | null = null;
  const apply = (resizing = false) => {
    if (current)
      chart.setOption(
        buildCalendarOptions(
          { ...current, animation: resizing ? false : current.animation },
          host.clientWidth,
        ),
        { notMerge: true, lazyUpdate: false },
      );
  };
  const click = (event: unknown) => {
    if (!current || !event || typeof event !== 'object') return;
    const payload = event as { componentType?: unknown; seriesType?: unknown; name?: unknown };
    if (
      payload.componentType !== 'series' ||
      payload.seriesType !== 'heatmap' ||
      typeof payload.name !== 'string'
    )
      return;
    if (current.days.some((day) => day.date === payload.name && day.value !== null))
      onPoint({ rowId: payload.name, seriesId: 'calendar' });
  };
  chart.on('click', click);
  return {
    update: (view) => {
      current = view;
      apply();
    },
    resize: () => {
      chart.resize();
      apply(true);
    },
    dispose: () => {
      current = null;
      chart.off('click', click);
      chart.dispose();
    },
  };
};
