import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵTablePager,
  ɵCartesianChart,
  type ɵCartesianContext,
} from '@mantha911/ng-echarts/core';
import { COMPOSED_RENDERER_LOADER } from './composed-browser';
import { buildComposedOptions, type ComposedOption } from './composed-options';
import { composedSeriesError, type ComposedSeries } from './composed-types';
@Component({
  selector: 'nec-composed-chart',
  imports: [ChartFrame, ɵChartStage, ɵTablePager],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposedChart<T extends object> extends ɵCartesianChart<
  T,
  ComposedOption,
  ComposedSeries<T>
> {
  readonly layout = input<'vertical' | 'horizontal'>('vertical');
  private readonly loader = inject(COMPOSED_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration() {
    return { series: this.series(), layout: this.layout() };
  }
  protected override familyError() {
    return ['vertical', 'horizontal'].includes(this.layout())
      ? composedSeriesError(this.series())
      : 'Chart layout is invalid.';
  }
  protected override buildOptions(context: ɵCartesianContext<T>): ComposedOption {
    return buildComposedOptions(context, this.series(), this.layout());
  }
}
