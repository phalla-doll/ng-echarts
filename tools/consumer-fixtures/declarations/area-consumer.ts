import { Component } from '@angular/core';
import { AreaChart, type ChartSeries, type PointSelection } from '@mantha911/ng-echarts/area';
interface Row {
  id: string;
  label: string;
  value: number | null;
}
@Component({
  imports: [AreaChart],
  template: `<nec-area-chart
    title="Packed area"
    [data]="rows"
    rowIdKey="id"
    categoryKey="label"
    [series]="series"
    [stacked]="true"
    [gradient]="true"
    (pointSelect)="select($event)"
  />`,
})
export class AreaConsumer {
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
