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
import {
  ChartFrame,
  ɵChartStage,
  ɵbrowserPlotEnvironment as browserPlotEnvironment,
  ɵreadCartesianTheme as readCartesianTheme,
  ɵresolveCartesianState as resolveCartesianState,
  ɵdefaultCartesianTheme as defaultCartesianTheme,
  ɵcreateValueFormatting as createValueFormatting,
  ɵChartFocusKeeper as ChartFocusKeeper,
  ɵPlotController as PlotController,
  type ɵCartesianThemeTokens as CartesianThemeTokens,
  type ɵPlotPoint as PlotPoint,
  type ChartMeasure,
  type ChartTheme,
  type CategoryVisibilityChange,
  type PointSelection,
  type StringKey,
  type ValueFormatter,
} from '@ng-echarts/chart-library/core';
import { normalizePieData } from './pie-model';
import { PIE_RENDERER_LOADER } from './pie-browser';
import { buildPieOptions, type PieOption } from './pie-options';

@Component({
  selector: 'nec-pie-chart',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: './pie-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<T extends object> {
  private readonly loader = inject(PIE_RENDERER_LOADER);
  readonly innerRadius = input(0);
  readonly showLabels = input(false);
  readonly showTotal = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly data = input.required<readonly T[]>();
  readonly rowIdKey = input.required<StringKey<T>>();
  readonly categoryKey = input.required<StringKey<T>>();
  readonly measure = input.required<ChartMeasure<T>>();
  readonly height = input(320);
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly showDataTable = input(true);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);
  readonly pointSelect = output<PointSelection<T>>();
  readonly legendChange = output<CategoryVisibilityChange>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly application = inject(ApplicationRef);
  private readonly platform = inject(PLATFORM_ID);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly hiddenIds = signal<ReadonlySet<string>>(new Set());
  private readonly measuredTheme = signal<CartesianThemeTokens | null>(null);
  private controller: PlotController<PieOption> | null = null;
  private removeMotionListener: (() => void) | null = null;
  private focusKeeper: ChartFocusKeeper | null = null;

  protected readonly rendererError = signal(false);
  protected readonly tableExpanded = signal(false);
  protected readonly model = computed(() =>
    normalizePieData(this.data(), this.rowIdKey(), this.categoryKey(), this.measure()),
  );
  private readonly formatting = computed(() => {
    const model = this.model();
    return createValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : [
            ...model.rows.flatMap((row) => row.points.map((point) => point.value)),
            ...(this.showTotal() ? [this.visibleTotal()] : []),
          ],
    );
  });
  private readonly settings = computed(() => ({
    height: this.height(),
    innerRadius: this.innerRadius(),
    showLabels: this.showLabels(),
    showTotal: this.showTotal(),
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
          : !Number.isFinite(settings.innerRadius) ||
              settings.innerRadius < 0 ||
              settings.innerRadius > 0.9
            ? 'Inner radius must be a finite ratio from 0 to 0.9.'
            : typeof settings.showLabels !== 'boolean' || typeof settings.showTotal !== 'boolean'
              ? 'Show labels and show total must be booleans.'
              : this.formatting().error;
    return resolveCartesianState(
      settings.error,
      settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
  });
  private readonly percentFormat = computed(() => {
    try {
      return new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 })
        .format;
    } catch {
      return (ratio: number) => String(ratio);
    }
  });
  protected readonly visibleTotal = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? 0
      : model.rows.reduce(
          (sum, row) => sum + (this.hiddenIds().has(row.id) ? 0 : (row.points[0]?.value ?? 0)),
          0,
        );
  });
  protected readonly totalText = computed(() => this.formatting().format(this.visibleTotal()));
  protected readonly legendItems = computed(() => {
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.rows.map((item, index) => {
      const value = item.points[0]?.value ?? null;
      const visible = !this.hiddenIds().has(item.id);
      return {
        id: item.id,
        label: item.category,
        visible,
        color: this.tokens().series[index % this.tokens().series.length],
        valueText: value === null ? 'Missing' : this.formatting().format(value),
        shareText:
          !visible || value === null
            ? '—'
            : this.percentFormat()(this.visibleTotal() > 0 ? value / this.visibleTotal() : 0),
      };
    });
  });
  protected readonly noVisibleValues = computed(() => {
    const model = this.model();
    return (
      model.kind !== 'error' &&
      !model.rows.some((row) => !this.hiddenIds().has(row.id) && (row.points[0]?.value ?? 0) > 0)
    );
  });
  private readonly options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return buildPieOptions({
      model,
      hiddenIds: this.hiddenIds(),
      tokens: this.tokens(),
      animation: this.animation() && !this.reducedMotion(),
      format: this.formatting().format,
      innerRadius: this.innerRadius(),
      showLabels: this.showLabels(),
      formatPercent: this.percentFormat(),
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
      this.rendererError.set(false);
    });
    effect(() => {
      const model = this.model();
      if (model.kind === 'error') return;
      const validIds = new Set(model.rows.map((row) => row.id));
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
            browserPlotEnvironment(() => this.loader(), this.host.nativeElement),
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
      const model = this.model();
      const theme = this.theme();
      this.themeRevision();
      if (model.kind === 'error') return;
      const palette = model.rows.map((row) => ({
        id: row.id,
        key: this.measure().key,
        label: row.category,
      }));
      try {
        this.measuredTheme.set(
          readCartesianTheme(this.host.nativeElement, theme, palette, this.plot().nativeElement),
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

  protected toggleCategory(id: string): void {
    if (this.state().kind !== 'ready') return;
    const hidden = new Set(this.hiddenIds());
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    this.hiddenIds.set(hidden);
    this.legendChange.emit({ rowId: id, visible: !hidden.has(id) });
  }

  protected selectPoint(point: PlotPoint, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return;
    if (source === 'plot' && this.hiddenIds().has(point.rowId)) return;
    const value = model.rows
      .find((row) => row.id === point.rowId)
      ?.points.find((cell) => cell.seriesId === point.seriesId);
    if (!value || value.value === null) return;
    this.pointSelect.emit({ ...value, value: value.value, source });
  }
}
