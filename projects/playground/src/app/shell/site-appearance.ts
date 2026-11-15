import { afterNextRender, computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';

const themeStorageKey = 'ng-echarts-theme';

/** Restore the saved UI theme after hydration to keep server/client output deterministic. */
@Injectable({ providedIn: 'root' })
export class SiteAppearance {
  private readonly document = inject(DOCUMENT);
  private storage: Storage | null = null;
  readonly dark = signal(true);
  readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));

  constructor() {
    afterNextRender(() => {
      try {
        this.storage = this.document.defaultView?.localStorage ?? null;
        const saved = this.storage?.getItem(themeStorageKey);
        if (saved === 'light' || saved === 'dark') this.dark.set(saved === 'dark');
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    });
  }

  toggle(): void {
    this.dark.update((dark) => !dark);
    try {
      this.storage?.setItem(themeStorageKey, this.theme());
    } catch {
      // Keep the current page usable even when persistence is denied or full.
    }
  }
}
