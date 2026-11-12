import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ChartFrame } from '@ng-echarts/chart-library';

@Component({
  selector: 'app-root',
  imports: [ChartFrame],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly darkTheme = signal(false);
  protected readonly themeLabel = computed(() =>
    this.darkTheme() ? 'Use light theme' : 'Use dark theme',
  );

  protected toggleTheme(): void {
    this.darkTheme.update((dark) => !dark);
  }
}
