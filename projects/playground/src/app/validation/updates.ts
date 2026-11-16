import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BarChart, type ChartSeries, type PointSelection } from '@mantha911/ng-echarts/bar';
import { deviceRows, deviceSeries, type DeviceRow } from '../fixtures/evilcharts-bar-fixture';
import { SiteAppearance } from '../shell/site-appearance';

@Component({
  selector: 'app-updates',
  imports: [BarChart],
  template: `<main class="utility-page validation-page">
    <h1>Input update validation</h1>
    <p>Change rows, labels, and series to check that selections follow stable identities.</p>
    <section class="validation-controls" aria-label="Chart controls">
      <div class="control-group" role="group" aria-labelledby="updates-controls-0">
        <h2 id="updates-controls-0">Data</h2>
        <div class="control-actions">
          <button type="button" (click)="reorder()">Reorder rows and series</button>
          <button type="button" (click)="rename()">Rename labels</button>
          <button type="button" (click)="replace()">Replace rows and series</button>
          <button class="control-restore" type="button" (click)="restore()">Restore inputs</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="updates-controls-1">
        <h2 id="updates-controls-1">States</h2>
        <div class="control-actions">
          <button type="button" (click)="invalidate()">Invalidate data</button>
        </div>
      </div>
    </section>
    <nec-bar-chart
      title="Updated visits"
      [theme]="theme()"
      description="Stable identities across immutable updates."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series()"
      [animation]="false"
      (pointSelect)="select($event)"
    />
    <div class="validation-results">
      <div>
        <h2>Point selection</h2>
        <p role="status" class="selection">{{ selection() }}</p>
      </div>
    </div>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Updates {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly rows = signal<readonly DeviceRow[]>(deviceRows);
  protected readonly series = signal<readonly ChartSeries<DeviceRow>[]>(deviceSeries);
  protected readonly selection = signal('No selection');
  protected reorder(): void {
    this.rows.update((rows) => [...rows].reverse());
    this.series.update((series) => [...series].reverse());
  }
  protected rename(): void {
    this.rows.update((rows) =>
      rows.map((row) => ({
        ...row,
        month: row.id === 'jan' || row.id === 'feb' ? 'Same month' : row.month,
      })),
    );
    this.series.update((series) =>
      series.map((item) => ({ ...item, label: item.id === 'desktop' ? 'Computers' : item.label })),
    );
  }
  protected replace(): void {
    this.rows.set([
      { id: 'new', month: 'New month', desktop: 0, mobile: -7 },
      { id: 'jan', month: 'January latest', desktop: 1001, mobile: null },
    ]);
    this.series.set([
      { id: 'desktop', key: 'desktop', label: 'Computers' },
      { id: 'new-series', key: 'mobile', label: 'New series' },
    ]);
  }
  protected invalidate(): void {
    this.rows.set([{ id: 'invalid', month: 'Invalid', desktop: Number.NaN, mobile: 1 }]);
  }
  protected restore(): void {
    this.rows.set(deviceRows);
    this.series.set(deviceSeries);
  }
  protected select(point: PointSelection<DeviceRow>): void {
    this.selection.set(
      `${point.rowId}/${point.seriesId}/${point.value}/${point.row.month}/${point.source}`,
    );
  }
}
