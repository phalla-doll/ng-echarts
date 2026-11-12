import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BarChart, type ChartSeries, type PointSelection } from '@ng-echarts/chart-library';
import { deviceRows, deviceSeries, type DeviceRow } from './fixtures/evilcharts-bar-fixture';

@Component({
  selector: 'app-updates',
  imports: [BarChart],
  template: `<main class="utility-page">
    <h1>Input update validation</h1>
    <div class="controls">
      <button type="button" (click)="reorder()">Reorder rows and series</button>
      <button type="button" (click)="rename()">Rename labels</button>
      <button type="button" (click)="replace()">Replace rows and series</button>
      <button type="button" (click)="invalidate()">Invalidate data</button>
      <button type="button" (click)="restore()">Restore inputs</button>
    </div>
    <nec-bar-chart
      title="Updated visits"
      description="Stable identities across immutable updates."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series()"
      [animation]="false"
      (pointSelect)="select($event)"
    />
    <p role="status" class="selection">{{ selection() }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Updates {
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
