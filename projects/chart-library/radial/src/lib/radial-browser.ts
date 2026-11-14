import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { RadialOption } from './radial-options';
export const RADIAL_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<RadialOption>>
>('Radial progress renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./radial-renderer').then((m) => m.createRadialRenderer),
});
