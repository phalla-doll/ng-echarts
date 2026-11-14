# Linked charts

NG20 links a monthly visits overview to device share for one month or an inclusive range, with optional transient month previews in private rc.15. Selection belongs to the application: `pointSelect` supplies a stable row ID, native period fields or a graphical drag edit the bounds, and signals derive the companion chart's data. The bar chart's controlled `selectedRowIds` input reflects every included month. No ECharts instance connection or global selection bus is required. The complete graphical example requires private rc.4 or later; native ranges require rc.3; the scalar `selectedRowId` input remains supported from rc.2.

## Complete standalone example

Paste this `App` into a standalone Angular application using the [installation guide](INSTALLATION.md). These visits are synthetic. Both charts retain their native legends and data-table actions. The native Period, From and To fields and the overview table work with a keyboard.

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import {
  BarChart,
  type ChartSeries,
  type BarRangeSelection,
  type PointPreview,
} from "@ng-echarts/chart-library/bar";
import { PieChart, type ChartMeasure } from "@ng-echarts/chart-library/pie";
interface Month {
  id: string;
  month: string;
  desktop: number | null;
  mobile: number | null;
}
interface Device {
  id: string;
  device: string;
  visits: number | null;
}
export type VisitPeriod =
  | { readonly kind: "month"; readonly id: string }
  | { readonly kind: "range"; readonly from: string; readonly to: string }
  | null;

/** Bounds are stable row IDs. Display order, never label parsing, defines a range. */
export function reconcilePeriod(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
): VisitPeriod {
  if (period === null) return null;
  if (period.kind === "month")
    return rows.some((row) => row.id === period.id) ? period : null;
  const from = rows.findIndex((row) => row.id === period.from);
  const to = rows.findIndex((row) => row.id === period.to);
  if (from < 0 || to < 0) return null;
  return from <= to
    ? period
    : { kind: "range", from: period.to, to: period.from };
}

export function periodRows<T extends { readonly id: string }>(
  rows: readonly T[],
  period: VisitPeriod,
): readonly T[] {
  const current = reconcilePeriod(rows, period);
  if (current === null) return rows;
  if (current.kind === "month")
    return rows.filter((row) => row.id === current.id);
  return rows.slice(
    rows.findIndex((row) => row.id === current.from),
    rows.findIndex((row) => row.id === current.to) + 1,
  );
}

