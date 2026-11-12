import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PieChart, type ChartMeasure, type PointSelection } from '@ng-echarts/chart-library/pie';
import { SiteAppearance } from './site-appearance';
interface Row {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}
export const pieValidationRows: readonly Row[] = [
  { id: 'a', month: 'January', desktop: 100, mobile: 40 },
  { id: 'b', month: 'February', desktop: 200, mobile: 70 },
  { id: 'c', month: 'March', desktop: null, mobile: 0 },
  { id: 'd', month: 'April', desktop: 0, mobile: 40 },
  { id: 'e', month: 'May', desktop: 80, mobile: 20 },
];
const measure: ChartMeasure<Row> = { id: 'visits', key: 'desktop', label: 'Visits' };
@Component({
  selector: 'app-deferred-pie',
  imports: [PieChart],
  template: `<nec-pie-chart
    title="Deferred pie"
    [data]="rows"
    rowIdKey="id"
    categoryKey="month"
    [measure]="measure"
    [theme]="theme()"
    [animation]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredPie {
  protected readonly rows = pieValidationRows;
  protected readonly measure = measure;
  protected readonly theme = inject(SiteAppearance).theme;
}
@Component({
  selector: 'app-pie-validation',
  imports: [PieChart, DeferredPie],
  template: `<main class="utility-page">
    <h1>Pie behavior validation</h1>
    <p>
      Exercise category visibility, zero totals, numeric formatting, hydration, and lifecycle
      behavior.
    </p>
    <div class="controls">
      <button type="button" [attr.aria-pressed]="donut()" (click)="donut.set(!donut())">
        Donut view
      </button>
      <button type="button" [attr.aria-pressed]="labels()" (click)="labels.set(!labels())">
        Category labels
      </button>
      <button type="button" (click)="zero()">Zero pie data</button>
      <button type="button" (click)="negative()">Negative pie data</button>
      <button type="button" (click)="update()">Update pie values</button>
      <button type="button" (click)="reorder()">Reorder pie inputs</button>
      <button type="button" [attr.aria-pressed]="currency()" (click)="currency.set(!currency())">
        Currency values
      </button>
      <button type="button" [attr.aria-pressed]="loading()" (click)="loading.set(!loading())">
        Loading pie
      </button>
      <button type="button" [attr.aria-pressed]="failure()" (click)="failure.set(!failure())">
        Error pie
      </button>
      <button type="button" (click)="empty()">Empty pie data</button>
      <button type="button" (click)="invalidate()">Invalid pie data</button>
      <button type="button" (click)="restore()">Restore pie data</button>
      <button type="button" [attr.aria-pressed]="hidden()" (click)="hidden.set(!hidden())">
        Hide pie host
      </button>
      <button type="button" [attr.aria-pressed]="mounted()" (click)="mounted.set(!mounted())">
        Mount pie
      </button>
    </div>
    <div class="primary-pie" [style.width]="hidden() ? '0px' : '100%'" style="overflow:hidden">
      @if (mounted()) {
        <nec-pie-chart
          title="Pie visits"
          description="Missing observations have no sector; zero values remain available in the table."
          [data]="rows()"
          rowIdKey="id"
          categoryKey="month"
          [measure]="measure"
          [theme]="theme()"
          [innerRadius]="donut() ? 0.6 : 0"
          [showLabels]="labels()"
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
    <section class="deferred-pie">
      <h2>Deferred hydration</h2>
      @defer (hydrate on interaction) {
        <app-deferred-pie />
      }
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieValidation {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly rows = signal<readonly Row[]>(pieValidationRows);
  protected readonly measure = measure;
  protected readonly donut = signal(false);
  protected readonly labels = signal(false);
  protected readonly currency = signal(false);
  protected readonly formatOptions = computed<Intl.NumberFormatOptions | undefined>(() =>
    this.currency() ? { style: 'currency', currency: 'USD' } : undefined,
  );
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly hidden = signal(false);
  protected readonly mounted = signal(true);
  protected readonly error = computed(() => (this.failure() ? 'Sample pie error.' : null));
  protected readonly selection = signal('No point selected');
  protected readonly legendResult = signal('No legend change');
  protected update() {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, desktop: row.desktop === null ? null : row.desktop + 10 })),
    );
  }
  protected reorder() {
    this.rows.update((rows) => [...rows].reverse());
  }
  protected zero() {
    this.rows.set(pieValidationRows.map((row) => ({ ...row, desktop: 0 })));
  }
  protected negative() {
    this.rows.set([{ id: 'bad', month: 'Invalid', desktop: -1, mobile: 0 }]);
  }
  protected empty() {
    this.rows.set([]);
  }
  protected invalidate() {
    this.rows.set([{ id: 'bad', month: 'Invalid', desktop: Number.NaN, mobile: 1 }]);
  }
  protected restore() {
    this.rows.set(pieValidationRows);
    this.loading.set(false);
    this.failure.set(false);
  }
  protected select(point: PointSelection<Row>) {
    this.selection.set(`${point.rowId}/${point.seriesId}/${point.value}/${point.source}`);
  }
  protected legend(event: { readonly rowId: string; readonly visible: boolean }) {
    this.legendResult.set(`${event.rowId}/${event.visible}`);
  }
}
