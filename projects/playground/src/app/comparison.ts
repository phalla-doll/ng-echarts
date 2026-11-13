import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ComparisonAppearance } from './comparison-appearance';
import { BarChart, type CategoryTickFormatter } from '@ng-echarts/chart-library/bar';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';
import { horizontalRows, horizontalSeries } from './fixtures/evilcharts-horizontal-fixture';

@Component({
  selector: 'app-comparison',
  imports: [BarChart],
  templateUrl: './comparison.html',
  providers: [ComparisonAppearance],
  styleUrl: './comparison.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comparison {
  private readonly appearance = inject(ComparisonAppearance);
  protected readonly referenceMode = this.appearance.referenceMode;
  protected readonly theme = this.appearance.theme;
  protected readonly abbreviated = signal(true);
  protected readonly invalidFormatter = signal(false);
  protected readonly variant = signal<'grouped' | 'stacked' | 'horizontal' | 'gradient'>('grouped');
  protected readonly rows = computed(() =>
    this.variant() === 'horizontal' ? horizontalRows : deviceRows,
  );
  protected readonly series = computed(() =>
    this.variant() === 'horizontal' ? horizontalSeries : deviceSeries,
  );
  protected readonly layout = computed(() =>
    this.variant() === 'horizontal' ? 'horizontal' : 'vertical',
  );
  protected readonly stacked = computed(() => this.variant() === 'stacked');
  protected readonly gradient = computed(() => this.variant() === 'gradient');
  protected readonly seriesColor = computed(() =>
    this.variant() !== 'horizontal' ? null : this.theme() === 'dark' ? '#3b82f6' : '#2563eb',
  );
  protected readonly abbreviateMonth: CategoryTickFormatter = (category) => category.slice(0, 3);
  protected readonly failedFormatter: CategoryTickFormatter = () => {
    throw new Error('Internal formatter details must not appear in the chart.');
  };
  protected readonly tickFormatter = computed(() =>
    this.invalidFormatter()
      ? this.failedFormatter
      : this.abbreviated()
        ? this.abbreviateMonth
        : undefined,
  );

  protected toggleTheme(): void {
    this.appearance.toggle();
  }
  protected showVariant(variant: 'grouped' | 'stacked' | 'horizontal' | 'gradient'): void {
    this.variant.set(variant);
  }
  protected toggleTicks(): void {
    this.abbreviated.update((value) => !value);
  }
  protected toggleFormatterError(): void {
    this.invalidFormatter.update((value) => !value);
  }
}
