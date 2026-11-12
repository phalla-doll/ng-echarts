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
  '/get-started': 'Get started',
  '/installation': 'Installation',
  '/components': 'Components',
  '/playground': 'Bar playground',
  '/comparison': 'Visual comparison',
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
  private readonly routePath = computed(() => this.url().split(/[?#]/, 1)[0] ?? '/');
  protected readonly skipTarget = computed(() => this.routePath() + '#page-content');
  protected readonly galleryMode = computed(() => this.routePath() === '/');
  protected readonly themeLabel = computed(() =>
    this.dark() ? 'Use light theme' : 'Use dark theme',
  );
  protected readonly themeIcon = computed(() => (this.dark() ? 'sun' : 'moon'));
  protected readonly fullWidth = computed(() =>
    ['/comparison', '/benchmark'].includes(this.routePath()),
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
