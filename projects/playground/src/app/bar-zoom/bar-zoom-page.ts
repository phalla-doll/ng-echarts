import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiteAppearance } from '../shell/site-appearance';
import { App as BarZoomExample } from './bar-zoom-example';
import { BarZoomSource } from './bar-zoom-source';

@Component({
  selector: 'app-bar-zoom-page',
  imports: [BarZoomExample, BarZoomSource],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery">
      <div class="gallery-content">
        <app-bar-zoom-example [theme]="theme()" />
        <details #sourceDetails class="source">
          <summary>Standalone Angular source</summary>
          @defer (on interaction(sourceDetails)) {
            <app-bar-zoom-source />
          } @loading {
            <p role="status">Loading example…</p>
          } @error {
            <p role="status">The example could not load. Reload this page to try again.</p>
          }
        </details>
      </div>
    </div>
  `,
  styleUrls: ['../gallery/gallery.css'],
  styles: `
    .source {
      max-inline-size: 50rem;
      margin: 0 auto 2rem;
      padding-inline: 1rem;
      color: var(--site-text);
    }
    summary {
      width: fit-content;
      cursor: pointer;
    }
  `,
})
export class BarZoomPage {
  protected readonly theme = inject(SiteAppearance).theme;
}
