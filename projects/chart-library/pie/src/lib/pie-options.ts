import type { PieSeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵtooltipMarkup as tooltipMarkup,
  ɵtooltipStyle as tooltipStyle,
  type ɵCartesianModel,
  type ɵCartesianThemeTokens,
  type ValueFormatter,
} from '@ng-echarts/chart-library/core';
export type PieOption = ComposeOption<PieSeriesOption | TooltipComponentOption>;
export function buildPieOptions<T>(context: {
  model: Exclude<ɵCartesianModel<T>, { kind: 'error' }>;
  hiddenIds: ReadonlySet<string>;
  tokens: ɵCartesianThemeTokens;
  animation: boolean;
  format: ValueFormatter;
  innerRadius: number;
  showLabels: boolean;
  formatPercent?: (ratio: number) => string;
}): PieOption {
  const { model, hiddenIds, tokens, format, innerRadius, showLabels } = context;
  const measure = model.series[0]!;
  const outerRadius = showLabels ? 60 : 80;
  const formatPercent =
    context.formatPercent ??
    ((ratio: number) =>
      new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(ratio));
  const total = model.rows.reduce(
    (sum, row) => sum + (hiddenIds.has(row.id) ? 0 : (row.points[0]?.value ?? 0)),
    0,
  );
  const visible = model.rows.flatMap((row, index) => {
    const value = row.points[0]!.value;
    return hiddenIds.has(row.id) || value === null
      ? []
      : [
          {
            id: row.id,
            name: row.category,
            value,
            itemStyle: { color: tokens.series[index % tokens.series.length] },
            label: { show: showLabels && value > 0 },
            labelLine: { show: showLabels && value > 0 },
          },
        ];
  });
  return {
    animation: context.animation,
    animationDuration: 300,
    animationDurationUpdate: 200,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: tokens.fontFamily, color: tokens.text },
    tooltip: {
      trigger: 'item',
      confine: true,
      ...tooltipStyle(tokens),
      formatter: (params: unknown) => {
        if (typeof params !== 'object' || params === null) return '';
        const data = (params as Record<string, unknown>)['data'];
        if (typeof data !== 'object' || data === null) return '';
        const id = (data as Record<string, unknown>)['id'];
        const row = model.rows.find((row) => row.id === id);
        const value = row?.points[0]?.value;
        return !row || hiddenIds.has(row.id) || value == null
          ? ''
          : tooltipMarkup(row.category, [
              {
                label: measure.label,
                value: format(value),
                color: tokens.series[model.rows.indexOf(row) % tokens.series.length],
              },
              {
                label: 'Share of visible total',
                value: formatPercent(total > 0 ? value / total : 0),
              },
            ]);
      },
    },
    series: [
      {
        id: measure.id,
        type: 'pie',
        radius: [`${innerRadius * outerRadius}%`, `${outerRadius}%`],
        center: ['50%', '50%'],
        startAngle: 0,
        clockwise: false,
        stillShowZeroSum: false,
        showEmptyCircle: false,
        selectedMode: false,
        emphasis: { scale: false },
        label: {
          show: showLabels,
          position: 'outside',
          alignTo: 'labelLine',
          edgeDistance: 8,
          bleedMargin: 4,
          color: tokens.text,
          fontSize: 12,
          width: 96,
          overflow: 'truncate',
          formatter: '{b}',
        },
        labelLine: {
          show: showLabels,
          length: 12,
          length2: 12,
          lineStyle: { color: tokens.muted },
        },
        labelLayout: { hideOverlap: true },
        avoidLabelOverlap: true,
        data: visible,
      },
    ],
  };
}