/** Moving a bound across its counterpart moves the other bound with it. */
export function changePeriodBound(
  rows: readonly { readonly id: string }[],
  period: VisitPeriod,
  bound: "from" | "to",
  id: string,
): VisitPeriod {
  if (period?.kind !== "range" || !rows.some((row) => row.id === id))
    return period;
  const next = { ...period, [bound]: id };
  if (
    rows.findIndex((row) => row.id === next.from) >
    rows.findIndex((row) => row.id === next.to)
  ) {
    return { kind: "range", from: id, to: id };
  }
  return next;
}
@Component({
  selector: "app-root",
  imports: [BarChart, PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown.escape)": "cancelRange()" },
  template: `<label
      >Period
      <select
        #period
        [value]="periodValue()"
        (change)="selectPeriod(period.value)"
      >
        <option value="">All months</option>
        <option value="__range__" [disabled]="!rows().length">
          Custom range
        </option>
        @for (row of rows(); track row.id) {
          <option [value]="'month:' + row.id">{{ row.month }}</option>
        }
      </select>
    </label>
    @if (selection() !== null) {
      <button type="button" (click)="reset()">Reset</button>
    }
    <button
      #rangeButton
      type="button"
      [attr.aria-pressed]="rangeMode()"
      [disabled]="!canSelectRange()"
      (click)="toggleRange()"
    >
      Select range
    </button>
    @if (rangeMode()) {
      <p role="status">Drag across months, then release. Escape cancels.</p>
    }
    @if (range(); as bounds) {
      <fieldset #rangeFields>
        <legend>Custom month range</legend>
        <label
          >From
          <select
            #from
            [value]="bounds.from"
            (change)="selectBound('from', from.value)"
          >
            @for (row of rows(); track row.id) {
              <option [value]="row.id" [selected]="row.id === bounds.from">
                {{ row.month }}
              </option>
            }
          </select>
        </label>
        <label
          >To
          <select
            #to
            [value]="bounds.to"
            (change)="selectBound('to', to.value)"
          >
            @for (row of rows(); track row.id) {
              <option [value]="row.id" [selected]="row.id === bounds.to">
                {{ row.month }}
              </option>
            }
          </select>
        </label>
      </fieldset>
    }
    <label><input #previewToggle type="checkbox" [checked]="previewMonths()"
      (change)="previewMonths.set(previewToggle.checked)" />Preview months</label>
    <p role="status">Device share for {{ context() }}</p>
    @if (previewRow(); as row) { <p>Preview · {{ row.month }}. Activate to select.</p> }
    <p role="status">{{ preview()?.trigger === 'focus' ? detailContext() : '' }}</p>
    <nec-bar-chart
      title="Monthly visits"
      description="Choose a month from a bar, table value or period field."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
      [selectedRowIds]="selectedIds()"
      [rangeSelection]="rangeMode()"
      [previewEnabled]="previewMonths()"
      (pointPreview)="preview.set($event)"
      (rangeSelect)="selectRange($event)"
      (pointSelect)="selectMonth($event.rowId)"
    />
    <nec-pie-chart
      [title]="'Device share · ' + detailContext()"
      [data]="share()"
      rowIdKey="id"
      categoryKey="device"
      [measure]="measure"
      [innerRadius]="0.6" [showTotal]="true"
    />`,
})
export class App {
  readonly rows = signal<readonly Month[]>([
    { id: "jan", month: "January", desktop: 120, mobile: 80 },
    { id: "feb", month: "February", desktop: 200, mobile: 0 },
    { id: "mar", month: "March", desktop: null, mobile: 40 },
  ]);
  readonly rangeMode = linkedSignal({
    source: this.rows,
    computation: () => false,
  });
  readonly previewMonths = signal(false);
  readonly preview = linkedSignal({
    source: () => [this.rows(), this.selection(), this.rangeMode(), this.previewMonths()],
    computation: (): PointPreview<Month> | null => null,
  });
  readonly previewRow = computed(() => {
    const point = this.preview();
    return this.previewMonths() && !this.rangeMode()
      ? this.rows().find(row => row.id === point?.rowId && row === point.row) ?? null
      : null;
  });
  readonly detailScope = computed(() => {
    const row = this.previewRow();
    return row ? [row] : this.scope();
  });
  readonly detailContext = computed(() => {
    const row = this.previewRow();
    return row ? `Preview: ${row.month}` : this.context();
  });
  readonly canSelectRange = computed(() =>
    this.rows().some((row) => row.desktop !== null || row.mobile !== null),
  );
  readonly selection = linkedSignal<readonly Month[], VisitPeriod>({
    source: this.rows,
    computation: (rows, previous) =>
      reconcilePeriod(rows, previous?.value ?? null),
  });
  readonly range = computed(() => {
    const value = this.selection();
    return value?.kind === "range" ? value : null;
  });
  readonly periodValue = computed(() => {
    const value = this.selection();
    return value?.kind === "range"
      ? "__range__"
      : value
        ? `month:${value.id}`
        : "";
  });
  readonly scope = computed(() => periodRows(this.rows(), this.selection()));
  readonly selectedIds = computed(() =>
    this.selection() === null ? [] : this.scope().map((row) => row.id),
  );
  readonly context = computed(() => {
    if (this.selection() === null) return "All months";
    const scope = this.scope();
    return scope.length === 1
      ? scope[0]!.month
      : `${scope[0]!.month}–${scope.at(-1)!.month}`;
  });
  readonly share = computed<readonly Device[]>(() =>
    (["desktop", "mobile"] as const).map((key) => {
      const values = this.detailScope().flatMap((row) =>
        row[key] === null ? [] : [row[key]],
      );
      return {
        id: key,
        device: key === "desktop" ? "Desktop" : "Mobile",
        visits: values.length
          ? values.reduce((sum, value) => sum + value, 0)
          : null,
      };
    }),
  );
  readonly series: readonly ChartSeries<Month>[] = [
    { id: "desktop", key: "desktop", label: "Desktop" },
    { id: "mobile", key: "mobile", label: "Mobile" },
  ];
  readonly measure: ChartMeasure<Device> = {
    id: "visits",
    key: "visits",
    label: "Visits",
  };
  private readonly periodSelect =
    viewChild.required<ElementRef<HTMLSelectElement>>("period");
  private readonly rangeButton =
    viewChild<ElementRef<HTMLButtonElement>>("rangeButton");
  private readonly rangeFields =
    viewChild<ElementRef<HTMLElement>>("rangeFields");
  constructor() {
    effect(() => {
      const range = this.range();
      const available = this.canSelectRange();
      untracked(() => {
        const fields = this.rangeFields()?.nativeElement;
        const button = this.rangeButton()?.nativeElement;
        const rangeFocused =
          range === null &&
          fields?.contains(fields.ownerDocument.activeElement);
        const unavailableButtonFocused =
          !available && button !== undefined && button.ownerDocument.activeElement === button;
        if (rangeFocused || unavailableButtonFocused)
          this.periodSelect().nativeElement.focus();
      });
    });
  }
  toggleRange(): void {
    this.rangeMode.update((value) => !value);
    this.rangeButton()?.nativeElement.focus();
  }
  cancelRange(): void {
    this.rangeMode.set(false);
    this.preview.set(null);
  }
  selectRange(event: BarRangeSelection<Month>): void {
    if (!this.rangeMode()) return;
    this.selection.set({
      kind: "range",
      from: event.fromRowId,
      to: event.toRowId,
    });
    this.rangeMode.set(false);
  }
  selectPeriod(value: string): void {
    this.rangeMode.set(false);
    if (value !== "__range__") {
      this.selectMonth(value.startsWith("month:") ? value.slice(6) : "");
      return;
    }
    const rows = this.rows();
    if (!rows.length) return;
    const current = this.selection();
    const anchor = current?.kind === "month" ? current.id : null;
    this.selection.set({
      kind: "range",
      from: anchor ?? rows[0]!.id,
      to: anchor ?? rows.at(-1)!.id,
    });
  }
  selectMonth(id: string): void {
    this.rangeMode.set(false);
    this.selection.set(
      this.rows().some((row) => row.id === id) ? { kind: "month", id } : null,
    );
  }
  selectBound(bound: "from" | "to", id: string): void {
    this.rangeMode.set(false);
    this.selection.update((period) =>
      changePeriodBound(this.rows(), period, bound, id),
    );
  }
  reset(): void {
    this.rangeMode.set(false);
    this.selection.set(null);
    this.periodSelect().nativeElement.focus();
  }
}
```

Replace `rows` immutably to update observations. `linkedSignal` reconciles stable IDs against the current supplied order. Labels and indices are presentation, never authoritative keys. The source above is kept byte-identical to the demo's copied example and compiled against the installed package with strict templates and `skipLibCheck: false`.

## Interaction contract

- **Select range** arms the overview without changing the committed period. Drag across months to preview an inclusive band, then release to commit once. Reverse dragging produces the same supplied-order range. The mode exits after commit and the stable button retains focus; a plain click while armed does not change selection.
- **Escape** exits the mode and cancels its draft. Resizing, theme/layout/option changes, capture interruption, blur and page scrolling cancel the draft without changing committed bounds. Replacing data exits the demo mode, and the library also rejects stale model snapshots. Native Period/From/To changes cancel graphical mode; Reset clears both.
- Vertical touch scrolling and pinch zoom remain available on this vertical overview. The same From/To controls provide the complete keyboard path; no keyboard interaction is assigned to the hidden canvas.

- **All months** is an unfiltered overview without selection shading. A plot/table action or a month option selects exactly one month and closes any range fields.
- **Custom range** reveals native From and To fields. It starts at the selected month, or first through last available row when unfiltered. Both endpoints are included. Equal bounds represent one month; moving a bound past the other moves both to the edited month.
- Ranges follow **current supplied/displayed order**. Reordering preserves endpoint IDs and includes the rows between them in that order; reversing swaps their displayed orientation. Interior insertion/removal changes the included rows. Removing either endpoint clears the filter; restoring it later does not resurrect selection. The demo deliberately does not parse month labels as dates.
- `selectedRowIds` accepts a readonly string array or null. A non-null array takes precedence over `selectedRowId`, including `[]` to clear feedback. Unknown/empty IDs are ignored and duplicates are deduplicated. Each included category retains its colors and a quiet band; surrounding bars fade. Zero/missing values and hidden series retain bands. The expanded table visibly labels each selected row; `aria-current` appears only when exactly one effective row is selected. These are native data rows, not an ARIA multi-select widget.
- Binding selection inputs never emits a point event or mutates the application state. The app owns range ordering, reconciliation and reset. Other chart families have no new selection inputs.
- **Reset** clears the period and returns focus to Period. Native field changes preserve focus; removing focused range fields after an endpoint disappears returns focus to Period. Source table actions retain their own focus. Context updates do not move focus into the detail chart.
- Legends retain independent visibility. Hiding a series/device does not change the period or aggregate. Native tables keep complete raw values.
- The demo shows a compact total and announces context/count through a polite status region. Detail actions display and announce the selected device's current value without propagating back to the source.
- Zero remains numeric; missing observations remain null. Aggregates exclude missing cells and an entirely missing device remains null. Supply finite, nonnegative visits suitable for a pie chart. No months, no observations and a genuine zero total remain distinct states. Custom range is unavailable with empty data.

The [live example](https://phalla-doll.github.io/ng-echarts/linked/) uses the existing attributed Desktop/Mobile fixture. `/linked-validation` exercises reordering, updates, endpoint/interior removal, crossing bounds, empty/missing observations and recovery. The standalone source uses synthetic values.

## Scope and evidence

This is a one-way, application-owned context link with inclusive native range controls and controlled bar feedback. The opt-in bar drag selects one contiguous category range. Shared legends, linked zoom, bidirectional hover and disjoint/bidirectional selection and an ECharts connection API remain later work. The graphical input/output advance the private candidate to rc.4; earlier candidate artifacts and notices remain preserved. Human F09/R06/G2/G3/G4 retain their deferred status.

The [initial NG20 report](experiments/NG20_LINKED_CHARTS.md), [scalar-feedback review](experiments/LINKED_SELECTION_FEEDBACK.md) and [month-range report](experiments/NG20_MONTH_RANGE.md) and [graphical-range review](experiments/GRAPHICAL_RANGE_SELECTION.md) record their respective evidence. The [UI refinement](experiments/LINKED_UI_REFINEMENT.md), [focus](experiments/FOCUS_REFINEMENT.md) and [hover](experiments/HOVER_REFINEMENT.md) reviews cover the shared presentation. Range fields use the existing quiet gallery tokens, native dropdowns and thin focus treatment; From/To sit together beneath Period and remain usable at 320 px.

The demo places overview and detail alongside one another when their container is at least 740 px wide and stacks them below that width. The detail donut opts into `showTotal`, displaying the visible device total; its legend shows raw values and shares. Filtering remains application-owned and the two legends remain independent.


## Transient month previews (rc.15)

Enable **Preview months** to inspect the companion chart without changing the committed Period, From/To bounds, overview selection bands or total. Pointer hover over a numeric bar and focus on a native numeric table action emit the same original row/value through `pointPreview`. A missing cell has no action; recorded zero remains previewable from the table. Preview titles explicitly say “Preview”. Only keyboard-focus previews use a live announcement; pointer movement does not repeatedly announce context.

Pointer exit restores a focused table preview if one exists, otherwise the committed context. Blur, Escape, input replacement, visibility/state changes, range mode and disabling preview clear transient context. Click or Enter/Space commits through the existing `pointSelect`; preview never emits that event. Graphical range selection takes precedence. Touch compatibility hover is ignored; taps retain normal selection and scrolling. Legends remain independent, and the two chart instances are retained. There is no ECharts connection, global bus, shared zoom or two-way selection.

The [follow-up record](experiments/NG20_MONTH_PREVIEWS.md) separates local verification, the mobile tap safeguard and the still-pending human/public-release decisions.
