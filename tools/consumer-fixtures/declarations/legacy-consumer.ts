import { Component } from '@angular/core';
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  ChartFrame,
  type ChartSeries,
} from '@mantha911/ng-echarts';
import type { ChartSeries as SharedSeries } from '@mantha911/ng-echarts/core';

@Component({
  imports: [BarChart, LineChart, AreaChart, PieChart, ChartFrame],
  template: `<nec-pie-chart
      title="Compatibility pie"
      [data]="rows"
      rowIdKey="id"
      categoryKey="month"
      [measure]="series[0]!"
    />
    <nec-chart-frame title="Compatibility frame" />
    <nec-area-chart
      title="Compatibility area"
      [data]="rows"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
    />
    <nec-line-chart
      title="Compatibility line"
      [data]="rows"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
    />
    <nec-bar-chart
      title="Compatibility bar"
      [data]="rows"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
    />`,
})
export class LegacyConsumer {
  readonly rows = [{ id: 'jan', month: 'January', visits: 1 }];
  readonly series: readonly ChartSeries<(typeof this.rows)[number]>[] = [
    { id: 'visits', key: 'visits', label: 'Visits' },
  ];
  readonly shared: readonly SharedSeries<(typeof this.rows)[number]>[] = this.series;
}

// @ts-expect-error The shared entry does not expose a chart renderer/component.
import type { BarChart as CoreBar } from '@mantha911/ng-echarts/core';
// @ts-expect-error Source internals are not exported package entry points.
import type { BarChart as InternalBar } from '@mantha911/ng-echarts/bar/src/lib/bar-chart';
