import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { documentationPages, chartCatalog } from './documentation-content';
import { CopyButton } from './copy-button';
import { SourceSnippet } from './source-snippet';
import { ChartIllustration } from './chart-illustration';
import { SiteIcon } from './site-icon';

@Component({
  selector: 'app-documentation',
  imports: [RouterLink, CopyButton, SourceSnippet, ChartIllustration, SiteIcon],
  templateUrl: './documentation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Documentation {
  private readonly route = inject(ActivatedRoute);
  protected readonly page =
    documentationPages[this.route.snapshot.data['page'] as string] ??
    documentationPages['components']!;
  protected readonly cards = chartCatalog;
  protected readonly isCatalog = this.page.path === '/components';
  protected readonly activeSection = signal(
    this.route.snapshot.fragment ?? this.page.sections[0]!.id,
  );
  protected readonly markdown = computed(() =>
    [
      `# ${this.page.title}`,
      this.page.intro,
      ...this.page.sections.map((section) =>
        [
          `## ${section.title}`,
          ...section.paragraphs,
          section.source ? `\`\`\`\n${section.source}\n\`\`\`` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      ),
      ...(this.isCatalog
        ? this.cards.map((card) => `${card.title}: ${card.status}. ${card.description}`)
        : []),
    ].join('\n\n'),
  );
  protected selectSection(id: string): void {
    this.activeSection.set(id);
  }
}
