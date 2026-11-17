import {
  computed,
  Directive,
  input,
  linkedSignal,
  output,
  signal,
  ElementRef,
  inject,
  viewChild,
  type Signal,
} from '@angular/core';
import type {
  ChartSeries,
  ChartTheme,
  LegendLayout,
  PointSelection,
  StringKey,
  ValueFormatter,
} from './chart-types';
import { defaultCartesianTheme, type CartesianThemeTokens } from './cartesian-options';
import { TablePagination } from './table-pagination';
import { resolveCartesianState, type CartesianModel } from './cartesian-model';
import type { ValueFormatting } from './value-formatting';
import type { PlotPoint, PlotRendererFactory } from './plot-controller';
import { bindBrowserPlot } from './browser-plot';
import { readCartesianTheme } from './cartesian-browser';

/** Internal shared signal inputs and native-table state; families own validation and rendering. */
@Directive()
export abstract class ChartPresentation<T extends object, Option = unknown> {
  protected abstract rendererInputs(): unknown;
  protected abstract renderer(): Promise<PlotRendererFactory<Option>>;
  protected abstract themeSeries(): readonly ChartSeries<T>[] | null;
  protected abstract readonly options: Signal<Option | null>;
  protected abstract readonly legendItems: Signal<unknown>;
  protected abstract readonly model: Signal<CartesianModel<T>>;
  protected abstract readonly formatting: Signal<ValueFormatting>;
  protected abstract familyConfiguration(): unknown;
  protected abstract familyError(): string | null;
  protected categoryError(): string | null {
    return null;
  }
  protected pointHidden(_point: PlotPoint): boolean {
    return false;
  }
  protected readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  protected readonly browserReady = signal(false);
  protected readonly reducedMotion = signal(false);
  protected selectRange(_rowIds: readonly string[], _snapshot: unknown): void {}
  protected previewPlotPoint(_point: PlotPoint | null): void {}
  protected observeTablePreviews(): void {}
  protected cleanupPreviews(): void {}
  readonly title = input.required<string>();
  readonly description = input('');
  readonly legendLayout = input<LegendLayout>('chips');
  readonly data = input.required<readonly T[]>();
  readonly rowIdKey = input.required<StringKey<T>>();
  readonly categoryKey = input.required<StringKey<T>>();
  readonly height = input(320);
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly showDataTable = input(true);
  readonly tablePageSize = input<number | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);
  readonly pointSelect = output<PointSelection<T>>();
  protected readonly measuredTheme = signal<CartesianThemeTokens | null>(null);
  protected readonly tokens = computed(
    () => this.measuredTheme() ?? defaultCartesianTheme(this.theme()),
  );
  // A failed renderer stays failed until retry or a relevant input changes.
  protected readonly rendererError = linkedSignal(() => {
    this.rendererInputs();
    return false;
  });
  protected readonly tableExpanded = signal(false);
  protected readonly tablePagination = new TablePagination(this.data, this.tablePageSize);
  protected readonly plotHeight = computed(() =>
    Number.isFinite(this.height()) && this.height() > 0 ? this.height() : 320,
  );
  protected seriesLabel(series: ChartSeries<T>): string {
    return series.label;
  }
  /** A family can opt into controlled row feedback without changing point events. */
  protected rowSelectionId(): string | null {
    return null;
  }
  protected rowIsSelected(id: string): boolean {
    return id === this.rowSelectionId();
  }
  protected resetPointPreview(): void {}
  protected readonly settings = computed(() => ({
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
            this.categoryError());
    return resolveCartesianState(
      settings.error,
      settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
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

  protected selectPoint(point: PlotPoint, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return;
    if (source === 'plot' && this.pointHidden(point)) return;
    const value = model.rows
      .find((row) => row.id === point.rowId)
      ?.points.find((cell) => cell.seriesId === point.seriesId);
    if (!value || value.value === null) return;
    this.resetPointPreview();
    this.pointSelect.emit({ ...value, value: value.value, source });
  }

  constructor() {
    bindBrowserPlot({
      host: this.host.nativeElement,
      plot: () => this.plot().nativeElement,
      load: () => this.renderer(),
      ready: this.browserReady,
      reducedMotion: this.reducedMotion,
      options: () => this.options(),
      readTheme: () => {
        if (!this.browserReady()) return;
        const series = this.themeSeries();
        const theme = this.theme();
        this.themeRevision();
        if (!series) return;
        try {
          this.measuredTheme.set(
            readCartesianTheme(this.host.nativeElement, theme, series, this.plot().nativeElement),
          );
        } catch {
          this.rendererError.set(true);
        }
      },
      observePreviews: () => this.observeTablePreviews(),
      cleanup: () => this.cleanupPreviews(),
      focusContext: () => [this.state(), this.tableRows(), this.legendItems()],
      onPoint: (point) => this.selectPoint(point, 'plot'),
      onError: () => this.rendererError.set(true),
      onRange: (ids, snapshot) => this.selectRange(ids, snapshot),
      onPreview: (point) => this.previewPlotPoint(point),
    });
  }

  protected toggleTable(): void {
    this.tableExpanded.update((expanded) => !expanded);
  }

  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
