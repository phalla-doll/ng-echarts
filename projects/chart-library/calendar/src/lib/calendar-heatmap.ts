import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {
  ChartFrame,
  ɵChartStage,
  ɵPlotController,
  ɵChartFocusKeeper,
  ɵbrowserPlotEnvironment,
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

  private readonly loader = inject(CALENDAR_RENDERER_LOADER);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly application = inject(ApplicationRef);
  private readonly platform = inject(PLATFORM_ID);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');
  private readonly browserReady = signal(false);
  private readonly reducedMotion = signal(false);
  private readonly measuredTheme = signal<ɵCartesianThemeTokens | null>(null);
  private controller: ɵPlotController<CalendarView> | null = null;
  private focusKeeper: ɵChartFocusKeeper | null = null;
  private removeMotionListener: (() => void) | null = null;
  protected readonly rendererError = signal(false);
  protected readonly model = computed(() =>
    normalizeCalendarData(this.data(), this.dateKey(), this.valueKey(), this.year(), this.max()),
  );
  private readonly formatting = computed(() => {
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
  private readonly settings = computed(() => ({
    title: this.title(),
    valueLabel: this.valueLabel(),
    theme: this.theme(),
    themeRevision: this.themeRevision(),
    animation: this.animation(),
    loading: this.loading(),
    error: this.error(),
  }));
  protected readonly tokens = computed(
    () => this.measuredTheme() ?? ɵdefaultCartesianTheme(this.theme()),
  );
  protected readonly localDatesAvailable = computed(() => {
    const model = this.model();
    return (
      !this.browserReady() ||
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
            upperText: this.formatting().format(upper),
            label: `More than ${this.formatting().format(lower)} to ${this.formatting().format(upper)}`,
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
              text: day.value === null ? 'No data' : this.formatting().format(day.value),
            })),
        }));
  });
  protected readonly zeroLabel = computed(() => this.formatting().format(0));
  protected readonly maximumLabel = computed(() => this.formatting().format(this.max()));
  protected readonly state = computed(() => {
    const settings = this.settings();
    const configurationError =
      typeof settings.valueLabel !== 'string' || !settings.valueLabel.trim()
        ? 'Value label must be nonempty text.'
        : typeof settings.title !== 'string' || !settings.title.trim()
          ? 'Calendar title must be nonempty text.'
          : !['light', 'dark'].includes(settings.theme) || !Number.isFinite(settings.themeRevision)
            ? 'Calendar theme configuration is invalid.'
            : typeof settings.animation !== 'boolean' || typeof settings.loading !== 'boolean'
              ? 'Calendar animation and loading settings must be booleans.'
              : this.formatting().error;
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
  private readonly options = computed<CalendarView | null>(() => {
    const model = this.model();
    return this.state().kind === 'ready' && model.kind === 'ready' && this.localDatesAvailable()
      ? {
          year: model.year,
          max: model.max,
          days: model.days,
          tokens: this.tokens(),
          animation: this.animation() && !this.reducedMotion(),
          format: this.formatting().format,
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
    effect(() => {
      this.model();
      this.settings();
      this.formatting();
      this.rendererError.set(false);
    });
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platform)) return;
      void this.application.whenStable().then(() => {
        if (this.destroyRef.destroyed) return;
        try {
          const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
          this.reducedMotion.set(preference.matches);
          const onMotion = (event: MediaQueryListEvent) => this.reducedMotion.set(event.matches);
          preference.addEventListener('change', onMotion);
          this.removeMotionListener = () => preference.removeEventListener('change', onMotion);
          this.controller = new ɵPlotController(
            this.plot().nativeElement,
            ɵbrowserPlotEnvironment(() => this.loader(), this.host.nativeElement),
            (point) => this.selectDate(point.rowId, 'plot'),
            () => this.rendererError.set(true),
          );
          this.focusKeeper = new ɵChartFocusKeeper(this.host.nativeElement);
          this.browserReady.set(true);
        } catch {
          this.rendererError.set(true);
        }
      });
    });
    afterRenderEffect(() => {
      if (!this.browserReady()) return;
      const theme = this.theme();
      this.themeRevision();
      try {
        this.measuredTheme.set(
          ɵreadCartesianTheme<{ value: number }>(
            this.host.nativeElement,
            theme,
            [{ id: 'calendar', key: 'value', label: this.title() }],
            this.plot().nativeElement,
          ),
        );
      } catch {
        this.rendererError.set(true);
      }
    });
    afterRenderEffect(() => {
      this.browserReady();
      this.controller?.update(this.options());
    });
    afterRenderEffect(() => {
      this.state();
      this.months();
      this.focusKeeper?.restore();
    });
    this.destroyRef.onDestroy(() => {
      this.removeMotionListener?.();
      this.controller?.destroy();
      this.focusKeeper?.destroy();
    });
  }
  protected retryRenderer(): void {
    this.rendererError.set(false);
  }
}
