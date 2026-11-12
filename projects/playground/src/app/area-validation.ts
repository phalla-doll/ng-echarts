import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AreaChart, type ChartSeries, type PointSelection } from '@ng-echarts/chart-library/area';
import { SiteAppearance } from './site-appearance';
interface Row {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}
export const areaValidationRows: readonly Row[] = [
  { id: 'a', month: 'January', desktop: 100, mobile: 40 },
  { id: 'b', month: 'February', desktop: 200, mobile: 70 },
  { id: 'c', month: 'March', desktop: null, mobile: 0 },
  { id: 'd', month: 'April', desktop: -160, mobile: -40 },
  { id: 'e', month: 'May', desktop: 80, mobile: -20 },
];
const series: readonly ChartSeries<Row>[] = [
  { id: 'desktop', key: 'desktop', label: 'Desktop' },
  { id: 'mobile', key: 'mobile', label: 'Mobile' },
];
@Component({
  selector: 'app-deferred-area',
  imports: [AreaChart],
  template: `<nec-area-chart
    title="Deferred area"
    [data]="rows"
    rowIdKey="id"
    categoryKey="month"
    [series]="series"
    [theme]="theme()"
    [animation]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredArea {
  protected readonly rows = areaValidationRows;
  protected readonly series = series;
  protected readonly theme = inject(SiteAppearance).theme;
}
@Component({
  selector: 'app-area-validation',
  imports: [AreaChart, DeferredArea],
  template: `<main class="utility-page">
    <h1>Area behavior validation</h1>
    <p>Exercise gaps, numeric formatting, immutable updates, hydration, and lifecycle behavior.</p>
    <div class="controls">
      <button type="button" [attr.aria-pressed]="stacked()" (click)="stacked.set(!stacked())">
        Stack areas
      </button>
      <button type="button" [attr.aria-pressed]="gradient()" (click)="gradient.set(!gradient())">
        Gradient fills
      </button>
      <button type="button" [attr.aria-pressed]="smooth()" (click)="smooth.set(!smooth())">
        Smooth areas
      </button>
      <button type="button" [attr.aria-pressed]="points()" (click)="points.set(!points())">
        Show points
      </button>
      <button type="button" (click)="update()">Update area values</button>
      <button type="button" (click)="reorder()">Reorder area inputs</button>
      <button type="button" [attr.aria-pressed]="currency()" (click)="currency.set(!currency())">
        Currency values
      </button>
      <button type="button" [attr.aria-pressed]="loading()" (click)="loading.set(!loading())">
        Loading area
      </button>
      <button type="button" [attr.aria-pressed]="failure()" (click)="failure.set(!failure())">
        Error area
      </button>
      <button type="button" (click)="empty()">Empty area data</button>
      <button type="button" (click)="invalidate()">Invalid area data</button>
      <button type="button" (click)="restore()">Restore area data</button>
      <button type="button" [attr.aria-pressed]="hidden()" (click)="hidden.set(!hidden())">
        Hide area host
      </button>
      <button type="button" [attr.aria-pressed]="mounted()" (click)="mounted.set(!mounted())">
        Mount area
      </button>
    </div>
    <div class="primary-area" [style.width]="hidden() ? '0px' : '100%'" style="overflow:hidden">
      @if (mounted()) {
        <nec-area-chart
          title="Area visits"
          description="Missing observations are gaps; zero and negative values remain numeric."
          [data]="rows()"
          rowIdKey="id"
          categoryKey="month"
          [series]="series()"
          [theme]="theme()"
          [smooth]="smooth()"
          [showPoints]="points()"
          [stacked]="stacked()"
          [gradient]="gradient()"
          [loading]="loading()"
          [error]="error()"
          [numberFormatOptions]="formatOptions()"
          [animation]="false"
          [height]="320"
          (pointSelect)="select($event)"
          (legendChange)="legend($event)"
        />
      }
    </div>
    <p class="selection" role="status">{{ selection() }}</p>
    <p class="legend-result" role="status">{{ legendResult() }}</p>
    <section class="deferred-area">
      <h2>Deferred hydration</h2>
      @defer (hydrate on interaction) {
        <app-deferred-area />
      }
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaValidation {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly rows = signal<readonly Row[]>(areaValidationRows);
  protected readonly series = signal(series);
  protected readonly smooth = signal(false);
  protected readonly points = signal(false);
  protected readonly stacked = signal(true);
  protected readonly gradient = signal(true);
  protected readonly currency = signal(false);
  protected readonly formatOptions = computed<Intl.NumberFormatOptions | undefined>(() =>
    this.currency() ? { style: 'currency', currency: 'USD' } : undefined,
  );
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly hidden = signal(false);
  protected readonly mounted = signal(true);
  protected readonly error = computed(() => (this.failure() ? 'Sample area error.' : null));
  protected readonly selection = signal('No point selected');
  protected readonly legendResult = signal('No legend change');
  protected update() {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, desktop: row.desktop === null ? null : row.desktop + 10 })),
    );
  }
  protected reorder() {
    this.rows.update((rows) => [...rows].reverse());
    this.series.update((items) => [...items].reverse());
  }
  protected empty() {
    this.rows.set([]);
  }
  protected invalidate() {
    this.rows.set([{ id: 'bad', month: 'Invalid', desktop: Number.NaN, mobile: 1 }]);
  }
  protected restore() {
    this.rows.set(areaValidationRows);
    this.series.set(series);
    this.loading.set(false);
    this.failure.set(false);
  }
  protected select(point: PointSelection<Row>) {
    this.selection.set(`${point.rowId}/${point.seriesId}/${point.value}/${point.source}`);
  }
  protected legend(event: { readonly seriesId: string; readonly visible: boolean }) {
    this.legendResult.set(`${event.seriesId}/${event.visible}`);
  }
}
