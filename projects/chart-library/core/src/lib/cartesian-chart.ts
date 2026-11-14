import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  ChangeDetectionStrategy,
  Directive,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  browserPlotEnvironment,
  readCartesianTheme,
  observeTablePreviews,
} from './cartesian-browser';
import {
  normalizeCartesianData,
  resolveCartesianState,
  type CartesianModel,
} from './cartesian-model';
import { defaultCartesianTheme, type CartesianThemeTokens } from './cartesian-options';
import type { PlotRendererFactory } from './plot-controller';
import { formatCategoryTicks } from './category-ticks';
import { createValueFormatting } from './value-formatting';
import { ChartFocusKeeper } from './chart-focus';
import type {
  CategoryTickFormatter,
  ChartSeries,
  ChartTheme,
  LegendVisibilityChange,
  PointSelection,
  PointPreview,
  StringKey,
  ValueFormatter,
} from './chart-types';
import { PlotController, type PlotPoint } from './plot-controller';

/** Internal Cartesian behavior shared by the Cartesian entries; not a supported consumer API. */
@Directive()
export abstract class CartesianChart<
  T extends object,
  Option,
  Series extends ChartSeries<T> = ChartSeries<T>,
> {
  protected abstract renderer(): Promise<PlotRendererFactory<Option>>;
  protected abstract familyConfiguration(): unknown;
  protected abstract familyError(): string | null;
  protected abstract buildOptions(context: CartesianContext<T>): Option;
  /** A family can opt into controlled row feedback without changing point events. */
  protected rowSelectionId(): string | null {
    return null;
  }
  protected rowIsSelected(id: string): boolean {
    return id === this.rowSelectionId();
  }
  protected selectRange(_rowIds: readonly string[], _snapshot: unknown): void {}
  protected canPreview(): boolean {
    return false;
  }
  protected observePreviews(): boolean {
    return this.canPreview();
  }
  protected emitPreview(_point: PointPreview<T> | null): void {}
  private pointerPreview: { point: PlotPoint; source: 'plot' | 'table' } | null = null;
  private focusPreview: PlotPoint | null = null;
  private lastPreview: PointPreview<T> | null = null;
  private readonly plotContext = computed(() => [
    this.model(),
    this.settings(),
    this.hiddenIds(),
    this.formatting(),
    this.categoryTicks(),
    this.tokens(),
    this.tableExpanded(),
  ]);
  private readonly plotPreview = signal<{ point: PlotPoint; context: readonly unknown[] } | null>(
    null,
    {
      equal: (a, b) =>
        a?.context === b?.context &&
        a?.point.rowId === b?.point.rowId &&
        a?.point.seriesId === b?.point.seriesId,
    },
  );
  private previewSnapshot: readonly unknown[] | null = null;
  private readonly previewContext = computed(() => [
    this.model(),
    this.settings(),
    this.hiddenIds(),
    this.tableExpanded(),
    this.state(),
  ]);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly data = input.required<readonly T[]>();
  readonly rowIdKey = input.required<StringKey<T>>();
  readonly categoryKey = input.required<StringKey<T>>();
  readonly series = input.required<readonly Series[]>();
  readonly height = input(320);
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly categoryTickFormatter = input<CategoryTickFormatter>();
  readonly showDataTable = input(true);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);
  readonly pointSelect = output<PointSelection<T>>();
  readonly legendChange = output<LegendVisibilityChange>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly application = inject(ApplicationRef);
  private readonly platform = inject(PLATFORM_ID);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());
  private readonly measuredTheme = signal<CartesianThemeTokens | null>(null);
  private controller: PlotController<Option> | null = null;
  private removeMotionListener: (() => void) | null = null;
  private focusKeeper: ChartFocusKeeper | null = null;
  private removePreviewListeners: (() => void) | null = null;

  protected readonly rendererError = signal(false);
  protected readonly tableExpanded = signal(false);
  protected readonly model = computed(() =>
    normalizeCartesianData(this.data(), this.rowIdKey(), this.categoryKey(), this.series()),
  );
  private readonly formatting = computed(() => {
    const model = this.model();
    return createValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : model.rows.flatMap((row) => row.points.map((point) => point.value)),
    );
  });
  private readonly categoryTicks = computed(() => {
    const model = this.model();
    return formatCategoryTicks(
      model.kind === 'error' ? [] : model.rows.map((row) => row.category),
      this.categoryTickFormatter(),
    );
  });
  private readonly settings = computed(() => ({
    height: this.height(),
    family: this.familyConfiguration(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.measuredTheme() ?? defaultCartesianTheme(this.theme()),
  );
  protected readonly plotHeight = computed(() =>
    Number.isFinite(this.height()) && this.height() > 0 ? this.height() : 320,
  );
  protected readonly state = computed(() => {
    const settings = this.settings();
    const configurationError =
      !Number.isFinite(settings.height) || settings.height <= 0
        ? 'Chart height must be a positive, finite number.'
        : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
          ? 'Chart theme configuration is invalid.'
          : (this.familyError() ?? this.formatting().error ?? this.categoryTicks().error);
    return resolveCartesianState(
      settings.error,
      settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
  });
  protected readonly legendItems = computed(() => {
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.series.map((item, index) => ({
      id: item.id,
      label: item.label,
      visible: !this.hiddenIds().has(item.id),
      color: this.tokens().series[index % this.tokens().series.length],
    }));
  });
  protected readonly allSeriesHidden = computed(() => {
    const items = this.legendItems();
    return items.length > 0 && items.every((item) => !item.visible);
  });
  private readonly options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return this.buildOptions({
      model,
      hiddenIds: this.hiddenIds(),
      tokens: this.tokens(),
      animation: this.animation() && !this.reducedMotion(),
      format: this.formatting().format,
      categoryTicks: this.categoryTicks().labels,
    });
  });
  protected readonly tableRows = computed(() => {
    const model = this.model();
    if (
      !this.showDataTable() ||
      !this.tableExpanded() ||
      this.state().kind !== 'ready' ||
      model.kind === 'error'
    )
      return [];
    return model.rows.map((row) => ({
      id: row.id,
      category: row.category,
      selected: this.rowIsSelected(row.id),
      current: row.id === this.rowSelectionId(),
      cells: row.points.map((point, index) => {
        const text = point.value === null ? 'Missing' : this.formatting().format(point.value);
        return {
          ...point,
          text,
          actionLabel: `Select ${model.series[index]?.label ?? ''} for ${row.category}: ${text}`,
        };
      }),
    }));
  });

  constructor() {
    // Input changes permit recovery; changes to rendererError itself never trigger this effect.
    effect(() => {
      this.model();
      this.settings();
      this.formatting();
      this.categoryTicks();
      this.rendererError.set(false);
    });
    effect(() => {
      const context = this.previewContext();
      // An event can already describe the new inputs before this scheduled effect
      // runs. Invalidate only previews captured against an older context.
      untracked(() => {
        if (this.previewSnapshot !== context) this.clearPreview();
      });
    });
    effect(() => {
      const current = this.plotPreview();
      const context = this.plotContext();
      const ready = this.state().kind === 'ready';
      const hidden = this.hiddenIds();
      const enabled = this.canPreview();
      if (
        current &&
        (current.context !== context || !ready || hidden.has(current.point.seriesId))
      ) {
        this.plotPreview.set(null);
        return;
      }
      // Native pointer events can arrive before Angular propagates an enabling
      // input. Reconcile the latest hit after inputs settle, without a new move.
      if (enabled) untracked(() => this.previewPoint(current?.point ?? null, 'plot', 'pointer'));
    });
    effect(() => {
      // Valid series removals still count while row data is loading or invalid.
      const series = this.series();
      if (
        !Array.isArray(series) ||
        !series.every(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            item.id &&
            typeof item.key === 'string' &&
            typeof item.label === 'string',
        )
      )
        return;
      const validIds = new Set(series.map((item) => item.id));
      if (validIds.size !== series.length) return;
      const previous = untracked(this.hiddenIds);
      const retained = new Set([...previous].filter((id) => validIds.has(id)));
      if (retained.size !== previous.size) this.hiddenIds.set(retained);
    });
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platform)) return;
      void this.application.whenStable().then(() => {
        if (this.destroyRef.destroyed) return;
        try {
          const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
          this.reducedMotion.set(preference.matches);
          const onMotion = (event: MediaQueryListEvent): void =>
            this.reducedMotion.set(event.matches);
          preference.addEventListener('change', onMotion);
          this.removeMotionListener = () => preference.removeEventListener('change', onMotion);
          this.controller = new PlotController(
            this.plot().nativeElement,
            browserPlotEnvironment(() => this.renderer(), this.host.nativeElement),
            (point) => this.selectPoint(point, 'plot'),
            () => this.rendererError.set(true),
            (ids, snapshot) => this.selectRange(ids, snapshot),
            (point) => this.plotPreview.set(point ? { point, context: this.plotContext() } : null),
          );
          this.browserReady.set(true);
          this.focusKeeper = new ChartFocusKeeper(this.host.nativeElement);
        } catch {
          this.rendererError.set(true);
        }
      });
    });
    afterRenderEffect(() => {
      if (!this.browserReady()) return;
      const series = this.series();
      const theme = this.theme();
      this.themeRevision();
      if (
        !Array.isArray(series) ||
        !series.every(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            typeof item.key === 'string' &&
            typeof item.label === 'string',
        )
      )
        return;
      try {
        this.measuredTheme.set(
          readCartesianTheme(this.host.nativeElement, theme, series, this.plot().nativeElement),
        );
      } catch {
        this.rendererError.set(true);
      }
    });
    afterRenderEffect(() => {
      this.browserReady();
      this.controller?.update(this.options());
    });
    afterRenderEffect(() => {
      if (this.browserReady() && this.observePreviews()) {
        this.removePreviewListeners ??= observeTablePreviews(
          this.host.nativeElement,
          (point, trigger) => this.previewPoint(point, 'table', trigger),
        );
      } else {
        this.removePreviewListeners?.();
        this.removePreviewListeners = null;
      }
    });
    afterRenderEffect(() => {
      this.state();
      this.tableRows();
      this.legendItems();
      this.focusKeeper?.restore();
    });
    this.destroyRef.onDestroy(() => {
      this.removeMotionListener?.();
      this.removePreviewListeners?.();
      this.controller?.destroy();
      this.focusKeeper?.destroy();
    });
  }

  protected toggleTable(): void {
    this.tableExpanded.update((expanded) => !expanded);
  }

  protected previewPoint(
    point: PlotPoint | null,
    source: 'plot' | 'table',
    trigger: 'pointer' | 'focus',
  ): void {
    if (this.destroyRef.destroyed || !this.canPreview()) return;
    const context = this.previewContext();
    if (this.previewSnapshot !== context) this.clearPreview();
    if (trigger === 'focus') this.focusPreview = point;
    else this.pointerPreview = point ? { point, source } : null;
    const pointer = this.pointerPreview;
    const candidate = pointer?.point ?? this.focusPreview;
    const origin = pointer?.source ?? 'table';
    const model = this.model();
    const value =
      candidate &&
      model.kind !== 'error' &&
      this.state().kind === 'ready' &&
      !(origin === 'plot' && this.hiddenIds().has(candidate.seriesId))
        ? model.rows
            .find((row) => row.id === candidate.rowId)
            ?.points.find((cell) => cell.seriesId === candidate.seriesId)
        : null;
    const next: PointPreview<T> | null =
      value && value.value !== null
        ? { ...value, value: value.value, source: origin, trigger: pointer ? 'pointer' : 'focus' }
        : null;
    this.previewSnapshot = context;
    if (
      next?.row === this.lastPreview?.row &&
      next?.seriesId === this.lastPreview?.seriesId &&
      next?.value === this.lastPreview?.value &&
      next?.source === this.lastPreview?.source &&
      next?.trigger === this.lastPreview?.trigger
    )
      return;
    this.lastPreview = next;
    this.emitPreview(next);
  }

  private clearPreview(): void {
    this.previewSnapshot = null;
    this.pointerPreview = this.focusPreview = null;
    if (this.lastPreview === null) return;
    this.lastPreview = null;
    this.emitPreview(null);
  }

  protected resetPointPreview(): void {
    this.plotPreview.set(null);
    this.clearPreview();
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }

  protected toggleSeries(id: string): void {
    if (this.state().kind !== 'ready') return;
    const hidden = new Set(this.hiddenIds());
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    this.hiddenIds.set(hidden);
    this.legendChange.emit({ seriesId: id, visible: !hidden.has(id) });
  }

  protected selectPoint(point: PlotPoint, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return;
    if (source === 'plot' && this.hiddenIds().has(point.seriesId)) return;
    const value = model.rows
      .find((row) => row.id === point.rowId)
      ?.points.find((cell) => cell.seriesId === point.seriesId);
    if (!value || value.value === null) return;
    this.resetPointPreview();
    this.pointSelect.emit({ ...value, value: value.value, source });
  }
}

export interface CartesianContext<T> {
  readonly model: Exclude<CartesianModel<T>, { kind: 'error' }>;
  readonly hiddenIds: ReadonlySet<string>;
  readonly tokens: CartesianThemeTokens;
  readonly animation: boolean;
  readonly format: ValueFormatter;
  readonly categoryTicks: readonly string[];
}
