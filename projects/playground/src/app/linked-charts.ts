import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LinkedVisits } from './linked-visits';
import { deviceRows } from './fixtures/evilcharts-bar-fixture';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';
import { HighlightCode } from './highlight-code';
import { linkedExampleSource } from './linked-example-source';
@Component({
  selector: 'app-linked-charts',
  imports: [LinkedVisits, RouterLink, SiteIcon, HighlightCode],
  template: `<main class="gallery">
    <div class="gallery-content">
      <header class="gallery-heading">
        <div>
          <h1>Linked Charts</h1>
          <p>Explore device share for a month or a custom range.</p>
        </div>
      </header>
      <app-linked-visits [data]="rows" [theme]="theme()" />
      <section class="linking-guide" id="linking-pattern" aria-labelledby="linking-title">
        <h2 id="linking-title">Linking pattern</h2>
        <p>
          Choose a month or an inclusive range to connect the overview and detail. Chart legends
          stay independent. Use the period fields or the overview’s data table with a keyboard.
        </p>
        <details #sourceDetails>
          <summary>Standalone Angular example</summary>
          <div class="code-tools">
            <button type="button" (click)="copySource()">
              <app-site-icon [name]="copied() ? 'check' : 'copy'" />{{
                copied() ? 'Copied' : 'Copy example'
              }}
            </button>
          </div>
          <pre
            tabindex="0"
            aria-label="Linked charts Angular source"
          >@defer (on interaction(sourceDetails)) {<code [appHighlight]="source"></code>} @placeholder {<code>{{ source }}</code>} @error {<code>{{ source }}</code>}</pre>
        </details>
        @if (copyFailed()) {
          <p role="status">
            Clipboard access is unavailable. Select the source above to copy it manually.
          </p>
        }
        <a href="https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINKED_CHARTS.md"
          >Read the integration guide<app-site-icon name="arrow"
        /></a>
      </section>
      <footer class="gallery-footer">
        <p>
          Examples use the local workspace package. Public npm installation is not available yet.
        </p>
        <a routerLink="/linked-validation">Open linked validation<app-site-icon name="arrow" /></a>
      </footer>
    </div>
    <aside class="page-outline" aria-label="On this page">
      <p>On this page</p>
      <a routerLink="." fragment="linking-pattern">Linking pattern</a
      ><a class="outline-playground" routerLink="/linked-validation"
        >Linked validation<app-site-icon name="arrow"
      /></a>
    </aside>
  </main>`,
  styleUrls: ['./gallery.css', './linked-charts.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedCharts {
  protected readonly rows = deviceRows;
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly source = linkedExampleSource;
  protected readonly copied = signal(false);
  protected readonly copyFailed = signal(false);
  protected async copySource(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.source);
      this.copied.set(true);
      this.copyFailed.set(false);
    } catch {
      this.copied.set(false);
      this.copyFailed.set(true);
    }
  }
}
