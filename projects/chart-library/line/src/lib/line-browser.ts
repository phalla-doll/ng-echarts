import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { LineOption } from './line-options';
export const LINE_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<LineOption>>
>('Line renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./line-renderer').then((module) => module.createLineRenderer),
});
