import { ChartPresentation } from './chart-presentation';
import {
  ChangeDetectionStrategy,
  Directive,
  computed,
  input,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { readCartesianTheme, observeTablePreviews } from './cartesian-browser';
import {
  normalizeCartesianData,
  resolveCartesianState,
  type CartesianModel,
} from './cartesian-model';
import type { CartesianThemeTokens } from './cartesian-options';
import type { PlotRendererFactory } from './plot-controller';
import { formatCategoryTicks } from './category-ticks';
import { createValueFormatting, type ValueFormatting } from './value-formatting';
import type {
  CategoryTickFormatter,
  ChartSeries,
  LegendVisibilityChange,
  PointPreview,
  ValueFormatter,
} from './chart-types';
import type { PlotPoint } from './plot-controller';
import { bindBrowserPlot } from './browser-plot';

interface PlotPreviewSnapshot {
  readonly point: PlotPoint;
  readonly context: readonly unknown[];
}

/** Internal Cartesian behavior shared by the Cartesian entries; not a supported consumer API. */
@Directive()
export abstract class CartesianChart<
  T extends object,
  Option,
  Series extends ChartSeries<T> = ChartSeries<T>,
> extends ChartPresentation<T> {
  protected abstract renderer(): Promise<PlotRendererFactory<Option>>;
  protected abstract familyConfiguration(): unknown;
  protected abstract familyError(): string | null;
  protected abstract buildOptions(context: CartesianContext<T>): Option;
  protected seriesLabel(series: ChartSeries<T>): string {
    return series.label;
  }
  protected valueAxisDescription(): string {
    return '';
  }
  protected valueFormatting(model: CartesianModel<T>): ValueFormatting {
    return createValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : model.rows.flatMap((row) => row.points.map((point) => point.value)),
    );
  }
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
    this.tablePagination.page(),
  ]);
  private readonly plotPreview = linkedSignal<
    { readonly context: readonly unknown[]; readonly ready: boolean },
    PlotPreviewSnapshot | null
  >({
    source: () => ({ context: this.plotContext(), ready: this.state().kind === 'ready' }),
    computation: ({ context, ready }, previous) =>
      ready && previous?.value?.context === context ? previous.value : null,
    equal: (a, b) =>
      a?.context === b?.context &&
      a?.point.rowId === b?.point.rowId &&
      a?.point.seriesId === b?.point.seriesId,
  });
  private previewSnapshot: readonly unknown[] | null = null;
  private readonly previewContext = computed(() => [
    this.model(),
    this.settings(),
    this.hiddenIds(),
    this.tableExpanded(),
    this.tablePagination.page(),
    this.state(),
  ]);
  readonly series = input.required<readonly Series[]>();
  readonly categoryTickFormatter = input<CategoryTickFormatter>();
  readonly legendChange = output<LegendVisibilityChange>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly hiddenIds = linkedSignal<readonly Series[], ReadonlySet<string>>({
    source: this.series,
    computation: (series, previous) => {
      const hidden = previous?.value ?? new Set<string>();
      // Valid removals still count while row data is loading or invalid.
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
        return hidden;
      const validIds = new Set(series.map((item) => item.id));
      if (validIds.size !== series.length) return hidden;
      const retained = new Set([...hidden].filter((id) => validIds.has(id)));
      return retained.size === hidden.size ? hidden : retained;
    },
  });
  private removePreviewListeners: (() => void) | null = null;

  protected readonly model = computed(() =>
    normalizeCartesianData(this.data(), this.rowIdKey(), this.categoryKey(), this.series()),
  );
  private readonly formatting = computed(() => this.valueFormatting(this.model()));
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
    tablePageSize: this.tablePageSize(),
  }));
  protected readonly state = computed(() => {
    const settings = this.settings();
    const configurationError =
      !Number.isFinite(settings.height) || settings.height <= 0
        ? 'Chart height must be a positive, finite number.'
        : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
          ? 'Chart theme configuration is invalid.'
          : (this.familyError() ??
            this.tablePagination.error() ??
            this.formatting().error ??
            this.categoryTicks().error);
    return resolveCartesianState(
      settings.error,
      settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
  });
  protected readonly legendItems = computed(() => {
    // Reconcile removals even when invalid rows leave the legend empty.
    const hiddenIds = this.hiddenIds();
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.series.map((item, index) => ({
      id: item.id,
      label: this.seriesLabel(item),
      visible: !hiddenIds.has(item.id),
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
      pointFormat: this.formatting().pointFormat,
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
    return this.tablePagination.rows(model.rows).map((row) => ({
      id: row.id,
      category: row.category,
      selected: this.rowIsSelected(row.id),
      current: row.id === this.rowSelectionId(),
      cells: row.points.map((point, index) => {
        const text =
          point.value === null
            ? 'Missing'
            : (this.formatting().pointFormat?.(point.value, point.seriesId) ??
              this.formatting().format(point.value));
        return {
          ...point,
          text,
          actionLabel: `Select ${this.seriesLabel(model.series[index]!)} for ${row.category}: ${text}`,
        };
      }),
    }));
  });

  protected override rendererInputs(): unknown {
    return [this.model(), this.settings(), this.formatting(), this.categoryTicks()];
  }

  constructor() {
    super();
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
      const enabled = this.canPreview();
      // Native pointer events can arrive before Angular propagates an enabling
      // input. Reconcile the latest hit after inputs settle, without a new move.
      if (enabled) untracked(() => this.previewPoint(current?.point ?? null, 'plot', 'pointer'));
    });
    bindBrowserPlot({
      host: this.host.nativeElement,
      plot: () => this.plot().nativeElement,
      load: () => this.renderer(),
      ready: this.browserReady,
      reducedMotion: this.reducedMotion,
      options: this.options,
      readTheme: () => {
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
      },
      observePreviews: () => {
        if (this.browserReady() && this.observePreviews()) {
          this.removePreviewListeners ??= observeTablePreviews(
            this.host.nativeElement,
            (point, trigger) => this.previewPoint(point, 'table', trigger),
          );
        } else {
          this.removePreviewListeners?.();
          this.removePreviewListeners = null;
        }
      },
      cleanup: () => this.removePreviewListeners?.(),
      focusContext: () => [this.state(), this.tableRows(), this.legendItems()],
      onPoint: (point) => this.selectPoint(point, 'plot'),
      onError: () => this.rendererError.set(true),
      onRange: (ids, snapshot) => this.selectRange(ids, snapshot),
      onPreview: (point) =>
        this.plotPreview.set(point ? { point, context: this.plotContext() } : null),
    });
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
  readonly pointFormat?: (value: number, seriesId: string) => string;
  readonly categoryTicks: readonly string[];
}
