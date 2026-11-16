import { computed, Directive, input, linkedSignal, output, signal } from '@angular/core';
import type {
  ChartTheme,
  LegendLayout,
  PointSelection,
  StringKey,
  ValueFormatter,
} from './chart-types';
import { defaultCartesianTheme, type CartesianThemeTokens } from './cartesian-options';
import { TablePagination } from './table-pagination';

/** Internal shared signal inputs and native-table state; families own validation and rendering. */
@Directive()
export abstract class ChartPresentation<T extends object> {
  protected abstract rendererInputs(): unknown;
  readonly title = input.required<string>();
  readonly description = input('');
  readonly legendLayout = input<LegendLayout>('chips');
  readonly data = input.required<readonly T[]>();
  readonly rowIdKey = input.required<StringKey<T>>();
  readonly categoryKey = input.required<StringKey<T>>();
  readonly height = input(320);
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly showDataTable = input(true);
  readonly tablePageSize = input<number | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);
  readonly pointSelect = output<PointSelection<T>>();
  protected readonly measuredTheme = signal<CartesianThemeTokens | null>(null);
  protected readonly tokens = computed(
    () => this.measuredTheme() ?? defaultCartesianTheme(this.theme()),
  );
  // A failed renderer stays failed until retry or a relevant input changes.
  protected readonly rendererError = linkedSignal(() => {
    this.rendererInputs();
    return false;
  });
  protected readonly tableExpanded = signal(false);
  protected readonly tablePagination = new TablePagination(this.data, this.tablePageSize);
  protected readonly plotHeight = computed(() =>
    Number.isFinite(this.height()) && this.height() > 0 ? this.height() : 320,
  );
  protected toggleTable(): void {
    this.tableExpanded.update((expanded) => !expanded);
  }

  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
