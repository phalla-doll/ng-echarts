import { Component } from '@angular/core';
import { CalendarHeatmap, type CalendarPointSelection } from '@mantha911/ng-echarts/calendar';
interface DailyCount {
  readonly date: string;
  readonly count: number | null;
  readonly note: string;
}
@Component({
  imports: [CalendarHeatmap],
  template: `<nec-calendar-heatmap
    title="Daily totals"
    [data]="rows"
    dateKey="date"
    valueKey="count"
    [year]="2024"
    [max]="40"
    (pointSelect)="select($event)"
  />`,
})
export class CalendarConsumer {
  readonly rows: readonly DailyCount[] = [{ date: '2024-01-01', count: 0, note: 'Recorded zero' }];
  select(point: CalendarPointSelection<DailyCount>): void {
    const date: string = point.date,
      raw: number = point.value,
      note: string = point.row.note;
    const source: 'plot' | 'table' = point.source;
    void [date, raw, note, source];
  }
}
