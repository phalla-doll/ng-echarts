// Use exported per-chart entries to preserve independent lazy engine chunks.
import 'echarts/lib/chart/bar';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { BarRendererFactory } from './plot-controller';
import { createBarRangeSurface } from './bar-range-browser';

use([GridComponent, TooltipComponent, CanvasRenderer]);

export const createBarRenderer: BarRendererFactory = (host, onPoint, onRange, onPreview) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let selection: Parameters<ReturnType<typeof createBarRangeSurface>['update']>[0] = null;
  const range = createBarRangeSurface(host, chart, onRange ?? (() => {}));
  const point = (event: unknown) => {
    if (typeof event !== 'object' || event === null || !('data' in event) || !('seriesId' in event))
      return null;
    const data: unknown = event.data;
    if (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof data.id === 'string' &&
      typeof event.seriesId === 'string'
    ) {
      return { rowId: data.id, seriesId: event.seriesId };
    }
    return null;
  };
  const onClick = (event: unknown): void => {
    const value = point(event);
    if (value) onPoint(value);
  };
  const preview = (event: unknown): void => {
    // ZRender marks compatibility mouse events generated from touch gestures.
    if (
      typeof event === 'object' &&
      event !== null &&
      'event' in event &&
      typeof event.event === 'object' &&
      event.event !== null &&
      'zrByTouch' in event.event &&
      event.event.zrByTouch
    )
      return;
    onPreview?.(point(event));
  };
  const clear = () => onPreview?.(null);
  chart.on('click', onClick);
  chart.on('mousemove', preview);
  chart.on('mouseout', clear);
  host.addEventListener('pointerleave', clear);
  host.ownerDocument.defaultView?.addEventListener('blur', clear);
  return {
    update: (options) => {
      chart.setOption(options.chart, { notMerge: true, lazyUpdate: false });
      selection = options.range;
      range.update(selection);
    },
    resize: () => {
      // Clear the pointer preview only when the host actually changes dimensions.
      if (chart.getWidth() !== host.clientWidth || chart.getHeight() !== host.clientHeight) clear();
      range.resize();
      chart.resize();
      range.update(selection);
    },
    dispose: () => {
      range.dispose();
      chart.off('click', onClick);
      chart.off('mousemove', preview);
      chart.off('mouseout', clear);
      host.removeEventListener('pointerleave', clear);
      host.ownerDocument.defaultView?.removeEventListener('blur', clear);
      chart.dispose();
    },
  };
};
