import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  ChartFrame,
  ɵCartesianChart,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
import { LINE_RENDERER_LOADER } from './line-browser';
import { buildLineOptions, type LineOption } from './line-options';
@Component({
  selector: 'nec-line-chart',
  imports: [ChartFrame],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrl: '../../../core/src/lib/cartesian-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChart<T extends object> extends ɵCartesianChart<T, LineOption> {
  readonly smooth = input(false);
  readonly showPoints = input(true);
  private readonly loader = inject(LINE_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration() {
    return { smooth: this.smooth(), showPoints: this.showPoints() };
  }
  protected override familyError() {
    return typeof this.smooth() === 'boolean' && typeof this.showPoints() === 'boolean'
      ? null
      : 'Line settings must be booleans.';
  }
  protected override buildOptions(context: ɵCartesianContext<T>): LineOption {
    return buildLineOptions(context, this.smooth(), this.showPoints());
  }
}
