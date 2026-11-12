import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
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
import { BAR_RENDERER_LOADER, browserPlotEnvironment, readBarTheme } from './bar-browser';
import { normalizeBarData, resolveBarState } from './bar-model';
import { buildBarOptions, defaultBarTheme, type BarThemeTokens } from './bar-options';
import { ChartFrame } from './chart-frame';
import { formatCategoryTicks } from './category-ticks';
import { createValueFormatting } from './value-formatting';
import { ChartFocusKeeper } from './chart-focus';
import type {
  BarLayout,
  CategoryTickFormatter,
  ChartSeries,
  ChartTheme,
  LegendVisibilityChange,
  PointSelection,
  StringKey,
  ValueFormatter,
} from './chart-types';
import { PlotController, type PlotPoint } from './plot-controller';

/** Experimental bar prototype. The contract remains subject to the feasibility gates. */
@Component({
  selector: 'nec-bar-chart',
  imports: [ChartFrame],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart<T extends object> {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly data = input.required<readonly T[]>();
  readonly rowIdKey = input.required<StringKey<T>>();
  readonly categoryKey = input.required<StringKey<T>>();
  readonly series = input.required<readonly ChartSeries<T>[]>();
  readonly height = input(320);
  readonly layout = input<BarLayout>('vertical');
  readonly stacked = input(false);
  readonly gradient = input(false);
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
  private readonly loadRenderer = inject(BAR_RENDERER_LOADER);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());
  private readonly measuredTheme = signal<BarThemeTokens | null>(null);
  private controller: PlotController | null = null;
  private removeMotionListener: (() => void) | null = null;
  private focusKeeper: ChartFocusKeeper | null = null;

  protected readonly rendererError = signal(false);
  protected readonly tableExpanded = signal(false);
  protected readonly model = computed(() =>
    normalizeBarData(this.data(), this.rowIdKey(), this.categoryKey(), this.series()),
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
    layout: this.layout(),
    stacked: this.stacked(),
    gradient: this.gradient(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(() => this.measuredTheme() ?? defaultBarTheme(this.theme()));
  protected readonly plotHeight = computed(() =>
    Number.isFinite(this.height()) && this.height() > 0 ? this.height() : 320,
  );
  protected readonly state = computed(() => {
    const settings = this.settings();
    const configurationError =
      !Number.isFinite(settings.height) || settings.height <= 0
        ? 'Chart height must be a positive, finite number.'
        : !['vertical', 'horizontal'].includes(settings.layout)
          ? 'Chart layout is invalid.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Chart theme configuration is invalid.'
            : (this.formatting().error ?? this.categoryTicks().error);
    return resolveBarState(
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
  private readonly options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return buildBarOptions(
      model,
      this.hiddenIds(),
      this.tokens(),
      this.layout(),
      this.stacked(),
      this.gradient(),
      this.animation() && !this.reducedMotion(),
      this.formatting().format,
      this.categoryTicks().labels,
    );
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
            browserPlotEnvironment(this.loadRenderer, this.host.nativeElement),
            (point) => this.selectPoint(point, 'plot'),
            () => this.rendererError.set(true),
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
          readBarTheme(this.host.nativeElement, theme, series, this.plot().nativeElement),
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
      this.state();
      this.tableRows();
      this.legendItems();
      this.focusKeeper?.restore();
    });
    this.destroyRef.onDestroy(() => {
      this.removeMotionListener?.();
      this.controller?.destroy();
      this.focusKeeper?.destroy();
    });
  }

  protected toggleTable(): void {
    this.tableExpanded.update((expanded) => !expanded);
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
    this.pointSelect.emit({ ...value, value: value.value, source });
  }
}
