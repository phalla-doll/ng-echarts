import { Injectable, signal } from '@angular/core';

/** Session-only UI theme; initial server/client output stays deterministic. */
@Injectable({ providedIn: 'root' })
export class SiteAppearance {
  readonly dark = signal(false);
  readonly galleryDark = signal(true);
}
