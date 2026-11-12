import type { PlotPoint } from './plot-controller';
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export function curvePoint(
  event: unknown,
  options: unknown,
  convert: (x: number) => unknown,
): PlotPoint | undefined {
  if (!record(event) || !record(options)) return;
  if (
    record(event['data']) &&
    typeof event['data']['id'] === 'string' &&
    typeof event['seriesId'] === 'string'
  ) {
    return { rowId: event['data']['id'], seriesId: event['seriesId'] };
  }
  // Whole-line clicks (including when markers are hidden) select the nearest category
  // on that painted series. Gaps have no painted path and missing cells never emit.
  if (
    (event['selfType'] !== 'line' && event['selfType'] !== 'area') ||
    typeof event['seriesIndex'] !== 'number' ||
    !record(event['event'])
  )
    return;
  const x = event['event']['offsetX'];
  if (typeof x !== 'number' || !Number.isFinite(x)) return;
  const category = convert(x);
  if (typeof category !== 'number' || !Number.isFinite(category)) return;
  const series =
    record(options) && Array.isArray(options['series'])
      ? options['series'][event['seriesIndex']]
      : undefined;
  if (!record(series)) return;
  const data = series['data'];
  if (!Array.isArray(data) || data.length === 0 || typeof series['id'] !== 'string') return;
  const point: unknown = data[Math.max(0, Math.min(data.length - 1, Math.round(category)))];
  if (
    record(point) &&
    typeof point['id'] === 'string' &&
    typeof point['value'] === 'number' &&
    Number.isFinite(point['value'])
  )
    return { rowId: point['id'], seriesId: series['id'] };
  return undefined;
}
