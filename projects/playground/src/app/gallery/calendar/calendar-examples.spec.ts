import { calendarSample } from './calendar-examples';
it('creates deterministic zero/missing and leap-day observations without local timezone arithmetic', () => {
  const leap = calendarSample(2024);
  expect(leap[0]).toEqual({ date: '2024-01-01', count: 0 });
  expect(leap.find((day) => day.date === '2024-01-02')).toBeUndefined();
  expect(leap.find((day) => day.date === '2024-02-29')).toBeDefined();
  expect(calendarSample(2025).some((day) => day.date === '2025-02-29')).toBe(false);
});
it('leaves invalid years to library validation without throwing during demo data creation', () => {
  for (const year of [NaN, Infinity, 0, 99, 10000, 2024.5, 1e12])
    expect(calendarSample(year)).toEqual([]);
  expect(calendarSample(100)[0]!.date).toBe('0100-01-01');
  expect(calendarSample(9999).at(-1)!.date).toBe('9999-12-31');
});
