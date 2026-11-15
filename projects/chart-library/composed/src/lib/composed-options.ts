import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵbuildCartesianOptions,
  ɵbuildAreaFill,
  type ɵCartesianContext,
  type ɵValueFormatting,
} from '@mantha911/ng-echarts/core';
import type { ComposedSeries, ComposedLayout, ComposedValueAxis } from './composed-types';
import { axisPosition, composedSeriesLabel } from './composed-axes';
export type ComposedOption = ComposeOption<
  BarSeriesOption | LineSeriesOption | GridComponentOption | TooltipComponentOption
>;

export function buildComposedOptions<T>(
  context: ɵCartesianContext<T>,
  series: readonly ComposedSeries<T>[],
  layout: ComposedLayout = 'vertical',
  axes: readonly ComposedValueAxis[] | null = null,
  axisFormats: readonly ɵValueFormatting[] = [],
): ComposedOption {
  const horizontal = layout === 'horizontal';
  const { model, hiddenIds, tokens, animation, format, categoryTicks } = context;
  const common = ɵbuildCartesianOptions(
    axes
      ? {
          ...model,
          series: model.series.map((item) => ({
            ...item,
            label: composedSeriesLabel(item, axes, layout),
          })),
        }
      : model,
    hiddenIds,
    tokens,
    horizontal,
    animation,
    format,
    categoryTicks,
    context.pointFormat,
  );
  const categoryAxis = horizontal ? common.yAxis : common.xAxis;
  if (categoryAxis.type !== 'category') throw new Error('Expected category axis');
  const valueAxis = horizontal ? common.xAxis : common.yAxis;
  if (valueAxis.type !== 'value') throw new Error('Expected value axis');
  const values = axes?.map((axis, index) => {
    const visible = series.some(
      (item) => !hiddenIds.has(item.id) && (item.axisId ?? axes[0]!.id) === axis.id,
    );
    return {
      ...valueAxis,
      position: axisPosition(index, layout) as 'top' | 'bottom' | 'left' | 'right',
      axisLabel: {
        ...valueAxis.axisLabel,
        show: visible,
        formatter: axisFormats[index]?.format ?? format,
      },
      splitLine: { ...valueAxis.splitLine, show: index === 0 && visible },
    };
  });
  return {
    ...common,
    // Keep category centers stable even while every bar is hidden.
    ...(horizontal
      ? { yAxis: { ...categoryAxis, boundaryGap: true } }
      : { xAxis: { ...categoryAxis, boundaryGap: true } }),
    ...(values
      ? {
          ...(horizontal ? { xAxis: values } : { yAxis: values }),
        }
      : {}),
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
          if (!covered)
            borderRadius = horizontal
              ? value < 0
                ? [2, 0, 0, 2]
                : [0, 2, 2, 0]
              : value < 0
                ? [0, 0, 2, 2]
                : [2, 2, 0, 0];
        }
        return {
          id: row.id,
          value: value ?? '-',
          ...(item.kind === 'bar' && item.stack !== undefined
            ? { itemStyle: { borderRadius } }
            : {}),
        };
      });
      const axisIndex = axes
        ? Math.max(
            0,
            axes.findIndex((axis) => axis.id === (item.axisId ?? axes[0]!.id)),
          )
        : 0;
      const identity = {
        id: item.id,
        name: composedSeriesLabel(item, axes, layout),
        data,
        ...(axes ? (horizontal ? { xAxisIndex: axisIndex } : { yAxisIndex: axisIndex }) : {}),
      };
      return item.kind === 'bar'
        ? [
            {
              ...identity,
              type: 'bar',
              stack: item.stack === undefined ? undefined : `nec-bar:${item.stack}`,
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
              z: item.kind === 'area' ? 1 : 3,
              ...(item.kind === 'area'
                ? {
                    stack: item.stack === undefined ? undefined : `nec-area:${item.stack}`,
                    stackStrategy: 'samesign' as const,
                    areaStyle: ɵbuildAreaFill(color, item.gradient ?? true, horizontal),
                  }
                : {}),
              smooth: item.smooth ?? false,
              showSymbol: item.showPoints ?? true,
              connectNulls: false,
              symbol: item.kind === 'area' ? 'circle' : 'diamond',
              clip: false,
              symbolSize: 7,
              triggerEvent: item.kind === 'area' ? true : 'line',
              lineStyle: {
                color,
                width: item.kind === 'area' ? 2 : 2.5,
                type: item.kind === 'area' ? 'solid' : 'dashed',
                cap: 'round',
              },
              itemStyle: { color: tokens.background, borderColor: color, borderWidth: 2 },
            },
          ];
    }),
  };
}
