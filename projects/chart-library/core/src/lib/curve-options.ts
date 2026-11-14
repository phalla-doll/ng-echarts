import type { LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { buildCartesianOptions } from './cartesian-options';
import type { CartesianContext } from './cartesian-chart';
export type CurveOption = ComposeOption<
  LineSeriesOption | GridComponentOption | TooltipComponentOption
>;
export function buildCurveOptions<T>(
  context: CartesianContext<T>,
  smooth: boolean,
  showPoints: boolean,
): CurveOption {
  const { model, hiddenIds, tokens, animation, format, categoryTicks } = context;
  const common = buildCartesianOptions(
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
          symbol: index % 2 === 0 ? 'circle' : 'diamond',
          clip: false,
          symbolSize: 6,
          triggerEvent: 'line',
          lineStyle: { color, width: 2, type: index % 2 === 0 ? 'solid' : 'dashed' },
          itemStyle: { color: tokens.background, borderColor: color, borderWidth: 2 },
          data: model.rows.map((row) => ({ id: row.id, value: row.points[index]?.value ?? '-' })),
        },
      ];
    }),
  };
}
