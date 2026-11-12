import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  ChartFrame,
  ɵCartesianChart,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
import { AREA_RENDERER_LOADER } from './area-browser';
import { buildAreaOptions, type AreaOption } from './area-options';
@Component({
  selector: 'nec-area-chart',
  imports: [ChartFrame],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrl: '../../../core/src/lib/cartesian-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaChart<T extends object> extends ɵCartesianChart<T, AreaOption> {
  readonly smooth = input(false);
  readonly showPoints = input(false);
  readonly stacked = input(false);
  readonly gradient = input(true);
  private readonly loader = inject(AREA_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration() {
    return {
      smooth: this.smooth(),
      showPoints: this.showPoints(),
      stacked: this.stacked(),
      gradient: this.gradient(),
    };
  }
  protected override familyError() {
    return typeof this.smooth() === 'boolean' &&
      typeof this.showPoints() === 'boolean' &&
      typeof this.stacked() === 'boolean' &&
      typeof this.gradient() === 'boolean'
      ? null
      : 'Area settings must be booleans.';
  }
  protected override buildOptions(context: ɵCartesianContext<T>): AreaOption {
    return buildAreaOptions(
      context,
      this.smooth(),
      this.showPoints(),
      this.stacked(),
      this.gradient(),
    );
  }
}
