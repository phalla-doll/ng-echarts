import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

interface DemoPreloads {
  readonly base: string;
  readonly routes: Readonly<Record<string, readonly { href: string; rel: string }[]>>;
}

/** Build-derived hints warm destination code without evaluating it or mounting plots. */
@Injectable({ providedIn: 'root' })
export class DemoRendererPreloads {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const source = this.document.getElementById('demo-preloads')?.textContent;
    if (!source) return; // Development builds do not have emitted renderer hashes yet.
    const manifest = JSON.parse(source) as DemoPreloads;
    const warmed = new Set<string>();
    const warm = (route: string): void => {
      const resources = manifest.routes[route];
      if (!resources || warmed.has(route)) return;
      warmed.add(route);
      for (const { href, rel } of resources) {
        if (!/^[\w./-]+\.js$/u.test(href) || !['modulepreload', 'preload'].includes(rel)) continue;
        const url = manifest.base + href;
        if (
          Array.from(this.document.querySelectorAll('link')).some(
            (link) => link.getAttribute('href') === url,
          )
        )
          continue;
        const link = this.document.createElement('link');
        link.rel = rel;
        if (rel === 'preload') link.as = 'script';
        link.href = url;
        this.document.head.append(link);
      }
    };
    const subscription = inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationStart)) return;
      const route = event.url.split(/[?#]/u, 1)[0]!.replace(/^\/+|\/+$/gu, '');
      warm(route);
    });
    const intent = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('#site-navigation a[href]');
      if (!link) return;
      const destination = new URL(link.href, this.document.baseURI);
      if (
        destination.origin !== this.document.location?.origin ||
        !destination.pathname.startsWith(manifest.base)
      )
        return;
      warm(destination.pathname.slice(manifest.base.length).replace(/^\/+|\/+$/gu, ''));
    };
    afterNextRender(() => {
      const sidebar = this.document.getElementById('site-navigation');
      sidebar?.addEventListener('pointerover', intent);
      sidebar?.addEventListener('focusin', intent);
      this.destroyRef.onDestroy(() => {
        sidebar?.removeEventListener('pointerover', intent);
        sidebar?.removeEventListener('focusin', intent);
      });
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
