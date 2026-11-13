import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  input,
  linkedSignal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  BarChart,
  type ChartSeries,
  type ChartTheme,
  type PointSelection,
} from '@ng-echarts/chart-library/bar';
import { PieChart, type ChartMeasure } from '@ng-echarts/chart-library/pie';
import { SiteIcon } from './site-icon';
import { changePeriodBound, periodRows, reconcilePeriod, type VisitPeriod } from './linked-period';

export interface VisitMonth {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}
export interface DeviceVisits {
  readonly id: string;
  readonly device: string;
  readonly visits: number | null;
}
const devices = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobile' },
] as const;

/** Missing observations stay missing when no numeric observations are available. */
export function deviceShare(rows: readonly VisitMonth[]): readonly DeviceVisits[] {
  return devices.map(({ id, label }) => {
    const values = rows.flatMap((row) => (row[id] === null ? [] : [row[id]]));
    return {
      id,
      device: label,
      visits: values.length ? values.reduce((sum, value) => sum + value, 0) : null,
    };
  });
}

@Component({
  selector: 'app-linked-visits',
  imports: [BarChart, PieChart, SiteIcon],
  templateUrl: './linked-visits.html',
  styleUrl: './linked-visits.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedVisits {
  readonly data = input.required<readonly VisitMonth[]>();
  readonly theme = input<ChartTheme>('light');
  private readonly periodSelect = viewChild.required<ElementRef<HTMLSelectElement>>('period');
  private readonly rangeFields = viewChild<ElementRef<HTMLElement>>('rangeFields');
  protected readonly selection = linkedSignal<readonly VisitMonth[], VisitPeriod>({
    source: this.data,
    computation: (rows, previous) => reconcilePeriod(rows, previous?.value ?? null),
  });
  protected readonly range = computed(() => {
    const value = this.selection();
    return value?.kind === 'range' ? value : null;
  });
  protected readonly periodValue = computed(() => {
    const value = this.selection();
    return value?.kind === 'range' ? '__range__' : value ? `month:${value.id}` : '';
  });
  protected readonly scope = computed(() => periodRows(this.data(), this.selection()));
  protected readonly selectedIds = computed(() =>
    this.selection() === null ? [] : this.scope().map((row) => row.id),
  );
  protected readonly context = computed(() => {
    if (this.selection() === null) return 'All months';
    const rows = this.scope();
    return rows.length === 1 ? rows[0]!.month : `${rows[0]!.month}–${rows.at(-1)!.month}`;
  });
  protected readonly scopeDescription = computed(() =>
    this.selection() === null
      ? 'all available months'
      : this.scope().length === 1
        ? 'this month'
        : `${this.scope().length} months`,
  );
  protected readonly overviewDescription = computed(() =>
    this.selection() !== null
      ? `${this.context()} selected. Choose a month or edit the period.`
      : 'Choose a month from the bars, table or period field.',
  );
  protected readonly share = computed(() => deviceShare(this.scope()));
  protected readonly detailTitle = computed(() => 'Device share · ' + this.context());
  protected readonly detailDescription = computed(
    () =>
      'Desktop and mobile visits for ' +
      (this.selection() !== null ? this.context() : 'all months') +
      '.',
  );
  protected readonly selectedDevice = linkedSignal({
    source: this.selection,
    computation: () => '',
  });
  protected readonly summary = computed(() => {
    if (!this.data().length) return { value: 'No months available', unit: '', device: '' };
    if (this.share().every((row) => row.visits === null))
      return { value: 'No recorded visits', unit: '', device: '' };
    const detail = this.share().find(
      (row) => row.id === this.selectedDevice() && row.visits !== null,
    );
    const value = detail?.visits ?? this.share().reduce((sum, row) => sum + (row.visits ?? 0), 0);
    return { value: this.number(value), unit: 'visits', device: detail?.device ?? '' };
  });
  protected readonly status = computed(() => {
    if (!this.data().length) return 'No months available. Device share is empty.';
    if (this.share().every((row) => row.visits === null))
      return `${this.context()}: No recorded device visits.`;
    const detail = this.share().find((row) => row.id === this.selectedDevice());
    if (detail && detail.visits !== null)
      return `${this.context()}: ${detail.device}, ${this.number(detail.visits)} visits.`;
    const total = this.share().reduce((sum, row) => sum + (row.visits ?? 0), 0);
    return `${this.context()}: ${this.number(total)} visits. Device share shows ${this.scopeDescription()}.`;
  });
  protected readonly series: readonly ChartSeries<VisitMonth>[] = [
    { id: 'desktop', key: 'desktop', label: 'Desktop' },
    { id: 'mobile', key: 'mobile', label: 'Mobile' },
  ];
  protected readonly measure: ChartMeasure<DeviceVisits> = {
    id: 'visits',
    key: 'visits',
    label: 'Visits',
  };
  protected readonly monthTick = (month: string) => month.slice(0, 3);
  constructor() {
    // View effects run before the conditional fields disappear. Preserve focus only
    // when the removed range fields contain it, never from another active control.
    effect(() => {
      if (this.range() !== null) return;
      untracked(() => {
        const fields = this.rangeFields()?.nativeElement;
        if (fields?.contains(fields.ownerDocument.activeElement))
          this.periodSelect().nativeElement.focus();
      });
    });
  }
  protected selectPeriod(id: string): void {
    if (id !== '__range__') {
      this.selectMonth(id.startsWith('month:') ? id.slice(6) : '');
      return;
    }
    const rows = this.data();
    if (!rows.length) return;
    const current = this.selection();
    const anchor = current?.kind === 'month' ? current.id : null;
    this.selection.set({
      kind: 'range',
      from: anchor ?? rows[0]!.id,
      to: anchor ?? rows.at(-1)!.id,
    });
    this.selectedDevice.set('');
  }
  protected selectBound(bound: 'from' | 'to', id: string): void {
    this.selection.update((period) => changePeriodBound(this.data(), period, bound, id));
    this.selectedDevice.set('');
  }
  protected selectMonth(id: string): void {
    this.selection.set(this.data().some((row) => row.id === id) ? { kind: 'month', id } : null);
    this.selectedDevice.set('');
  }
  protected resetMonth(): void {
    this.selectMonth('');
    this.periodSelect().nativeElement.focus();
  }
  protected selectPoint(point: PointSelection<VisitMonth>): void {
    this.selectMonth(point.rowId);
  }
  protected selectDevice(point: PointSelection<DeviceVisits>): void {
    this.selectedDevice.set(point.rowId);
  }
  private number(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
