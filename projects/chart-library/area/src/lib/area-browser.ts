import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { AreaOption } from './area-options';
export const AREA_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<AreaOption>>
>('Area renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./area-renderer').then((module) => module.createAreaRenderer),
});
