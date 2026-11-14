import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { ɵbuildCartesianOptions, type ɵCartesianContext } from '@ng-echarts/chart-library/core';
import type { ComposedSeries } from './composed-types';
export type ComposedOption = ComposeOption<
  BarSeriesOption | LineSeriesOption | GridComponentOption | TooltipComponentOption
>;

export function buildComposedOptions<T>(
  context: ɵCartesianContext<T>,
  series: readonly ComposedSeries<T>[],
): ComposedOption {
  const { model, hiddenIds, tokens, animation, format, categoryTicks } = context;
  const common = ɵbuildCartesianOptions(
    model,
    hiddenIds,
    tokens,
    false,
    animation,
    format,
    categoryTicks,
  );
  const categoryAxis = common.xAxis;
  if (categoryAxis.type !== 'category') throw new Error('Expected category axis');
  return {
    ...common,
    // Keep category centers stable even while every bar is hidden.
    xAxis: { ...categoryAxis, boundaryGap: true },
    series: series.flatMap((item, index): (BarSeriesOption | LineSeriesOption)[] => {
      if (hiddenIds.has(item.id)) return [];
      const color = tokens.series[index % tokens.series.length] ?? '#047857';
      const data = model.rows.map((row) => ({
        id: row.id,
        value: row.points[index]?.value ?? '-',
      }));
      const identity = { id: item.id, name: item.label, data };
      return item.kind === 'bar'
        ? [
            {
              ...identity,
              type: 'bar',
              z: 2,
              barMaxWidth: 48,
              itemStyle: { color, borderRadius: 2 },
            },
          ]
        : [
            {
              ...identity,
              type: 'line',
              z: 3,
              smooth: item.smooth ?? false,
              showSymbol: item.showPoints ?? true,
              connectNulls: false,
              symbol: 'diamond',
              clip: false,
              symbolSize: 7,
              triggerEvent: 'line',
              lineStyle: { color, width: 2.5, type: 'dashed', cap: 'round' },
              itemStyle: { color: tokens.background, borderColor: color, borderWidth: 2 },
            },
          ];
    }),
  };
}
