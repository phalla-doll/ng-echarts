import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { ComposedOption } from './composed-options';
export const COMPOSED_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<ComposedOption>>
>('Composed renderer loader', {
  providedIn: 'root',
  factory: () => () =>
    import('./composed-renderer').then((module) => module.createComposedRenderer),
});
