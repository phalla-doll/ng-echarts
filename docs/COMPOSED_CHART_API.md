# Composed chart API

NG17 combines vertical bars, lines and areas on one category axis and one linear value axis. Named bar stacks ship in published rc.21 and later; composed areas and named area stacks ship in rc.22 and later. Use comparable units for all measures on a shared axis. Published rc.24 and later provide explicit independent value axes below. It inherits the Cartesian formatting, states, stable identities, native legends/tables, motion, resizing, and SSR behavior.

## Complete example

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComposedChart, type ComposedSeries } from '@mantha911/ng-echarts/composed';

interface Visit {
  id: string;
  month: string;
  visits: number | null;
  trend: number | null;
}

@Component({
  selector: 'app-composed-example',
  imports: [ComposedChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-composed-chart
    title="Visits and trend"
    description="Monthly visits and a trailing three-month mean, both in visits."
    [data]="rows" rowIdKey="id" categoryKey="month" [series]="series"
    [animation]="false"
  />`,
})
export class ComposedExample {
  readonly rows: readonly Visit[] = [
    { id: 'jan', month: 'January', visits: 120, trend: 120 },
    { id: 'feb', month: 'February', visits: 180, trend: 150 },
    { id: 'mar', month: 'March', visits: 150, trend: 150 },
  ];
  readonly series: readonly ComposedSeries<Visit>[] = [
    { id: 'visits', key: 'visits', label: 'Visits', kind: 'bar' },
    { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line', smooth: false, showPoints: true },
  ];
}
```

## Series contract

`ComposedSeries<T>` is a discriminated union of `ComposedBarSeries<T>`, `ComposedLineSeries<T>` and `ComposedAreaSeries<T>`. Every descriptor requires a unique nonempty `id`, numeric/nullish numeric `key`, text `label`, and `kind: 'bar' | 'line' | 'area'`. `color?: string` follows the existing explicit-color/token/default precedence.

| Kind | Additional settings |
| --- | --- |
| `bar` | `stack?: string` (rc.20+); omission means vertical, unstacked, solid fill |
| `line` | `smooth?: boolean` (default false), `showPoints?: boolean` (default true) |
| `area` (rc.22+) | `smooth?: boolean` (default false), `showPoints?: boolean` (default true), `gradient?: boolean` (default true), `stack?: string` |

A missing/unknown kind, nonboolean curve/fill settings, curve settings on a bar, fill settings on a bar/ordinary line, or stack settings on an ordinary line produce a configuration error at runtime; typed templates/descriptors reject them during compilation. Replace the series reference to change its kind/settings. Stable IDs preserve legend visibility through reordering, renaming and kind changes; removing an ID discards its previous hidden state.

`stack` must be a nonempty string without surrounding whitespace. Equal names group bars into the same stack; different names form separate stacks next to unstacked bars. Lines reject stack settings in strict types and at runtime. Supplied series order defines segment order. Positive and negative values stack separately from zero; null/undefined remain missing and zero remains observed. Hiding a segment recalculates the visible stack and exposed end corners; its original table values remain accessible. Tooltips, tables and point events report raw segment values. The library does not calculate a cumulative line or percentage normalization.

For example, supply descriptors `{ id: 'desktop', key: 'desktop', label: 'Desktop', kind: 'bar', stack: 'visits' }` and `{ id: 'mobile', key: 'mobile', label: 'Mobile', kind: 'bar', stack: 'visits' }`, plus a line descriptor for your own total/target/trend field. See the copyable second `/composed` gallery example. Named bar stacks ship in published rc.21; composed areas ship in rc.22. The earlier rc.19 artifact remains preserved.

Bars, lines and areas use the same category centers, with a half-category edge gap retained even when all bars are hidden. Lines render above bars and preserve missing-observation gaps. A line path without persistent markers remains clickable and resolves the nearest valid category on that series. Negative and zero values remain raw numeric values. Null/undefined values are missing; all-zero data is valid.

The library renders supplied trend values; it does not calculate a moving average. The demo computes an original trailing three-observation mean from the attributed monthly fixture. Early months use available observations, and its summary shows the latest mean rather than adding monthly averages together.

## Shared inputs and outputs

The shared inputs/defaults are `title` (required), `description` (empty), `legendLayout` (`'chips'`; `'list'` for aligned rows since published rc.28), `data` (required), `rowIdKey`/`categoryKey` (required string fields), `series` (required mixed descriptors), `height` (320), `theme` (light), `themeRevision` (0), `locale` (en-US), `numberFormatOptions`, `valueFormatter`, `categoryTickFormatter`, `showDataTable` (true), `tablePageSize` (null; complete table), `loading` (false), `error` (null), and `animation` (true; reduced motion wins).

`pointSelect: PointSelection<T>` includes the original row, row/series IDs, raw value and plot/table source. `legendChange: LegendVisibilityChange` includes series ID and visibility. Native table actions retain hidden-series values and provide keyboard point activation. Point activation does not add persistent selection state. Tooltips share full category/series labels and escaped formatted numeric text; category tick abbreviations do not change those full labels.

States follow application error, loading, data/configuration/renderer error, empty, then ready. All-hidden series remain ready so native controls can restore them. Theme/revision changes reread inherited tokens and keep one renderer instance; input changes use replacement options so obsolete bar/line/area settings do not remain.

## Entry points, scope and limits

Use `/composed` for `ComposedChart`, `ComposedSeries`, `ComposedBarSeries`, `ComposedLineSeries` and `ComposedAreaSeries`; root exports are compatible. Shared event/key/formatter types are reexported by `/composed` and `/core`. The focused entry lazily registers only bar, line, grid, tooltip and Canvas modules. Existing focused bar/line/area/pie entries do not acquire the composed component or additional engines.

The default configuration supports bar/line/area combinations on shared axes. Stacked ordinary lines, raw ECharts options and custom tooltip templates remain outside this API. Published rc.24 and later provide explicit independent linear value axes below. Mixed units such as visits and percentages require a different design, not an unlabelled shared scale. Existing [compatibility and measured-envelope guidance](COMPATIBILITY.md) remains the starting point; the [NG17 report](experiments/NG17_COMPOSED_CHART.md) records composed-specific measurements and checks.

The gallery at `/composed` keeps the approved neutral styling and copyable source; `/composed-validation` exposes engineering controls separately. Human interpretation and complete release gates retain their deferred status.

The ordinary line layer uses a 2.5 px dashed stroke and 7 px diamond markers; the bar layer uses 2 px corners. Areas sit behind both, with 2 px solid outlines, 7 px circle markers and the standalone area fill treatment. These presentation cues do not change raw events, series identity or comparable-unit requirements. Nonready states preserve plot geometry and retain inert control space.

<a id="optional-table-pagination-in-unreleased-rc19-source"></a>

## Optional table pagination since rc.19

Set `[tablePageSize]="50"` to create at most 50 native table rows at once. The default `null` retains the complete table. The size must be a positive safe integer; invalid values produce a configuration error. The plot continues to show all observations. Previous/Next buttons announce the visible row range and retain keyboard focus at either boundary. Every row remains available through paging, including hidden-series values, zero and missing observations.

Replacing the immutable data array or page size resets to the first page; collapsing and reopening retains the page. Native point actions still return the original row and raw value. See the [performance follow-up](experiments/PERFORMANCE_FOLLOW_UP.md). This API is available in published rc.19 and later; use `@next` or pin rc.19. Published rc.23 also includes it.


## Area composition in rc.22

`ComposedAreaSeries<T>` adds `kind: 'area'` with the same numeric/nullish keys and curve settings. Its independent fill is gradient by default; `gradient: false` uses the existing solid translucent area treatment. Fill settings on bars/ordinary lines and nonboolean area settings are rejected by strict types and runtime validation.

Named area stacks accumulate same-sign observations in supplied series order. Bar and area stack namespaces are separate, even when their public names match; the library never combines those geometries into one stack. Ordinary lines remain independent supplied values. Missing values stay gaps in the affected series, zero remains observed, and other observed series remain available. An observed partial stack must not be presented as a complete total when another member is missing. Tooltips, native tables and plot/table actions return original observations, not cumulative stack heights.

Areas render behind bars and ordinary lines; category centers and half-category edge gaps stay stable through kind/legend changes. Replacing a descriptor clears obsolete fill/stack settings. Whole-area and line clicks resolve the nearest observed category; missing observations cannot emit. The native table supplies exact keyboard actions.

The third and fourth gallery examples provide compiled area+line and stacked-area+line source. Percentage normalization remains deferred. Horizontal composition ships in rc.23; rc.24 adds the explicit value-axis contract below. The [area increment report](experiments/NG17_COMPOSED_AREAS.md) owns current verification; human interpretation stays pending.

<a id="horizontal-layout-in-local-rc23"></a>

## Horizontal layout in published rc.23

`layout: 'vertical' | 'horizontal'` defaults to `vertical`; other values are rejected in strict templates and runtime configuration. Set `layout="horizontal"` for a numeric x-axis and a category y-axis. Supplied row order is retained from top to bottom, without sorting. Category centers and edge gaps remain stable when all bars or all series are hidden. Stacks keep their signed accumulation and separate bar/area namespaces; bar end caps and area gradients rotate with the geometry.

The shared formatter formats numeric ticks, tooltips and tables in either layout. Use `categoryTickFormatter` to shorten long regional labels while retaining full tooltip/table labels. Choose a height appropriate to the supplied category count. Whole-line/area hits use the pointer y-coordinate and category y-axis in horizontal layout; direct marker/bar identities and raw values are unchanged. Layout replacement preserves the renderer and stable-ID legend/focus state; invalid layouts use the existing error/recovery policy. No new engine modules, raw ECharts options or dual-axis contract are added.

The `/composed#horizontal-visits-and-target` example includes copyable horizontal source. The [linked dashboard](COMPOSED_DASHBOARD.md) uses existing rc.22 events and app-owned selection, independently of this new layout API. [Implementation and evidence](experiments/NG20_COMPOSED_DASHBOARD.md). Horizontal layout ships in published rc.23. Published rc.22 remains immutable and does not expose that input.

## Explicit value axes since rc.24

`valueAxes: readonly ComposedValueAxis[] | null` defaults to `null` (the existing shared scale). When set, supply one or two axes, each with unique nonempty unpadded `id`, `label` and `unit` strings. Set `axisId?: string` on bar, line or area descriptors; omission uses the first supplied axis. Explicit IDs retain assignment when axes are reordered. Unknown IDs, duplicate/invalid descriptors, zero or more than two axes are configuration errors. Values must be comparable within an axis. Vertical axes are left/right; horizontal axes are bottom/top. Both scales are linear and automatic. Only the first draws grid lines. Equal screen heights on independent scales do not establish equal quantities.

Each axis accepts optional `numberFormatOptions` and `valueFormatter`. It uses shared `locale`, with its own Intl defaults or pure formatter; explicit axes replace shared `numberFormatOptions`/`valueFormatter`. Formatting and caching are isolated by axis for ticks, tooltips and native table/actions. Missing observations do not call formatters. Invalid options or known-observation callback failures produce the normal error state; unexpected tick failures use renderer recovery. Callback/data/config replacement permits recovery. Null `valueAxes` restores ordinary shared formatting.

A native scale description names each position, full label and unit. Legends, tooltip rows, table headers and action labels include unit and position. Point events retain original numbers: `12%` text still emits `0.12`. Zero, missing data, immutable replacement, local legend state and keyboard focus follow existing rules. Options are replaced so removing axes clears obsolete indexes. Within either bar or area geometry a named stack must stay on one axis/unit; the two geometry namespaces remain distinct. The library does not normalize percentages, combine units or calculate supplied rates.

```ts
import { Component } from '@angular/core';
import { ComposedChart, type ComposedSeries, type ComposedValueAxis } from '@mantha911/ng-echarts/composed';

interface Month { id: string; month: string; revenue: number | null; conversion: number | null; }
@Component({
  selector: 'app-root',
  imports: [ComposedChart],
  template: `<nec-composed-chart title="Revenue and conversion"
    description="Independent USD and percentage scales."
    [data]="rows" rowIdKey="id" categoryKey="month" [series]="series"
    [valueAxes]="axes" />`,
})
export class App {
  readonly rows: readonly Month[] = [
    { id: 'jan', month: 'January', revenue: 1200, conversion: 0.12 },
    { id: 'feb', month: 'February', revenue: 0, conversion: null },
  ];
  readonly series: readonly ComposedSeries<Month>[] = [
    { id: 'revenue', key: 'revenue', label: 'Revenue', kind: 'bar', axisId: 'money' },
    { id: 'conversion', key: 'conversion', label: 'Conversion', kind: 'line', axisId: 'rate' },
  ];
  readonly axes: readonly ComposedValueAxis[] = [
    { id: 'money', label: 'Revenue', unit: 'USD', numberFormatOptions: { style: 'currency', currency: 'USD' } },
    { id: 'rate', label: 'Conversion', unit: '%', numberFormatOptions: { style: 'percent' } },
  ];
}
```

The `/composed#revenue-and-conversion` gallery provides complete compiled source; `/composed-validation` exercises replacement and invalid states. This feature ships in published rc.24; install `@next` or pin `@0.1.0-rc.24`. [Publication](experiments/RC24_PUBLICATION.md). [Implementation and actual verification](experiments/NG17_DUAL_AXES.md). Human interpretation remains deferred.
