import type { PieSeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵescapeTooltipText as escape,
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
}): PieOption {
  const { model, hiddenIds, tokens, format, innerRadius, showLabels } = context;
  const measure = model.series[0]!;
  const outerRadius = showLabels ? 60 : 80;
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
      backgroundColor: tokens.background,
      borderColor: tokens.border,
      textStyle: { color: tokens.text, fontFamily: tokens.fontFamily, fontSize: 12 },
      extraCssText:
        'max-width: min(280px, calc(100% - 16px)); white-space: normal; pointer-events: none;',
      formatter: (params: unknown) => {
        if (typeof params !== 'object' || params === null) return '';
        const data = (params as Record<string, unknown>)['data'];
        if (typeof data !== 'object' || data === null) return '';
        const id = (data as Record<string, unknown>)['id'];
        const row = model.rows.find((row) => row.id === id);
        const value = row?.points[0]?.value;
        return !row || hiddenIds.has(row.id) || value == null
          ? ''
          : `<div data-nec-tooltip><strong>${escape(row.category)}</strong><div>${escape(measure.label)}: ${escape(format(value))}</div></div>`;
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
          alignTo: 'edge',
          edgeDistance: 8,
          bleedMargin: 4,
          color: tokens.text,
          fontSize: 12,
          width: 96,
          overflow: 'truncate',
          formatter: '{b}',
        },
        labelLine: { show: showLabels, length: 10, length2: 8, lineStyle: { color: tokens.muted } },
        labelLayout: { hideOverlap: true },
        avoidLabelOverlap: true,
        data: visible,
      },
    ],
  };
}
