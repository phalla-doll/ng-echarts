import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { SankeyView } from './sankey-options';
export const SANKEY_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<SankeyView>>
>('Sankey renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./sankey-renderer').then((m) => m.createSankeyRenderer),
});

/** Consistent local keyboard scrolling, including WebKit's overflow-region behavior. */
export function scrollFlowViewport(event: KeyboardEvent): void {
  const viewport = event.currentTarget;
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.target !== viewport ||
    !(viewport instanceof HTMLElement)
  )
    return;
  const maximum = viewport.scrollWidth - viewport.clientWidth;
  if (maximum <= 0) return;
  const step = Math.max(40, Math.min(160, viewport.clientWidth / 2));
  const next =
    event.key === 'ArrowRight'
      ? viewport.scrollLeft + step
      : event.key === 'ArrowLeft'
        ? viewport.scrollLeft - step
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? maximum
            : null;
  if (next === null) return;
  event.preventDefault();
  viewport.scrollLeft = Math.max(0, Math.min(maximum, next));
}
