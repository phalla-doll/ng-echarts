import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LineChart, type ChartSeries, type PointSelection } from '@mantha911/ng-echarts/line';
import { SiteAppearance } from '../shell/site-appearance';
interface Row {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}
export const lineValidationRows: readonly Row[] = [
  { id: 'a', month: 'January', desktop: 100, mobile: 40 },
  { id: 'b', month: 'February', desktop: 200, mobile: 70 },
  { id: 'c', month: 'March', desktop: null, mobile: 0 },
  { id: 'd', month: 'April', desktop: 160, mobile: null },
  { id: 'e', month: 'May', desktop: 80, mobile: -20 },
];
const series: readonly ChartSeries<Row>[] = [
  { id: 'desktop', key: 'desktop', label: 'Desktop' },
  { id: 'mobile', key: 'mobile', label: 'Mobile' },
];
@Component({
  selector: 'app-deferred-line',
  imports: [LineChart],
  template: `<nec-line-chart
    title="Deferred line"
    [data]="rows"
    rowIdKey="id"
    categoryKey="month"
    [series]="series"
    [theme]="theme()"
    [animation]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredLine {
  protected readonly rows = lineValidationRows;
  protected readonly series = series;
  protected readonly theme = inject(SiteAppearance).theme;
}
@Component({
  selector: 'app-line-validation',
  imports: [LineChart, DeferredLine],
  template: `<main class="utility-page validation-page">
    <h1>Line behavior validation</h1>
    <p>Exercise gaps, numeric formatting, immutable updates, hydration, and lifecycle behavior.</p>
    <section class="validation-controls" aria-label="Chart controls">
      <div class="control-group" role="group" aria-labelledby="line-validation-controls-0">
        <h2 id="line-validation-controls-0">Appearance</h2>
        <div class="control-actions">
          <button type="button" [attr.aria-pressed]="smooth()" (click)="smooth.set(!smooth())">
            Smooth lines
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="points()" (click)="points.set(!points())">
            Show points
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button
            type="button"
            [attr.aria-pressed]="currency()"
            (click)="currency.set(!currency())"
          >
            Currency values
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="line-validation-controls-1">
        <h2 id="line-validation-controls-1">Data</h2>
        <div class="control-actions">
          <button type="button" (click)="update()">Update line values</button>
          <button type="button" (click)="refreshPalette()">Refresh palette</button>
          <button type="button" (click)="reorder()">Reorder line inputs</button>
          <button class="control-restore" type="button" (click)="restore()">
            Restore line data
          </button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="line-validation-controls-2">
        <h2 id="line-validation-controls-2">States</h2>
        <div class="control-actions">
          <button type="button" [attr.aria-pressed]="loading()" (click)="loading.set(!loading())">
            Loading line
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="failure()" (click)="failure.set(!failure())">
            Error line
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" (click)="empty()">Empty line data</button>
          <button type="button" (click)="invalidate()">Invalid line data</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="line-validation-controls-3">
        <h2 id="line-validation-controls-3">Lifecycle</h2>
        <div class="control-actions">
          <button type="button" [attr.aria-pressed]="hidden()" (click)="hidden.set(!hidden())">
            Hide line host
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="mounted()" (click)="mounted.set(!mounted())">
            Mount line
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </section>
    <div class="primary-line" [style.width]="hidden() ? '0px' : '100%'" style="overflow:hidden">
      @if (mounted()) {
        <nec-line-chart
          title="Line visits"
          description="Missing observations are gaps; zero and negative values remain numeric."
          [data]="rows()"
          rowIdKey="id"
          categoryKey="month"
          [series]="series()"
          [theme]="theme()"
          [themeRevision]="themeRevision()"
          [style.--nec-series-1]="palette()"
          [smooth]="smooth()"
          [showPoints]="points()"
          [loading]="loading()"
          [error]="error()"
          [numberFormatOptions]="formatOptions()"
          [animation]="false"
          [height]="320"
          (pointSelect)="select($event)"
          (legendChange)="legend($event)"
        />
      } @else {
        <div class="validation-empty">
          <h2>Chart unmounted</h2>
          <p>Use “Mount line” to bring the chart back.</p>
        </div>
      }
    </div>
    <div class="validation-results">
      <div>
        <h2>Point selection</h2>
        <p class="selection" role="status">{{ selection() }}</p>
      </div>
      <div>
        <h2>Legend change</h2>
        <p class="legend-result" role="status">{{ legendResult() }}</p>
      </div>
    </div>
    <section class="deferred-line validation-scenario">
      <h2>Deferred hydration</h2>
      <p>Interact with the chart below to activate its server-rendered controls.</p>
      @defer (hydrate on interaction) {
        <app-deferred-line />
      }
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineValidation {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly themeRevision = signal(0);
  protected readonly palette = signal('');
  protected refreshPalette() {
    this.palette.set('#2563eb');
    this.themeRevision.update((revision) => revision + 1);
  }
  protected readonly rows = signal<readonly Row[]>(lineValidationRows);
  protected readonly series = signal(series);
  protected readonly smooth = signal(false);
  protected readonly points = signal(true);
  protected readonly currency = signal(false);
  protected readonly formatOptions = computed<Intl.NumberFormatOptions | undefined>(() =>
    this.currency() ? { style: 'currency', currency: 'USD' } : undefined,
  );
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly hidden = signal(false);
  protected readonly mounted = signal(true);
  protected readonly error = computed(() => (this.failure() ? 'Sample line error.' : null));
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
    this.rows.set(lineValidationRows);
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
