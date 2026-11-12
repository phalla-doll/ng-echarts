import type { ChartSeries, StringKey } from './chart-types';

export interface CartesianPoint<T> {
  readonly rowId: string;
  readonly seriesId: string;
  readonly row: T;
  readonly value: number | null;
}

export interface CartesianRow<T> {
  readonly id: string;
  readonly category: string;
  readonly points: readonly CartesianPoint<T>[];
}

export type CartesianModel<T> =
  | { readonly kind: 'error'; readonly message: string }
  | {
      readonly kind: 'empty' | 'ready';
      readonly rows: readonly CartesianRow<T>[];
      readonly series: readonly ChartSeries<T>[];
    };

export function normalizeCartesianData<T extends object>(
  data: readonly T[],
  rowIdKey: StringKey<T>,
  categoryKey: StringKey<T>,
  series: readonly ChartSeries<T>[],
): CartesianModel<T> {
  const invalid = (message: string): CartesianModel<T> => ({ kind: 'error', message });
  if (!Array.isArray(data) || !Array.isArray(series)) {
    return invalid('Chart data and series must be arrays.');
  }
  const seriesIds = new Set<string>();
  for (const item of series) {
    if (!item || typeof item.id !== 'string' || !item.id || seriesIds.has(item.id)) {
      return invalid('Series require unique, nonempty string identifiers.');
    }
    if (typeof item.key !== 'string' || typeof item.label !== 'string') {
      return invalid('Series require a numeric field key and a text label.');
    }
    seriesIds.add(item.id);
  }
  const rowIds = new Set<string>();
  const rows: CartesianRow<T>[] = [];
  let hasValue = false;
  for (const row of data) {
    if (!row || typeof row !== 'object') return invalid('Each chart row must be an object.');
    const id = row[rowIdKey];
    const category = row[categoryKey];
    if (typeof id !== 'string' || !id || rowIds.has(id)) {
      return invalid('Rows require unique, nonempty string identifiers.');
    }
    if (typeof category !== 'string') return invalid('Category labels must be strings.');
    rowIds.add(id);
    const points: CartesianPoint<T>[] = [];
    for (const item of series) {
      const value: unknown = row[item.key];
      if (value != null && (typeof value !== 'number' || !Number.isFinite(value))) {
        return invalid('Measures must be finite numbers or missing values.');
      }
      if (typeof value === 'number') hasValue = true;
      points.push({
        rowId: id,
        seriesId: item.id,
        row,
        value: value == null ? null : (value as number),
      });
    }
    rows.push({ id, category, points });
  }
  return { kind: hasValue ? 'ready' : 'empty', rows, series };
}

export type ChartState =
  | { readonly kind: 'ready' }
  | { readonly kind: 'loading' | 'empty' | 'error'; readonly message: string };

export function resolveCartesianState(
  applicationError: string | null,
  loading: boolean,
  model:
    { readonly kind: 'error'; readonly message: string } | { readonly kind: 'ready' | 'empty' },
  rendererError: boolean,
  configurationError: string | null,
): ChartState {
  if (applicationError !== null)
    return { kind: 'error', message: applicationError || 'Unable to display chart.' };
  if (loading) return { kind: 'loading', message: 'Loading chart…' };
  if (model.kind === 'error') return model;
  if (configurationError) return { kind: 'error', message: configurationError };
  if (rendererError)
    return { kind: 'error', message: 'Unable to render chart. Try again or update the data.' };
  if (model.kind === 'empty') return { kind: 'empty', message: 'No chart data available.' };
  return { kind: 'ready' };
}
