/** Inclusive IDs in the chart's current supplied category order. */
export interface CategoryRangeSelection {
  readonly from: string;
  readonly to: string;
  readonly rowIds: readonly string[];
  readonly source: 'pointer';
}

export type CategoryRangeCancellation =
  'escape' | 'context' | 'resize' | 'scroll' | 'blur' | 'pointercancel' | 'unavailable';

export function categoryRange(
  ids: readonly string[],
  first: number,
  last: number,
): CategoryRangeSelection | null {
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    !ids.every((id) => typeof id === 'string' && id.length > 0) ||
    new Set(ids).size !== ids.length ||
    !Number.isInteger(first) ||
    !Number.isInteger(last) ||
    first < 0 ||
    last < 0 ||
    first >= ids.length ||
    last >= ids.length
  )
    return null;
  const rowIds = ids.slice(Math.min(first, last), Math.max(first, last) + 1);
  return { from: rowIds[0]!, to: rowIds.at(-1)!, rowIds, source: 'pointer' };
}
