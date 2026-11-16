import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  DestroyRef,
  inject,
  PLATFORM_ID,
  type WritableSignal,
} from '@angular/core';
import { browserPlotEnvironment } from './cartesian-browser';
import { ChartFocusKeeper } from './chart-focus';
import { PlotController, type PlotPoint, type PlotRendererFactory } from './plot-controller';

interface BrowserPlotBinding<Option> {
  readonly host: HTMLElement;
  readonly plot: () => HTMLElement;
  readonly load: () => Promise<PlotRendererFactory<Option>>;
  readonly ready: WritableSignal<boolean>;
  readonly reducedMotion: WritableSignal<boolean>;
  readonly options: () => Option | null;
  readonly readTheme: () => void;
  readonly observePreviews?: () => void;
  readonly cleanup?: () => void;
  readonly focusContext: () => unknown;
  readonly onPoint: (point: PlotPoint) => void;
  readonly onError: () => void;
  readonly onRange?: (ids: readonly string[], snapshot: unknown) => void;
  readonly onPreview?: (point: PlotPoint | null) => void;
}

/** Browser lifecycle shared by native chart components; requires an injection context. */
export function bindBrowserPlot<Option>(binding: BrowserPlotBinding<Option>): void {
  const destroy = inject(DestroyRef);
  const application = inject(ApplicationRef);
  const platform = inject(PLATFORM_ID);
  let controller: PlotController<Option> | null = null;
  let focus: ChartFocusKeeper | null = null;
  let removeMotion: (() => void) | undefined;
  afterNextRender(() => {
    if (!isPlatformBrowser(platform)) return;
    void application.whenStable().then(() => {
      if (destroy.destroyed) return;
      try {
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        binding.reducedMotion.set(preference.matches);
        const motion = (event: MediaQueryListEvent) => binding.reducedMotion.set(event.matches);
        preference.addEventListener('change', motion);
        removeMotion = () => preference.removeEventListener('change', motion);
        controller = new PlotController(
          binding.plot(),
          browserPlotEnvironment(binding.load, binding.host),
          binding.onPoint,
          binding.onError,
          binding.onRange,
          binding.onPreview,
        );
        binding.ready.set(true);
        focus = new ChartFocusKeeper(binding.host);
      } catch {
        binding.onError();
      }
    });
  });
  // Preserve component phase ordering: theme, options, previews, then focus.
  afterRenderEffect({ mixedReadWrite: binding.readTheme });
  afterRenderEffect({
    write: () => {
      binding.ready();
      controller?.update(binding.options());
    },
  });
  if (binding.observePreviews) afterRenderEffect({ mixedReadWrite: binding.observePreviews });
  afterRenderEffect({
    mixedReadWrite: () => {
      binding.focusContext();
      focus?.restore();
    },
  });
  destroy.onDestroy(() => {
    removeMotion?.();
    binding.cleanup?.();
    controller?.destroy();
    focus?.destroy();
  });
}
