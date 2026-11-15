import { afterNextRender, DestroyRef, inject, Injectable, signal } from '@angular/core';

/** Hydrate all gallery plots for print, while ordinary browsing follows the viewport. */
@Injectable({ providedIn: 'root' })
export class DemoPrintMode {
  readonly active = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const media = matchMedia('print');
      const update = () => this.active.set(media.matches);
      const before = () => this.active.set(true);
      const after = () => this.active.set(false);
      media.addEventListener('change', update);
      window.addEventListener('beforeprint', before);
      window.addEventListener('afterprint', after);
      update();
      this.destroyRef.onDestroy(() => {
        media.removeEventListener('change', update);
        window.removeEventListener('beforeprint', before);
        window.removeEventListener('afterprint', after);
      });
    });
  }
}
