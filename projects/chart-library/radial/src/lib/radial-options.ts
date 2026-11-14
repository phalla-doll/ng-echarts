import type { PieSeriesOption } from 'echarts/charts';
import type { ComposeOption } from 'echarts/core';
import type { ɵCartesianThemeTokens } from '@ng-echarts/chart-library/core';
import type { RadialModel } from './radial-model';
export type RadialOption = ComposeOption<PieSeriesOption> & { readonly animation: boolean };
export function buildRadialOptions(
  model: Extract<RadialModel, { kind: 'ready' }>,
  tokens: ɵCartesianThemeTokens,
  animation: boolean,
): RadialOption {
  return {
    animation,
    animationDuration: 300,
    animationDurationUpdate: 200,
    backgroundColor: tokens.background,
    series: [
      {
        id: 'progress',
        type: 'pie',
        silent: true,
        radius: ['68%', '80%'],
        center: ['50%', '50%'],
        startAngle: 90,
        clockwise: true,
        selectedMode: false,
        stillShowZeroSum: false,
        showEmptyCircle: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { disabled: true },
        // Unit weights avoid overflow when finite raw values approach Number.MAX_VALUE.
        data: [
          { id: 'completed', value: model.ratio, itemStyle: { color: tokens.series[0] } },
          { id: 'remaining', value: 1 - model.ratio, itemStyle: { color: tokens.border } },
        ],
      },
    ],
  };
}
