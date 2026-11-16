import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵPlotController,
  ɵChartFocusKeeper,
  ɵbrowserPlotEnvironment,
  ɵreadCartesianTheme,
  ɵdefaultCartesianTheme,
  ɵcreateValueFormatting,
  ɵresolveCartesianState,
  type ɵCartesianThemeTokens,
  type ChartTheme,
  type ValueFormatter,
} from '@mantha911/ng-echarts/core';
import { normalizeRadialProgress } from './radial-model';
import { buildRadialOptions, type RadialOption } from './radial-options';
import { RADIAL_RENDERER_LOADER } from './radial-browser';
@Component({
  selector: 'nec-radial-progress',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: './radial-progress.html',
  styleUrl: './radial-progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadialProgress {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly value = input.required<number | null>();
  readonly max = input(100);
  readonly height = input(240);
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);

  readonly #loader = inject(RADIAL_RENDERER_LOADER);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #destroyRef = inject(DestroyRef);
  readonly #application = inject(ApplicationRef);
  readonly #platform = inject(PLATFORM_ID);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  readonly #browserReady = signal(false);
  readonly #reducedMotion = signal(false);
  readonly #measuredTheme = signal<ɵCartesianThemeTokens | null>(null);
  #controller: ɵPlotController<RadialOption> | null = null;
  #focusKeeper: ɵChartFocusKeeper | null = null;
  #removeMotionListener: (() => void) | null = null;
  // A failed renderer stays failed until retry or a relevant input changes.
  protected readonly rendererError = linkedSignal(() => {
    this.model();
    this.#settings();
    this.#formatting();
    return false;
  });
  protected readonly model = computed(() => normalizeRadialProgress(this.value(), this.max()));
  readonly #formatting = computed(() => {
    const model = this.model();
    return ɵcreateValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'ready' ? [model.value, model.max] : [],
    );
  });
  readonly #percentFormatting = computed(() => {
    try {
      return {
        format: new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 })
          .format,
        error: null,
      };
    } catch {
      return { format: () => '', error: 'The progress locale is invalid.' };
    }
  });
  readonly #settings = computed(() => ({
    title: this.title(),
    height: this.height(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.#measuredTheme() ?? ɵdefaultCartesianTheme(this.theme()),
  );
  protected readonly plotHeight = computed(() =>
    Number.isFinite(this.height()) && this.height() > 0 ? this.height() : 240,
  );
  protected readonly state = computed(() => {
    const settings = this.#settings();
    const configurationError =
      typeof settings.title !== 'string' || !settings.title.trim()
        ? 'Progress title must be nonempty text.'
        : !Number.isFinite(settings.height) || settings.height <= 0
          ? 'Progress height must be a positive, finite number.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Progress theme configuration is invalid.'
            : typeof settings.animation !== 'boolean' || typeof settings.loading !== 'boolean'
              ? 'Progress animation and loading settings must be booleans.'
              : (this.#formatting().error ?? this.#percentFormatting().error);
    const state = ɵresolveCartesianState(
      settings.error,
      typeof settings.loading === 'boolean' && settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
    return state.kind === 'loading'
      ? { ...state, message: 'Loading progress…' }
      : state.kind === 'empty'
        ? { ...state, message: 'No progress data available.' }
        : state;
  });
  protected readonly labels = computed(() => {
    const model = this.model();
    if (model.kind !== 'ready') return { percent: '', values: '', accessible: '' };
    const formatPercent = this.#percentFormatting().format;
    const rounded = formatPercent(model.ratio);
    const percent =
      model.value > 0 && rounded === formatPercent(0)
        ? `<${formatPercent(0.001)}`
        : model.value < model.max && rounded === formatPercent(1)
          ? `>${formatPercent(0.999)}`
          : rounded;
    const values = `${this.#formatting().format(model.value)} of ${this.#formatting().format(model.max)}`;
    return { percent, values, accessible: `${percent}; ${values}` };
  });
  readonly #options = computed(() => {
    const model = this.model();
    return this.state().kind === 'ready' && model.kind === 'ready'
      ? buildRadialOptions(model, this.tokens(), this.animation() && !this.#reducedMotion())
      : null;
  });
  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.#platform)) return;
      void this.#application.whenStable().then(() => {
        if (this.#destroyRef.destroyed) return;
        try {
          const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
          this.#reducedMotion.set(preference.matches);
          const onMotion = (event: MediaQueryListEvent) => this.#reducedMotion.set(event.matches);
          preference.addEventListener('change', onMotion);
          this.#removeMotionListener = () => preference.removeEventListener('change', onMotion);
          this.#controller = new ɵPlotController(
            this.plot().nativeElement,
            ɵbrowserPlotEnvironment(() => this.#loader(), this.#host.nativeElement),
            () => {},
            () => this.rendererError.set(true),
          );
          this.#focusKeeper = new ɵChartFocusKeeper(this.#host.nativeElement);
          this.#browserReady.set(true);
        } catch {
          this.rendererError.set(true);
        }
      });
    });
    // Resolving CSS colors writes a probe and immediately reads its computed color.
    afterRenderEffect({
      mixedReadWrite: () => {
        if (!this.#browserReady()) return;
        const theme = this.theme();
        this.themeRevision();
        try {
          this.#measuredTheme.set(
            ɵreadCartesianTheme<{ value: number }>(
              this.#host.nativeElement,
              theme,
              [{ id: 'progress', key: 'value', label: this.title() }],
              this.plot().nativeElement,
            ),
          );
        } catch {
          this.rendererError.set(true);
        }
      },
    });
    // Option updates only schedule rendering or dispose the previous plot.
    afterRenderEffect({
      write: () => {
        this.#browserReady();
        this.#controller?.update(this.#options());
      },
    });
    // Focus restoration checks current DOM ownership before changing focus.
    afterRenderEffect({
      mixedReadWrite: () => {
        this.state();
        this.#focusKeeper?.restore();
      },
    });
    this.#destroyRef.onDestroy(() => {
      this.#removeMotionListener?.();
      this.#controller?.destroy();
      this.#focusKeeper?.destroy();
    });
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
