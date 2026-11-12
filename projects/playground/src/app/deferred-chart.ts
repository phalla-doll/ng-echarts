import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library/bar';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';
import { SiteAppearance } from './site-appearance';

@Component({
  selector: 'app-deferred-chart',
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Deferred visits"
    [theme]="theme()"
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
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly rows = deviceRows;
  protected readonly series = deviceSeries;
}
