import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵTablePager,
  ɵChartPresentation as ChartPresentation,
  ɵbindBrowserPlot as bindBrowserPlot,
  ɵreadCartesianTheme as readCartesianTheme,
  ɵresolveCartesianState as resolveCartesianState,
  ɵcreateValueFormatting as createValueFormatting,
  type ɵPlotPoint as PlotPoint,
  type ChartMeasure,
  type CategoryVisibilityChange,
} from '@mantha911/ng-echarts/core';
import { normalizePieData } from './pie-model';
import { PIE_RENDERER_LOADER } from './pie-browser';
import { buildPieOptions, type PieOption } from './pie-options';

@Component({
  selector: 'nec-pie-chart',
  imports: [ChartFrame, ɵChartStage, ɵTablePager],
  templateUrl: './pie-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
    './pie-chart.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<T extends object> extends ChartPresentation<T> {
  readonly #loader = inject(PIE_RENDERER_LOADER);
  readonly innerRadius = input(0);
  readonly showLabels = input(false);
  readonly showTotal = input(false);
  readonly measure = input.required<ChartMeasure<T>>();
  readonly legendChange = output<CategoryVisibilityChange>();

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  readonly #browserReady = signal(false);
  readonly #reducedMotion = signal(false);
  readonly #hiddenIds = linkedSignal<ReturnType<typeof normalizePieData<T>>, ReadonlySet<string>>({
    source: () => this.model(),
    computation: (model, previous) => {
      const hidden = previous?.value ?? new Set<string>();
      // Invalid data must not erase the user's last valid legend choices.
      if (model.kind === 'error') return hidden;
      const validIds = new Set(model.rows.map((row) => row.id));
      const retained = new Set([...hidden].filter((id) => validIds.has(id)));
      return retained.size === hidden.size ? hidden : retained;
    },
  });

  protected readonly model = computed(() =>
    normalizePieData(this.data(), this.rowIdKey(), this.categoryKey(), this.measure()),
  );
  readonly #formatting = computed(() => {
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
  readonly #settings = computed(() => ({
    height: this.height(),
    innerRadius: this.innerRadius(),
    showLabels: this.showLabels(),
    showTotal: this.showTotal(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
    tablePageSize: this.tablePageSize(),
  }));
  protected readonly state = computed(() => {
    const settings = this.#settings();
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
              : (this.tablePagination.error() ?? this.#formatting().error);
    return resolveCartesianState(
      settings.error,
      settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
  });
  readonly #percentFormat = computed(() => {
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
          (sum, row) => sum + (this.#hiddenIds().has(row.id) ? 0 : (row.points[0]?.value ?? 0)),
          0,
        );
  });
  protected readonly totalText = computed(() => this.#formatting().format(this.visibleTotal()));
  protected readonly legendItems = computed(() => {
    const hiddenIds = this.#hiddenIds();
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.rows.map((item, index) => {
      const value = item.points[0]?.value ?? null;
      const visible = !hiddenIds.has(item.id);
      return {
        id: item.id,
        label: item.category,
        visible,
        color: this.tokens().series[index % this.tokens().series.length],
        valueText: value === null ? 'Missing' : this.#formatting().format(value),
        shareText:
          !visible || value === null
            ? '—'
            : this.#percentFormat()(this.visibleTotal() > 0 ? value / this.visibleTotal() : 0),
      };
    });
  });
  protected readonly noVisibleValues = computed(() => {
    const model = this.model();
    return (
      model.kind !== 'error' &&
      !model.rows.some((row) => !this.#hiddenIds().has(row.id) && (row.points[0]?.value ?? 0) > 0)
    );
  });
  readonly #options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return buildPieOptions({
      model,
      hiddenIds: this.#hiddenIds(),
      tokens: this.tokens(),
      animation: this.animation() && !this.#reducedMotion(),
      format: this.#formatting().format,
      innerRadius: this.innerRadius(),
      showLabels: this.showLabels(),
      formatPercent: this.#percentFormat(),
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
      cells: row.points.map((point, index) => {
        const text = point.value === null ? 'Missing' : this.#formatting().format(point.value);
        return {
          ...point,
          text,
          actionLabel: `Select ${model.series[index]?.label ?? ''} for ${row.category}: ${text}`,
        };
      }),
    }));
  });

  protected override rendererInputs(): unknown {
    return [this.model(), this.#settings(), this.#formatting()];
  }

  constructor() {
    super();
    bindBrowserPlot({
      host: this.#host.nativeElement,
      plot: () => this.plot().nativeElement,
      load: () => this.#loader(),
      ready: this.#browserReady,
      reducedMotion: this.#reducedMotion,
      options: this.#options,
      readTheme: () => {
        if (!this.#browserReady()) return;
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
            readCartesianTheme(this.#host.nativeElement, theme, palette, this.plot().nativeElement),
          );
        } catch {
          this.rendererError.set(true);
        }
      },
      focusContext: () => [this.state(), this.tableRows(), this.legendItems()],
      onPoint: (point) => this.selectPoint(point, 'plot'),
      onError: () => this.rendererError.set(true),
    });
  }

  protected toggleCategory(id: string): void {
    if (this.state().kind !== 'ready') return;
    const hidden = new Set(this.#hiddenIds());
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    this.#hiddenIds.set(hidden);
    this.legendChange.emit({ rowId: id, visible: !hidden.has(id) });
  }

  protected selectPoint(point: PlotPoint, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return;
    if (source === 'plot' && this.#hiddenIds().has(point.rowId)) return;
    const value = model.rows
      .find((row) => row.id === point.rowId)
      ?.points.find((cell) => cell.seriesId === point.seriesId);
    if (!value || value.value === null) return;
    this.pointSelect.emit({ ...value, value: value.value, source });
  }
}
