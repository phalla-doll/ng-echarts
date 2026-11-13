# Linked charts

NG20 links a monthly visits overview to a device-share detail. Selection belongs to the application: `pointSelect` supplies a stable row ID, a signal stores it, and `computed` derives the companion chart's data. The bar chart's controlled `selectedRowId` input reflects that context in the overview. No ECharts instance connection or global selection bus is required. Use private rc.2 or later for this feedback input; rc.1 supports the original link without persistent highlighting.

## Complete standalone example

Paste this `App` into a standalone Angular application using the [installation guide](INSTALLATION.md). These visits are synthetic. Both charts retain their native legends and data-table actions. The month selector and overview table provide keyboard equivalents to plot clicks.

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  signal,
} from "@angular/core";
import { BarChart, type ChartSeries } from "@ng-echarts/chart-library/bar";
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
@Component({
  selector: "app-root",
  imports: [BarChart, PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label
      >Month
      <select #month [value]="selectedId()" (change)="selectMonth(month.value)">
        <option value="">All months</option>
        @for (row of rows(); track row.id) {
          <option [value]="row.id">{{ row.month }}</option>
        }
      </select>
    </label>
    <p role="status">Device share for {{ context() }}</p>
    <nec-bar-chart
      title="Monthly visits"
      description="Select a bar or a table value to update device share."
      [data]="rows()"
      rowIdKey="id"
      categoryKey="month"
      [series]="series"
      [selectedRowId]="selectedId() || null"
      (pointSelect)="selectMonth($event.rowId)"
    />
    <nec-pie-chart
      [title]="'Device share · ' + context()"
      [data]="share()"
      rowIdKey="id"
      categoryKey="device"
      [measure]="measure"
      [innerRadius]="0.6"
    />`,
})
export class App {
  readonly rows = signal<readonly Month[]>([
    { id: "jan", month: "January", desktop: 120, mobile: 80 },
    { id: "feb", month: "February", desktop: 200, mobile: 0 },
    { id: "mar", month: "March", desktop: null, mobile: 40 },
  ]);
  readonly selectedId = linkedSignal<readonly Month[], string>({
    source: this.rows,
    computation: (rows, previous) =>
      rows.some((row) => row.id === previous?.value) ? previous!.value : "",
  });
  readonly context = computed(
    () =>
      this.rows().find((row) => row.id === this.selectedId())?.month ??
      "All months",
  );
  readonly share = computed<readonly Device[]>(() => {
    const scope = this.selectedId()
      ? this.rows().filter((row) => row.id === this.selectedId())
      : this.rows();
    return (["desktop", "mobile"] as const).map((key) => {
      const values = scope.flatMap((row) =>
        row[key] === null ? [] : [row[key]],
      );
      return {
        id: key,
        device: key === "desktop" ? "Desktop" : "Mobile",
        visits: values.length
          ? values.reduce((sum, value) => sum + value, 0)
          : null,
      };
    });
  });
  readonly series: readonly ChartSeries<Month>[] = [
    { id: "desktop", key: "desktop", label: "Desktop" },
    { id: "mobile", key: "mobile", label: "Mobile" },
  ];
  readonly measure: ChartMeasure<Device> = {
    id: "visits",
    key: "visits",
    label: "Visits",
  };
  selectMonth(id: string): void {
    this.selectedId.set(this.rows().some((row) => row.id === id) ? id : "");
  }
}
```

Replace `rows` immutably to update observations. `linkedSignal` keeps an existing selected ID through updates, reordering and renaming. Removing the ID clears selection; restoring that row later does not restore an obsolete filter. An empty selection means all currently available months. Never use the displayed label, row index or a cached event row as the authoritative selection key.

## Interaction contract

- A point in either overview series selects its **month**, not a device filter. The companion chart updates to that month's desktop/mobile observations.
- `selectedRowId` highlights the full month category: its bars retain their palette, other months fade, and a subtle band remains even for zero/missing values or hidden series. The expanded table marks the same row as current and displays “Selected.” Binding the input alone emits no point event; chart clicks do not mutate it. The application owns reconciliation and reset.
- The month selector provides the same month action without opening a table. All months clears selection. The live demo also shows a compact Reset action only while a month is selected; it returns focus to the month field after clearing. Focus stays on the initiating control; an update does not move focus to the detail chart.
- Legends retain independent visibility. Hiding a series/category does not change the linked month, and native tables retain complete values.
- The live demo displays a compact total and announces its full context through a polite status region; detail actions display and announce the selected device's current value. Updating a context never writes back into the source event, so no feedback loop is created.
- Zero remains numeric. A missing observation stays null; aggregate totals exclude missing cells, and an entirely missing device remains null. Supply finite, nonnegative visit counts suitable for the pie chart. This example does not reinterpret arbitrary signed measures as shares.
- Empty data clears an unavailable selection. The demo labels no-month and all-missing states separately from a real zero total. Both chart components keep their documented empty/error behavior.

The [live example](https://phalla-doll.github.io/ng-echarts/linked/) uses the existing attributed monthly Desktop/Mobile fixture. `/linked-validation` exercises data updates, reordering, removal, empty/missing observations and recovery. The supplied example source uses local synthetic values and is compiled against the installed package with strict templates and `skipLibCheck: false`.

## Scope

This is a one-way, application-owned context link with persistent overview feedback. Shared legend visibility, linked zoom, brushing, range selection, cross-chart hover and an ECharts connection API remain outside this increment. Range brushing and two-way/multiple-selection designs remain later NG20 work. The new bar input advances the private candidate to rc.2; earlier candidate artifacts remain preserved. Human interpretation and release gates retain their deferred status; the [initial NG20 report](experiments/NG20_LINKED_CHARTS.md) and [selection-feedback review](experiments/LINKED_SELECTION_FEEDBACK.md) record their respective evidence.


## Demo presentation

The [UI refinement review](experiments/LINKED_UI_REFINEMENT.md) records the shorter Month field, consistent native select styling, contextual Reset, compact totals, single card borders and responsive control layout. The form remains a native combobox; numeric zeros and no-observation states keep their original meaning. The standalone example above focuses on the linking contract, while the demo applies the site's existing presentation tokens.
