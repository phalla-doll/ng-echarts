import type { RadarSeriesOption } from 'echarts/charts';
import type { RadarComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵescapeTooltipText as escape,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';

export type RadarOption = ComposeOption<
  RadarSeriesOption | RadarComponentOption | TooltipComponentOption
> & { readonly animation: boolean };
export function buildRadarOptions<T>(
  context: ɵCartesianContext<T>,
  maxima: readonly number[],
  filled: boolean,
): RadarOption {
  const { model, hiddenIds, tokens, format, categoryTicks } = context;
  return {
    animation: context.animation,
    animationDuration: 300,
    animationDurationUpdate: 200,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: tokens.fontFamily, color: tokens.text },
    radar: {
      center: ['50%', '50%'],
      radius: 80,
      startAngle: 90,
      clockwise: false,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: tokens.muted,
        fontFamily: tokens.fontFamily,
        fontSize: 11,
        width: 60,
        overflow: 'truncate',
      },
      axisNameGap: 8,
      axisLine: { lineStyle: { color: tokens.border } },
      splitLine: { lineStyle: { color: tokens.border } },
      splitArea: { show: false },
      indicator: model.rows.map((row, i) => ({
        name: categoryTicks[i] ?? row.category,
        min: 0,
        max: maxima[i],
      })),
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: tokens.background,
      borderColor: tokens.border,
      textStyle: { color: tokens.text, fontFamily: tokens.fontFamily, fontSize: 12 },
      extraCssText:
        'max-width: min(280px, calc(100% - 16px)); white-space: normal; pointer-events: none;',
      formatter: (params: unknown) => {
        if (!params || typeof params !== 'object') return '';
        const id = (params as Record<string, unknown>)['seriesId'];
        const index = model.series.findIndex((s) => s.id === id);
        if (index < 0 || hiddenIds.has(String(id))) return '';
        return `<div data-nec-tooltip><strong>${escape(model.series[index]!.label)}</strong>${model.rows
          .map((row, i) => {
            const value = row.points[index]!.value;
            return `<div>${escape(row.category)}: ${value === null ? 'Missing' : escape(format(value))} / ${escape(format(maxima[i]!))}</div>`;
          })
          .join('')}</div>`;
      },
    },
    series: model.series.flatMap((item, index) => {
      if (hiddenIds.has(item.id) || model.rows.some((row) => row.points[index]!.value === null))
        return [];
      const color = tokens.series[index % tokens.series.length];
      return [
        {
          id: item.id,
          name: item.label,
          type: 'radar' as const,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color,
            width: 2,
            type: index % 2 === 0 ? ('solid' as const) : ('dashed' as const),
          },
          itemStyle: { color },
          areaStyle: { color, opacity: filled ? 0.08 : 0 },
          emphasis: { disabled: true },
          data: [
            {
              id: item.id,
              name: item.label,
              value: model.rows.map((row) => row.points[index]!.value!),
            },
          ],
        },
      ];
    }),
  };
}

/** Reserve bounded labels on each side, with the full dimension text in the native table. */
export function radarLayout(width: number, height: number, dimensions = 6) {
  const horizontalExtent = Math.max(
    ...Array.from({ length: dimensions }, (_, i) =>
      Math.abs(Math.cos(Math.PI / 2 + (i * Math.PI * 2) / dimensions)),
    ),
  );
  return {
    center: [width / 2, height / 2] as const,
    radius: Math.max(8, Math.min((width / 2 - 72) / horizontalExtent, (height - 64) / 2)),
  };
}
