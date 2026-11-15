// Use exported per-chart entries to preserve independent lazy engine chunks.
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { ɵcreateCurveRenderer, type ɵPlotRendererFactory } from '@mantha911/ng-echarts/core';
import type { ComposedOption } from './composed-options';
use([GridComponent, TooltipComponent, CanvasRenderer]);
export const createComposedRenderer: ɵPlotRendererFactory<ComposedOption> = (host, onPoint) =>
  ɵcreateCurveRenderer<ComposedOption>(init(host, undefined, { renderer: 'canvas' }), onPoint);
