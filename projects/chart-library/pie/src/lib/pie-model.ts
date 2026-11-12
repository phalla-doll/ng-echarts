import {
  ɵnormalizeCartesianData,
  type ɵCartesianModel,
  type ChartMeasure,
  type StringKey,
} from '@ng-echarts/chart-library/core';
export function normalizePieData<T extends object>(
  data: readonly T[],
  rowIdKey: StringKey<T>,
  categoryKey: StringKey<T>,
  measure: ChartMeasure<T>,
): ɵCartesianModel<T> {
  const model = ɵnormalizeCartesianData(data, rowIdKey, categoryKey, [measure]);
  if (model.kind === 'error') return model;
  let total = 0;
  for (const row of model.rows) {
    const value = row.points[0]!.value;
    if (value !== null && value < 0)
      return { kind: 'error', message: 'Pie measures must be nonnegative.' };
    total += value ?? 0;
  }
  if (!Number.isFinite(total)) return { kind: 'error', message: 'Pie total must be finite.' };
  return { ...model, kind: total > 0 ? 'ready' : 'empty' };
}
