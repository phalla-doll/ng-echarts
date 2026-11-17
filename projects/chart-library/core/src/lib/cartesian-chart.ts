import { ChartPresentation } from './chart-presentation';
import {
  ChangeDetectionStrategy,
  Directive,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { normalizeCartesianData, type CartesianModel } from './cartesian-model';
import type { CartesianThemeTokens } from './cartesian-options';
import { formatCategoryTicks } from './category-ticks';
import { createValueFormatting, type ValueFormatting } from './value-formatting';
import type {
  CategoryTickFormatter,
  ChartSeries,
  LegendVisibilityChange,
  ValueFormatter,
} from './chart-types';
import type { PlotPoint } from './plot-controller';

function validSeries(series: unknown): boolean {
  return (
    Array.isArray(series) &&
    series.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        item.id &&
        typeof item.key === 'string' &&
        typeof item.label === 'string',
    )
  );
}

/** Internal Cartesian behavior shared by the Cartesian entries; not a supported consumer API. */
@Directive()
export abstract class CartesianChart<
  T extends object,
  Option,
  Series extends ChartSeries<T> = ChartSeries<T>,
> extends ChartPresentation<T, Option> {
  protected abstract buildOptions(context: CartesianContext<T>): Option;
  protected valueAxisDescription(): string {
    return '';
  }
  protected valueFormatting(model: CartesianModel<T>): ValueFormatting {
    return createValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : model.rows.flatMap((row) => row.points.map((point) => point.value)),
    );
  }
  readonly series = input.required<readonly Series[]>();
  readonly categoryTickFormatter = input<CategoryTickFormatter>();
  readonly legendChange = output<LegendVisibilityChange>();

  protected readonly hiddenIds = linkedSignal<readonly Series[], ReadonlySet<string>>({
    source: this.series,
    computation: (series, previous) => {
      const hidden = previous?.value ?? new Set<string>();
      // Valid removals still count while row data is loading or invalid.
      if (!validSeries(series)) return hidden;
      const validIds = new Set(series.map((item) => item.id));
      if (validIds.size !== series.length) return hidden;
      const retained = new Set([...hidden].filter((id) => validIds.has(id)));
      return retained.size === hidden.size ? hidden : retained;
    },
  });

  protected override readonly model = computed(() =>
    normalizeCartesianData(this.data(), this.rowIdKey(), this.categoryKey(), this.series()),
  );
  protected override readonly formatting = computed(() => this.valueFormatting(this.model()));
  protected readonly categoryTicks = computed(() => {
    const model = this.model();
    return formatCategoryTicks(
      model.kind === 'error' ? [] : model.rows.map((row) => row.category),
      this.categoryTickFormatter(),
    );
  });
  protected override readonly legendItems = computed(() => {
    // Reconcile removals even when invalid rows leave the legend empty.
    const hiddenIds = this.hiddenIds();
    const model = this.model();
    if (model.kind === 'error') return [];
    return model.series.map((item, index) => ({
      id: item.id,
      label: this.seriesLabel(item),
      visible: !hiddenIds.has(item.id),
      color: this.tokens().series[index % this.tokens().series.length],
    }));
  });
  protected readonly allSeriesHidden = computed(() => {
    const items = this.legendItems();
    return items.length > 0 && items.every((item) => !item.visible);
  });
  protected override readonly options = computed(() => {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind === 'error') return null;
    return this.buildOptions({
      model,
      hiddenIds: this.hiddenIds(),
      tokens: this.tokens(),
      animation: this.animation() && !this.reducedMotion(),
      format: this.formatting().format,
      pointFormat: this.formatting().pointFormat,
      categoryTicks: this.categoryTicks().labels,
    });
  });
  protected override themeSeries(): readonly ChartSeries<T>[] | null {
    const series = this.series();
    return validSeries(series) ? series : null;
  }
  protected override categoryError(): string | null {
    return this.categoryTicks().error;
  }
  protected override pointHidden(point: PlotPoint): boolean {
    return this.hiddenIds().has(point.seriesId);
  }

  protected override rendererInputs(): unknown {
    return [this.model(), this.settings(), this.formatting(), this.categoryTicks()];
  }

  protected toggleSeries(id: string): void {
    if (this.state().kind !== 'ready') return;
    const hidden = new Set(this.hiddenIds());
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    this.hiddenIds.set(hidden);
    this.legendChange.emit({ seriesId: id, visible: !hidden.has(id) });
  }
}

export interface CartesianContext<T> {
  readonly model: Exclude<CartesianModel<T>, { kind: 'error' }>;
  readonly hiddenIds: ReadonlySet<string>;
  readonly tokens: CartesianThemeTokens;
  readonly animation: boolean;
  readonly format: ValueFormatter;
  readonly pointFormat?: (value: number, seriesId: string) => string;
  readonly categoryTicks: readonly string[];
}
