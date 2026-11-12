import { InjectionToken } from '@angular/core';
import type { BarRendererFactory } from './plot-controller';
export {
  ɵbrowserPlotEnvironment as browserPlotEnvironment,
  ɵreadCartesianTheme as readBarTheme,
} from '@ng-echarts/chart-library/core';
export const BAR_RENDERER_LOADER = new InjectionToken<() => Promise<BarRendererFactory>>(
  'Bar renderer loader',
  {
    providedIn: 'root',
    factory: () => () => import('./bar-renderer').then((module) => module.createBarRenderer),
  },
);
