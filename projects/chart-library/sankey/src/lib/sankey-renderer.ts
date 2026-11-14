// This exported per-chart entry keeps Sankey out of shared chart-barrel chunks.
import 'echarts/lib/chart/sankey';
import { TooltipComponent } from 'echarts/components';
import type { TooltipComponentOption } from 'echarts/components';
type TooltipPosition = Extract<
  NonNullable<TooltipComponentOption['position']>,
  (...args: never[]) => unknown
>;
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import { buildSankeyOptions, type SankeyView } from './sankey-options';
use([TooltipComponent, CanvasRenderer]);
export const createSankeyRenderer: ɵPlotRendererFactory<SankeyView> = (host, onPoint) => {
  const chart = init(host, undefined, { renderer: 'canvas' });
  let current: SankeyView | null = null;
  const click = (event: unknown) => {
    const p = event as {
      componentType?: unknown;
      seriesType?: unknown;
      dataType?: unknown;
      data?: { id?: unknown };
    } | null;
    if (
      !current ||
      p?.componentType !== 'series' ||
      p.seriesType !== 'sankey' ||
      typeof p.data?.id !== 'string'
    )
      return;
    const kind = p.dataType === 'edge' ? 'link' : p.dataType === 'node' ? 'node' : null;
    if (kind) onPoint({ rowId: p.data.id, seriesId: kind });
  };
  // The diagram may be wider than its scrollport. ECharts' normal confine
  // boundary is the full plot, so it cannot keep edge tooltips in view alone.
  const viewport = host.parentElement;
  const position: TooltipPosition = (point, _params, element) => {
    if (!viewport || !(element instanceof HTMLElement)) return point;
    const maximumWidth = `${Math.max(1, Math.min(280, viewport.clientWidth - 16))}px`;
    if (element.style.maxWidth !== maximumWidth) element.style.maxWidth = maximumWidth;
    if (element.style.boxSizing !== 'border-box') element.style.boxSizing = 'border-box';
    const left = viewport.scrollLeft + 8;
    const right = Math.max(
      left,
      viewport.scrollLeft + viewport.clientWidth - element.offsetWidth - 8,
    );
    const bottom = Math.max(8, host.clientHeight - element.offsetHeight - 8);
    return [
      Math.max(left, Math.min(right, point[0] + 12)),
      Math.max(8, Math.min(bottom, point[1] + 12)),
    ];
  };
  const hideTooltip = () => chart.dispatchAction({ type: 'hideTip' });
  viewport?.addEventListener('scroll', hideTooltip, { passive: true });
  chart.on('click', click);
  return {
    update: (view) => {
      current = view;
      const options = buildSankeyOptions(view);
      chart.setOption(
        { ...options, tooltip: { ...options.tooltip, position } },
        { notMerge: true, lazyUpdate: false },
      );
    },
    resize: () => {
      hideTooltip();
      chart.resize();
    },
    dispose: () => {
      current = null;
      viewport?.removeEventListener('scroll', hideTooltip);
      chart.off('click', click);
      chart.dispose();
    },
  };
};
