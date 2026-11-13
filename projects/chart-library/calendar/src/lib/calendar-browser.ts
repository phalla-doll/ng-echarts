import { InjectionToken } from '@angular/core';
import type { ɵPlotRendererFactory } from '@ng-echarts/chart-library/core';
import type { CalendarView } from './calendar-options';
export const CALENDAR_RENDERER_LOADER = new InjectionToken<
  () => Promise<ɵPlotRendererFactory<CalendarView>>
>('Calendar renderer loader', {
  providedIn: 'root',
  factory: () => () => import('./calendar-renderer').then((m) => m.createCalendarRenderer),
});

/** ECharts Calendar uses local Date arithmetic. A civil-date skip must not
 * silently place two observations in the same cell; native tables stay exact. */
export function calendarDatesExistLocally(dates: readonly string[]): boolean {
  return dates.every((date) => {
    const [year, month, day] = date.split('-').map(Number) as [number, number, number];
    const local = new Date(year, month - 1, day);
    return (
      local.getFullYear() === year && local.getMonth() === month - 1 && local.getDate() === day
    );
  });
}
