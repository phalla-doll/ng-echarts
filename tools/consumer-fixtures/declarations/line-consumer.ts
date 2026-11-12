import { Component } from '@angular/core';
import { LineChart, type ChartSeries, type PointSelection } from '@ng-echarts/chart-library/line';
interface Row {
  id: string;
  label: string;
  value: number | null;
}
@Component({
  imports: [LineChart],
  template: `<nec-line-chart
    title="Packed line"
    [data]="rows"
    rowIdKey="id"
    categoryKey="label"
    [series]="series"
    [smooth]="true"
    [showPoints]="false"
    (pointSelect)="select($event)"
  />`,
})
export class LineConsumer {
  readonly rows: readonly Row[] = [
    { id: 'a', label: 'A', value: 0 },
    { id: 'b', label: 'B', value: null },
  ];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'v', key: 'value', label: 'Value' }];
  select(point: PointSelection<Row>) {
    const value: number | null = point.row.value;
    void value;
  }
}
