import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵTablePager,
  ɵChartPresentation as ChartPresentation,
  ɵcreateValueFormatting as createValueFormatting,
  type ɵPlotPoint as PlotPoint,
  type ChartMeasure,
  type CategoryVisibilityChange,
} from '@mantha911/ng-echarts/core';
import { normalizePieData } from './pie-model';
import { PIE_RENDERER_LOADER } from './pie-browser';
import { buildPieOptions, type PieOption } from './pie-options';

@Component({
  selector: 'nec-pie-chart',
  imports: [ChartFrame, ɵChartStage, ɵTablePager],
  templateUrl: './pie-chart.html',
  styleUrls: [
    '../../../core/src/lib/cartesian-chart.css',
    '../../../core/src/lib/chart-controls.css',
    './pie-chart.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChart<T extends object> extends ChartPresentation<T, PieOption> {
  readonly #loader = inject(PIE_RENDERER_LOADER);
  readonly innerRadius = input(0);
  readonly showLabels = input(false);
  readonly showTotal = input(false);
  readonly measure = input.required<ChartMeasure<T>>();
  readonly legendChange = output<CategoryVisibilityChange>();

  readonly #hiddenIds = linkedSignal<ReturnType<typeof normalizePieData<T>>, ReadonlySet<string>>({
    source: () => this.model(),
    computation: (model, previous) => {
      const hidden = previous?.value ?? new Set<string>();
      // Invalid data must not erase the user's last valid legend choices.
      if (model.kind === 'error') return hidden;
      const validIds = new Set(model.rows.map((row) => row.id));
      const retained = new Set([...hidden].filter((id) => validIds.has(id)));
      return retained.size === hidden.size ? hidden : retained;
    },
  });

  protected override readonly model = computed(() =>
    normalizePieData(this.data(), this.rowIdKey(), this.categoryKey(), this.measure()),
  );
  protected override readonly formatting = computed(() => {
    const model = this.model();
    return createValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : [
            ...model.rows.flatMap((row) => row.points.map((point) => point.value)),
            ...(this.showTotal() ? [this.visibleTotal()] : []),
          ],
    );
  });
  protected override familyConfiguration() {
    return {
      innerRadius: this.innerRadius(),
      showLabels: this.showLabels(),
      showTotal: this.showTotal(),
    };
  }
  protected override familyError(): string | null {
    if (!Number.isFinite(this.innerRadius()) || this.innerRadius() < 0 || this.innerRadius() > 0.9)
      return 'Inner radius must be a finite ratio from 0 to 0.9.';
    return typeof this.showLabels() !== 'boolean' || typeof this.showTotal() !== 'boolean'
      ? 'Show labels and show total must be booleans.'
      : null;
  }
  protected override pointHidden(point: PlotPoint): boolean {
    return this.#hiddenIds().has(point.rowId);
  }
  readonly #percentFormat = computed(() => {
    try {
      return new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1 })
        .format;
    } catch {
      return (ratio: number) => String(ratio);
    }
  });
  protected readonly visibleTotal = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? 0
      : model.rows.reduce(
          (sum, row) => sum + (this.#hiddenIds().has(row.id) ? 0 : (row.points[0]?.value ?? 0)),
          0,
        );
  });
  protected readonly totalText = computed(() => this.formatting().format(this.visibleTotal()));
  protected override readonly legendItems = computed(() => {
    const hiddenIds = this.#hiddenIds();
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.rows.map((item, index) => {
      const value = item.points[0]?.value ?? null;
      const visible = !hiddenIds.has(item.id);
      return {
        id: item.id,
        label: item.category,
        visible,
        color: this.tokens().series[index % this.tokens().series.length],
        valueText: value === null ? 'Missing' : this.formatting().format(value),
        shareText:
          !visible || value === null
            ? '—'
            : this.#percentFormat()(this.visibleTotal() > 0 ? value / this.visibleTotal() : 0),
      };
    });
  });
  protected readonly noVisibleValues = computed(() => {
    const model = this.model();
    return (
      model.kind !== 'error' &&
      !model.rows.some((row) => !this.#hiddenIds().has(row.id) && (row.points[0]?.value ?? 0) > 0)
    );
  });
  protected override readonly options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return buildPieOptions({
      model,
      hiddenIds: this.#hiddenIds(),
      tokens: this.tokens(),
      animation: this.animation() && !this.reducedMotion(),
      format: this.formatting().format,
      innerRadius: this.innerRadius(),
      showLabels: this.showLabels(),
      formatPercent: this.#percentFormat(),
    });
  });
  protected override rendererInputs(): unknown {
    return [this.model(), this.settings(), this.formatting()];
  }

  protected override renderer() {
    return this.#loader();
  }
  protected override themeSeries() {
    const model = this.model();
    return model.kind === 'error'
      ? null
      : model.rows.map((row) => ({
          id: row.id,
          key: this.measure().key,
          label: row.category,
        }));
  }

  protected toggleCategory(id: string): void {
    if (this.state().kind !== 'ready') return;
    const hidden = new Set(this.#hiddenIds());
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    this.#hiddenIds.set(hidden);
    this.legendChange.emit({ rowId: id, visible: !hidden.has(id) });
  }
}
