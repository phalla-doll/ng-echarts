import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  type InputSignal,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵTablePager,
  ɵCartesianChart,
  type ɵCartesianContext,
  type ɵCartesianModel,
  type ɵValueFormatting,
  type ChartSeries,
} from '@mantha911/ng-echarts/core';
import { COMPOSED_RENDERER_LOADER } from './composed-browser';
import { buildComposedOptions, type ComposedOption } from './composed-options';
import {
  composedSeriesError,
  type ComposedSeries,
  type ComposedLayout,
  type ComposedValueAxis,
} from './composed-types';
import {
  axisPosition,
  composedAxesError,
  composedAxisFormatting,
  composedSeriesLabel,
} from './composed-axes';
interface ComposedConfiguration<T> {
  readonly series: readonly ComposedSeries<T>[];
  readonly layout: ComposedLayout;
  readonly valueAxes: readonly ComposedValueAxis[] | null;
}
@Component({
  selector: 'nec-composed-chart',
  imports: [ChartFrame, ɵChartStage, ɵTablePager],
  templateUrl: '../../../core/src/lib/cartesian-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
    './composed-chart.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposedChart<T extends object> extends ɵCartesianChart<
  T,
  ComposedOption,
  ComposedSeries<T>
> {
  readonly layout: InputSignal<ComposedLayout> = input<ComposedLayout>('vertical');
  readonly valueAxes: InputSignal<readonly ComposedValueAxis[] | null> = input<
    readonly ComposedValueAxis[] | null
  >(null);
  private readonly axisFormats = computed(() => {
    const axes = this.valueAxes();
    return axes && Array.isArray(this.series()) && !composedAxesError(axes, this.series())
      ? composedAxisFormatting(axes, this.series(), this.model(), this.locale())
      : [];
  });
  private readonly loader = inject(COMPOSED_RENDERER_LOADER);
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration(): ComposedConfiguration<T> {
    return { series: this.series(), layout: this.layout(), valueAxes: this.valueAxes() };
  }
  protected override familyError() {
    return ['vertical', 'horizontal'].includes(this.layout())
      ? (composedSeriesError(this.series()) ?? composedAxesError(this.valueAxes(), this.series()))
      : 'Chart layout is invalid.';
  }
  protected override seriesLabel(series: ChartSeries<T>): string {
    return composedSeriesLabel(series, this.valueAxes(), this.layout());
  }
  protected override valueAxisDescription(): string {
    const axes = this.valueAxes();
    return Array.isArray(axes) && !composedAxesError(axes, this.series())
      ? axes
          .map(
            (axis, index) =>
              `${axisPosition(index, this.layout())} axis: ${axis.label} (${axis.unit})`,
          )
          .join('. ')
      : '';
  }
  protected override valueFormatting(model: ɵCartesianModel<T>): ɵValueFormatting {
    if (this.valueAxes() === null) return super.valueFormatting(model);
    if (model.kind === 'error') return super.valueFormatting(model);
    const formats = this.axisFormats();
    if (!formats.length) return { format: () => '', error: null };
    const axes = this.valueAxes()!;
    const bySeries = new Map(
      this.series().map((series) => [
        series.id,
        formats[axes.findIndex((axis) => axis.id === (series.axisId ?? axes[0]!.id))]!.format,
      ]),
    );
    return {
      format: formats[0]!.format,
      pointFormat: (value, id) => bySeries.get(id)!(value),
      error: formats.find((format) => format.error)?.error ?? null,
    };
  }
  protected override buildOptions(context: ɵCartesianContext<T>): ComposedOption {
    return buildComposedOptions(
      context,
      this.series(),
      this.layout(),
      this.valueAxes(),
      this.axisFormats(),
    );
  }
}
