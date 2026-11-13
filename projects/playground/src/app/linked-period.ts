export type VisitPeriod =
  | { readonly kind: 'month'; readonly id: string }
  | { readonly kind: 'range'; readonly from: string; readonly to: string }
  | null;

/** Bounds are stable row IDs. Display order, never label parsing, defines a range. */
export function reconcilePeriod(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
): VisitPeriod {
  if (period === null) return null;
  if (period.kind === 'month') return rows.some((row) => row.id === period.id) ? period : null;
  const from = rows.findIndex((row) => row.id === period.from);
  const to = rows.findIndex((row) => row.id === period.to);
  if (from < 0 || to < 0) return null;
  return from <= to ? period : { kind: 'range', from: period.to, to: period.from };
}

export function periodRows<T extends { readonly id: string }>(
  rows: readonly T[],
  period: VisitPeriod,
): readonly T[] {
  const current = reconcilePeriod(rows, period);
  if (current === null) return rows;
  if (current.kind === 'month') return rows.filter((row) => row.id === current.id);
  return rows.slice(
    rows.findIndex((row) => row.id === current.from),
    rows.findIndex((row) => row.id === current.to) + 1,
  );
}

/** Moving a bound across its counterpart moves the other bound with it. */
export function changePeriodBound(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
  bound: 'from' | 'to',
  id: string,
): VisitPeriod {
  if (period?.kind !== 'range' || !rows.some((row) => row.id === id)) return period;
  const next = { ...period, [bound]: id };
  if (rows.findIndex((row) => row.id === next.from) > rows.findIndex((row) => row.id === next.to)) {
    return { kind: 'range', from: id, to: id };
  }
  return next;
}
