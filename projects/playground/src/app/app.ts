import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  BarChart,
  type CategoryTickFormatter,
  type PointSelection,
} from '@ng-echarts/chart-library/bar';
import { deviceRows, deviceSeries, type DeviceRow } from './fixtures/evilcharts-bar-fixture';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';

@Component({
  selector: 'app-playground',
  imports: [BarChart, SiteIcon, HighlightCode],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly darkTheme = inject(SiteAppearance).dark;
  protected readonly view = signal<'preview' | 'code'>('preview');
  private readonly copiedSource = signal<string | null>(null);
  protected readonly copyFailed = signal(false);
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
  protected readonly categoryTickFormatter: CategoryTickFormatter = (category) =>
    category.slice(0, 3);
  protected readonly selectedPoint = signal('Select a bar or a value in the data table.');
  protected readonly source = computed(
    () =>
      `<nec-bar-chart\n  title="Device visits by month"\n  [data]="visits"\n  rowIdKey="id"\n  categoryKey="month"\n  [categoryTickFormatter]="categoryTickFormatter"\n  [series]="series"\n  theme="${this.theme()}"\n  layout="${this.layout()}"\n  [stacked]="${this.stacked()}"\n  [gradient]="${this.gradient()}"\n  [height]="360"\n  (pointSelect)="onPointSelect($event)"\n/>`,
  );
  protected readonly copied = computed(() => this.copiedSource() === this.source());

  protected showView(view: 'preview' | 'code'): void {
    this.view.set(view);
  }
  protected resetControls(): void {
    this.horizontal.set(false);
    this.stacked.set(false);
    this.gradient.set(false);
    this.loading.set(false);
    this.failure.set(false);
    this.empty.set(false);
    this.mounted.set(true);
    this.changed.set(false);
    this.selectedPoint.set('Select a bar or a value in the data table.');
  }
  protected async copySource(): Promise<void> {
    const source = this.source();
    try {
      await navigator.clipboard.writeText(source);
      this.copiedSource.set(source);
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
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
