import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BarChart,
  type ChartSeries,
  type PointSelection,
  type ValueFormatter,
} from '@ng-echarts/chart-library';
import { SiteAppearance } from './site-appearance';

type FormatMode =
  'default' | 'currency' | 'custom' | 'bad-value' | 'bad-axis' | 'bad-options' | 'bad-locale';
interface Row {
  readonly id: string;
  readonly category: string;
  readonly value: number | null;
}

@Component({
  selector: 'app-formatting',
  imports: [BarChart],
  template: `<main class="utility-page">
    <h1>Value formatting</h1>
    <p>Compare the same numeric text in axis ticks, tooltips, and the data table.</p>
    <div class="controls" aria-label="Formatting examples">
      <button type="button" (click)="show('default')">Default numbers</button>
      <button type="button" (click)="show('currency')">Euro currency</button>
      <button type="button" (click)="show('custom')">Custom value labels</button>
      <button type="button" (click)="toggleLocale()">Toggle German locale</button>
      <button type="button" (click)="show('bad-value')">Invalid value formatter</button>
      <button type="button" (click)="show('bad-axis')">Invalid axis formatter</button>
      <button type="button" (click)="show('bad-options')">Invalid number options</button>
      <button type="button" (click)="show('bad-locale')">Invalid locale</button>
      <button type="button" (click)="toggleLoading()" [attr.aria-pressed]="loading()">
        Loading state
      </button>
      <button type="button" (click)="toggleError()" [attr.aria-pressed]="failure()">
        Application error
      </button>
    </div>
    <p>Locale: {{ locale() }}</p>
    <nec-bar-chart
      title="Formatted values"
      [theme]="theme()"
      description="Includes fractions, zero, a negative value, and a missing observation."
      [data]="rows"
      rowIdKey="id"
      categoryKey="category"
      [series]="series"
      [locale]="locale()"
      [numberFormatOptions]="options()"
      [valueFormatter]="formatter()"
      [loading]="loading()"
      [error]="error()"
      [animation]="false"
      (pointSelect)="select($event)"
    />
    <p class="selection" role="status">{{ selection() }}</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Formatting {
  protected readonly theme = inject(SiteAppearance).theme;
  private readonly route = inject(ActivatedRoute);
  private readonly mode = signal<FormatMode>(
    this.route.snapshot.queryParamMap.get('invalid') === 'locale' ? 'bad-locale' : 'default',
  );
  private readonly german = signal(false);
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly error = computed(() => (this.failure() ? 'Sample application error.' : null));
  protected readonly selection = signal('No selection');
  protected readonly rows: readonly Row[] = [
    { id: 'jan', category: 'January', value: 1234.5 },
    { id: 'feb', category: 'February', value: 0 },
    { id: 'mar', category: 'March', value: null },
    { id: 'apr', category: 'April', value: -42 },
  ];
  protected readonly series: readonly ChartSeries<Row>[] = [
    { id: 'amount', key: 'value', label: 'Amount' },
  ];
  protected readonly locale = computed(() =>
    this.mode() === 'bad-locale' ? 'bad_locale' : this.german() ? 'de-DE' : 'en-US',
  );
  protected readonly options = computed<Intl.NumberFormatOptions | undefined>(() =>
    this.mode() === 'currency'
      ? { style: 'currency', currency: 'EUR' }
      : this.mode() === 'bad-options'
        ? { minimumFractionDigits: 4, maximumFractionDigits: 1 }
        : undefined,
  );
  private readonly custom: ValueFormatter = (value) => `<${value}> units`;
  private readonly failed: ValueFormatter = () => {
    throw new Error('Private formatter details');
  };
  private readonly failedAxis: ValueFormatter = (value) => {
    if (![1234.5, 0, -42].includes(value)) throw new Error('Private axis details');
    return String(value);
  };
  protected readonly formatter = computed(() =>
    this.mode() === 'custom'
      ? this.custom
      : this.mode() === 'bad-value'
        ? this.failed
        : this.mode() === 'bad-axis'
          ? this.failedAxis
          : undefined,
  );
  protected show(mode: FormatMode): void {
    this.mode.set(mode);
  }
  protected toggleLocale(): void {
    this.german.update((value) => !value);
  }
  protected toggleLoading(): void {
    this.loading.update((value) => !value);
  }
  protected toggleError(): void {
    this.failure.update((value) => !value);
  }
  protected select(point: PointSelection<Row>): void {
    this.selection.set(`${point.rowId}/${point.seriesId}/${point.value}/${point.source}`);
  }
}
