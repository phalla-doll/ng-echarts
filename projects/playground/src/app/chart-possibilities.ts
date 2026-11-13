import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  Renderer2,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SiteAppearance } from './site-appearance';
import { SiteIcon } from './site-icon';

const standaloneUrl = 'concepts/chart-style-gallery.html?v=0c7a20dadb90';

/** Keep a server-started iframe navigation alive during hydration. Angular reapplies
 * static attributes too, so src is assigned once here rather than in the template. */
@Directive({ selector: 'iframe[appConceptGallery]' })
class ConceptGallerySource {
  constructor() {
    const frame = inject<ElementRef<HTMLIFrameElement>>(ElementRef).nativeElement;
    if (!frame.hasAttribute('src'))
      inject(Renderer2).setAttribute(
        frame,
        'src',
        `${standaloneUrl.replace('.html?', '-embedded.html?')}&embedded=1&theme=dark`,
      );
  }
}

/** The approved standalone document is also the deployed concept gallery's source. */
@Component({
  selector: 'app-chart-possibilities',
  imports: [SiteIcon, ConceptGallerySource],
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
  protected readonly standaloneUrl = standaloneUrl;
  // The iframe uses a static bundled src in the template: hydration must not
  // reassign HTMLIFrameElement.src and restart an already loading document.
  private viewportFrame: number | null = null;
  private lastViewport = '';

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
            const next = Math.min(30000, Math.ceil(height));
            if (next !== this.height()) {
              this.height.set(next);
              this.scheduleViewport();
            }
            if (data['ready'] === true) this.ready.set(true);
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
      const viewport = () => this.scheduleViewport();
      hostWindow.addEventListener('scroll', viewport, { passive: true });
      hostWindow.addEventListener('resize', viewport);
      this.destroyRef.onDestroy(() => {
        hostWindow.removeEventListener('message', receive);
        hostWindow.removeEventListener('scroll', viewport);
        hostWindow.removeEventListener('resize', viewport);
        if (this.viewportFrame !== null) hostWindow.cancelAnimationFrame(this.viewportFrame);
      });
      this.browserReady.set(true);
      // Also synchronizes a child that finished before the hydration listener existed.
      this.onGalleryLoad();
    });
    effect(() => {
      const theme = this.appearance.theme();
      if (this.browserReady()) this.sendTheme(theme);
    });
  }

  protected onGalleryLoad(): void {
    this.lastViewport = '';
    this.sendTheme(this.appearance.theme());
    this.scheduleViewport();
  }

  private scheduleViewport(): void {
    const hostWindow = this.document.defaultView;
    if (!hostWindow || this.viewportFrame !== null || this.destroyRef.destroyed) return;
    this.viewportFrame = hostWindow.requestAnimationFrame(() => {
      this.viewportFrame = null;
      const top = this.frame().nativeElement.getBoundingClientRect().top;
      const viewport = { top: -top, bottom: hostWindow.innerHeight - top };
      const signature = JSON.stringify(viewport);
      if (signature === this.lastViewport) return;
      this.lastViewport = signature;
      this.frame().nativeElement.contentWindow?.postMessage(
        { type: 'chart-possibilities:viewport', ...viewport },
        hostWindow.location.origin,
      );
    });
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
