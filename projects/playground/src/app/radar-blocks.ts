import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RadarChart, type ChartSeries, type PointSelection } from '@ng-echarts/chart-library/radar';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { capabilityRows, radarExampleSource, type Capability } from './radar-example-source';
@Component({
  selector: 'app-radar-blocks',
  imports: [RadarChart, RouterLink, SiteIcon, HighlightCode],
  templateUrl: './radar-blocks.html',
  styleUrls: ['./gallery.css', './bar-block.css', './radar-blocks.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarBlocks {
  protected readonly dark = inject(SiteAppearance).dark;
  protected readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));
  protected readonly rows = signal(capabilityRows);
  protected readonly filled = signal(true);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mounted = signal(true);
  protected readonly view = signal<'preview' | 'code'>('preview');
  protected readonly selection = signal('');
  protected readonly source = radarExampleSource;
  protected readonly copied = signal(false);
  protected readonly copyFailed = signal(false);
  protected readonly series: readonly ChartSeries<Capability>[] = [
    { id: 'current', key: 'current', label: 'Current' },
    { id: 'target', key: 'target', label: 'Target' },
  ];
  protected select(point: PointSelection<Capability>): void {
    this.selection.set(
      `${point.row.dimension}: ${point.seriesId} = ${point.value} (${point.source})`,
    );
  }
  protected updateScores(): void {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, current: Math.min(row.max, (row.current ?? 0) + 5) })),
    );
  }
  protected makeMissing(): void {
    this.rows.update((rows) => rows.map((row, i) => (i === 0 ? { ...row, current: null } : row)));
  }
  protected reverseDimensions(): void {
    this.rows.update((rows) => [...rows].reverse());
  }
  protected reset(): void {
    this.rows.set(capabilityRows);
    this.loading.set(false);
    this.error.set(null);
    this.filled.set(true);
    this.selection.set('');
  }
  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.source);
      this.copied.set(true);
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
