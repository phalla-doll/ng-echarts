import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵCartesianChart,
  type BarLayout,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
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
@Component({
  selector: 'nec-bar-chart',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart<T extends object> extends ɵCartesianChart<T, BarRenderOptions> {
  readonly rangeSelection = input(false);
  readonly rangeSelect = output<BarRangeSelection<T>>();
  readonly layout = input<BarLayout>('vertical');
  readonly stacked = input(false);
  readonly gradient = input(false);
  readonly selectedRowId = input<string | null>(null);
  readonly selectedRowIds = input<readonly string[] | null>(null);
  private readonly selectedIds = computed<ReadonlySet<string>>(() => {
    const model = this.model();
    const available = new Set(model.kind === 'error' ? [] : model.rows.map((row) => row.id));
    const multiple = this.selectedRowIds();
    const requested =
      multiple === null ? [this.selectedRowId()] : Array.isArray(multiple) ? multiple : [];
    return new Set(
      requested.filter((id): id is string => typeof id === 'string' && available.has(id)),
    );
  });
  private readonly loader = inject(BAR_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
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
    const ids = this.selectedIds();
    return ids.size === 1 ? (ids.values().next().value ?? null) : null;
  }
  protected override rowIsSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }
  protected override familyError() {
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
        this.selectedIds(),
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
