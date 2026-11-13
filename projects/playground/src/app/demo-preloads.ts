import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

interface DemoPreloads {
  readonly base: string;
  readonly routes: Readonly<Record<string, readonly { href: string; rel: string }[]>>;
}

/** Build-derived hints warm only the destination's browser renderer, without evaluating it. */
@Injectable({ providedIn: 'root' })
export class DemoRendererPreloads {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const source = this.document.getElementById('demo-preloads')?.textContent;
    if (!source) return; // Development builds do not have emitted renderer hashes yet.
    const manifest = JSON.parse(source) as DemoPreloads;
    const subscription = inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationStart)) return;
      const route = event.url.split(/[?#]/u, 1)[0]!.replace(/^\/+|\/+$/gu, '');
      for (const { href, rel } of manifest.routes[route] ?? []) {
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
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
