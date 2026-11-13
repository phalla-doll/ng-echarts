import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ChartFrame,
  ɵCartesianChart,
  type BarLayout,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
import { BAR_RENDERER_LOADER } from './bar-browser';
import { buildBarOptions, type BarOption } from './bar-options';
@Component({
  selector: 'nec-bar-chart',
  imports: [ChartFrame],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrl: '../../../core/src/lib/cartesian-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChart<T extends object> extends ɵCartesianChart<T, BarOption> {
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
    if (!['vertical', 'horizontal'].includes(this.layout())) return 'Chart layout is invalid.';
    if (this.selectedRowId() !== null && typeof this.selectedRowId() !== 'string')
      return 'Selected row ID must be a string or null.';
    const ids = this.selectedRowIds();
    return ids === null || (Array.isArray(ids) && ids.every((id) => typeof id === 'string'))
      ? null
      : 'Selected row IDs must be an array of strings or null.';
  }
  protected override buildOptions(context: ɵCartesianContext<T>): BarOption {
    return buildBarOptions(
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
    );
  }
}
