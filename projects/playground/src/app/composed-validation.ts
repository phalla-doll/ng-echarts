import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ComposedChart,
  type ComposedSeries,
  type PointSelection,
} from '@ng-echarts/chart-library/composed';
import { SiteAppearance } from './site-appearance';
export interface ComposedRow {
  readonly id: string;
  readonly month: string;
  readonly visits: number | null;
  readonly trend: number | null;
}
export const composedValidationRows: readonly ComposedRow[] = [
  { id: 'a', month: 'January', visits: 100, trend: 80 },
  { id: 'b', month: 'February', visits: 200, trend: 140 },
  { id: 'c', month: 'March', visits: null, trend: 0 },
  { id: 'd', month: 'April', visits: -60, trend: null },
  { id: 'e', month: 'May', visits: 120, trend: 40 },
];
export const composedValidationSeries: readonly ComposedSeries<ComposedRow>[] = [
  { id: 'visits', key: 'visits', label: 'Visits', kind: 'bar' },
  { id: 'trend', key: 'trend', label: 'Trend', kind: 'line' },
];
@Component({
  selector: 'app-deferred-composed',
  imports: [ComposedChart],
  template: `<nec-composed-chart
    title="Deferred composed"
    [data]="rows"
    rowIdKey="id"
    categoryKey="month"
    [series]="series"
    [theme]="theme()"
    [animation]="false"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeferredComposed {
  protected readonly rows = composedValidationRows;
  protected readonly series = composedValidationSeries;
  protected readonly theme = inject(SiteAppearance).theme;
}
@Component({
  selector: 'app-composed-validation',
  imports: [ComposedChart, DeferredComposed],
  template: `<main class="utility-page">
    <h1>Composed behavior validation</h1>
    <p>Bars and lines share one visits scale, native controls, and data identities.</p>
    <div class="controls">
      <button type="button" (click)="update()">Update composed values</button>
      <button type="button" (click)="reorder()">Reorder composed inputs</button>
      <button type="button" (click)="switchKind()">Switch series kind</button>
      <button type="button" (click)="togglePoints()">Toggle trend points</button>
      <button type="button" (click)="refreshPalette()">Refresh palette</button>
      <button type="button" [attr.aria-pressed]="loading()" (click)="loading.set(!loading())">
        Loading composed
      </button>
      <button type="button" [attr.aria-pressed]="failure()" (click)="failure.set(!failure())">
        Error composed
      </button>
      <button type="button" (click)="empty()">Empty composed data</button>
      <button type="button" (click)="invalidate()">Invalid composed settings</button>
      <button type="button" (click)="restore()">Restore composed data</button>
      <button type="button" [attr.aria-pressed]="hidden()" (click)="hidden.set(!hidden())">
        Hide composed host
      </button>
      <button type="button" [attr.aria-pressed]="mounted()" (click)="mounted.set(!mounted())">
        Mount composed
      </button>
    </div>
    <div class="primary-composed" [style.width]="hidden() ? '0px' : '100%'" style="overflow:hidden">
      @if (mounted()) {
        <nec-composed-chart
          title="Visits and trend"
          description="Signed, zero, and missing values preserve their raw meaning."
          [data]="rows()"
          rowIdKey="id"
          categoryKey="month"
          [series]="series()"
          [theme]="theme()"
          [themeRevision]="revision()"
          [style.--nec-series-1]="palette()"
          [height]="320"
          [animation]="false"
          [loading]="loading()"
          [error]="error()"
          (pointSelect)="select($event)"
          (legendChange)="legend.set($event.seriesId + '/' + $event.visible)"
        />
      }
    </div>
    <p class="selection" role="status">{{ selection() }}</p>
    <p class="legend-result" role="status">{{ legend() }}</p>
    <section class="deferred-composed">
      <h2>Deferred hydration</h2>
      @defer (hydrate on interaction) {
        <app-deferred-composed />
      }
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposedValidation {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly rows = signal<readonly ComposedRow[]>(composedValidationRows);
  protected readonly series = signal(composedValidationSeries);
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly error = computed(() => (this.failure() ? 'Sample composed error.' : null));
  protected readonly mounted = signal(true);
  protected readonly hidden = signal(false);
  protected readonly selection = signal('No selection');
  protected readonly legend = signal('No legend changes');
  protected readonly revision = signal(0);
  protected readonly palette = signal('');
  protected select(point: PointSelection<ComposedRow>) {
    this.selection.set(`${point.rowId}/${point.seriesId}/${point.value}/${point.source}`);
  }
  protected update() {
    this.rows.update((rows) =>
      rows.map((row, index) => (index === 0 ? { ...row, visits: 110, trend: 90 } : row)),
    );
  }
  protected reorder() {
    this.rows.update((rows) => [...rows].reverse());
    this.series.update((series) => [...series].reverse());
  }
  protected switchKind() {
    this.series.update((series) =>
      series.map((item) =>
        item.id === 'visits'
          ? {
              id: item.id,
              key: item.key,
              label: item.label,
              kind: item.kind === 'bar' ? 'line' : 'bar',
            }
          : item,
      ),
    );
  }
  protected togglePoints() {
    this.series.update((series) =>
      series.map((item) =>
        item.kind === 'line' ? { ...item, showPoints: !(item.showPoints ?? true) } : item,
      ),
    );
  }
  protected refreshPalette() {
    this.palette.set('#2563eb');
    this.revision.update((value) => value + 1);
  }
  protected empty() {
    this.rows.set([]);
  }
  protected invalidate() {
    this.series.set([
      {
        id: 'visits',
        key: 'visits',
        label: 'Visits',
        kind: 'area',
      } as unknown as ComposedSeries<ComposedRow>,
    ]);
  }
  protected restore() {
    this.rows.set(composedValidationRows);
    this.series.set(composedValidationSeries);
    this.loading.set(false);
    this.failure.set(false);
  }
}
