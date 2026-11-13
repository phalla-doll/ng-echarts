import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { SiteIcon } from './site-icon';
import { SiteAppearance } from './site-appearance';

const pageTitles: Readonly<Record<string, string>> = {
  '/': 'Bar Blocks',
  '/line': 'Line Blocks',
  '/pie': 'Pie & Donut Blocks',
  '/composed': 'Composed Blocks',
  '/composed-benchmark': 'Composed benchmark',
  '/composed-validation': 'Composed validation',
  '/pie-validation': 'Pie validation',
  '/area': 'Area Blocks',
  '/area-validation': 'Area validation',
  '/line-validation': 'Line validation',
  '/get-started': 'Get started',
  '/installation': 'Installation',
  '/components': 'Components',
  '/playground': 'Bar playground',
  '/comparison': 'Visual comparison',
  '/line-comparison': 'Line visual comparison',
  '/area-comparison': 'Area visual comparison',
  '/pie-comparison': 'Pie visual comparison',
  '/updates': 'Input updates',
  '/formatting': 'Value formatting',
  '/validation': 'Lifecycle validation',
  '/away': 'Navigation cleanup',
  '/benchmark': 'Render benchmark',
  '/retention': 'Retention validation',
};

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, SiteIcon],
  templateUrl: './root.html',
  styleUrl: './root.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Root {
  private readonly router = inject(Router);
  private readonly menuToggle = viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly appearance = inject(SiteAppearance);
  protected readonly dark = this.appearance.dark;
  protected readonly menuOpen = signal(false);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  private readonly routePath = computed(
    () => (this.url().split(/[?#]/, 1)[0] ?? '/').replace(/\/+$/, '') || '/',
  );
  protected readonly galleryMode = computed(() =>
    ['/', '/line', '/area', '/pie', '/composed'].includes(this.routePath()),
  );
  protected readonly themeLabel = computed(() =>
    this.dark() ? 'Use light theme' : 'Use dark theme',
  );
  protected readonly themeIcon = computed(() => (this.dark() ? 'sun' : 'moon'));
  protected readonly comparisonMode = computed(() =>
    ['/comparison', '/line-comparison', '/area-comparison', '/pie-comparison'].includes(
      this.routePath(),
    ),
  );
  protected readonly fullWidth = computed(
    () =>
      [
        '/benchmark',
        '/line-benchmark',
        '/area-benchmark',
        '/pie-benchmark',
        '/composed-benchmark',
      ].includes(this.routePath()) ||
      (this.comparisonMode() &&
        new URLSearchParams(this.url().split('?')[1]?.split('#')[0]).get('reference') === '1'),
  );
  protected readonly pageTitle = computed(() => pageTitles[this.routePath()] ?? 'Playground');
  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
  protected toggleTheme(): void {
    this.appearance.toggle();
  }
  protected closeMenu(restoreFocus = false): void {
    const wasOpen = this.menuOpen();
    this.menuOpen.set(false);
    if (restoreFocus && wasOpen) this.menuToggle().nativeElement.focus();
  }
}
