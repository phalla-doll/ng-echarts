import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library';
import { DeferredChart } from './deferred-chart';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';

@Component({
  selector: 'app-validation',
  imports: [BarChart, DeferredChart],
  templateUrl: './validation.html',
  styles: `
    :host {
      display: block;
      padding: 1.5rem;
      background: #f4f6fa;
      color: #18202c;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    button {
      padding: 0.75rem;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 3px solid #648dff;
      outline-offset: 3px;
    }
    .charts {
      display: grid;
      gap: 1.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Validation {
  protected readonly rows = deviceRows;
  protected readonly mounted = signal(true);
  protected readonly hidden = signal(true);
  protected readonly loading = signal(true);
  protected readonly mobile = signal(true);
  protected readonly palette = signal(false);
  protected readonly revision = signal(0);
  protected readonly series = computed(() =>
    this.mobile() ? deviceSeries : deviceSeries.slice(0, 1),
  );

  protected toggleMount(): void {
    this.mounted.update((value) => !value);
  }
  protected revealHidden(): void {
    this.hidden.set(false);
  }
  protected finishLoading(): void {
    this.loading.set(false);
  }
  protected toggleMobile(): void {
    this.mobile.update((value) => !value);
  }
  protected refreshPalette(): void {
    this.palette.update((value) => !value);
    this.revision.update((value) => value + 1);
  }
}
