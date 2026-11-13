import { Component } from '@angular/core';
import {
  ComposedChart,
  type ComposedSeries,
  type PointSelection,
} from '@ng-echarts/chart-library/composed';
import {
  ComposedChart as RootComposedChart,
  type ComposedBarSeries,
  type ComposedLineSeries,
} from '@ng-echarts/chart-library';
interface Row {
  id: string;
  category: string;
  value: number | null;
  trend: number;
}
@Component({
  imports: [ComposedChart, RootComposedChart],
  template: ` <nec-composed-chart
    title="Mixed"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    (pointSelect)="select($event)"
  />`,
})
export class ComposedConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', value: 0, trend: 1 }];
  readonly series: readonly ComposedSeries<Row>[] = [
    { id: 'v', key: 'value', label: 'V', kind: 'bar' },
    { id: 't', key: 'trend', label: 'T', kind: 'line', smooth: true, showPoints: false },
  ];
  select(point: PointSelection<Row>) {
    const row: Row = point.row;
    void row.trend;
  }
}
// @ts-expect-error Numeric measure keys reject text fields.
const badKey: ComposedSeries<Row> = { id: 'v', key: 'category', label: 'V', kind: 'bar' };
// @ts-expect-error The kind discriminator is required.
const missingKind: ComposedSeries<Row> = { id: 'v', key: 'value', label: 'V' };
// @ts-expect-error This increment accepts bar/line, not area.
const badKind: ComposedSeries<Row> = { id: 'v', key: 'value', label: 'V', kind: 'area' };
const badBar: ComposedBarSeries<Row> = {
  id: 'v',
  key: 'value',
  label: 'V',
  kind: 'bar',
  // @ts-expect-error Bar descriptors cannot carry line settings.
  smooth: true,
};
const badLine: ComposedLineSeries<Row> = {
  id: 'v',
  key: 'value',
  label: 'V',
  kind: 'line',
  // @ts-expect-error Line options require booleans.
  showPoints: 'yes',
};
void [badKey, missingKind, badKind, badBar, badLine];
