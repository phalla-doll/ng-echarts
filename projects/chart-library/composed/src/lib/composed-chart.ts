import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵCartesianChart,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
import { COMPOSED_RENDERER_LOADER } from './composed-browser';
import { buildComposedOptions, type ComposedOption } from './composed-options';
import { composedSeriesError, type ComposedSeries } from './composed-types';
@Component({
  selector: 'nec-composed-chart',
  imports: [ChartFrame, ɵChartStage],
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
  private readonly loader = inject(COMPOSED_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration() {
    return this.series();
  }
  protected override familyError() {
    return composedSeriesError(this.series());
  }
  protected override buildOptions(context: ɵCartesianContext<T>): ComposedOption {
    return buildComposedOptions(context, this.series());
  }
}
