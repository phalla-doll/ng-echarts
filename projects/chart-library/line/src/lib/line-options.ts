import type { LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { ɵbuildCartesianOptions, type ɵCartesianContext } from '@ng-echarts/chart-library/core';
export type LineOption = ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption
>;
export function buildLineOptions<T>(
  context: ɵCartesianContext<T>,
  smooth: boolean,
  showPoints: boolean,
): LineOption {
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
    xAxis: { ...categoryAxis, boundaryGap: false },
    series: model.series.flatMap((item, index): LineSeriesOption[] => {
      if (hiddenIds.has(item.id)) return [];
      const color = tokens.series[index % tokens.series.length] ?? '#047857';
      return [
        {
          id: item.id,
          name: item.label,
          type: 'line',
          smooth,
          showSymbol: showPoints,
          connectNulls: false,
          symbol: 'circle',
          symbolSize: 6,
          triggerEvent: 'line',
          lineStyle: { color, width: 2 },
          itemStyle: { color: tokens.background, borderColor: color, borderWidth: 2 },
          data: model.rows.map((row) => ({ id: row.id, value: row.points[index]?.value ?? '-' })),
        },
      ];
    }),
  };
}
