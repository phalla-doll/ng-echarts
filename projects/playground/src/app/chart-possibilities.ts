import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';

/** The approved standalone document is also the deployed concept gallery's source. */
@Component({
  selector: 'app-chart-possibilities',
  imports: [SiteIcon],
  templateUrl: './chart-possibilities.html',
  styleUrl: './chart-possibilities.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPossibilities {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appearance = inject(SiteAppearance);
  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('gallery');
  protected readonly browserReady = signal(false);
  protected readonly ready = signal(false);
  protected readonly height = signal(4600);
  // Refresh the document in browsers that cached the first gallery deployment.
  protected readonly standaloneUrl = 'concepts/chart-style-gallery.html?v=8169ba21b4c5';
  // A fixed, bundled document; no external URL or user input enters this trust boundary.
  protected readonly galleryUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `${this.standaloneUrl}&embedded=1&theme=dark`,
  );

  constructor() {
    afterNextRender(() => {
      const hostWindow = this.document.defaultView!;
      const receive = (event: MessageEvent<unknown>): void => {
        if (
          event.origin !== hostWindow.location.origin ||
          event.source !== this.frame().nativeElement.contentWindow ||
          !event.data ||
          typeof event.data !== 'object'
        )
          return;
        const data = event.data as Record<string, unknown>;
        if (data['type'] === 'chart-possibilities:resize') {
          const height = data['height'];
          if (typeof height === 'number' && Number.isFinite(height) && height > 0) {
            this.height.set(Math.min(30000, Math.ceil(height)));
            this.ready.set(true);
          }
        } else if (data['type'] === 'chart-possibilities:anchor') {
          const top = data['top'];
          if (typeof top === 'number' && Number.isFinite(top) && top >= 0 && top <= this.height()) {
            const frameTop = this.frame().nativeElement.getBoundingClientRect().top;
            hostWindow.scrollTo({ top: hostWindow.scrollY + frameTop + top - 80 });
          }
        }
      };
      hostWindow.addEventListener('message', receive);
      this.destroyRef.onDestroy(() => hostWindow.removeEventListener('message', receive));
      this.browserReady.set(true);
    });
    effect(() => {
      const theme = this.appearance.theme();
      if (this.browserReady()) this.sendTheme(theme);
    });
  }

  protected onGalleryLoad(): void {
    this.sendTheme(this.appearance.theme());
  }

  private sendTheme(theme: 'light' | 'dark'): void {
    const origin = this.document.defaultView?.location.origin;
    if (origin) {
      this.frame().nativeElement.contentWindow?.postMessage(
        { type: 'chart-possibilities:theme', theme },
        origin,
      );
    }
  }
}
