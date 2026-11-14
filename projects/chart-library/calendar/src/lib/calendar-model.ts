import type { NumericKey, StringKey } from '@mantha911/ng-echarts/core';

export interface CalendarPointSelection<T> {
  readonly date: string;
  readonly value: number;
  readonly row: T;
  readonly source: 'plot' | 'table';
}
export interface CalendarDay<T> {
  readonly date: string;
  readonly month: number;
  readonly value: number | null;
  readonly row: T | null;
}
export type CalendarModel<T> =
  | { readonly kind: 'error'; readonly message: string }
  | {
      readonly kind: 'ready' | 'empty';
      readonly year: number;
      readonly max: number;
      readonly days: readonly CalendarDay<T>[];
    };

export const calendarMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
export function monthLength(year: number, month: number): number {
  return (
    [
      31,
      year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][month - 1] ?? 0
  );
}
export function normalizeCalendarData<T extends object>(
  data: readonly T[],
  dateKey: StringKey<T>,
  valueKey: NumericKey<T>,
  year: number,
  max: number,
): CalendarModel<T> {
  const error = (message: string): CalendarModel<T> => ({ kind: 'error', message });
  if (!Number.isInteger(year) || year < 100 || year > 9999)
    return error('Calendar year must be an integer between 100 and 9999.');
  if (!Number.isFinite(max) || max <= 0)
    return error('Calendar maximum must be positive and finite.');
  if (
    !Array.isArray(data) ||
    typeof dateKey !== 'string' ||
    !dateKey ||
    typeof valueKey !== 'string' ||
    !valueKey
  )
    return error('Calendar data and date/value keys are invalid.');
  const observed = new Map<string, { value: number | null; row: T }>();
  for (const row of data) {
    if (!row || typeof row !== 'object') return error('Calendar rows must be objects.');
    const date = row[dateKey];
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(date))
      return error('Calendar dates must use YYYY-MM-DD without a time or offset.');
    const [y, m, d] = date.split('-').map(Number) as [number, number, number];
    if (y !== year || m < 1 || m > 12 || d < 1 || d > monthLength(y, m))
      return error('Calendar dates must be valid Gregorian dates in the selected year.');
    if (observed.has(date)) return error('Calendar dates must be unique.');
    const value = row[valueKey];
    if (
      value !== null &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max)
    )
      return error('Calendar values must be null or finite numbers between zero and the maximum.');
    observed.set(date, {
      value: value === null ? null : Object.is(value, -0) ? 0 : (value as number),
      row,
    });
  }
  const days: CalendarDay<T>[] = [];
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= monthLength(year, month); day++) {
      const date = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const observation = observed.get(date);
      days.push({ date, month, value: observation?.value ?? null, row: observation?.row ?? null });
    }
  }
  return { kind: days.some((d) => d.value !== null) ? 'ready' : 'empty', days, year, max };
}
