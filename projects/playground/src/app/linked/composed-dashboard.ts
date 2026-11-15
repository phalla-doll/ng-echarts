import {
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
import type { ChartSeries, ChartTheme, PointSelection } from '@mantha911/ng-echarts/core';

export interface DashboardMonth {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
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
  imports: [ComposedChart, BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-controls">
      <label
        >Month
        <select
          #month
          [value]="selectedId() ?? ''"
          [style.color-scheme]="theme()"
          (change)="selectMonth(month.value)"
        >
          <option value="">All months</option>
          @for (row of data(); track row.id) {
            <option [value]="row.id">{{ row.month }}</option>
          }
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
        title="Monthly visits and trend"
        description="Desktop and mobile share a stack. The line is the trailing mean of combined visits over up to three supplied months. Incomplete windows have no mean. Choose a month from any plotted series, its table or the Month field."
        [data]="overview()"
        rowIdKey="id"
        categoryKey="month"
        [series]="series()"
        [theme]="theme()"
        [height]="280"
        [categoryTickFormatter]="monthTick"
        (pointSelect)="selectPoint($event)"
      />
      <nec-bar-chart
        [title]="detailTitle()"
        description="Recorded device visits for the selected period. Missing observations are excluded from recorded sums and reported below. Legends are independent."
        [data]="detail()"
        rowIdKey="id"
        categoryKey="device"
        [series]="detailSeries"
        layout="horizontal"
        [theme]="theme()"
        [height]="280"
      />
    </div>
    <p class="dashboard-missing">{{ completeness() }}</p>
    <p class="dashboard-action" role="status">{{ action() }}</p>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      container: dashboard / inline-size;
      --nec-background: var(--site-bg, #fff);
      --nec-text: var(--site-text, #18202c);
      --nec-muted: var(--site-muted, #536176);
      --nec-border: var(--site-border, #d6dce5);
    }
    :host([data-theme='light']) {
      --site-bg: #fff;
      --site-text: #18202c;
      --site-muted: #536176;
      --site-border: #d6dce5;
    }
    :host([data-theme='dark']) {
      --site-bg: #18202c;
      --site-text: #edf2fa;
      --site-muted: #b2bfd2;
      --site-border: #3b4a61;
    }
    .dashboard-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 20px;
      align-items: end;
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 13px;
      color: var(--site-muted, #536176);
    }
    select,
    button {
      min-height: 40px;
      max-width: 100%;
      padding: 8px 12px;
      font: inherit;
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 6px;
      color: var(--site-text, #18202c);
      background: var(--site-bg, #fff);
      cursor: pointer;
    }
    select:focus-visible,
    button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 3px;
    }
    .dashboard-context {
      margin: 20px 0;
      font-size: 14px;
      color: var(--site-text, #18202c);
    }
    .dashboard-pair {
      display: grid;
      gap: 20px;
    }
    .dashboard-pair > * {
      min-width: 0;
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 8px;
    }
    .dashboard-missing,
    .dashboard-action {
      font-size: 13px;
      line-height: 1.6;
      color: var(--site-muted, #536176);
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
  `,
  host: { '[attr.data-theme]': 'theme()' },
})
export class ComposedDashboard {
  readonly data = input.required<readonly DashboardMonth[]>();
  readonly theme = input<ChartTheme>('light');
  private readonly monthField = viewChild.required<ElementRef<HTMLSelectElement>>('month');
  private readonly resetButton = viewChild<ElementRef<HTMLButtonElement>>('resetMonth');
  protected readonly kind = signal<'bar' | 'area'>('bar');
  protected readonly selectedId = linkedSignal<readonly DashboardMonth[], string | null>({
    source: this.data,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : null,
  });
  protected readonly overview = computed(() => dashboardRows(this.data()));
  protected readonly series = computed<
    readonly ComposedSeries<ReturnType<typeof dashboardRows>[number]>[]
  >(() => [
    { id: 'desktop', key: 'desktop', label: 'Desktop', kind: this.kind(), stack: 'visits' },
    { id: 'mobile', key: 'mobile', label: 'Mobile', kind: this.kind(), stack: 'visits' },
    { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
  ]);
  protected readonly scope = computed(() =>
    this.selectedId() === null
      ? this.data()
      : this.data().filter((row) => row.id === this.selectedId()),
  );
  protected readonly detail = computed(() => dashboardBreakdown(this.scope()));
  protected readonly context = computed(() =>
    !this.data().length
      ? 'No months available.'
      : this.selectedId() === null
        ? 'All months selected.'
        : `${this.scope()[0]!.month} selected.`,
  );
  protected readonly detailTitle = computed(
    () =>
      `Recorded device visits · ${this.selectedId() === null ? 'All months' : this.scope()[0]!.month}`,
  );
  protected readonly completeness = computed(() => {
    if (!this.data().length) return 'No device observations available.';
    const missing = this.detail().reduce((sum, row) => sum + row.missing, 0);
    return missing
      ? `${missing} missing device observation${missing === 1 ? '' : 's'}. Recorded sums may be partial.`
      : 'All device observations are recorded for this period.';
  });
  protected readonly action = linkedSignal({
    source: () => [this.data(), this.selectedId()],
    computation: () => '',
  });
  protected readonly detailSeries: readonly ChartSeries<
    ReturnType<typeof dashboardBreakdown>[number]
  >[] = [{ id: 'visits', key: 'visits', label: 'Visits' }];
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
    this.selectedId.set(this.data().some((row) => row.id === id) ? id : null);
    this.action.set('');
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
      `${point.row.month}: ${label}, ${new Intl.NumberFormat('en-US').format(point.value)} visits (${point.source}).`,
    );
  }
  protected reset(): void {
    this.selectMonth('');
    this.monthField().nativeElement.focus();
  }
}
