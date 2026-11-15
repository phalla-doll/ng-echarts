import { Component } from '@angular/core';
import {
  ComposedChart,
  type ComposedSeries,
  type ComposedValueAxis,
  type ComposedLayout,
  type PointSelection,
} from '@mantha911/ng-echarts/composed';
import {
  ComposedChart as RootComposedChart,
  type ComposedBarSeries,
  type ComposedLineSeries,
  type ComposedAreaSeries,
} from '@mantha911/ng-echarts';
interface Row {
  id: string;
  category: string;
  value: number | null;
  trend: number;
}
@Component({
  imports: [ComposedChart, RootComposedChart],
  template: ` <nec-composed-chart
    [tablePageSize]="50"
    [layout]="layout"
    [valueAxes]="axes"
    title="Mixed"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    (pointSelect)="select($event)"
  />`,
})
export class ComposedConsumer {
  readonly layout: ComposedLayout = 'horizontal';
  readonly axes: readonly ComposedValueAxis[] = [
    { id: 'value', label: 'Value', unit: 'visits' },
    { id: 'trend', label: 'Trend', unit: '%', numberFormatOptions: { style: 'percent' } },
  ];
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', value: 0, trend: 1 }];
  readonly series: readonly ComposedSeries<Row>[] = [
    { id: 'v', key: 'value', label: 'V', kind: 'bar', stack: 'visits' },
    { id: 'area', key: 'value', label: 'Area', kind: 'area', stack: 'total', gradient: true },
    {
      id: 't',
      key: 'trend',
      label: 'T',
      kind: 'line',
      axisId: 'trend',
      smooth: true,
      showPoints: false,
    },
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
// @ts-expect-error Unsupported kinds are rejected.
const badKind: ComposedSeries<Row> = { id: 'v', key: 'value', label: 'V', kind: 'scatter' };
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
const stackedLine: ComposedLineSeries<Row> = {
  id: 't',
  key: 'trend',
  label: 'T',
  kind: 'line',
  // @ts-expect-error Composed stacks belong to bars only.
  stack: 'visits',
};
const numericStack: ComposedBarSeries<Row> = {
  id: 'v',
  key: 'value',
  label: 'V',
  kind: 'bar',
  // @ts-expect-error Stack names are strings.
  stack: 1,
};
void [stackedLine, numericStack];

const invalidArea: ComposedAreaSeries<Row> = {
  id: 'a',
  key: 'value',
  label: 'A',
  kind: 'area',
  // @ts-expect-error Area fills require booleans.
  gradient: 'yes',
};
void invalidArea;
