import type { HeatmapSeriesOption } from 'echarts/charts';
import type {
  CalendarComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵtooltipMarkup as tooltipMarkup,
  ɵtooltipStyle as tooltipStyle,
  type ɵCartesianThemeTokens,
  type ValueFormatter,
} from '@ng-echarts/chart-library/core';
import { monthLength, type CalendarDay } from './calendar-model';
export type CalendarOption = ComposeOption<
  HeatmapSeriesOption | CalendarComponentOption | TooltipComponentOption | VisualMapComponentOption
> & { readonly animation: boolean };
export interface CalendarView {
  readonly year: number;
  readonly max: number;
  readonly days: readonly CalendarDay<unknown>[];
  readonly tokens: ɵCartesianThemeTokens;
  readonly animation: boolean;
  readonly format: ValueFormatter;
  readonly valueLabel?: string;
}

function rgb(color: string): number[] {
  if (color.startsWith('#')) return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return (color.match(/[\d.]+/gu) ?? []).slice(0, 3).map(Number);
}
/** Theme colors have been resolved to six-digit hex or rgba at the browser boundary. */
export function calendarColors(tokens: ɵCartesianThemeTokens): readonly string[] {
  const background = rgb(tokens.background),
    foreground = rgb(tokens.series[0]!);
  return [0.3, 0.5, 0.75, 1].map(
    (weight) =>
      `rgb(${foreground.map((channel, i) => Math.round(channel * weight + background[i]! * (1 - weight))).join(',')})`,
  );
}
export function buildCalendarOptions(view: CalendarView, width: number): CalendarOption {
  const { year, days, max, tokens, format } = view;
  const quarters = width < 560;
  const ranges = quarters
    ? Array.from({ length: 4 }, (_, i) => [i * 3 + 1, i * 3 + 3] as const)
    : [[1, 12] as const];
  const colors = calendarColors(tokens);
  const date = (month: number, day: number) =>
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const byDate = new Map(days.map((day) => [day.date, day]));
  return {
    animation: view.animation,
    animationDuration: 250,
    animationDurationUpdate: 150,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: tokens.fontFamily, color: tokens.text },
    calendar: ranges.map(([start, end], index) => ({
      range: [date(start, 1), date(end, monthLength(year, end))],
      left: 30,
      right: 8,
      top: 28 + index * 138,
      height: 98,
      orient: 'horizontal',
      cellSize: 'auto',
      splitLine: { show: false },
      itemStyle: { color: tokens.background, borderColor: tokens.border, borderWidth: 0.5 },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 1,
        nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        margin: 10,
        color: tokens.muted,
        fontSize: 10,
      },
      monthLabel: { nameMap: 'en', margin: 10, color: tokens.muted, fontSize: 11, align: 'left' },
    })),
    visualMap: {
      type: 'piecewise',
      show: false,
      dimension: 1,
      selectedMode: false,
      pieces: [
        { value: 0, color: tokens.border },
        ...colors.map((color, i) => ({ gt: i / 4, lte: (i + 1) / 4, color })),
      ],
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      ...tooltipStyle(tokens),
      formatter: (params: unknown) => {
        const id =
          params && typeof params === 'object' ? (params as { name?: unknown }).name : null;
        const day = typeof id === 'string' ? byDate.get(id) : null;
        return day?.value != null
          ? tooltipMarkup(day.date, [
              {
                label: view.valueLabel ?? 'Value',
                value: format(day.value),
                color:
                  day.value === 0
                    ? tokens.border
                    : colors[Math.min(3, Math.max(0, Math.ceil((day.value / max) * 4) - 1))],
              },
            ])
          : '';
      },
    },
    series: ranges.map(([start, end], index) => ({
      id: `calendar-${index}`,
      type: 'heatmap',
      coordinateSystem: 'calendar',
      calendarIndex: index,
      data: days
        .filter((day) => day.month >= start && day.month <= end && day.value !== null)
        .map((day) => ({
          id: day.date,
          name: day.date,
          value: [day.date, day.value === 0 ? 0 : Math.max(Number.MIN_VALUE, day.value! / max)],
        })),
      itemStyle: { borderWidth: 2, borderColor: tokens.background },
      emphasis: { itemStyle: { borderColor: tokens.text, borderWidth: 1 } },
    })),
  };
}
