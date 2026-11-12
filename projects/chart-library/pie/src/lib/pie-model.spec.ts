import { normalizePieData } from './pie-model';
interface Row {
  id: string;
  name: string;
  value: number | null;
}
const measure = { id: 'v', key: 'value', label: 'Value' } as const;
const model = (rows: readonly Row[]) => normalizePieData(rows, 'id', 'name', measure);
it('keeps identity, nulls and zero separate and rejects negative/nonfinite/overflow totals', () => {
  const rows = Object.freeze([
    Object.freeze({ id: 'a', name: 'Repeated', value: 5 }),
    Object.freeze({ id: 'b', name: 'Repeated', value: 0 }),
    Object.freeze({ id: 'c', name: 'Missing', value: null }),
  ]);
  const normalized = model(rows);
  expect(normalized.kind).toBe('ready');
  if (normalized.kind === 'error') throw new Error('Expected valid model');
  expect(normalized.rows[0]!.points[0]!.row).toBe(rows[0]);
  expect(normalized.rows.map((r) => r.points[0]!.value)).toEqual([5, 0, null]);
  for (const value of [-1, NaN, Infinity])
    expect(model([{ id: 'a', name: 'A', value }]).kind).toBe('error');
  expect(
    model([
      { id: 'a', name: 'A', value: Number.MAX_VALUE },
      { id: 'b', name: 'B', value: Number.MAX_VALUE },
    ]).kind,
  ).toBe('error');
  expect(model([rows[0]!, rows[0]!]).kind).toBe('error');
});
it('uses an empty state for absent, missing and all-zero values', () => {
  for (const rows of [
    [],
    [{ id: 'a', name: 'A', value: null }],
    [{ id: 'a', name: 'A', value: 0 }],
  ])
    expect(model(rows).kind).toBe('empty');
});
