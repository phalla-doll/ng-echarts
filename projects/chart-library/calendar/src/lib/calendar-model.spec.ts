import { monthLength, normalizeCalendarData } from './calendar-model';
const parse = (data: readonly { date: string; value: number | null }[], year = 2024, max = 40) =>
  normalizeCalendarData(data, 'date', 'value', year, max);
it('preserves date identity, original rows and missing-vs-zero throughout a leap year', () => {
  const zero = { date: '2024-02-28', value: -0 },
    leap = { date: '2024-02-29', value: 40 };
  const model = parse([leap, zero, { date: '2024-03-02', value: null }]);
  expect(model.kind).toBe('ready');
  if (model.kind === 'error') throw Error();
  expect(model.days).toHaveLength(366);
  expect(model.days[0]!.date).toBe('2024-01-01');
  expect(model.days.at(-1)!.date).toBe('2024-12-31');
  expect(model.days.find((d) => d.date === zero.date)).toEqual({
    date: zero.date,
    month: 2,
    value: 0,
    row: zero,
  });
  expect(Object.is(model.days.find((d) => d.date === zero.date)!.value, -0)).toBe(false);
  expect(model.days.find((d) => d.date === leap.date)!.row).toBe(leap);
  expect(model.days.find((d) => d.date === '2024-03-01')!.value).toBeNull();
  expect(model.days.find((d) => d.date === '2024-03-02')!.value).toBeNull();
});
it.each([
  '2024-2-01',
  '2024-02-30',
  '2023-02-29',
  '2024-01-00',
  '2024-13-01',
  '2024-01-01T00:00:00Z',
  '2024-01-01+07:00',
])('rejects invalid, out-of-year and timestamp dates: %s', (date) => {
  expect(parse([{ date, value: 1 }]).kind).toBe('error');
});
it('rejects duplicate dates and invalid bounds/values instead of aggregating or clamping', () => {
  const row = { date: '2024-01-01', value: 2 };
  expect(parse([row, row]).kind).toBe('error');
  for (const value of [-1, 41, NaN, Infinity, undefined, '1'])
    expect(parse([{ ...row, value: value as number }]).kind).toBe('error');
  for (const year of [99, 10000, 2024.5, NaN]) expect(parse([row], year).kind).toBe('error');
  for (const max of [0, -1, Infinity, NaN]) expect(parse([row], 2024, max).kind).toBe('error');
});
it('treats all-zero observations as ready and absent/null observations as empty', () => {
  expect(parse([{ date: '2024-01-01', value: 0 }]).kind).toBe('ready');
  expect(parse([{ date: '2024-01-01', value: null }]).kind).toBe('empty');
  expect(parse([]).kind).toBe('empty');
  expect(monthLength(1900, 2)).toBe(28);
  expect(monthLength(2000, 2)).toBe(29);
  const model = parse([], 2025);
  if (model.kind === 'error') throw Error();
  expect(model.days).toHaveLength(365);
});

it('retains Gregorian date identity even for a locally skipped civil date', () => {
  const model = parse([{ date: '2011-12-30', value: 13 }], 2011);
  if (model.kind === 'error') throw Error();
  expect(model.days).toHaveLength(365);
  expect(model.days.find((day) => day.date === '2011-12-30')!.value).toBe(13);
});
