# Bar chart API

Use [installation](INSTALLATION.md), the [complete application example](INTEGRATION_GUIDE.md), and the [tested compatibility/limits table](COMPATIBILITY.md) with this API.

Implemented Angular bar API, reviewed 13 November 2026. Package/API names remain experimental. Import from `@ng-echarts/chart-library/bar`; build or install the local tarball using the [installation instructions](INSTALLATION.md). No public npm package is available.

## Minimal integration

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library/bar';

interface Visit {
  id: string;
  month: string;
  desktop: number | null;
  mobile: number | null;
}

@Component({
  selector: 'app-visits',
  imports: [BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-bar-chart
    title="Monthly visits"
    description="Desktop and mobile visits by month."
    [data]="visits"
    rowIdKey="id"
    categoryKey="month"
    [series]="series"
  />`,
})
export class Visits {
  readonly visits: readonly Visit[] = [
    { id: 'jan', month: 'January', desktop: 342, mobile: 184 },
    { id: 'feb', month: 'February', desktop: 0, mobile: null },
  ];
  readonly series: readonly ChartSeries<Visit>[] = [
    { id: 'desktop', key: 'desktop', label: 'Desktop' },
    { id: 'mobile', key: 'mobile', label: 'Mobile' },
  ];
}
```

## Inputs

Bind booleans and numbers as Angular properties, for example `[stacked]="true"` and `[height]="360"`.

| Input | Type / default | Behavior |
| --- | --- | --- |
| `title` | Required `string` | Native heading and table title |
| `description` | `string`, `''` | Concise chart summary |
| `data` | Required `readonly T[]` | Immutable supplied rows |
| `rowIdKey` | Required `StringKey<T>` | Unique nonempty row identifier field |
| `categoryKey` | Required `StringKey<T>` | Category text field; duplicate labels allowed |
| `series` | Required `readonly ChartSeries<T>[]` | Ordered measures with unique nonempty IDs, numeric keys, text labels, and optional `color` |
| `height` | `number`, `320` | Positive finite plot height in CSS pixels; controls add to total height |
| `layout` | `'vertical' \| 'horizontal'`, `'vertical'` | Category/value axis orientation |
| `stacked` | `boolean`, `false` | Stack visible series together |
| `gradient` | `boolean`, `false` | Theme-colored linear fade along the value axis |
| `selectedRowId` | `string \| null`, `null` | Controlled row feedback (rc.2+): retain this category's bar colors, fade others, draw a category band and mark the expanded table row as current. Unknown/empty IDs render normally. |
| `selectedRowIds` | `readonly string[] \| null`, `null` | Controlled multiple-row feedback (rc.3+). A non-null array overrides `selectedRowId`; empty clears. Known IDs are deduplicated; unknown/empty IDs are ignored. All selected table rows have visible labels, with `aria-current` only for one effective row. |
| `rangeSelection` | `boolean`, `false` | Opt-in pointer range mode (rc.4+), only active for a ready plot. Pair it with native keyboard range fields. |
| `theme` | `'light' \| 'dark'`, `'light'` | Explicit palette defaults; no automatic system preference |
| `themeRevision` | Finite `number`, `0` | Change to reread inherited font and CSS colors |
| `locale` | `string`, `'en-US'` | Deterministic numeric locale |
| `numberFormatOptions` | `Intl.NumberFormatOptions \| undefined` | Immutable currency, percentage, unit, or precision options |
| `valueFormatter` | `ValueFormatter \| undefined` | Pure synchronous `(value: number) => string`; overrides generated numeric text |
| `categoryTickFormatter` | `CategoryTickFormatter \| undefined` | Pure synchronous `(category: string, index: number) => string`; axis text only |
| `showDataTable` | `boolean`, `true` | Include table toggle and expandable values; initially collapsed |
| `loading` | `boolean`, `false` | Show loading state and remove stale plot actions |
| `error` | `string \| null`, `null` | Supplied application error; empty string uses a generic message |
| `animation` | `boolean`, `true` | Decorative plot animation; reduced motion always disables it |

`ChartSeries<T>` restricts measure keys to numeric/nullish numeric fields. Supplied nonfinite or nonnumeric measures are invalid. Null/undefined are missing observations, never zero. Zero and negative values are valid; empty data, no series, or no observed measures produce an empty state. Every series shares the supplied row order and category axis.

Replace row, series, and options references to update them. Visibility survives by series ID across replacements; removed IDs are discarded and new IDs start visible. All-hidden data stays ready so the legend can restore it.

## Outputs and controls

| Output | Payload |
| --- | --- |
| `pointSelect` | `PointSelection<T>`: `rowId`, `seriesId`, original `row`, raw numeric `value`, and `source: 'plot' \| 'table'` |
| `rangeSelect` | `BarRangeSelection<T>`: inclusive `fromRowId`, `toRowId`, ordered `rowIds`, original `rows`, and `source: 'plot'` (rc.4+) |
| `legendChange` | `LegendVisibilityChange`: `seriesId`, `visible` |

Use `(pointSelect)="select($event)"` with a named handler. Plot selection ignores hidden series; table actions remain available for every nonmissing value, including hidden series and zero. Missing cells have text but no action. Legend buttons expose pressed state and work by keyboard. The native table preserves every row when a series is hidden.

To reflect an application selection, bind `[selectedRowId]="selectedId()"` and set that signal from `pointSelect` or another native control. The chart never mutates this input or emits a point event for an input change. Reset it to `null` for the full overview. IDs refer to supplied rows, including rows with zero/missing observations; duplicate category labels do not affect identity. Unknown IDs produce no highlight. The application decides whether a removed ID should be cleared or highlighted again if reintroduced; the [linked example](LINKED_CHARTS.md) clears removed IDs permanently. Legends and raw tooltip/table values remain independent of feedback, including with horizontal, stacked or gradient bars. Feedback appears only in the ready state; entirely missing/empty data retains the normal empty state, and loading/errors hide the plot and table.

Gallery examples set `[showDataTable]="false"` at the user's request; datasets remain in Code. Applications needing keyboard point actions should retain the table or provide an equivalent interface. Disabling and reenabling the input preserves the previous expansion preference.

## Formatting, themes, and lifecycle

Numeric formatting is shared across value-axis ticks, tooltip values, table cells, and action labels. Horizontal bars request fewer rounded numeric intervals for narrow hosts; overlapping value-axis labels may be omitted. ECharts chooses the rounded tick domain; tooltip/table values remain complete. Custom formatters must also support generated finite axis ticks absent from the data. Missing values bypass callbacks; events retain raw numbers. Category-tick formatting leaves full tooltip/table labels unchanged. Keep data and formatter behavior identical on server and client. See the [formatting guide](../projects/chart-library/README.md#numeric-formatting).

CSS tokens are `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and `--nec-series-1` onward. A series' explicit `color` takes precedence over its CSS color token. Theme/revision changes refresh browser color reads. Canvas labels and tooltips inherit the host font; load a replacement font before incrementing `themeRevision`. No font or UI framework is bundled with the library.

Error precedence is application error, loading, data/configuration or renderer error, empty, then ready. Browser failures expose generic messages and allow retry/input recovery. SSR emits Angular headings, controls, and state text; a lazy Canvas renderer starts after hydration in a visible nonzero host. Resize, reduced-motion, and focus listeners are removed on destruction.

## Scope and tested limits

Grouped/stacked, vertical/horizontal, rounded, and solid/gradient combinations are implemented. Bar corners are 2 px, widths are capped at 48 px, and the gradient holds its color through 20% before becoming clear at 90%. Brush selection, arbitrary ECharts options, custom tooltip templates, and pixel identity with upstream are outside this API.

Tested versions: Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, Node 24.22.2, npm 11.19.1. Current package peers require Angular common/core `^22.2.6` and ECharts `^6.1.0`; the full ranges have not been tested. The [recorded performance envelope](COMPATIBILITY.md#data-and-measured-envelope) is up to 200 categories × three series on the reference machine; 2,000 × three is stress evidence rather than a hard API limit or latency guarantee.

See [source comparison](experiments/R03_VISUAL_REVIEW.md), [provenance](UPSTREAM_PROVENANCE.md), [package boundaries](experiments/NG09_PACKAGE_BOUNDARIES.md), and [foundation/bar acceptance](experiments/NG09_NG10_ACCEPTANCE.md). The deferred human listening review remains a release requirement.

For a range, derive `[selectedRowIds]="includedIds()"` in the application. Membership is by ID, independent of adjacency or array order; the library does not infer dates or reconcile endpoints. Set this input to `null` to resume scalar fallback, or `[]` to clear even when a scalar is bound. Both inputs retain runtime type validation; plural values must be an array of strings. The [range example](LINKED_CHARTS.md) defines inclusive supplied-order membership, crossing and removal policy.

## Graphical category ranges

Set `[rangeSelection]="selecting()"` and handle `(rangeSelect)="selectRange($event)"` to opt into a contiguous pointer range. A primary drag of at least four CSS pixels along the category axis shows a snapped draft; release emits once in supplied row order, including equal-month or reverse drags. Releases outside the grid clip to its first/last category. A plain click while armed emits neither a range nor a point. In normal mode, existing plot/table point actions are unchanged. Missing, zero and hidden series do not remove categories from the range.

The output contains original row references and stable IDs, with no ECharts instance or pointer event. Bind the resulting IDs to `selectedRowIds` for persistent feedback. Binding the input alone emits nothing. Drafts cancel on Escape, resize, option/theme/layout changes, interrupted capture, blur, scrolling and disposal. Snapshot validation rejects stale data, including replacements that retain the same IDs. The application's committed selection is preserved during cancellation. Native From/To fields remain the keyboard equivalent; the plot remains hidden from the accessibility tree. The [complete linked source](LINKED_CHARTS.md) also exits selection mode on Escape/commit, preserves the initiating button focus and cancels the mode on data/native-field changes.

On a vertical bar chart, horizontal touch movement can select while vertical page scrolling and pinch zoom stay available; a horizontal chart reserves vertical movement for categories and allows horizontal scrolling/pinch zoom. This bounded feature does not implement zoom, disjoint ranges, drag handles or cross-chart hover.
