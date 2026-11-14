import {
  ɵnormalizeCartesianData,
  type ɵCartesianModel,
  type ChartSeries,
  type NumericKey,
  type StringKey,
} from '@mantha911/ng-echarts/core';

export type RadarModel<T> =
  | Extract<ɵCartesianModel<T>, { kind: 'error' }>
  | (Exclude<ɵCartesianModel<T>, { kind: 'error' }> & { readonly maxima: readonly number[] });

export function normalizeRadarData<T extends object>(
  data: readonly T[],
  rowIdKey: StringKey<T>,
  categoryKey: StringKey<T>,
  series: readonly ChartSeries<T>[],
  maxKey: NumericKey<T>,
): RadarModel<T> {
  const model = ɵnormalizeCartesianData(data, rowIdKey, categoryKey, series);
  if (model.kind === 'error') return model;
  if (typeof maxKey !== 'string' || !maxKey)
    return { kind: 'error', message: 'Radar requires a numeric maximum field.' };
  if (model.rows.length > 0 && (model.rows.length < 3 || model.rows.length > 12))
    return { kind: 'error', message: 'Radar requires 3 to 12 dimensions.' };
  if (model.series.length < 1 || model.series.length > 4)
    return { kind: 'error', message: 'Radar requires 1 to 4 comparison series.' };
  const maxima: number[] = [];
  for (const [index, row] of model.rows.entries()) {
    const max = data[index]![maxKey];
    if (typeof max !== 'number' || !Number.isFinite(max) || max <= 0)
      return {
        kind: 'error',
        message: 'Each radar dimension requires a positive, finite maximum.',
      };
    if (row.points.some((p) => p.value !== null && (p.value < 0 || p.value > max)))
      return {
        kind: 'error',
        message: 'Radar values must be between zero and their dimension maximum.',
      };
    maxima.push(max);
  }
  return { ...model, maxima };
}
