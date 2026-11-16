import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  DestroyRef,
  effect,
  linkedSignal,
  untracked,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵTablePager,
  ɵCartesianChart,
  ɵobserveTablePreviews,
  type ɵPlotPoint,
  type BarLayout,
  type PointPreview,
  type ɵCartesianContext,
} from '@mantha911/ng-echarts/core';
import { BAR_RENDERER_LOADER } from './bar-browser';
import { buildBarOptions } from './bar-options';
import type { BarRenderOptions } from './bar-render-options';
export interface BarRangeSelection<T> {
  readonly fromRowId: string;
  readonly toRowId: string;
  readonly rowIds: readonly string[];
  readonly rows: readonly T[];
  readonly source: 'plot';
}
interface PlotPreviewSnapshot {
  readonly point: ɵPlotPoint;
  readonly context: readonly unknown[];
}

@Component({
  selector: 'nec-bar-chart',
  imports: [ChartFrame, ɵChartStage, ɵTablePager],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
    './bar-chart.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart<T extends object> extends ɵCartesianChart<T, BarRenderOptions> {
  readonly rangeSelection = input(false);
  readonly previewEnabled = input(false);
  readonly pointPreview = output<PointPreview<T> | null>();
  readonly rangeSelect = output<BarRangeSelection<T>>();
  readonly layout = input<BarLayout>('vertical');
  readonly stacked = input(false);
  readonly gradient = input(false);
  readonly selectedRowId = input<string | null>(null);
  readonly selectedRowIds = input<readonly string[] | null>(null);
  readonly #selectedIds = computed<ReadonlySet<string>>(() => {
    const model = this.model();
    const available = new Set(model.kind === 'error' ? [] : model.rows.map((row) => row.id));
    const multiple = this.selectedRowIds();
    const requested =
      multiple === null ? [this.selectedRowId()] : Array.isArray(multiple) ? multiple : [];
    return new Set(
      requested.filter((id): id is string => typeof id === 'string' && available.has(id)),
    );
  });
  readonly #destroyRef = inject(DestroyRef);
  #removePreviewListeners: (() => void) | null = null;
  #pointerPreview: { point: ɵPlotPoint; source: 'plot' | 'table' } | null = null;
  #focusPreview: ɵPlotPoint | null = null;
  #lastPreview: PointPreview<T> | null = null;
  readonly #plotContext = computed(() => [
    this.model(),
    this.settings(),
    this.hiddenIds(),
    this.formatting(),
    this.categoryTicks(),
    this.tokens(),
    this.tableExpanded(),
    this.tablePagination.page(),
  ]);
  readonly #plotPreview = linkedSignal<
    { readonly context: readonly unknown[]; readonly ready: boolean },
    PlotPreviewSnapshot | null
  >({
    source: () => ({ context: this.#plotContext(), ready: this.state().kind === 'ready' }),
    computation: ({ context, ready }, previous) =>
      ready && previous?.value?.context === context ? previous.value : null,
    equal: (a, b) =>
      a?.context === b?.context &&
      a?.point.rowId === b?.point.rowId &&
      a?.point.seriesId === b?.point.seriesId,
  });
  #previewSnapshot: readonly unknown[] | null = null;
  readonly #previewContext = computed(() => [
    this.model(),
    this.settings(),
    this.hiddenIds(),
    this.tableExpanded(),
    this.tablePagination.page(),
    this.state(),
  ]);
  constructor() {
    super();
    effect(() => {
      const context = this.#previewContext();
      // An event can already describe the new inputs before this scheduled effect
      // runs. Invalidate only previews captured against an older context.
      untracked(() => {
        if (this.#previewSnapshot !== context) this.#clearPreview();
      });
    });
    effect(() => {
      const current = this.#plotPreview();
      const enabled = this.canPreview();
      // Native pointer events can arrive before Angular propagates an enabling
      // input. Reconcile the latest hit after inputs settle, without a new move.
      if (enabled) untracked(() => this.previewPoint(current?.point ?? null, 'plot', 'pointer'));
    });
  }
  protected override previewPlotPoint(point: ɵPlotPoint | null): void {
    this.#plotPreview.set(point ? { point, context: this.#plotContext() } : null);
  }
  protected override observeTablePreviews(): void {
    if (this.browserReady() && this.observePreviews()) {
      this.#removePreviewListeners ??= ɵobserveTablePreviews(
        this.host.nativeElement,
        (point, trigger) => this.previewPoint(point, 'table', trigger),
      );
    } else {
      this.#removePreviewListeners?.();
      this.#removePreviewListeners = null;
    }
  }
  protected override cleanupPreviews(): void {
    this.#removePreviewListeners?.();
  }
  protected previewPoint(
    point: ɵPlotPoint | null,
    source: 'plot' | 'table',
    trigger: 'pointer' | 'focus',
  ): void {
    if (this.#destroyRef.destroyed || !this.canPreview()) return;
    const context = this.#previewContext();
    if (this.#previewSnapshot !== context) this.#clearPreview();
    if (trigger === 'focus') this.#focusPreview = point;
    else this.#pointerPreview = point ? { point, source } : null;
    const pointer = this.#pointerPreview;
    const candidate = pointer?.point ?? this.#focusPreview;
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
    this.#previewSnapshot = context;
    if (
      next?.row === this.#lastPreview?.row &&
      next?.seriesId === this.#lastPreview?.seriesId &&
      next?.value === this.#lastPreview?.value &&
      next?.source === this.#lastPreview?.source &&
      next?.trigger === this.#lastPreview?.trigger
    )
      return;
    this.#lastPreview = next;
    this.emitPreview(next);
  }

  #clearPreview(): void {
    this.#previewSnapshot = null;
    this.#pointerPreview = this.#focusPreview = null;
    if (this.#lastPreview === null) return;
    this.#lastPreview = null;
    this.emitPreview(null);
  }

  protected override resetPointPreview(): void {
    this.#plotPreview.set(null);
    this.#clearPreview();
  }
  readonly #loader = inject(BAR_RENDERER_LOADER);
  protected override renderer() {
    return this.#loader();
  }
  protected canPreview(): boolean {
    return this.previewEnabled() && !this.rangeSelection();
  }
  protected observePreviews(): boolean {
    // Range mode suppresses events without replaying focused values on Escape.
    return this.previewEnabled();
  }
  protected emitPreview(point: PointPreview<T> | null): void {
    this.pointPreview.emit(point);
  }
  protected override familyConfiguration() {
    return {
      rangeSelection: this.rangeSelection(),
      layout: this.layout(),
      stacked: this.stacked(),
      gradient: this.gradient(),
      selectedRowId: this.selectedRowId(),
      selectedRowIds: this.selectedRowIds(),
    };
  }
  protected override rowSelectionId(): string | null {
    const ids = this.#selectedIds();
    return ids.size === 1 ? (ids.values().next().value ?? null) : null;
  }
  protected override rowIsSelected(id: string): boolean {
    return this.#selectedIds().has(id);
  }
  protected override familyError() {
    if (typeof this.previewEnabled() !== 'boolean') return 'Preview enabled must be a boolean.';
    if (typeof this.rangeSelection() !== 'boolean') return 'Range selection must be a boolean.';
    if (!['vertical', 'horizontal'].includes(this.layout())) return 'Chart layout is invalid.';
    if (this.selectedRowId() !== null && typeof this.selectedRowId() !== 'string')
      return 'Selected row ID must be a string or null.';
    const ids = this.selectedRowIds();
    return ids === null || (Array.isArray(ids) && ids.every((id) => typeof id === 'string'))
      ? null
      : 'Selected row IDs must be an array of strings or null.';
  }
  protected override selectRange(ids: readonly string[], snapshot: unknown): void {
    const model = this.model();
    if (
      snapshot !== model ||
      !this.rangeSelection() ||
      this.state().kind !== 'ready' ||
      model.kind === 'error' ||
      !ids.length
    )
      return;
    const first = model.rows.findIndex((row) => row.id === ids[0]);
    const last = model.rows.findIndex((row) => row.id === ids.at(-1));
    if (first < 0 || last < first) return;
    const rows = model.rows.slice(first, last + 1);
    if (rows.length !== ids.length || rows.some((row, index) => row.id !== ids[index])) return;
    this.resetPointPreview();
    this.rangeSelect.emit({
      fromRowId: rows[0]!.id,
      toRowId: rows.at(-1)!.id,
      rowIds: rows.map((row) => row.id),
      rows: this.data().slice(first, last + 1),
      source: 'plot',
    });
  }
  protected override buildOptions(context: ɵCartesianContext<T>): BarRenderOptions {
    return {
      chart: buildBarOptions(
        context.model,
        context.hiddenIds,
        context.tokens,
        this.layout(),
        this.stacked(),
        this.gradient(),
        context.animation,
        context.format,
        context.categoryTicks,
        this.#selectedIds(),
      ),
      range: this.rangeSelection()
        ? {
            snapshot: context.model,
            ids: context.model.rows.map((row) => row.id),
            horizontal: this.layout() === 'horizontal',
            color: context.tokens.muted,
            fill: context.tokens.border,
          }
        : null,
    };
  }
}
