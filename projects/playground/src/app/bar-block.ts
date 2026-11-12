import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  BarChart,
  type CategoryTickFormatter,
  type PointSelection,
} from '@ng-echarts/chart-library/bar';
import { LineChart } from '@ng-echarts/chart-library/line';
import { lineExampleSource, type LineBlock } from './line-blocks';
import { barExampleSource, type BarBlock } from './bar-blocks';
import type { DeviceRow } from './fixtures/evilcharts-bar-fixture';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';

@Component({
  selector: 'app-bar-block',
  imports: [BarChart, LineChart, SiteIcon, HighlightCode],
  templateUrl: './bar-block.html',
  styleUrl: './bar-block.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarBlockExample {
  readonly block = input.required<BarBlock | LineBlock>();
  readonly dark = input.required<boolean>();
  protected readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));
  protected readonly color = computed(() =>
    this.block().color ? (this.dark() ? this.block().color : '#2563eb') : null,
  );
  protected readonly view = signal<'preview' | 'code'>('preview');
  private readonly generation = signal(0);
  protected readonly instances = computed(() => [this.generation()]);
  private readonly copiedText = signal<string | null>(null);
  protected readonly copyFailed = signal(false);
  protected readonly importSource = computed(() =>
    this.block().kind === 'line'
      ? "import { LineChart } from '@ng-echarts/chart-library/line';"
      : "import { BarChart } from '@ng-echarts/chart-library/bar';",
  );
  protected readonly source = computed(() => {
    const block = this.block();
    return block.kind === 'line'
      ? lineExampleSource(block, this.dark())
      : barExampleSource(block, this.dark());
  });
  protected readonly copied = computed(() => this.copiedText() === this.source());
  protected readonly selection = signal('');
  protected readonly monthTick: CategoryTickFormatter = (month) => month.slice(0, 3);
  protected readonly metrics = computed(() =>
    this.block().series.map((series) => ({
      id: series.id,
      label: series.label,
      total: new Intl.NumberFormat('en-US').format(
        this.block().rows.reduce((sum, row) => sum + (row[series.key] ?? 0), 0),
      ),
    })),
  );
  protected showView(view: 'preview' | 'code'): void {
    this.view.set(view);
  }
  protected resetPreview(): void {
    this.generation.update((value) => value + 1);
    this.selection.set('');
    this.view.set('preview');
  }
  protected select(point: PointSelection<DeviceRow>): void {
    this.selection.set(`${point.row.month}: ${point.seriesId} = ${point.value} (${point.source})`);
  }
  protected async copySource(): Promise<void> {
    const source = this.source();
    try {
      await navigator.clipboard.writeText(source);
      this.copiedText.set(source);
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
