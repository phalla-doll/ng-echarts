import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { PieOption } from './pie-options';
export const PIE_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<PieOption>>
>('Pie renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./pie-renderer').then((module) => module.createPieRenderer),
});
