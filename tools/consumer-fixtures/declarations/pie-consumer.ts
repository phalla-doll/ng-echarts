import { Component } from '@angular/core';
import {
  PieChart,
  type ChartMeasure,
  type CategoryVisibilityChange,
  type PointSelection,
} from '@mantha911/ng-echarts/pie';
interface Reading {
  id: string;
  label: string;
  value: number | null;
}
@Component({
  selector: 'consumer-pie',
  imports: [PieChart],
  template: `<nec-pie-chart
    title="Pie"
    [data]="data"
    rowIdKey="id"
    categoryKey="label"
    [measure]="measure"
    [innerRadius]="0.6"
    [showLabels]="true"
    (legendChange)="legend($event)"
    (pointSelect)="select($event)"
  />`,
})
export class ConsumerPie {
  readonly data: readonly Reading[] = [{ id: 'a', label: 'A', value: 1 }];
  readonly measure: ChartMeasure<Reading> = { id: 'v', key: 'value', label: 'Value' };
  legend(event: CategoryVisibilityChange): void {
    const id: string = event.rowId;
    void id;
  }
  select(event: PointSelection<Reading>): void {
    const row: Reading = event.row;
    void row;
  }
}
