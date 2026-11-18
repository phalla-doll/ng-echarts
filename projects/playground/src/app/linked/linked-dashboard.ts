import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { App as DashboardApp } from './dashboard-app';
import { DashboardInteractionSource } from './dashboard-interaction-source';
import { NativeDashboardSource } from './native-dashboard-source';
import { SiteAppearance } from '../shell/site-appearance';

@Component({
  selector: 'app-linked-dashboard',
  imports: [DashboardApp, DashboardInteractionSource, RouterLink, NativeDashboardSource],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gallery">
    <div class="gallery-content">
      <app-dashboard-pilot [theme]="theme()" [showDataTable]="showDataTable" />
      <section class="linking-guide" aria-labelledby="dashboard-pattern">
        <h2 id="dashboard-pattern">Use this dashboard</h2>
        <p>
          Choose visible months with From/To, zoom controls or Select overview range. Select a
          device to explore its monthly detail, then choose a month in either chart or the Month
          field. Reset month clears selection; Reset zoom restores the full window. Select detail
          range lets a mouse or pen update the same window from the device chart. Escape cancels a
          draft. Refreshing and reordering retain available IDs. Each legend affects its own chart.
        </p>
        <p>
          Missing observations remain missing. Recorded device sums may be partial, and the trend
          requires complete device observations throughout its window.
        </p>
        <details #sourceDetails>
          <summary>Standalone Angular dashboard source</summary>
          @defer (on interaction(sourceDetails)) {
            <app-dashboard-interaction-source />
          } @placeholder {
            <p>Open to load the graphical dashboard example.</p>
          } @loading {
            <p role="status">Loading example…</p>
          } @error {
            <p role="status">The example could not load. Reload this page to try again.</p>
          }
        </details>
        <details #nativeDetails>
          <summary>Native dashboard source (published rc.22)</summary>
          @defer (on interaction(nativeDetails)) {
            <app-native-dashboard-source />
          } @placeholder {
            <p>Open to load the native example.</p>
          } @error {
            <p role="status">The native example could not load. Reload this page to try again.</p>
          }
        </details>
        <p>
          Graphical ranges use the optional interaction entry in local rc.33. The native
          shared-window dashboard remains separately verified against published rc.22. Check
          Installation for the current published package.
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
}
