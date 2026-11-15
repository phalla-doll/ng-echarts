import {
  ɵcreateValueFormatting,
  type ChartSeries,
  type ɵCartesianModel,
  type ɵValueFormatting,
} from '@mantha911/ng-echarts/core';
import type { ComposedLayout, ComposedSeries, ComposedValueAxis } from './composed-types';

export function composedAxesError<T>(
  axes: readonly ComposedValueAxis[] | null,
  series: readonly ComposedSeries<T>[],
): string | null {
  if (!Array.isArray(series)) return null; // The ordinary series validator owns this error.
  if (
    axes !== null &&
    (!Array.isArray(axes) ||
      axes.length < 1 ||
      axes.length > 2 ||
      axes.some(
        (axis) =>
          !axis ||
          [axis.id, axis.label, axis.unit].some(
            (text) => typeof text !== 'string' || !text || text !== text.trim(),
          ),
      ) ||
      new Set(axes.map((axis) => axis.id)).size !== axes.length)
  )
    return 'Value axes need 1–2 unique IDs, labels/units without padding.';
  const stacks = new Map<string, string>();
  for (const item of series) {
    if (!item) continue;
    const axis = item.axisId ?? axes?.[0]?.id;
    if (item.axisId !== undefined && (!axes || !axes.some((value) => value.id === item.axisId)))
      return 'Unknown axisId.';
    if (axes && item.kind !== 'line' && item.stack !== undefined) {
      const key = `${item.kind}:${item.stack}`;
      if (stacks.has(key) && stacks.get(key) !== axis) return 'A stack cannot span axes or units.';
      stacks.set(key, axis!);
    }
  }
  return null;
}

export function axisPosition(index: number, layout: ComposedLayout): string {
  return layout === 'horizontal'
    ? index === 0
      ? 'bottom'
      : 'top'
    : index === 0
      ? 'left'
      : 'right';
}

export function composedSeriesLabel<T>(
  item: ChartSeries<T>,
  axes: readonly ComposedValueAxis[] | null,
  layout: ComposedLayout,
): string {
  if (!Array.isArray(axes) || axes.length < 1 || axes.length > 2) return item.label;
  const index = Math.max(
    0,
    axes.findIndex((axis) => axis?.id === (item as ComposedSeries<T>).axisId),
  );
  return `${item.label} (${axes[index]?.unit}, ${axisPosition(index, layout)} axis)`;
}

export function composedAxisFormatting<T>(
  axes: readonly ComposedValueAxis[],
  series: readonly ComposedSeries<T>[],
  model: ɵCartesianModel<T>,
  locale: string,
): readonly ɵValueFormatting[] {
  return axes.map((axis) =>
    ɵcreateValueFormatting(
      locale,
      axis.numberFormatOptions,
      axis.valueFormatter,
      model.kind === 'error'
        ? []
        : model.rows.flatMap((row) =>
            row.points
              .filter((_, i) => (series[i]?.axisId ?? axes[0]!.id) === axis.id)
              .map((point) => point.value),
          ),
    ),
  );
}
