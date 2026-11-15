export interface ActivityDay {
  readonly date: string;
  readonly count: number | null;
}
/** Illustrative activity, independent of local timezone and current date. */
export function calendarSample(year: number): readonly ActivityDay[] {
  if (!Number.isInteger(year) || year < 100 || year > 9999) return [];
  const result: ActivityDay[] = [];
  for (let index = 0; index < 366; index++) {
    const date = new Date(Date.UTC(year, 0, index + 1)).toISOString().slice(0, 10);
    if (!date.startsWith(String(year).padStart(4, '0')) || index % 19 === 1) continue;
    result.push({
      date,
      count: index % 29 === 8 ? null : (index * 13 + Math.floor(index / 7) * 5) % 41,
    });
  }
  return result;
}
export function calendarExampleSource(dark = false): string {
  return `import { Component } from '@angular/core';
import { CalendarHeatmap } from '@mantha911/ng-echarts/calendar';

interface ActivityDay { readonly date: string; readonly count: number | null; }

@Component({
  selector: 'app-daily-activity',
  imports: [CalendarHeatmap],
  template: \`<nec-calendar-heatmap
    title="Daily contributions" valueLabel="Contributions"
    description="Illustrative activity in 2024. Missing days are distinct from zero."
    [data]="days"
    dateKey="date"
    valueKey="count"
    [year]="2024"
    [max]="40"
    theme="${dark ? 'dark' : 'light'}"
  />\`,
})
export class DailyActivity {
  readonly days: readonly ActivityDay[] = Array.from({ length: 366 }, (_, index) => ({
    date: new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
    count: index % 29 === 8 ? null : (index * 13 + Math.floor(index / 7) * 5) % 41,
  })).filter((_, index) => index % 19 !== 1);
}
`;
}
