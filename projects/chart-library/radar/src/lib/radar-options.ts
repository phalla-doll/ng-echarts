import type { RadarSeriesOption } from 'echarts/charts';
import type { RadarComponentOption, TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵtooltipMarkup as tooltipMarkup,
  ɵtooltipStyle as tooltipStyle,
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
        fontSize: 12,
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
      ...tooltipStyle(tokens),
      formatter: (params: unknown) => {
        if (!params || typeof params !== 'object') return '';
        const id = (params as Record<string, unknown>)['seriesId'];
        const index = model.series.findIndex((s) => s.id === id);
        if (index < 0 || hiddenIds.has(String(id))) return '';
        return tooltipMarkup(
          model.series[index]!.label,
          model.rows.map((row, i) => ({
            label: row.category,
            value:
              row.points[index]!.value === null
                ? 'Missing'
                : `${format(row.points[index]!.value!)} / ${format(maxima[i]!)}`,
          })),
        );
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
