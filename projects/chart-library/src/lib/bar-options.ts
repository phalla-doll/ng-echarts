// The first two default palette colors are adapted from EvilCharts (2026 Gurbinder, MIT).
// See docs/UPSTREAM_PROVENANCE.md and third-party/evilcharts-LICENSE.txt in the package.
import type { BarSeriesOption } from 'echarts/charts';
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import type { BarModel } from './bar-model';
import type { BarLayout, ChartTheme } from './chart-types';

export type BarOption = ComposeOption<
  BarSeriesOption | GridComponentOption | TooltipComponentOption
>;

export interface BarThemeTokens {
  readonly background: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly series: readonly string[];
}

export function defaultBarTheme(theme: ChartTheme): BarThemeTokens {
  return theme === 'dark'
    ? {
        background: '#18202c',
        text: '#edf2fa',
        muted: '#b2bfd2',
        border: '#3b4a61',
        series: ['#10b981', '#f43f5e', '#60a5fa', '#fbbf24'],
      }
    : {
        background: '#ffffff',
        text: '#18202c',
        muted: '#536176',
        border: '#d6dce5',
        series: ['#047857', '#be123c', '#2563eb', '#a16207'],
      };
}

export function escapeTooltipText(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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
): BarOption {
  const horizontal = layout === 'horizontal';
  const categoryAxis = {
    type: 'category' as const,
    data: model.rows.map((row) => row.id),
    inverse: horizontal,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: tokens.muted,
      fontSize: 12,
      formatter: (_value: string, index: number) => categoryTicks[index] ?? '',
    },
  };
  const valueAxis = {
    type: 'value' as const,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: tokens.muted, fontSize: 12, formatter: format },
    splitLine: { lineStyle: { color: tokens.border, type: 'dashed' as const } },
  };
  return {
    animation,
    animationDuration: 300,
    animationDurationUpdate: 200,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: 'system-ui, sans-serif', color: tokens.text },
    grid: {
      left: 12,
      right: 16,
      top: 12,
      bottom: 8,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: tokens.background,
      borderColor: tokens.border,
      textStyle: { color: tokens.text },
      formatter: (params: unknown) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items.find((item) => record(item) && record(item['data']));
        if (!record(first) || !record(first['data'])) return '';
        const rowId: unknown = first['data']['id'];
        const row = model.rows.find((candidate) => candidate.id === rowId);
        if (!row) return '';
        const values = row.points.flatMap((point) => {
          if (hiddenIds.has(point.seriesId)) return [];
          const label = model.series.find((item) => item.id === point.seriesId)?.label ?? '';
          return [
            `<div>${escapeTooltipText(label)}: ${escapeTooltipText(point.value === null ? 'Missing' : format(point.value))}</div>`,
          ];
        });
        return `<strong>${escapeTooltipText(row.category)}</strong>${values.join('')}`;
      },
    },
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
            borderRadius: 2,
            color: gradient
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: horizontal ? 1 : 0,
                  y2: horizontal ? 0 : 1,
                  colorStops: [
                    { offset: 0, color },
                    { offset: 1, color: tokens.background },
                  ],
                }
              : color,
          },
          data: model.rows.map((row) => ({ id: row.id, value: row.points[index]?.value ?? '-' })),
        },
      ];
    }),
  };
}
