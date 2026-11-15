import { changePeriodBound, periodRows, reconcilePeriod, type VisitPeriod } from './linked-period';

const rows = ['jan', 'feb', 'mar', 'apr'].map((id) => ({ id }));
const range: VisitPeriod = { kind: 'range', from: 'feb', to: 'apr' };
it('uses inclusive displayed order and stable endpoints through insertions, removal and reversal', () => {
  expect(periodRows(rows, range).map((row) => row.id)).toEqual(['feb', 'mar', 'apr']);
  const reversed = [...rows].reverse();
  expect(reconcilePeriod(reversed, range)).toEqual({ kind: 'range', from: 'apr', to: 'feb' });
  expect(periodRows(reversed, range).map((row) => row.id)).toEqual(['apr', 'mar', 'feb']);
  expect(
    periodRows([rows[0]!, rows[1]!, { id: 'new' }, rows[3]!], range).map((row) => row.id),
  ).toEqual(['feb', 'new', 'apr']);
  expect(reconcilePeriod(rows.slice(0, 3), range)).toBeNull();
  expect(reconcilePeriod(rows, null)).toBeNull();
});
it('moves the other endpoint on crossing and treats equal endpoints as one row', () => {
  const collapsed = changePeriodBound(rows, range, 'to', 'jan');
  expect(collapsed).toEqual({ kind: 'range', from: 'jan', to: 'jan' });
  expect(periodRows(rows, collapsed)).toEqual([rows[0]]);
  expect(changePeriodBound(rows, { kind: 'range', from: 'jan', to: 'feb' }, 'from', 'apr')).toEqual(
    { kind: 'range', from: 'apr', to: 'apr' },
  );
  expect(changePeriodBound(rows, range, 'to', 'unknown')).toEqual(range);
});
