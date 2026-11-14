// The first two default palette colors are adapted from EvilCharts (2026 Gurbinder, MIT).
// See docs/UPSTREAM_PROVENANCE.md and third-party/evilcharts-LICENSE.txt in the package.
import type { BarSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import type { BarModel } from './bar-model';
import type { BarLayout } from '@ng-echarts/chart-library/core';

export type BarOption = ComposeOption<
  BarSeriesOption | GridComponentOption | TooltipComponentOption
>;

export {
  ɵdefaultCartesianTheme as defaultBarTheme,
  ɵescapeTooltipText as escapeTooltipText,
} from '@ng-echarts/chart-library/core';
export type { ɵCartesianThemeTokens as BarThemeTokens } from '@ng-echarts/chart-library/core';
import { ɵbuildCartesianOptions } from '@ng-echarts/chart-library/core';
import type { ɵCartesianThemeTokens as BarThemeTokens } from '@ng-echarts/chart-library/core';
function baseColor(color: string): string {
  if (/^#[\da-f]{6}$/i.test(color)) {
    return `rgba(${[1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)).join(',')},0.3)`;
  }
  const rgba = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/);
  return rgba ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Number(rgba[4] ?? 1) * 0.3})` : color;
}

export function buildBarOptions<T>(
  model: Exclude<BarModel<T>, { kind: 'error' }>,
  hiddenIds: ReadonlySet<string>,
  tokens: BarThemeTokens,
  layout: BarLayout,
  stacked: boolean,
  gradient: boolean,
  animation: boolean,
  format: (value: number) => string,
  categoryTicks: readonly string[] = model.rows.map((row) => row.category),
  selectedRowIds: ReadonlySet<string> = new Set(),
): BarOption {
  const horizontal = layout === 'horizontal';
  const selected = selectedRowIds.size > 0 && model.rows.some((row) => selectedRowIds.has(row.id));
  const base = ɵbuildCartesianOptions(
    model,
    hiddenIds,
    tokens,
    horizontal,
    animation,
    format,
    categoryTicks,
  );
  const categoryAxis = horizontal ? base.yAxis : base.xAxis;
  const selectedAxis = () => ({
    ...categoryAxis,
    // A category band remains visible for zero/missing values or hidden series.
    splitArea: {
      show: true,
      interval: 0,
      areaStyle: {
        color: model.rows.map((row) =>
          selectedRowIds.has(row.id) ? tokens.border : 'transparent',
        ),
        opacity: 0.3,
      },
    },
    data: model.rows.map((row) => ({
      value: row.id,
      textStyle: selectedRowIds.has(row.id) ? { color: tokens.text, fontWeight: 600 } : undefined,
    })),
  });
  return {
    ...base,
    ...(selected ? (horizontal ? { yAxis: selectedAxis() } : { xAxis: selectedAxis() }) : {}),
    series: model.series.flatMap((item, index): BarSeriesOption[] => {
      if (hiddenIds.has(item.id)) return [];
      const color = tokens.series[index % tokens.series.length] ?? '#047857';
      return [
        {
          id: item.id,
          name: item.label,
          type: 'bar',
          stack: stacked ? 'total' : undefined,
          barMaxWidth: 48,
          itemStyle: {
            borderRadius: stacked ? 0 : 3,
            color: gradient
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: horizontal ? 1 : 0,
                  y2: horizontal ? 0 : 1,
                  colorStops: [
                    { offset: 0, color },
                    { offset: 0.2, color },
                    { offset: 0.9, color: baseColor(color) },
                    { offset: 1, color: baseColor(color) },
                  ],
                }
              : color,
          },
          data: model.rows.map((row) => {
            const value = row.points[index]?.value ?? null;
            const outer =
              value !== null &&
              value !== 0 &&
              !model.series.some((later, laterIndex) => {
                const other = row.points[laterIndex]?.value ?? 0;
                return (
                  laterIndex > index &&
                  !hiddenIds.has(later.id) &&
                  other !== 0 &&
                  Math.sign(other) === Math.sign(value)
                );
              });
            const cap = horizontal
              ? value! < 0
                ? [3, 0, 0, 3]
                : [0, 3, 3, 0]
              : value! < 0
                ? [0, 0, 3, 3]
                : [3, 3, 0, 0];
            return {
              id: row.id,
              value: value ?? '-',
              ...(stacked || selected
                ? {
                    itemStyle: {
                      ...(stacked ? { borderRadius: outer ? cap : 0 } : {}),
                      ...(selected ? { opacity: selectedRowIds.has(row.id) ? 1 : 0.35 } : {}),
                    },
                  }
                : {}),
            };
          }),
        },
      ];
    }),
  };
}
