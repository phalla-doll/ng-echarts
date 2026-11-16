import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ComposedChart,
  type ComposedSeries,
  type PointSelection,
  type ComposedValueAxis,
} from '@mantha911/ng-echarts/composed';
import { SiteAppearance } from '../shell/site-appearance';
export interface ComposedRow {
  readonly id: string;
  readonly month: string;
  readonly visits: number | null;
  readonly mobile?: number | null;
  readonly trend: number | null;
}
export const composedValidationRows: readonly ComposedRow[] = [
  { id: 'a', month: 'January', visits: 100, mobile: 40, trend: 80 },
  { id: 'b', month: 'February', visits: 200, mobile: -30, trend: 140 },
  { id: 'c', month: 'March', visits: null, mobile: 0, trend: 0 },
  { id: 'd', month: 'April', visits: -60, mobile: -20, trend: null },
  { id: 'e', month: 'May', visits: 120, mobile: null, trend: 40 },
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
  template: `<main class="utility-page validation-page">
    <h1>Composed behavior validation</h1>
    <p>Bars and lines share one visits scale, native controls, and data identities.</p>
    <section class="validation-controls" aria-label="Chart controls">
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-0">
        <h2 id="composed-validation-controls-0">Appearance</h2>
        <div class="control-actions">
          <button
            type="button"
            [attr.aria-pressed]="layout() === 'horizontal'"
            (click)="toggleLayout()"
          >
            Horizontal composed
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" (click)="refreshPalette()">Refresh palette</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-1">
        <h2 id="composed-validation-controls-1">Series</h2>
        <div class="control-actions">
          <button type="button" (click)="switchKind()">Switch series kind</button>
          <button type="button" (click)="togglePoints()">Toggle trend points</button>
          <button type="button" (click)="stackBars()">Use stacked bars</button>
          <button type="button" (click)="areaSeries()">Use area series</button>
          <button type="button" (click)="stackAreas()">Use stacked areas</button>
          <button type="button" (click)="toggleFill()">Toggle area fill</button>
          <button type="button" (click)="separateStacks()">Separate bar stacks</button>
          <button type="button" (click)="ungroupBars()">Use unstacked bars</button>
          <button type="button" (click)="dualAxes()">Use dual axes</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-2">
        <h2 id="composed-validation-controls-2">Data</h2>
        <div class="control-actions">
          <button type="button" (click)="update()">Update composed values</button>
          <button type="button" (click)="reorder()">Reorder composed inputs</button>
          <button class="control-restore" type="button" (click)="restore()">
            Restore composed data
          </button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-3">
        <h2 id="composed-validation-controls-3">States</h2>
        <div class="control-actions">
          <button type="button" [attr.aria-pressed]="loading()" (click)="loading.set(!loading())">
            Loading composed
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="failure()" (click)="failure.set(!failure())">
            Error composed
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" (click)="empty()">Empty composed data</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-4">
        <h2 id="composed-validation-controls-4">Invalid inputs</h2>
        <div class="control-actions">
          <button type="button" (click)="invalidLayout()">Invalid composed layout</button>
          <button type="button" (click)="crossAxisStack()">Cross-axis stack</button>
          <button type="button" (click)="invalidAxisFormatter()">Invalid axis formatter</button>
          <button type="button" (click)="invalidArea()">Invalid area settings</button>
          <button type="button" (click)="invalidateStack()">Invalid composed stack</button>
          <button type="button" (click)="invalidate()">Invalid composed settings</button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="composed-validation-controls-5">
        <h2 id="composed-validation-controls-5">Lifecycle</h2>
        <div class="control-actions">
          <button type="button" [attr.aria-pressed]="hidden()" (click)="hidden.set(!hidden())">
            Hide composed host
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="mounted()" (click)="mounted.set(!mounted())">
            Mount composed
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </section>
    <div class="primary-composed" [style.width]="hidden() ? '0px' : '100%'" style="overflow:hidden">
      @if (mounted()) {
        <nec-composed-chart
          title="Visits and trend"
          description="Signed, zero, and missing values preserve their raw meaning. Bar and area stacks have separate groups; missing values stay missing and Trend is an independent supplied visits value."
          [data]="rows()"
          rowIdKey="id"
          categoryKey="month"
          [series]="series()"
          [layout]="layout()"
          [valueAxes]="valueAxes()"
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
      } @else {
        <div class="validation-empty">
          <h2>Chart unmounted</h2>
          <p>Use “Mount composed” to bring the chart back.</p>
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
        <p class="legend-result" role="status">{{ legend() }}</p>
      </div>
    </div>
    <section class="deferred-composed validation-scenario">
      <h2>Deferred hydration</h2>
      <p>Interact with the chart below to activate its server-rendered controls.</p>
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
  protected readonly layout = signal<'vertical' | 'horizontal'>('vertical');
  protected readonly valueAxes = signal<readonly ComposedValueAxis[] | null>(null);
  protected dualAxes(): void {
    this.rows.set([
      { id: 'a', month: 'January', visits: 1200, trend: 0.12 },
      { id: 'b', month: 'February', visits: 1800, trend: 0.18 },
      { id: 'c', month: 'March', visits: 0, trend: 0 },
      { id: 'd', month: 'April', visits: null, trend: null },
      { id: 'e', month: 'May', visits: -60, trend: 0.2 },
    ]);
    this.series.set([
      { id: 'visits', key: 'visits', label: 'Revenue', kind: 'bar', stack: 'income' },
      { id: 'trend', key: 'trend', label: 'Conversion', kind: 'line', axisId: 'conversion' },
    ]);
    this.valueAxes.set([
      {
        id: 'revenue',
        label: 'Revenue',
        unit: 'USD',
        numberFormatOptions: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
      },
      {
        id: 'conversion',
        label: 'Conversion',
        unit: '%',
        numberFormatOptions: { style: 'percent', maximumFractionDigits: 0 },
      },
    ]);
  }
  protected crossAxisStack(): void {
    this.series.update((series) =>
      series.map((item) =>
        item.id === 'trend'
          ? {
              id: item.id,
              key: item.key,
              label: item.label,
              axisId: item.axisId,
              kind: 'bar',
              stack: 'income',
            }
          : item,
      ),
    );
  }
  protected invalidAxisFormatter(): void {
    this.valueAxes.update(
      (axes) =>
        axes?.map((axis, index) =>
          index
            ? {
                ...axis,
                valueFormatter: () => {
                  throw Error('Invalid formatter');
                },
              }
            : axis,
        ) ?? null,
    );
  }
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
  protected toggleLayout() {
    this.layout.update((layout) => (layout === 'horizontal' ? 'vertical' : 'horizontal'));
  }
  protected invalidLayout() {
    this.layout.set('diagonal' as 'horizontal');
  }
  protected stackBars() {
    this.series.set([
      { id: 'visits', key: 'visits', label: 'Visits', kind: 'bar', stack: 'visits' },
      { id: 'mobile', key: 'mobile', label: 'Mobile', kind: 'bar', stack: 'visits' },
      { id: 'trend', key: 'trend', label: 'Trend', kind: 'line' },
    ]);
  }
  protected areaSeries() {
    this.series.set([
      { id: 'visits', key: 'visits', label: 'Visits', kind: 'area', gradient: false },
      { id: 'mobile', key: 'mobile', label: 'Mobile', kind: 'bar', stack: 'visits' },
      { id: 'trend', key: 'trend', label: 'Trend', kind: 'line' },
    ]);
  }
  protected stackAreas() {
    this.series.set([
      {
        id: 'visits',
        key: 'visits',
        label: 'Visits',
        kind: 'area',
        stack: 'visits',
        gradient: false,
      },
      {
        id: 'mobile',
        key: 'mobile',
        label: 'Mobile',
        kind: 'area',
        stack: 'visits',
        gradient: false,
      },
      { id: 'trend', key: 'trend', label: 'Trend', kind: 'line' },
    ]);
  }
  protected invalidArea() {
    this.series.update((series) =>
      series.map((item) =>
        item.id === 'visits'
          ? ({ ...item, kind: 'area', gradient: 'bad' } as unknown as ComposedSeries<ComposedRow>)
          : item,
      ),
    );
  }
  protected toggleFill() {
    this.series.update((series) =>
      series.map((item) =>
        item.kind === 'area' ? { ...item, gradient: !(item.gradient ?? true) } : item,
      ),
    );
  }
  protected separateStacks() {
    this.series.update((series) =>
      series.map((item) => (item.kind !== 'line' ? { ...item, stack: item.id } : item)),
    );
  }
  protected ungroupBars() {
    this.series.update((series) =>
      series.map((item) => (item.kind !== 'line' ? { ...item, stack: undefined } : item)),
    );
  }
  protected invalidateStack() {
    this.series.set([{ id: 'visits', key: 'visits', label: 'Visits', kind: 'bar', stack: '' }]);
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
        kind: 'scatter',
      } as unknown as ComposedSeries<ComposedRow>,
    ]);
  }
  protected restore() {
    this.valueAxes.set(null);
    this.layout.set('vertical');
    this.rows.set(composedValidationRows);
    this.series.set(composedValidationSeries);
    this.loading.set(false);
    this.failure.set(false);
  }
}
