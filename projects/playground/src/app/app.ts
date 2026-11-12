import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BarChart, type PointSelection } from '@ng-echarts/chart-library';
import { deviceRows, deviceSeries, type DeviceRow } from './fixtures/evilcharts-bar-fixture';

@Component({
  selector: 'app-root',
  imports: [BarChart],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly darkTheme = signal(false);
  protected readonly themeLabel = computed(() =>
    this.darkTheme() ? 'Use light theme' : 'Use dark theme',
  );
  protected readonly theme = computed(() => (this.darkTheme() ? 'dark' : 'light'));
  protected readonly horizontal = signal(false);
  protected readonly layout = computed(() => (this.horizontal() ? 'horizontal' : 'vertical'));
  protected readonly stacked = signal(false);
  protected readonly gradient = signal(false);
  protected readonly loading = signal(false);
  protected readonly failure = signal(false);
  protected readonly error = computed(() =>
    this.failure() ? 'Sample application error. Turn off the error to recover.' : null,
  );
  protected readonly empty = signal(false);
  protected readonly mounted = signal(true);
  protected readonly changed = signal(false);
  protected readonly rows = computed(() =>
    this.empty()
      ? []
      : this.changed()
        ? deviceRows.map((row) => ({
            ...row,
            desktop: row.desktop === null ? null : row.desktop + 100,
          }))
        : deviceRows,
  );
  protected readonly series = deviceSeries;
  protected readonly selectedPoint = signal('Select a bar or a value in the data table.');

  protected toggleTheme(): void {
    this.darkTheme.update((value) => !value);
  }
  protected toggleLayout(): void {
    this.horizontal.update((value) => !value);
  }
  protected toggleStack(): void {
    this.stacked.update((value) => !value);
  }
  protected toggleGradient(): void {
    this.gradient.update((value) => !value);
  }
  protected toggleLoading(): void {
    this.loading.update((value) => !value);
  }
  protected toggleError(): void {
    this.failure.update((value) => !value);
  }
  protected toggleEmpty(): void {
    this.empty.update((value) => !value);
  }
  protected toggleMount(): void {
    this.mounted.update((value) => !value);
  }
  protected updateValues(): void {
    this.changed.update((value) => !value);
  }
  protected showPoint(point: PointSelection<DeviceRow>): void {
    this.selectedPoint.set(
      `${point.row.month}: ${point.seriesId} = ${point.value} (${point.source})`,
    );
  }
}
