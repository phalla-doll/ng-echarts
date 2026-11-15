import { computed, Injectable, signal } from '@angular/core';

/** Session-only UI theme; initial server/client output stays deterministic. */
@Injectable({ providedIn: 'root' })
export class SiteAppearance {
  readonly dark = signal(true);
  readonly theme = computed(() => (this.dark() ? 'dark' : 'light'));

  toggle(): void {
    this.dark.update((dark) => !dark);
  }
}
