import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { PieOption } from './pie-options';
export const PIE_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<PieOption>>
>('Pie renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./pie-renderer').then((module) => module.createPieRenderer),
});
