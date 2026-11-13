import type { ɵPlotPoint } from '@ng-echarts/chart-library/core';
import type { RadarOption, radarLayout } from './radar-options';

/** Only an unambiguous vertex activates a dimension; a polygon interior has no point identity. */
export function radarPoint(
  event: unknown,
  option: RadarOption,
  layout: ReturnType<typeof radarLayout>,
): ɵPlotPoint | null {
  if (!event || typeof event !== 'object') return null;
  const e = event as Record<string, unknown>;
  const pointer = e['event'] as Record<string, unknown> | undefined;
  if (!pointer || typeof pointer['offsetX'] !== 'number' || typeof pointer['offsetY'] !== 'number')
    return null;
  const series = Array.isArray(option.series)
    ? option.series.find((s) => s.id === e['seriesId'])
    : null;
  const radar = Array.isArray(option.radar) ? option.radar[0] : option.radar;
  const indicators = radar?.indicator;
  const data = series?.data?.[0];
  if (
    !indicators ||
    !data ||
    typeof data !== 'object' ||
    !('value' in data) ||
    !Array.isArray(data.value)
  )
    return null;
  const values = data.value;
  const candidates = indicators
    .flatMap((indicator, i) => {
      const value = values[i];
      if (typeof value !== 'number' || typeof indicator.max !== 'number') return [];
      const angle = Math.PI / 2 + (i * Math.PI * 2) / indicators.length;
      const radius = (layout.radius * value) / indicator.max;
      const distance = Math.hypot(
        (pointer['offsetX'] as number) - layout.center[0] - Math.cos(angle) * radius,
        (pointer['offsetY'] as number) - layout.center[1] + Math.sin(angle) * radius,
      );
      return distance <= 10 ? [{ index: i, distance }] : [];
    })
    .sort((a, b) => a.distance - b.distance);
  if (!candidates[0] || (candidates[1] && candidates[1].distance - candidates[0].distance < 1))
    return null;
  // Stable row IDs travel with the option, never with a renderer's mutable data indices.
  const rows = (option as RadarIdentityOption).necRowIds;
  const rowId = rows?.[candidates[0].index];
  return rowId && typeof e['seriesId'] === 'string' ? { rowId, seriesId: e['seriesId'] } : null;
}
export type RadarIdentityOption = RadarOption & { readonly necRowIds?: readonly string[] };
