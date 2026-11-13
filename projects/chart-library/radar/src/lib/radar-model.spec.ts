import { normalizeRadarData } from './radar-model';
const rows = [
  { id: 'a', name: 'Speed', max: 100, first: 0, second: 90 },
  { id: 'b', name: 'Coverage', max: 50, first: 30, second: 40 },
  { id: 'c', name: 'Value', max: 10, first: null as number | null, second: 8 },
];
const series = [
  { id: 'first', key: 'first', label: 'First' },
  { id: 'second', key: 'second', label: 'Second' },
] as const;
const normalize = (data = rows) => normalizeRadarData(data, 'id', 'name', series, 'max');
it('preserves zero, missing values, supplied order, identities and explicit scales', () => {
  const result = normalize();
  expect(result.kind).toBe('ready');
  if (result.kind === 'error') throw new Error(result.message);
  expect(result.maxima).toEqual([100, 50, 10]);
  expect(result.rows[0]!.points[0]).toMatchObject({
    rowId: 'a',
    seriesId: 'first',
    value: 0,
    row: rows[0],
  });
  expect(result.rows[2]!.points[0]!.value).toBeNull();
  expect(normalize([...rows].reverse())).toMatchObject({ maxima: [10, 50, 100] });
});
it.each([0, -1, Infinity, NaN])('rejects invalid maxima %s', (max) => {
  expect(normalize(rows.map((row, i) => (i === 0 ? { ...row, max } : row)))).toMatchObject({
    kind: 'error',
  });
});
it.each([-1, 101, Infinity, NaN])('rejects out-of-scale or invalid measures %s', (first) => {
  expect(normalize(rows.map((row, i) => (i === 0 ? { ...row, first } : row)))).toMatchObject({
    kind: 'error',
  });
});
it('rejects dimension counts, comparison counts and duplicate identities', () => {
  expect(normalize(rows.slice(0, 2))).toMatchObject({ kind: 'error' });
  expect(
    normalize(Array.from({ length: 13 }, (_, i) => ({ ...rows[0]!, id: String(i) }))),
  ).toMatchObject({ kind: 'error' });
  expect(normalize([rows[0]!, rows[0]!, rows[2]!])).toMatchObject({ kind: 'error' });
  expect(normalizeRadarData(rows, 'id', 'name', [], 'max')).toMatchObject({ kind: 'error' });
  expect(
    normalizeRadarData(
      rows,
      'id',
      'name',
      Array.from({ length: 5 }, (_, i) => ({ ...series[0], id: String(i) })),
      'max',
    ),
  ).toMatchObject({ kind: 'error' });
});
it('keeps an all-zero profile ready and an absent dataset empty', () => {
  expect(normalize(rows.map((row) => ({ ...row, first: 0, second: 0 })))).toMatchObject({
    kind: 'ready',
  });
  expect(normalize([])).toMatchObject({ kind: 'empty' });
  expect(
    normalize(rows.map((row) => ({ ...row, first: null, second: null as unknown as number }))),
  ).toMatchObject({ kind: 'empty' });
});
