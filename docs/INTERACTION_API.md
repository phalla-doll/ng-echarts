# Optional category-range interaction

Published rc.33 introduces `CategoryRange` from `@mantha911/ng-echarts/interaction`. The compatibility root and core retain their existing exports and budgets.

The directive adds one contiguous, inclusive category gesture to bar or composed charts. It reads the existing chart's public ECharts coordinate APIs; it never connects instances, changes options, registers engines or owns application state. Native From/To controls must provide equivalent keyboard access. Use one graphical gesture owner per chart; do not simultaneously arm the bar chart’s existing `rangeSelection` adapter. This is application-owned windowing, not ECharts DataZoom.

## Complete bounded example

```ts
import { Component, computed, signal } from '@angular/core';
import { BarChart, type ChartSeries } from '@mantha911/ng-echarts/bar';
import { CategoryRange, type CategoryRangeSelection } from '@mantha911/ng-echarts/interaction';

interface Month { id: string; label: string; visits: number | null; }
@Component({
  selector: 'app-interaction-example',
  imports: [BarChart, CategoryRange],
  host: { '(keydown.escape)': 'armed.set(false)' },
  template: `
    <label>From <select #start [value]="from()" (change)="setFrom(start.value)">
      @for (row of rows; track row.id) {
        <option [value]="row.id" [selected]="row.id === from()">{{ row.label }}</option>
      }
    </select></label>
    <label>To <select #end [value]="to()" (change)="setTo(end.value)">
      @for (row of rows; track row.id) {
        <option [value]="row.id" [selected]="row.id === to()">{{ row.label }}</option>
      }
    </select></label>
    <button #arm type="button" [attr.aria-disabled]="visible().length < 2 ? 'true' : null" [attr.aria-pressed]="armed()"
      (click)="toggleRange(arm)">Select range</button>
    <button type="button" (click)="reset()">Reset window</button>
    <p role="status">{{ visible().length }} visible months. Use From/To or arm the chart and drag. Escape cancels.</p>
    <nec-bar-chart title="Visits" description="Recorded zero and missing remain distinct."
      [data]="visible()" rowIdKey="id" categoryKey="label" [series]="series"
      [necCategoryRange]="ids()" [rangeEnabled]="armed()" [rangeContext]="visible()"
      (categoryRangeSelect)="select($event)" (categoryRangeCancel)="armed.set(false)" />
  `,
})
export class InteractionExample {
  readonly rows: readonly Month[] = [
    { id: 'jan', label: 'January', visits: 100 },
    { id: 'feb', label: 'February', visits: 0 },
    { id: 'mar', label: 'March', visits: null },
  ];
  readonly series: readonly ChartSeries<Month>[] = [{ id: 'visits', key: 'visits', label: 'Visits' }];
  readonly from = signal('jan');
  readonly to = signal('mar');
  readonly armed = signal(false);
  readonly visible = computed(() => this.rows.slice(
    this.rows.findIndex((row) => row.id === this.from()),
    this.rows.findIndex((row) => row.id === this.to()) + 1,
  ));
  readonly ids = computed(() => this.visible().map((row) => row.id));
  toggleRange(button: HTMLButtonElement) {
    if (this.visible().length < 2) return;
    this.armed.set(!this.armed());
    button.focus({ preventScroll: true });
  }
  setFrom(id: string) {
    this.armed.set(false);
    this.from.set(id);
    if (this.rows.findIndex((row) => row.id === id) > this.rows.findIndex((row) => row.id === this.to())) this.to.set(id);
  }
  setTo(id: string) {
    this.armed.set(false);
    this.to.set(id);
    if (this.rows.findIndex((row) => row.id === id) < this.rows.findIndex((row) => row.id === this.from())) this.from.set(id);
  }
  select(range: CategoryRangeSelection) {
    this.armed.set(false);
    this.from.set(range.from);
    this.to.set(range.to);
  }
  reset() { this.armed.set(false); this.from.set('jan'); this.to.set('mar'); }
}
```

For a chart linked to application data, see [Filter transactions with a bar chart](TRANSACTION_RANGE.md). To control the chart’s visible window, see [Zoom and pan one bar chart](BAR_ZOOM_PROTOTYPE.md).

## Contract

| Binding | Meaning |
| --- | --- |
| `necCategoryRange: readonly string[]` | Required unique, nonempty IDs matching the rendered category-axis IDs in supplied order |
| `rangeEnabled: boolean` | Default false; the application arms/disarms the gesture |
| `rangeContext: unknown` | Default null; replace when application data/theme/layout/context invalidates a draft |
| `categoryRangeSelect` | `{ from, to, rowIds, source: 'pointer' }`; one release-only event in supplied order, including missing/zero categories |
| `categoryRangeCancel` | `escape`, `context`, `resize`, `scroll`, `blur`, `pointercancel` or `unavailable`; disarm in the handler |

A reverse drag produces the same ordered range. A movement of at least six CSS pixels is required; a plain click while armed emits neither a range nor a point action. A completed gesture cannot replay as a point click after disarming. Bindings never emit a range by themselves or mutate chart/application data. Both outputs require the application to disarm. Invalid/mismatched IDs, unavailable charts, multiple grids and DataZoom produce `unavailable`; they do not alter the chart.

Escape cancels even before dragging. The application host handles Escape and keeps focus on the arming button while the lazy browser module is still downloading, as in the complete example; disabling cancels the pending binding. Resizing, scrolling, capture interruption, blur, engine option changes or a changed input context discard a draft without committing. Destroying/disarming removes listeners, the draft band and temporary styles. Theme/series changes are also detected through chart rendering during a draft. Keep the arming button mounted so focus can stay there; commit may return focus with `preventScroll`. Native fields must remain available.

The vertical chart supports horizontal touch drags with `pan-y pinch-zoom`, preserving native vertical scrolling and pinch gestures. Horizontal charts accept mouse/pen range gestures; use the native fields on touch devices. Neither chart has canvas keyboard bindings. Draft shading is clipped to the actual grid, hidden from accessibility APIs, and includes a current-color border for forced colors.

## Scope and verification

The dashboard uses the same shared inclusive window for an overview gesture or a horizontal device-detail gesture. Original raw point actions, independent legends, full-history trend semantics, native zoom/pan/reset and SSR/hydration remain in place. The native-only [dashboard example](COMPOSED_DASHBOARD.md) retains its digest-verified published rc.22 consumer; the enhanced displayed source has a separate candidate consumer.

The [increment record](experiments/RC33_GRAPHICAL_LINKING.md) owns measured payloads and actual checks. Existing twelve budget scenarios retain their caps and exclude interaction code; additional scenarios bound the optional entry and composed+interaction increment. General-purpose DataZoom, disjoint selection, arbitrary family linking and shared legends remain subsequent work. See the [human review result](experiments/RC20_HUMAN_REVIEW.md).

Public API references: [ECharts getInstanceByDom](https://echarts.apache.org/en/api.html#echarts.getInstanceByDom), [coordinate conversion and containment](https://echarts.apache.org/en/api.html#echartsInstance.convertFromPixel). No upstream implementation code is copied.
