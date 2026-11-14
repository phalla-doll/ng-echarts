import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { RadarOption } from './radar-options';
export const RADAR_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<RadarOption>>
>('Radar renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./radar-renderer').then((m) => m.createRadarRenderer),
});
