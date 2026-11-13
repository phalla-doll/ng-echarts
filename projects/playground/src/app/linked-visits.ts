import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import {
  BarChart,
  type ChartSeries,
  type ChartTheme,
  type PointSelection,
} from '@ng-echarts/chart-library/bar';
import { PieChart, type ChartMeasure } from '@ng-echarts/chart-library/pie';

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
  imports: [BarChart, PieChart],
  templateUrl: './linked-visits.html',
  styleUrl: './linked-visits.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedVisits {
  readonly data = input.required<readonly VisitMonth[]>();
  readonly theme = input<ChartTheme>('light');
  protected readonly selectedId = linkedSignal<readonly VisitMonth[], string | null>({
    source: this.data,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : null,
  });
  protected readonly selectedMonth = computed(
    () => this.data().find((row) => row.id === this.selectedId()) ?? null,
  );
  protected readonly context = computed(() => this.selectedMonth()?.month ?? 'All months');
  protected readonly share = computed(() =>
    deviceShare(this.selectedMonth() ? [this.selectedMonth()!] : this.data()),
  );
  protected readonly detailTitle = computed(() => 'Device share · ' + this.context());
  protected readonly detailDescription = computed(
    () =>
      'Desktop and mobile visits for ' +
      (this.selectedMonth()?.month ?? 'all months') +
      '. Missing observations are excluded from totals.',
  );
  protected readonly selectedDevice = linkedSignal({
    source: this.selectedId,
    computation: () => '',
  });
  protected readonly status = computed(() => {
    if (!this.data().length) return 'No months available. Device share is empty.';
    if (this.share().every((row) => row.visits === null))
      return `${this.context()}: No recorded device visits.`;
    const detail = this.share().find((row) => row.id === this.selectedDevice());
    if (detail && detail.visits !== null)
      return `${this.context()}: ${detail.device}, ${this.number(detail.visits)} visits.`;
    const total = this.share().reduce((sum, row) => sum + (row.visits ?? 0), 0);
    return `${this.context()}: ${this.number(total)} visits. Device share shows ${this.selectedMonth() ? 'this month' : 'all available months'}.`;
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
  protected selectMonth(id: string): void {
    this.selectedId.set(this.data().some((row) => row.id === id) ? id : null);
    this.selectedDevice.set('');
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
