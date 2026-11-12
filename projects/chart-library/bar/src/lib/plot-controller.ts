import { ɵPlotController } from '@ng-echarts/chart-library/core';
import type {
  ɵPlotRenderer,
  ɵPlotRendererFactory,
  ɵPlotEnvironment,
} from '@ng-echarts/chart-library/core';
import type { BarOption } from './bar-options';
export type { ɵPlotPoint as PlotPoint } from '@ng-echarts/chart-library/core';
export type BarRenderer = ɵPlotRenderer<BarOption>;
export type BarRendererFactory = ɵPlotRendererFactory<BarOption>;
export type PlotEnvironment = ɵPlotEnvironment<BarOption>;
export class PlotController extends ɵPlotController<BarOption> {}
