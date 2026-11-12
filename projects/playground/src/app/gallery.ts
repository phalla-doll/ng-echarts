import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PieBlockExample } from './pie-block';
import { BarBlockExample } from './bar-block';
import { chartExampleSource, galleryFamilies, type ChartBlock } from './chart-blocks';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';

@Component({
  selector: 'app-gallery',
  imports: [BarBlockExample, PieBlockExample, SiteIcon, RouterLink],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  private readonly requestedFamily = inject(ActivatedRoute).snapshot.data['family'];
  protected readonly family =
    this.requestedFamily === 'pie'
      ? 'pie'
      : this.requestedFamily === 'area'
        ? 'area'
        : this.requestedFamily === 'line'
          ? 'line'
          : 'bar';
  protected readonly config = galleryFamilies[this.family];
  protected readonly heading = this.config.title;
  protected readonly subtitle = `Ready-made Angular ${this.config.noun} chart blocks, powered by Apache ECharts`;
  protected readonly blocks: readonly ChartBlock[] = this.config.blocks;
  protected readonly activeBlock = signal(this.blocks[0]!.id);
  protected readonly dark = inject(SiteAppearance).dark;
  private readonly copiedPage = signal<string | null>(null);
  protected readonly copyFailed = signal(false);
  private readonly markdown = computed(() =>
    [
      '# ' + this.heading,
      'Native Angular ' + this.config.noun + ' examples, powered by Apache ECharts.',
      'Use the private @ng-echarts/chart-library package from this workspace. No public npm installer is available.',
      ...this.blocks.map(
        (block) =>
          `## ${block.title}\n\n${block.description}\n\n\`\`\`ts\n${chartExampleSource(block, this.dark())}\n\`\`\``,
      ),
    ].join('\n\n'),
  );
  protected readonly copied = computed(() => this.copiedPage() === this.markdown());
  protected selectBlock(id: string): void {
    this.activeBlock.set(id);
  }
  protected async copyPage(): Promise<void> {
    const page = this.markdown();
    try {
      await navigator.clipboard.writeText(page);
      this.copiedPage.set(page);
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
