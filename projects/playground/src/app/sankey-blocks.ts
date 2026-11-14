import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SankeyChart,
  type SankeyNode,
  type SankeyLink,
  type SankeySelection,
} from '@ng-echarts/chart-library/sankey';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { flowNodes, flowLinks, sankeyExampleSource } from './sankey-examples';
@Component({
  selector: 'app-sankey-blocks',
  imports: [SankeyChart, RouterLink, SiteIcon, HighlightCode],
  templateUrl: './sankey-blocks.html',
  styleUrls: ['./gallery.css', './bar-block.css', './radial-block.css', './sankey-blocks.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SankeyBlocks {
  private readonly appearance = inject(SiteAppearance);
  protected readonly theme = this.appearance.theme;
  protected readonly mode = signal<'sample' | 'zero' | 'empty' | 'cycle' | 'updated'>('sample');
  protected readonly nodes = computed(() => (this.mode() === 'empty' ? [] : flowNodes));
  protected readonly links = computed(() => {
    switch (this.mode()) {
      case 'empty':
        return [];
      case 'zero':
        return flowLinks.map((link) => ({ ...link, value: 0 }));
      case 'cycle':
        return [...flowLinks, { id: 'cycle', source: 'customer', target: 'search', value: 1 }];
      case 'updated':
        return [...flowLinks].reverse().map((link) => ({ ...link, value: link.value * 2 }));
      default:
        return flowLinks;
    }
  });
  protected readonly source = computed(() => sankeyExampleSource(this.appearance.dark()));
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mounted = signal(true);
  protected readonly view = signal<'code' | 'preview'>('preview');
  protected readonly selection = signal<SankeySelection<SankeyNode, SankeyLink> | null>(null);
  protected readonly selectionText = computed(() => {
    const selected = this.selection();
    if (!selected) return 'Select a node or flow, or explore the exact values in the tables.';
    if (selected.kind === 'node')
      return `${selected.node.label}: ${selected.incoming} incoming, ${selected.outgoing} outgoing`;
    const label = (id: string) => flowNodes.find((node) => node.id === id)!.label;
    return `${label(selected.link.source)} to ${label(selected.link.target)}: ${selected.value} visits`;
  });
  private readonly copiedSource = signal<string | null>(null);
  protected readonly copied = computed(() => this.copiedSource() === this.source());
  protected readonly copyFailed = signal(false);
  protected setMode(mode: 'sample' | 'zero' | 'empty' | 'cycle' | 'updated'): void {
    this.mode.set(mode);
    this.selection.set(null);
  }
  protected reset(): void {
    this.setMode('sample');
    this.loading.set(false);
    this.error.set(null);
    this.mounted.set(true);
  }
  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.source());
      this.copiedSource.set(this.source());
      this.copyFailed.set(false);
    } catch {
      this.copyFailed.set(true);
    }
  }
}
