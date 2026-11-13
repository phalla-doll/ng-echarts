import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PieChart, type PointSelection } from '@ng-echarts/chart-library/pie';
import { pieExampleSource, type PieBlock } from './pie-blocks';
import { visitorMeasure, browserPalette, type BrowserRow } from './fixtures/evilcharts-pie-fixture';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { ChartImport } from './chart-import';
import { DemoPrintMode } from './demo-print-mode';

@Component({
  selector: 'app-pie-block',
  imports: [PieChart, SiteIcon, HighlightCode, ChartImport, RouterLink],
  templateUrl: './pie-block.html',
  styleUrl: './bar-block.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieBlockExample {
  protected readonly printMode = inject(DemoPrintMode);
  protected readonly measure = visitorMeasure;
  readonly block = input.required<PieBlock>();
  readonly dark = input.required<boolean>();
  protected readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));
  protected readonly palette = computed(() => browserPalette[this.theme()]);
  protected readonly view = signal<'preview' | 'code'>('preview');
  private readonly generation = signal(0);
  protected readonly instances = computed(() => [this.generation()]);
  private readonly copiedText = signal<string | null>(null);
  protected readonly copyFailed = signal(false);
  protected readonly source = computed(() => pieExampleSource(this.block(), this.dark()));
  protected readonly copied = computed(() => this.copiedText() === this.source());
  protected readonly selection = signal('');
  protected readonly metrics = computed(() => [
    {
      id: 'total',
      label: 'Total visitors',
      total: new Intl.NumberFormat('en-US').format(
        this.block().rows.reduce((sum, row) => sum + (row.visitors ?? 0), 0),
      ),
    },
    { id: 'categories', label: 'Browsers', total: String(this.block().rows.length) },
  ]);
  protected showView(view: 'preview' | 'code'): void {
    this.view.set(view);
  }
  protected resetPreview(): void {
    this.generation.update((value) => value + 1);
    this.selection.set('');
    this.view.set('preview');
  }
  protected select(point: PointSelection<BrowserRow>): void {
    this.selection.set(
      `${point.row.browser}: ${point.seriesId} = ${point.value} (${point.source})`,
    );
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
