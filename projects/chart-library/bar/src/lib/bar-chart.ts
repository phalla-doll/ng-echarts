import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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
    };
  }
  protected override rowSelectionId(): string | null {
    return this.selectedRowId();
  }
  protected override familyError() {
    if (!['vertical', 'horizontal'].includes(this.layout())) return 'Chart layout is invalid.';
    return this.selectedRowId() === null || typeof this.selectedRowId() === 'string'
      ? null
      : 'Selected row ID must be a string or null.';
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
      this.selectedRowId(),
    );
  }
}
