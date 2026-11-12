import { Component } from '@angular/core';
import { BarChart, ChartFrame, type ChartSeries } from '@ng-echarts/chart-library';
import type { ChartSeries as SharedSeries } from '@ng-echarts/chart-library/core';

@Component({
  imports: [BarChart, ChartFrame],
  template: `<nec-chart-frame title="Compatibility frame" />
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
import type { BarChart as CoreBar } from '@ng-echarts/chart-library/core';
// @ts-expect-error Source internals are not exported package entry points.
import type { BarChart as InternalBar } from '@ng-echarts/chart-library/bar/src/lib/bar-chart';
