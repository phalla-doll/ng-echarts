import { ɵPlotController } from '@ng-echarts/chart-library/core';
import type {
  ɵPlotRenderer,
  ɵPlotRendererFactory,
  ɵPlotEnvironment,
} from '@ng-echarts/chart-library/core';
import type { BarRenderOptions } from './bar-render-options';
export type { ɵPlotPoint as PlotPoint } from '@ng-echarts/chart-library/core';
export type BarRenderer = ɵPlotRenderer<BarRenderOptions>;
export type BarRendererFactory = ɵPlotRendererFactory<BarRenderOptions>;
export type PlotEnvironment = ɵPlotEnvironment<BarRenderOptions>;
export class PlotController extends ɵPlotController<BarRenderOptions> {}
