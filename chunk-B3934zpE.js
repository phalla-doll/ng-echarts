import{t as hn}from"./chunk-Dr3H5Qd6.js";import{D as HI,Ln as wT,Q as Og,Rn as wi,a as Ag,p as Cl}from"./chunk-BCV1fTjr.js";var l=`import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ComposedChart, type ComposedSeries } from '@mantha911/ng-echarts/composed';
import { BarChart } from '@mantha911/ng-echarts/bar';
import {
  CategoryRange,
  type CategoryRangeSelection,
  type CategoryRangeCancellation,
} from '@mantha911/ng-echarts/interaction';
import type { ChartSeries, ChartTheme, PointSelection } from '@mantha911/ng-echarts/core';

export interface DashboardMonth {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}

export type DashboardWindow = { readonly from: string; readonly to: string } | null;

/** Stable endpoint IDs follow supplied order; removing either endpoint restores the full window. */
export function reconcileDashboardWindow(
  rows: readonly DashboardMonth[],
  window: DashboardWindow,
): DashboardWindow {
  if (window === null) return null;
  const from = rows.findIndex((row) => row.id === window.from);
  const to = rows.findIndex((row) => row.id === window.to);
  if (from < 0 || to < 0) return null;
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  if (start === 0 && end === rows.length - 1) return null;
  return from <= to ? window : { from: window.to, to: window.from };
}

export function dashboardWindowRows<T extends DashboardMonth>(
  rows: readonly T[],
  window: DashboardWindow,
): readonly T[] {
  const current = reconcileDashboardWindow(rows, window);
  return current === null
    ? rows
    : rows.slice(
        rows.findIndex((row) => row.id === current.from),
        rows.findIndex((row) => row.id === current.to) + 1,
      );
}

/** Zoom/pan clamp to supplied rows, preserving size at either boundary. */
export function moveDashboardWindow(
  rows: readonly DashboardMonth[],
  window: DashboardWindow,
  action: 'in' | 'out' | 'previous' | 'next',
  anchor: string | null = null,
): DashboardWindow {
  if (!rows.length) return null;
  const current = dashboardWindowRows(rows, window);
  const first = rows.findIndex((row) => row.id === current[0]!.id);
  const size = current.length;
  const count =
    action === 'in'
      ? Math.max(1, Math.ceil(size / 2))
      : action === 'out'
        ? Math.min(rows.length, size * 2)
        : size;
  const selected = current.findIndex((row) => row.id === anchor);
  const center = first + (selected < 0 ? Math.floor((size - 1) / 2) : selected);
  const requested =
    action === 'previous'
      ? first - size
      : action === 'next'
        ? first + size
        : center - Math.floor((count - 1) / 2);
  const start = Math.max(0, Math.min(rows.length - count, requested));
  return count === rows.length ? null : { from: rows[start]!.id, to: rows[start + count - 1]!.id };
}

/** A trailing mean requires every device observation in its supplied-order window. */
export function dashboardRows(data: readonly DashboardMonth[]) {
  return data.map((row, index) => {
    const window = data.slice(Math.max(0, index - 2), index + 1);
    const complete = window.every((item) => item.desktop !== null && item.mobile !== null);
    return {
      ...row,
      trend: complete
        ? window.reduce((sum, item) => sum + item.desktop! + item.mobile!, 0) / window.length
        : null,
    };
  });
}

/** Partial aggregates are explicitly labelled; no observations is missing, never zero. */
export function dashboardBreakdown(data: readonly DashboardMonth[]) {
  return (['desktop', 'mobile'] as const).map((id) => {
    const observations = data.flatMap((row) => (row[id] === null ? [] : [row[id]]));
    return {
      id,
      device: id === 'desktop' ? 'Desktop' : 'Mobile',
      visits: observations.length ? observations.reduce((sum, value) => sum + value, 0) : null,
      missing: data.length - observations.length,
    };
  });
}

@Component({
  selector: 'app-composed-dashboard',
  imports: [ComposedChart, BarChart, CategoryRange],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <fieldset class="dashboard-window-controls">
      <legend>Visible months</legend>
      <label
        >From
        <select
          #from
          [value]="visibleRows()[0]?.id ?? ''"
          [disabled]="!data().length"
          [style.color-scheme]="theme()"
          (change)="changeWindowBound('from', from.value)"
        >
          @for (row of data(); track row.id) {
            <option [value]="row.id" [selected]="row.id === visibleRows()[0]?.id">
              {{ row.month }}
            </option>
          }
        </select>
      </label>
      <label
        >To
        <select
          #to
          [value]="visibleRows().at(-1)?.id ?? ''"
          [disabled]="!data().length"
          [style.color-scheme]="theme()"
          (change)="changeWindowBound('to', to.value)"
        >
          @for (row of data(); track row.id) {
            <option [value]="row.id" [selected]="row.id === visibleRows().at(-1)?.id">
              {{ row.month }}
            </option>
          }
        </select>
      </label>
      <div class="dashboard-window-actions">
        <button
          #overviewRange
          type="button"
          [attr.aria-disabled]="visibleRows().length < 2 ? 'true' : null"
          [attr.aria-pressed]="rangeTarget() === 'overview'"
          (click)="armRange('overview')"
        >
          Select overview range
        </button>
        @if (selectedDevice() !== null) {
          <button
            #detailRange
            type="button"
            [attr.aria-disabled]="visibleRows().length < 2 ? 'true' : null"
            [attr.aria-pressed]="rangeTarget() === 'detail'"
            (click)="armRange('detail')"
          >
            Select detail range
          </button>
        }
        <button
          type="button"
          [attr.aria-disabled]="visibleRows().length <= 1 ? 'true' : null"
          (click)="moveWindow('in')"
        >
          Zoom in
        </button>
        <button
          type="button"
          [attr.aria-disabled]="fullWindow() ? 'true' : null"
          (click)="moveWindow('out')"
        >
          Zoom out
        </button>
        <button
          type="button"
          [attr.aria-disabled]="!canMovePrevious() ? 'true' : null"
          (click)="moveWindow('previous')"
        >
          Previous window
        </button>
        <button
          type="button"
          [attr.aria-disabled]="!canMoveNext() ? 'true' : null"
          (click)="moveWindow('next')"
        >
          Next window
        </button>
        <button
          type="button"
          [attr.aria-disabled]="fullWindow() ? 'true' : null"
          (click)="resetWindow()"
        >
          Reset zoom
        </button>
      </div>
    </fieldset>
    <p class="dashboard-window" role="status">{{ windowContext() }}</p>
    @if (rangeTarget() !== null) {
      <p class="dashboard-range-help" role="status">
        {{
          rangeTarget() === 'overview'
            ? 'Drag across months in the overview, then release to zoom both charts.'
            : 'Drag across months in the device detail, then release to zoom both charts. Use a mouse or pen here.'
        }}
        Escape cancels. From and To provide the same range without dragging.
      </p>
    }
    <div class="dashboard-controls">
      <label
        >Month
        <select
          #month
          [value]="selectedId() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectMonth(month.value)"
        >
          <option value="">{{ fullWindow() ? 'All months' : 'All visible months' }}</option>
          @for (row of visibleRows(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
        </select>
      </label>
      <label
        >Device
        <select
          #device
          [value]="selectedDevice() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectDevice(device.value)"
        >
          <option value="">All devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
        </select>
      </label>
      <label
        >Overview style
        <select
          #style
          [value]="kind()"
          [style.color-scheme]="theme()"
          (change)="kind.set(style.value === 'area' ? 'area' : 'bar')"
        >
          <option value="bar">Stacked bars</option>
          <option value="area">Stacked areas</option>
        </select>
      </label>
      @if (selectedId() !== null) {
        <button #resetMonth type="button" (click)="reset()">Reset dashboard month</button>
      }
    </div>
    <p class="dashboard-context" role="status">{{ context() }}</p>
    <div class="dashboard-pair">
      <nec-composed-chart
        [necCategoryRange]="rangeIds()"
        [rangeEnabled]="rangeTarget() === 'overview'"
        [rangeContext]="rangeContext()"
        (categoryRangeSelect)="selectRange($event)"
        (categoryRangeCancel)="cancelRange($event)"
        title="Monthly visits and trend"
        description="Desktop and mobile share a stack. The line uses up to three supplied months, including observations before the visible window. Incomplete windows have no mean. Choose a month from either chart or the Month field."
        [data]="overview()"
        rowIdKey="id"
        categoryKey="month"
        [series]="series()"
        [theme]="theme()"
        [showDataTable]="showDataTable()"
        [height]="280"
        [categoryTickFormatter]="monthTick"
        (pointSelect)="selectPoint($event)"
      />
      <nec-bar-chart
        [necCategoryRange]="rangeIds()"
        [rangeEnabled]="rangeTarget() === 'detail'"
        [rangeContext]="rangeContext()"
        (categoryRangeSelect)="selectRange($event)"
        (categoryRangeCancel)="cancelRange($event)"
        [title]="detailTitle()"
        [description]="
          selectedDevice() === null
            ? 'Recorded visits for the selected period. Choose a device to explore its months. Missing observations are excluded from sums. Legends are independent.'
            : 'Monthly recorded visits for the chosen device in the visible window. Choose a month here to update the overview selection. Missing values stay missing.'
        "
        [data]="detail()"
        rowIdKey="id"
        categoryKey="device"
        [series]="detailSeries"
        [selectedRowId]="selectedDevice() === null ? null : selectedId()"
        (pointSelect)="selectDetailPoint($event)"
        layout="horizontal"
        [theme]="theme()"
        [showDataTable]="showDataTable()"
        [height]="280"
      />
    </div>
    <p class="dashboard-missing">{{ completeness() }}</p>
    <p class="dashboard-action" role="status">{{ action() }}</p>
  \`,
  styles: \`
    :host {
      display: block;
      min-width: 0;
      container: dashboard / inline-size;
      --nec-background: var(--site-bg, #fff);
      --nec-text: var(--site-text, #171717);
      --nec-muted: var(--site-muted, #6b6b6b);
      --nec-border: var(--site-border, #e5e5e5);
    }
    :host([data-theme='light']) {
      --site-bg: #fff;
      --site-text: #171717;
      --site-muted: #6b6b6b;
      --site-border: #e5e5e5;
      --nec-series-1: #2f8a78;
      --nec-series-2: #7588bc;
      --nec-series-3: #b5853a;
    }
    :host([data-theme='dark']) {
      --site-bg: #111;
      --site-text: #f5f5f5;
      --site-muted: #a3a3a3;
      --site-border: #292929;
      --nec-series-1: #52b7a1;
      --nec-series-2: #96a6cf;
      --nec-series-3: #d6b77e;
    }
    /* Standalone defaults yield to the demo shell's shared control layout. */
    :where(.dashboard-window-controls) {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 12px 20px;
      margin: 0;
      padding: 16px;
      border: 1px solid var(--site-border, #e5e5e5);
      border-radius: 8px;
      min-width: 0;
    }
    legend {
      padding: 0 6px;
      font-size: 14px;
    }
    :where(.dashboard-window-actions) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    button:disabled,
    button[aria-disabled='true'] {
      opacity: 0.5;
      cursor: default;
    }
    .dashboard-window {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-muted, #6b6b6b);
    }
    .dashboard-range-help {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-text, #171717);
    }
    :where(.dashboard-controls) {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 20px;
      align-items: end;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 13px;
      color: var(--site-muted, #6b6b6b);
    }
    select,
    button {
      min-height: 40px;
      max-width: 100%;
      padding: 8px 12px;
      font: inherit;
      border: 1px solid var(--site-border, #e5e5e5);
      border-radius: 6px;
      color: var(--site-text, #171717);
      background: var(--site-bg, #fff);
      cursor: pointer;
    }
    select:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--site-muted, #6b6b6b);
      outline-offset: 3px;
    }
    .dashboard-context {
      margin: 20px 0;
      font-size: 14px;
      color: var(--site-text, #171717);
    }
    .dashboard-pair {
      display: grid;
      gap: 20px;
    }
    .dashboard-pair > * {
      min-width: 0;
    }
    .dashboard-missing,
    .dashboard-action {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-muted, #6b6b6b);
    }
    .dashboard-action {
      min-height: 21px;
    }
    @container dashboard (min-width: 820px) {
      .dashboard-pair {
        grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
        align-items: start;
      }
    }
  \`,
  host: {
    '[attr.data-theme]': 'theme()',
    '(keydown.escape)': 'cancelRange("escape")',
  },
})
export class ComposedDashboard {
  readonly data = input.required<readonly DashboardMonth[]>();
  readonly theme = input<ChartTheme>('light');
  readonly showDataTable = input(true);
  private readonly monthField = viewChild.required<ElementRef<HTMLSelectElement>>('month');
  private readonly resetButton = viewChild<ElementRef<HTMLButtonElement>>('resetMonth');
  private readonly overviewRangeButton = viewChild<ElementRef<HTMLButtonElement>>('overviewRange');
  private readonly detailRangeButton = viewChild<ElementRef<HTMLButtonElement>>('detailRange');
  protected readonly kind = signal<'bar' | 'area'>('bar');
  protected readonly window = linkedSignal<readonly DashboardMonth[], DashboardWindow>({
    source: this.data,
    computation: (rows, previous) => reconcileDashboardWindow(rows, previous?.value ?? null),
  });
  protected readonly visibleRows = computed(() => dashboardWindowRows(this.data(), this.window()));
  protected readonly fullWindow = computed(() => this.visibleRows().length === this.data().length);
  protected readonly canMovePrevious = computed(
    () => this.visibleRows()[0]?.id !== this.data()[0]?.id,
  );
  protected readonly canMoveNext = computed(
    () => this.visibleRows().at(-1)?.id !== this.data().at(-1)?.id,
  );
  protected readonly windowContext = computed(() => {
    const rows = this.visibleRows();
    return rows.length
      ? \`Viewing \${rows[0]!.month}\u2013\${rows.at(-1)!.month} \xB7 \${rows.length} of \${this.data().length} months.\`
      : 'No months to display.';
  });
  protected readonly selectedDevice = signal<'desktop' | 'mobile' | null>(null);
  protected readonly rangeContext = computed(() => [
    this.data(),
    this.theme(),
    this.kind(),
    this.window(),
    this.selectedDevice(),
  ]);
  protected readonly rangeIds = computed(() => this.visibleRows().map((row) => row.id));
  protected readonly rangeTarget = linkedSignal<readonly unknown[], 'overview' | 'detail' | null>({
    source: this.rangeContext,
    computation: () => null,
  });
  protected readonly selectedId = linkedSignal<readonly DashboardMonth[], string | null>({
    source: this.visibleRows,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : null,
  });
  // Calculate the trailing mean before slicing so zoom does not change its meaning.
  protected readonly overview = computed(() =>
    dashboardWindowRows(dashboardRows(this.data()), this.window()),
  );
  protected readonly series = computed<
    readonly ComposedSeries<ReturnType<typeof dashboardRows>[number]>[]
  >(() => [
    { id: 'desktop', key: 'desktop', label: 'Desktop', kind: this.kind(), stack: 'visits' },
    { id: 'mobile', key: 'mobile', label: 'Mobile', kind: this.kind(), stack: 'visits' },
    { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
  ]);
  protected readonly scope = computed(() =>
    this.selectedId() === null
      ? this.visibleRows()
      : this.visibleRows().filter((row) => row.id === this.selectedId()),
  );
  protected readonly detail = computed(() => {
    const device = this.selectedDevice();
    return device === null
      ? dashboardBreakdown(this.scope())
      : this.visibleRows().map((row) => ({
          id: row.id,
          device: row.month,
          visits: row[device],
          missing: row[device] === null ? 1 : 0,
        }));
  });
  protected readonly context = computed(() =>
    !this.data().length
      ? 'No months available.'
      : this.selectedId() === null
        ? this.fullWindow()
          ? 'All months selected.'
          : 'All visible months selected.'
        : \`\${this.scope()[0]!.month} selected.\`,
  );
  protected readonly detailTitle = computed(() =>
    this.selectedDevice() === null
      ? \`Recorded device visits \xB7 \${this.selectedId() === null ? (this.fullWindow() ? 'All months' : 'Visible months') : this.scope()[0]!.month}\`
      : \`\${this.selectedDevice() === 'desktop' ? 'Desktop' : 'Mobile'} visits by month\`,
  );
  protected readonly completeness = computed(() => {
    if (!this.data().length) return 'No device observations available.';
    const missing = this.detail().reduce((sum, row) => sum + row.missing, 0);
    return missing
      ? \`\${missing} missing device observation\${missing === 1 ? '' : 's'}. Recorded sums may be partial.\`
      : 'All device observations are recorded for this period.';
  });
  protected readonly action = linkedSignal({
    source: () => [this.data(), this.selectedId(), this.window(), this.selectedDevice()],
    computation: () => '',
  });
  protected readonly detailSeries: readonly ChartSeries<{
    id: string;
    device: string;
    visits: number | null;
    missing: number;
  }>[] = [{ id: 'visits', key: 'visits', label: 'Visits' }];
  protected readonly monthTick = (month: string) => month.slice(0, 3);
  constructor() {
    effect(() => {
      const id = this.selectedId();
      untracked(() => {
        const reset = this.resetButton()?.nativeElement;
        if (id === null && reset && reset.ownerDocument.activeElement === reset) {
          this.monthField().nativeElement.focus();
        }
      });
    });
  }
  protected selectMonth(id: string): void {
    this.rangeTarget.set(null);
    this.selectedId.set(this.visibleRows().some((row) => row.id === id) ? id : null);
    this.action.set('');
  }
  protected changeWindowBound(bound: 'from' | 'to', id: string): void {
    this.rangeTarget.set(null);
    const rows = this.data();
    const current = this.visibleRows();
    if (!rows.some((row) => row.id === id) || !current.length) return;
    const next = { from: current[0]!.id, to: current.at(-1)!.id, [bound]: id };
    if (
      rows.findIndex((row) => row.id === next.from) > rows.findIndex((row) => row.id === next.to)
    ) {
      next.from = next.to = id;
    }
    this.window.set(reconcileDashboardWindow(rows, next));
  }
  protected moveWindow(action: 'in' | 'out' | 'previous' | 'next'): void {
    if (
      !this.data().length ||
      (action === 'in' && this.visibleRows().length <= 1) ||
      (action === 'out' && this.fullWindow()) ||
      (action === 'previous' && !this.canMovePrevious()) ||
      (action === 'next' && !this.canMoveNext())
    )
      return;
    this.window.set(moveDashboardWindow(this.data(), this.window(), action, this.selectedId()));
  }
  protected resetWindow(): void {
    this.rangeTarget.set(null);
    if (!this.fullWindow()) this.window.set(null);
  }
  protected selectDevice(id: string): void {
    this.selectedDevice.set(id === 'desktop' || id === 'mobile' ? id : null);
    this.action.set('');
  }
  protected armRange(target: 'overview' | 'detail'): void {
    if (this.visibleRows().length < 2) return;
    this.action.set('');
    this.rangeTarget.set(this.rangeTarget() === target ? null : target);
    // Safari does not focus buttons on pointer activation; keep Escape available during loading.
    (target === 'overview'
      ? this.overviewRangeButton()
      : this.detailRangeButton()
    )?.nativeElement.focus({ preventScroll: true });
  }
  protected cancelRange(reason: CategoryRangeCancellation): void {
    this.rangeTarget.set(null);
    if (reason === 'unavailable')
      this.action.set('The chart is not ready for a range. Try again or use From and To.');
  }
  protected selectRange(selection: CategoryRangeSelection): void {
    const target = this.rangeTarget();
    if (target === null || !selection.rowIds.every((id) => this.rangeIds().includes(id))) return;
    this.rangeTarget.set(null);
    this.window.set(reconcileDashboardWindow(this.data(), selection));
    (target === 'overview'
      ? this.overviewRangeButton()
      : this.detailRangeButton()
    )?.nativeElement.focus({ preventScroll: true });
  }
  protected selectDetailPoint(point: PointSelection<{ readonly id: string }>): void {
    if (this.selectedDevice() === null) {
      this.selectDevice(point.rowId);
    } else {
      this.selectMonth(point.rowId);
      this.action.set(
        \`\${this.data().find((row) => row.id === point.rowId)?.month}: \${this.selectedDevice()}, \${new Intl.NumberFormat('en-US').format(point.value)} visits (\${point.source}).\`,
      );
    }
  }
  protected selectPoint(point: PointSelection<DashboardMonth>): void {
    this.selectMonth(point.rowId);
    const label =
      point.seriesId === 'trend'
        ? '3-month mean'
        : point.seriesId === 'desktop'
          ? 'Desktop'
          : 'Mobile';
    this.action.set(
      \`\${point.row.month}: \${label}, \${new Intl.NumberFormat('en-US').format(point.value)} visits (\${point.source}).\`,
    );
  }
  protected reset(): void {
    this.selectMonth('');
    this.monthField().nativeElement.focus();
  }
}


const sample: readonly DashboardMonth[] = [
  { id: 'jan', month: 'January', desktop: 120, mobile: 80 },
  { id: 'feb', month: 'February', desktop: 200, mobile: 0 },
  { id: 'mar', month: 'March', desktop: null, mobile: 40 },
  { id: 'apr', month: 'April', desktop: 60, mobile: null },
];

@Component({
  selector: 'app-root, app-dashboard-pilot',
  imports: [ComposedDashboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<main>
    <h1>Visits dashboard</h1>
    <p>Explore recorded device visits and compare monthly trends.</p>
    <div class="controls">
      <button type="button" (click)="refresh()">Refresh visits</button>
      <button type="button" (click)="reverse()">Reverse months</button>
      <button type="button" (click)="remove()">Remove February</button>
      <button type="button" (click)="rows.set([])">Clear months</button>
      <button type="button" (click)="rows.set(sample)">Restore months</button>
      <button type="button" [attr.aria-pressed]="dark()" (click)="dark.set(!dark())">
        Dark theme
      </button>
    </div>
    <app-composed-dashboard
      [data]="rows()"
      [theme]="dark() ? 'dark' : 'light'"
      [showDataTable]="showDataTable()"
    />
  </main>\`,
  styles: \`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      color: var(--site-text, #171717);
    }
    main {
      max-width: 1180px;
      padding: 24px 12px;
      margin: auto;
    }
    h1 {
      font-size: 28px;
      font-weight: 500;
    }
    p {
      color: var(--site-muted, #6b6b6b);
      line-height: 1.6;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0;
    }
    button {
      min-height: 40px;
      padding: 8px 12px;
      font: inherit;
      color: var(--site-text, #171717);
      background: var(--site-bg, white);
      border: 1px solid var(--site-border, #e5e5e5);
      border-radius: 6px;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--site-muted, #6b6b6b);
      outline-offset: 3px;
    }
  \`,
})
export class App {
  readonly theme = input<ChartTheme>('light');
  readonly showDataTable = input(true);
  protected readonly sample = sample;
  protected readonly rows = signal(sample);
  protected readonly dark = linkedSignal(() => this.theme() === 'dark');
  protected refresh(): void {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, desktop: row.desktop === null ? null : row.desktop + 10 })),
    );
  }
  protected reverse(): void {
    this.rows.update((rows) => [...rows].reverse());
  }
  protected remove(): void {
    this.rows.update((rows) => rows.filter((row) => row.id !== 'feb'));
  }
}
`;var c=class e{source=l;static ɵfac=function(n){return new(n||e)};static ɵcmp=wT({type:e,selectors:[[`app-dashboard-interaction-source`]],hostAttrs:[2,`display`,`block`],decls:2,vars:1,consts:[[`tabindex`,`0`,`aria-label`,`Composed linked dashboard Angular source`],[3,`appHighlight`]],template:function(n,p){n&1&&(wi(0,`pre`,0),Og(1,`code`,1),Cl()),n&2&&(HI(),Ag(`appHighlight`,p.source))},dependencies:[hn],styles:[`.gallery-heading[_ngcontent-%COMP%]{margin-bottom:36px}.linking-guide[_ngcontent-%COMP%]{margin-top:32px}h2[_ngcontent-%COMP%]{font-size:20px;font-weight:500;line-height:32px;margin:0 0 12px}.linking-guide[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{color:var(--%NS%site-muted);font-size:13px;line-height:22px}details[_ngcontent-%COMP%]{margin:24px 0;border:1px solid var(--%NS%site-border);border-radius:var(--%NS%site-panel-radius);min-width:0}summary[_ngcontent-%COMP%]{padding:12px 16px;cursor:pointer;font-size:12px}pre[_ngcontent-%COMP%]{margin:0;padding:16px;max-height:480px;overflow:auto;font-size:12px;line-height:20px;border-top:1px solid var(--%NS%site-border)}a[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;color:var(--%NS%site-text);font-size:12px;line-height:20px}a[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}.code-tools[_ngcontent-%COMP%]{display:flex;justify-content:flex-end;padding:8px 12px;border-top:1px solid var(--%NS%site-border)}.code-tools[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{display:inline-flex;gap:6px;align-items:center;border:0;background:transparent;font:inherit;color:var(--%NS%site-text);font-size:12px;cursor:pointer;padding:4px}.code-tools[_ngcontent-%COMP%]   app-site-icon[_ngcontent-%COMP%]{width:12px;height:12px}@media(min-width:1100px){.gallery[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr);max-width:1180px}.page-outline[_ngcontent-%COMP%]{display:none}}`]})};export{c as DashboardInteractionSource};