import { Component } from '@angular/core';
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library';

interface Row {
  id: string;
  category: string;
  count: number;
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid category key"
    [data]="rows"
    rowIdKey="id"
    categoryKey="count"
    [series]="series"
  />`,
})
export class InvalidConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid numeric key"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="badSeries"
  />`,
})
export class InvalidSeriesConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly badSeries = [{ id: 'bad', key: 'category', label: 'Invalid measure' }] as const;
}
