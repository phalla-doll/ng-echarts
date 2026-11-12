import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';

@Component({
  selector: 'app-deferred-chart',
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Deferred visits"
    description="Interact with its controls to hydrate this server-rendered chart."
    [data]="rows"
    rowIdKey="id"
    categoryKey="month"
    [series]="series"
    [animation]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredChart {
  protected readonly rows = deviceRows;
  protected readonly series = deviceSeries;
}
