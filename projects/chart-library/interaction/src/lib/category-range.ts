import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { CategoryRangeCancellation, CategoryRangeSelection } from './category-range-types';

/** Optional graphical range input; application-owned native fields supply keyboard access. */
@Directive({ selector: 'nec-composed-chart[necCategoryRange], nec-bar-chart[necCategoryRange]' })
export class CategoryRange {
  readonly necCategoryRange = input.required<readonly string[]>();
  readonly rangeEnabled = input(false);
  /** Change this value when application context invalidates an in-progress gesture. */
  readonly rangeContext = input<unknown>(null);
  readonly categoryRangeSelect = output<CategoryRangeSelection>();
  readonly categoryRangeCancel = output<CategoryRangeCancellation>();
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #destroy = inject(DestroyRef);
  readonly #ready = signal(false);

  constructor() {
    afterNextRender(() => this.#ready.set(true));
    let previous: { ids: readonly string[]; context: unknown; enabled: boolean } | null = null;
    effect((onCleanup) => {
      if (!this.#ready()) return;
      const ids = this.necCategoryRange();
      const enabled = this.rangeEnabled();
      const context = this.rangeContext();
      const changed =
        previous &&
        previous.enabled &&
        enabled &&
        (previous.ids !== ids || previous.context !== context);
      previous = { ids, enabled, context };
      if (changed) {
        this.categoryRangeCancel.emit('context');
        return;
      }
      if (!enabled) return;
      let cancelled = false;
      let dispose: (() => void) | undefined;
      onCleanup(() => {
        cancelled = true;
        dispose?.();
      });
      void import('./category-range-browser')
        .then((browser) => {
          if (cancelled || this.#destroy.destroyed) return;
          dispose = browser.bindCategoryRange(
            this.#host.nativeElement,
            ids,
            (selection) => this.categoryRangeSelect.emit(selection),
            (reason) => this.categoryRangeCancel.emit(reason),
          );
        })
        .catch(() => {
          if (!cancelled && !this.#destroy.destroyed) this.categoryRangeCancel.emit('unavailable');
        });
    });
  }
}
