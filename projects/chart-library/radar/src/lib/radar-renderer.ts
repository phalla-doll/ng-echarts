// Use exported per-chart entries to preserve independent lazy engine chunks.
import 'echarts/lib/chart/radar';
import { RadarComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import { radarLayout, type RadarOption } from './radar-options';
import { radarPoint } from './radar-point';
use([RadarComponent, TooltipComponent, CanvasRenderer]);
export const createRadarRenderer: ɵPlotRendererFactory<RadarOption> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: RadarOption | null = null;
  const layout = () => {
    const radar = Array.isArray(current?.radar) ? current.radar[0] : current?.radar;
    return radarLayout(host.clientWidth, host.clientHeight, radar?.indicator?.length ?? 6);
  };
  const apply = (resizing = false) => {
    if (!current) return;
    chart.setOption(
      {
        ...current,
        animation: resizing ? false : current.animation,
        radar: { ...current.radar, radius: layout().radius },
      },
      { notMerge: true, lazyUpdate: false },
    );
  };
  const click = (event: unknown) => {
    const point = current && radarPoint(event, current, layout());
    if (point) onPoint(point);
  };
  chart.on('click', click);
  return {
    update: (options) => {
      current = options;
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
