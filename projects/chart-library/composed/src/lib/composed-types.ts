import type { ChartSeries } from '@mantha911/ng-echarts/core';

export interface ComposedBarSeries<T> extends ChartSeries<T> {
  readonly kind: 'bar';
  readonly gradient?: never;
  /** Bars with the same nonempty name stack by sign; omission keeps a grouped bar. */
  readonly stack?: string;
  readonly smooth?: never;
  readonly showPoints?: never;
}
export interface ComposedLineSeries<T> extends ChartSeries<T> {
  readonly kind: 'line';
  readonly gradient?: never;
  readonly stack?: never;
  readonly smooth?: boolean;
  readonly showPoints?: boolean;
}
export interface ComposedAreaSeries<T> extends ChartSeries<T> {
  readonly kind: 'area';
  readonly stack?: string;
  readonly smooth?: boolean;
  readonly showPoints?: boolean;
  readonly gradient?: boolean;
}
/** Series share one category axis and one numeric scale; measures must use comparable units. */
export type ComposedSeries<T> =
  ComposedBarSeries<T> | ComposedLineSeries<T> | ComposedAreaSeries<T>;

export function composedSeriesError<T>(series: readonly ComposedSeries<T>[]): string | null {
  if (!Array.isArray(series)) return 'Chart data and series must be arrays.';
  for (const item of series) {
    if (!item || !['bar', 'line', 'area'].includes(item.kind))
      return "Composed series require a 'bar', 'line' or 'area' kind.";
    if (item.kind === 'bar' && (item.smooth !== undefined || item.showPoints !== undefined))
      return 'Line settings cannot be used on bar series.';
    if (
      item.kind !== 'line' &&
      item.stack !== undefined &&
      (typeof item.stack !== 'string' || !item.stack.trim() || item.stack !== item.stack.trim())
    )
      return 'Bar and area stack names must be nonempty strings without surrounding whitespace.';
    if (item.kind !== 'area' && item.gradient !== undefined)
      return 'Fill settings require an area series.';
    if (item.kind === 'area' && item.gradient !== undefined && typeof item.gradient !== 'boolean')
      return 'Area gradient must be a boolean.';
    if (item.kind === 'line' && item.stack !== undefined)
      return 'Stack settings cannot be used on line series.';
    if (
      item.kind !== 'bar' &&
      ((item.smooth !== undefined && typeof item.smooth !== 'boolean') ||
        (item.showPoints !== undefined && typeof item.showPoints !== 'boolean'))
    )
      return 'Curve settings must be booleans.';
  }
  return null;
}
