import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BarChart, type CategoryTickFormatter } from '@ng-echarts/chart-library';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';

@Component({
  selector: 'app-comparison',
  imports: [BarChart],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Comparison {
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly abbreviated = signal(true);
  protected readonly invalidFormatter = signal(false);
  protected readonly rows = deviceRows;
  protected readonly series = deviceSeries;
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
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }
  protected toggleTicks(): void {
    this.abbreviated.update((value) => !value);
  }
  protected toggleFormatterError(): void {
    this.invalidFormatter.update((value) => !value);
  }
}
