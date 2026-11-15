import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
      <app-dashboard-pilot [theme]="theme()" />
      <section class="linking-guide" aria-labelledby="dashboard-pattern">
        <h2 id="dashboard-pattern">Use this dashboard</h2>
        <p>
          Activate a bar, area or trend value, use its data table, or choose a month. Switch the
          overview style without changing the selection. Reset returns to all months. Refreshing and
          reordering retain the selected month by ID; removing it returns to all months. Each legend
          affects its own chart.
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
          Install the experimental rc.22 package to use this example. Horizontal composed charts are
          a separate rc.23 source feature.
        </p>
        <a routerLink="/linked">Explore month ranges and previews</a>
      </section>
    </div>
  </div>`,
  styleUrls: ['../gallery/gallery.css', './linked-charts.css'],
})
export class LinkedDashboard {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly source = composedDashboardSource;
}
