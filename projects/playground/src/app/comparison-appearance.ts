import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SiteAppearance } from './site-appearance';

/** Normal comparisons follow the site; explicit reference captures keep an isolated baseline. */
@Injectable()
export class ComparisonAppearance {
  private readonly site = inject(SiteAppearance);
  readonly referenceMode = inject(ActivatedRoute).snapshot.queryParamMap.get('reference') === '1';
  private readonly referenceTheme = signal<'light' | 'dark'>('light');
  readonly theme = computed(() => (this.referenceMode ? this.referenceTheme() : this.site.theme()));

  toggle(): void {
    if (this.referenceMode) {
      this.referenceTheme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
    } else {
      this.site.toggle();
    }
  }
}
