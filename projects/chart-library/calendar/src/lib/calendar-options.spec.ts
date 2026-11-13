import { buildCalendarOptions, calendarColors, type CalendarView } from './calendar-options';
import { ɵdefaultCartesianTheme } from '@ng-echarts/chart-library/core';
import { normalizeCalendarData } from './calendar-model';
function view(): CalendarView {
  const model = normalizeCalendarData(
    [
      { date: '2024-01-01', value: 0 },
      { date: '2024-02-29', value: 40 },
      { date: '2024-03-01', value: null },
    ],
    'date',
    'value',
    2024,
    40,
  );
  if (model.kind === 'error') throw Error();
  return {
    ...model,
    tokens: ɵdefaultCartesianTheme('light'),
    animation: false,
    format: (value) => `<${value}>`,
  };
}
it('splits the same inclusive year into quarters without losing or duplicating observations', () => {
  const wide = buildCalendarOptions(view(), 560),
    narrow = buildCalendarOptions(view(), 280);
  expect(wide.calendar).toHaveLength(1);
  expect(narrow.calendar).toHaveLength(4);
  expect(narrow.calendar).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ range: ['2024-01-01', '2024-03-31'] }),
      expect.objectContaining({ range: ['2024-10-01', '2024-12-31'] }),
    ]),
  );
  const values = (options: typeof wide) =>
    (options.series as { data: unknown[] }[]).flatMap((s) => s.data);
  expect(values(narrow)).toEqual(values(wide));
  expect(values(wide)).toEqual([
    { id: '2024-01-01', name: '2024-01-01', value: ['2024-01-01', 0] },
    { id: '2024-02-29', name: '2024-02-29', value: ['2024-02-29', 1] },
  ]);
  expect(wide.animation).toBe(false);
  expect(calendarColors(view().tokens)).toHaveLength(4);
});
it('escapes formatter output and keeps zero numeric even for extreme finite scales', () => {
  const options = buildCalendarOptions(view(), 800);
  const tooltip = (options.tooltip as { formatter: (p: unknown) => string }).formatter;
  expect(tooltip({ name: '2024-01-01' })).toContain('&lt;0&gt;');
  expect(tooltip({ name: '2024-03-01' })).toBe('');
  expect(tooltip({ name: '<script>' })).toBe('');
  const extreme = buildCalendarOptions(
    {
      ...view(),
      max: Number.MIN_VALUE,
      days: [{ date: '2024-01-01', month: 1, value: Number.MIN_VALUE, row: {} }],
    },
    800,
  );
  expect((extreme.series as { data: { value: unknown[] }[] }[])[0]!.data[0]!.value[1]).toBe(1);
});

it('keeps an underflowing positive ratio distinct from recorded zero', () => {
  const options = buildCalendarOptions(
    {
      ...view(),
      max: Number.MAX_VALUE,
      days: [{ date: '2024-01-01', month: 1, value: Number.MIN_VALUE, row: {} }],
    },
    800,
  );
  expect(
    (options.series as { data: { value: unknown[] }[] }[])[0]!.data[0]!.value[1],
  ).toBeGreaterThan(0);
});
