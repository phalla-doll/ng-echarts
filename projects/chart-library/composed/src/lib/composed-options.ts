import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import { ɵbuildCartesianOptions, type ɵCartesianContext } from '@mantha911/ng-echarts/core';
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
      const data = model.rows.map((row) => {
        const value = row.points[index]?.value ?? null;
        let borderRadius: number | number[] = 0;
        if (item.kind === 'bar' && item.stack !== undefined && value !== null && value !== 0) {
          const covered = series.some((later, laterIndex) => {
            const other = row.points[laterIndex]?.value ?? 0;
            return (
              laterIndex > index &&
              later.kind === 'bar' &&
              later.stack === item.stack &&
              !hiddenIds.has(later.id) &&
              other !== 0 &&
              Math.sign(other) === Math.sign(value)
            );
          });
          if (!covered) borderRadius = value < 0 ? [0, 0, 2, 2] : [2, 2, 0, 0];
        }
        return {
          id: row.id,
          value: value ?? '-',
          ...(item.kind === 'bar' && item.stack !== undefined
            ? { itemStyle: { borderRadius } }
            : {}),
        };
      });
      const identity = { id: item.id, name: item.label, data };
      return item.kind === 'bar'
        ? [
            {
              ...identity,
              type: 'bar',
              stack: item.stack,
              stackStrategy: 'samesign',
              z: 2,
              barMaxWidth: 48,
              itemStyle: { color, borderRadius: item.stack === undefined ? 2 : 0 },
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
