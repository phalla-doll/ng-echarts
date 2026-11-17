import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵbindBrowserPlot,
  ɵreadCartesianTheme,
  ɵdefaultCartesianTheme,
  ɵcreateValueFormatting,
  ɵresolveCartesianState,
  type ɵCartesianThemeTokens,
  type ChartTheme,
  type ValueFormatter,
  type NumericKey,
  type StringKey,
} from '@mantha911/ng-echarts/core';
import {
  normalizeCalendarData,
  calendarMonths,
  type CalendarPointSelection,
} from './calendar-model';
import { calendarColors, type CalendarView } from './calendar-options';
import { CALENDAR_RENDERER_LOADER, calendarDatesExistLocally } from './calendar-browser';
@Component({
  selector: 'nec-calendar-heatmap',
  imports: [ChartFrame, ɵChartStage],
  templateUrl: './calendar-heatmap.html',
  styleUrls: ['./calendar-heatmap.css', '../../../core/src/lib/chart-controls.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeatmap<T extends object> {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly showDataTable = input(true);
  readonly valueLabel = input('Value');
  readonly data = input.required<readonly T[]>();
  readonly dateKey = input.required<StringKey<T>>();
  readonly valueKey = input.required<NumericKey<T>>();
  readonly year = input.required<number>();
  readonly max = input.required<number>();
  readonly pointSelect = output<CalendarPointSelection<T>>();
  readonly theme = input<ChartTheme>('light');
  readonly themeRevision = input(0);
  readonly locale = input('en-US');
  readonly numberFormatOptions = input<Intl.NumberFormatOptions>();
  readonly valueFormatter = input<ValueFormatter>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly animation = input(true);

  readonly #loader = inject(CALENDAR_RENDERER_LOADER);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  readonly #browserReady = signal(false);
  readonly #reducedMotion = signal(false);
  readonly #measuredTheme = signal<ɵCartesianThemeTokens | null>(null);
  // A failed renderer stays failed until retry or a relevant input changes.
  protected readonly rendererError = linkedSignal(() => {
    this.model();
    this.#settings();
    this.#formatting();
    return false;
  });
  protected readonly model = computed(() =>
    normalizeCalendarData(this.data(), this.dateKey(), this.valueKey(), this.year(), this.max()),
  );
  readonly #formatting = computed(() => {
    const model = this.model();
    return ɵcreateValueFormatting(
      this.locale(),
      this.numberFormatOptions(),
      this.valueFormatter(),
      model.kind === 'error'
        ? []
        : [
            0,
            model.max / 4,
            model.max / 2,
            model.max * 0.75,
            model.max,
            ...model.days.map((day) => day.value),
          ],
    );
  });
  readonly #settings = computed(() => ({
    title: this.title(),
    valueLabel: this.valueLabel(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.#measuredTheme() ?? ɵdefaultCartesianTheme(this.theme()),
  );
  protected readonly localDatesAvailable = computed(() => {
    const model = this.model();
    return (
      !this.#browserReady() ||
      model.kind !== 'ready' ||
      calendarDatesExistLocally(model.days.map((day) => day.date))
    );
  });
  protected readonly colors = computed(() => calendarColors(this.tokens()));
  protected readonly scale = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? []
      : Array.from({ length: 4 }, (_, i) => {
          const lower = model.max * (i / 4),
            upper = model.max * ((i + 1) / 4);
          return {
            color: this.colors()[i]!,
            upperText: this.#formatting().format(upper),
            label: `More than ${this.#formatting().format(lower)} to ${this.#formatting().format(upper)}`,
          };
        });
  });
  protected readonly intervalLabel = computed(() =>
    this.scale()
      .map((step) => step.label)
      .join('; '),
  );
  protected readonly months = computed(() => {
    const model = this.model();
    return model.kind === 'error'
      ? []
      : calendarMonths.map((name, index) => ({
          name,
          days: model.days
            .filter((day) => day.month === index + 1)
            .map((day) => ({
              ...day,
              text: day.value === null ? 'No data' : this.#formatting().format(day.value),
            })),
        }));
  });
  protected readonly zeroLabel = computed(() => this.#formatting().format(0));
  protected readonly maximumLabel = computed(() => this.#formatting().format(this.max()));
  protected readonly state = computed(() => {
    const settings = this.#settings();
    const configurationError =
      typeof settings.valueLabel !== 'string' || !settings.valueLabel.trim()
        ? 'Value label must be nonempty text.'
        : typeof settings.title !== 'string' || !settings.title.trim()
          ? 'Calendar title must be nonempty text.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Calendar theme configuration is invalid.'
            : typeof settings.animation !== 'boolean' || typeof settings.loading !== 'boolean'
              ? 'Calendar animation and loading settings must be booleans.'
              : this.#formatting().error;
    const state = ɵresolveCartesianState(
      settings.error,
      typeof settings.loading === 'boolean' && settings.loading,
      this.model(),
      this.rendererError(),
      configurationError,
    );
    return state.kind === 'loading'
      ? { ...state, message: 'Loading calendar…' }
      : state.kind === 'empty'
        ? { ...state, message: 'No calendar observations available.' }
        : state;
  });
  readonly #options = computed<CalendarView | null>(() => {
    const model = this.model();
    return this.state().kind === 'ready' && model.kind === 'ready' && this.localDatesAvailable()
      ? {
          year: model.year,
          max: model.max,
          days: model.days,
          tokens: this.tokens(),
          animation: this.animation() && !this.#reducedMotion(),
          format: this.#formatting().format,
          valueLabel: this.valueLabel(),
        }
      : null;
  });
  protected selectDate(date: string, source: 'plot' | 'table'): void {
    const model = this.model();
    if (this.state().kind !== 'ready' || model.kind !== 'ready') return;
    const day = model.days.find((day) => day.date === date);
    if (day?.value == null || day.row === null) return;
    this.pointSelect.emit({ date, value: day.value, row: day.row, source });
  }
  constructor() {
    ɵbindBrowserPlot({
      host: this.#host.nativeElement,
      plot: () => this.plot().nativeElement,
      load: () => this.#loader(),
      ready: this.#browserReady,
      reducedMotion: this.#reducedMotion,
      options: () => this.#options(),
      readTheme: () => {
        if (!this.#browserReady()) return;
        const theme = this.theme();
        this.themeRevision();
        try {
          this.#measuredTheme.set(
            ɵreadCartesianTheme<{ value: number }>(
              this.#host.nativeElement,
              theme,
              [{ id: 'calendar', key: 'value', label: this.title() }],
              this.plot().nativeElement,
            ),
          );
        } catch {
          this.rendererError.set(true);
        }
      },
      focusContext: () => [this.state(), this.months()],
      onPoint: (point) => this.selectDate(point.rowId, 'plot'),
      onError: () => this.rendererError.set(true),
    });
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
