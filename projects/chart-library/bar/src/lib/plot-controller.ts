import { ɵPlotController } from '@mantha911/ng-echarts/core';
import type {
  ɵPlotRenderer,
  ɵPlotRendererFactory,
  ɵPlotEnvironment,
} from '@mantha911/ng-echarts/core';
import type { BarRenderOptions } from './bar-render-options';
export type { ɵPlotPoint as PlotPoint } from '@mantha911/ng-echarts/core';
export type BarRenderer = ɵPlotRenderer<BarRenderOptions>;
export type BarRendererFactory = ɵPlotRendererFactory<BarRenderOptions>;
export type PlotEnvironment = ɵPlotEnvironment<BarRenderOptions>;
export class PlotController extends ɵPlotController<BarRenderOptions> {}
