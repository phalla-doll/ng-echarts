import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { App as DashboardApp } from './dashboard-app';
import { HighlightCode } from '../code-examples/highlight-code';
import { composedDashboardSource } from './composed-dashboard-source';
import { SiteAppearance } from '../shell/site-appearance';

@Component({
  selector: 'app-linked-dashboard',
  imports: [DashboardApp, HighlightCode, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gallery">
    <div class="gallery-content">
      <app-dashboard-pilot [theme]="theme()" [showDataTable]="showDataTable" />
      <section class="linking-guide" aria-labelledby="dashboard-pattern">
        <h2 id="dashboard-pattern">Use this dashboard</h2>
        <p>
          Choose visible months with From/To or the zoom controls. Select a device to explore its
          monthly detail, then choose a month in either chart or the Month field. Reset month clears
          selection; Reset zoom restores the full window. Refreshing and reordering retain available
          IDs. Each legend affects its own chart.
        </p>
        <p>
          Missing observations remain missing. Recorded device sums may be partial, and the trend
          requires complete device observations throughout its window.
        </p>
        <details #sourceDetails>
          <summary>Standalone Angular dashboard source</summary>
          <pre
            tabindex="0"
            aria-label="Composed linked dashboard Angular source"
          >@defer (on interaction(sourceDetails)) {<code [appHighlight]="source"></code>} @placeholder {<code>{{ source }}</code>} @error {<code>{{ source }}</code>}</pre>
        </details>
        <p>
          This complete example also runs on the preserved rc.22 package. The current experimental
          package is rc.28; install it with the next tag.
        </p>
        <a routerLink="/linked">Explore month ranges and previews</a>
      </section>
    </div>
  </div>`,
  styleUrls: ['../gallery/gallery.css', './linked-charts.css'],
})
export class LinkedDashboard {
  protected readonly showDataTable = inject(ActivatedRoute).snapshot.data['showDataTable'] === true;
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly source = composedDashboardSource;
}
