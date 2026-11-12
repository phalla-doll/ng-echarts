import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BarBlockExample } from './bar-block';
import { barBlocks, barExampleSource } from './bar-blocks';
import { lineBlocks, lineExampleSource, type LineBlock } from './line-blocks';
import type { BarBlock } from './bar-blocks';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';

@Component({
  selector: 'app-gallery',
  imports: [BarBlockExample, SiteIcon, RouterLink],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly isLine = inject(ActivatedRoute).snapshot.data['family'] === 'line';
  protected readonly heading = this.isLine ? 'Line Blocks' : 'Bar Blocks';
  protected readonly subtitle = this.isLine
    ? 'Ready-made Angular line chart blocks, powered by Apache ECharts'
    : 'Ready-made Angular bar chart blocks, powered by Apache ECharts';
  protected readonly blocks: readonly (BarBlock | LineBlock)[] = this.isLine
    ? lineBlocks
    : barBlocks;
  protected readonly activeBlock = signal(this.blocks[0]!.id);
  protected readonly dark = inject(SiteAppearance).dark;
  private readonly copiedPage = signal<string | null>(null);
  protected readonly copyFailed = signal(false);
  private readonly markdown = computed(() =>
    [
      '# ' + this.heading,
      'Native Angular ' + (this.isLine ? 'line' : 'bar') + ' examples, powered by Apache ECharts.',
      'Use the private @ng-echarts/chart-library package from this workspace. No public npm installer is available.',
      ...this.blocks.map(
        (block) =>
          `## ${block.title}\n\n${block.description}\n\n\`\`\`ts\n${block.kind === 'line' ? lineExampleSource(block, this.dark()) : barExampleSource(block, this.dark())}\n\`\`\``,
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
