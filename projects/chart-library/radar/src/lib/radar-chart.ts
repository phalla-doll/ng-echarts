import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵCartesianChart,
  ɵcreateValueFormatting,
  type ɵCartesianContext,
  type NumericKey,
} from '@mantha911/ng-echarts/core';
import { normalizeRadarData } from './radar-model';
import { buildRadarOptions, type RadarOption } from './radar-options';
import { RADAR_RENDERER_LOADER } from './radar-browser';
import type { RadarIdentityOption } from './radar-point';
@Component({
  selector: 'nec-radar-chart',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: './radar-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChart<T extends object> extends ɵCartesianChart<T, RadarOption> {
  readonly maxKey = input.required<NumericKey<T>>();
  readonly filled = input(true);
  private readonly loader = inject(RADAR_RENDERER_LOADER);
  protected override readonly model = computed(() =>
    normalizeRadarData(
      this.data(),
      this.rowIdKey(),
      this.categoryKey(),
      this.series(),
      this.maxKey(),
    ),
  );
  private readonly maxFormatting = computed(() => {
    const model = this.model();
    return ɵcreateValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error' ? [] : [0, ...model.maxima],
    );
  });
  protected readonly scaleLabels = computed(() => {
    const model = this.model();
    return new Map(
      model.kind === 'error'
        ? []
        : model.rows.map((row, i) => [
            row.id,
            `${this.maxFormatting().format(0)} – ${this.maxFormatting().format(model.maxima[i]!)}`,
          ]),
    );
  });
  protected readonly scaleContext = computed(() => {
    const scales = [...new Set(this.scaleLabels().values())];
    return scales.length === 1
      ? `Each dimension: ${scales[0]}`
      : 'Each dimension has its own scale. See the data table.';
  });
  protected readonly incompleteIds = computed(() => {
    const model = this.model();
    return new Set(
      model.kind === 'error'
        ? []
        : model.series
            .filter((_, i) => model.rows.some((row) => row.points[i]!.value === null))
            .map((series) => series.id),
    );
  });
  protected readonly incompleteSeries = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? ''
      : model.series
          .filter((_, i) => model.rows.some((row) => row.points[i]!.value === null))
          .map((s) => s.label)
          .join(', ');
  });
  protected override renderer() {
    return this.loader();
  }
  protected override familyConfiguration() {
    return { maxKey: this.maxKey(), filled: this.filled() };
  }
  protected override familyError() {
    return typeof this.filled() === 'boolean'
      ? this.maxFormatting().error
      : 'Radar fill must be a boolean.';
  }
  protected override buildOptions(context: ɵCartesianContext<T>): RadarIdentityOption {
    const model = this.model();
    return {
      ...buildRadarOptions(context, model.kind === 'error' ? [] : model.maxima, this.filled()),
      necRowIds: context.model.rows.map((row) => row.id),
    };
  }
}
