import { tooltipStyle, tooltipMarkup } from './tooltip';
// First two palette colors adapted from EvilCharts (2026 Gurbinder, MIT); see package third-party notice.
import type { ChartTheme } from './chart-types';
import type { CartesianModel } from './cartesian-model';
export interface CartesianThemeTokens {
  readonly fontFamily: string;
  readonly background: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly series: readonly string[];
}

export function defaultCartesianTheme(theme: ChartTheme): CartesianThemeTokens {
  return theme === 'dark'
    ? {
        fontFamily: 'system-ui, sans-serif',
        background: '#18202c',
        text: '#edf2fa',
        muted: '#b2bfd2',
        border: '#3b4a61',
        series: ['#10b981', '#f43f5e', '#60a5fa', '#fbbf24'],
      }
    : {
        fontFamily: 'system-ui, sans-serif',
        background: '#ffffff',
        text: '#18202c',
        muted: '#536176',
        border: '#d6dce5',
        series: ['#047857', '#be123c', '#2563eb', '#a16207'],
      };
}

export { escapeTooltipText } from './tooltip';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

interface AxisAppearance {
  axisLine: { show: boolean };
  axisTick: { show: boolean };
}

interface CartesianCategoryAxis extends AxisAppearance {
  type: 'category';
  data: string[];
  inverse: boolean;
  axisLabel: {
    color: string;
    fontSize: number;
    formatter: (_value: string, index: number) => string;
  };
}

interface CartesianValueAxis extends AxisAppearance {
  type: 'value';
  splitNumber: number;
  axisLabel: {
    show: boolean;
    color: string;
    fontSize: number;
    formatter: (value: number) => string;
    hideOverlap: boolean;
  };
  splitLine: {
    show: boolean;
    lineStyle: { color: string; type: 'dashed' };
  };
}

type CartesianAxis = CartesianCategoryAxis | CartesianValueAxis;

/** Explicit axes keep declaration member order stable across independent build roots. */
interface CartesianOption {
  animation: boolean;
  animationDuration: number;
  animationDurationUpdate: number;
  backgroundColor: string;
  textStyle: { fontFamily: string; color: string };
  grid: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    outerBoundsMode: 'same';
    outerBoundsContain: 'axisLabel';
  };
  xAxis: CartesianAxis;
  yAxis: CartesianAxis;
  tooltip: ReturnType<typeof tooltipStyle> & {
    trigger: 'axis';
    confine: boolean;
    formatter: (params: unknown) => string;
  };
}

export function buildCartesianOptions<T>(
  model: Exclude<CartesianModel<T>, { kind: 'error' }>,
  hiddenIds: ReadonlySet<string>,
  tokens: CartesianThemeTokens,
  horizontal: boolean,
  animation: boolean,
  format: (value: number) => string,
  categoryTicks: readonly string[] = model.rows.map((row) => row.category),
  pointFormat?: (value: number, seriesId: string) => string,
): CartesianOption {
  const hasVisibleSeries = model.series.some((series) => !hiddenIds.has(series.id));
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
    splitNumber: horizontal ? 3 : 5,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      show: hasVisibleSeries,
      color: tokens.muted,
      fontSize: 12,
      formatter: format,
      hideOverlap: true,
    },
    splitLine: {
      show: hasVisibleSeries,
      lineStyle: { color: tokens.border, type: 'dashed' as const },
    },
  };
  return {
    animation,
    animationDuration: 300,
    animationDurationUpdate: 200,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: tokens.fontFamily, color: tokens.text },
    grid: {
      left: 12,
      right: 16,
      top: 12,
      bottom: 8,
      outerBoundsMode: 'same' as const,
      outerBoundsContain: 'axisLabel' as const,
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    tooltip: {
      trigger: 'axis' as const,
      confine: true,
      ...tooltipStyle(tokens),
      formatter: (params: unknown) => {
        const items = Array.isArray(params) ? params : [params];
        const first = items.find((item) => record(item) && record(item['data']));
        if (!record(first) || !record(first['data'])) return '';
        const rowId: unknown = first['data']['id'];
        const row = model.rows.find((candidate) => candidate.id === rowId);
        if (!row) return '';
        const values = row.points.flatMap((point, index) => {
          if (hiddenIds.has(point.seriesId)) return [];
          const label = model.series[index]?.label ?? '';
          return [
            {
              label,
              value:
                point.value === null
                  ? 'Missing'
                  : (pointFormat?.(point.value, point.seriesId) ?? format(point.value)),
              color: tokens.series[index % tokens.series.length] ?? '#047857',
            },
          ];
        });
        return tooltipMarkup(row.category, values);
      },
    },
  };
}
