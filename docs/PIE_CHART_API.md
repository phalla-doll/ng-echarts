# Pie and donut API

Use [installation](INSTALLATION.md), the [complete application example](INTEGRATION_GUIDE.md), and the [tested compatibility/limits table](COMPATIBILITY.md) with this API.

Experimental Angular 22 `PieChart<T>` from `@ng-echarts/chart-library/pie`. Use the local workspace or packed artifact; public npm installation is not available yet. One component renders both pie and donut layouts.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PieChart, type ChartMeasure } from '@ng-echarts/chart-library/pie';
interface Browser { id: string; label: string; visitors: number | null; }
@Component({
  selector: 'app-browser-share', imports: [PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-pie-chart title="Browser share" description="Visitors by browser."
    [data]="rows" rowIdKey="id" categoryKey="label" [measure]="measure"
    [innerRadius]="0.6" [showLabels]="true"
  />`,
})
export class BrowserShare {
  readonly rows: readonly Browser[] = [
    { id: 'chrome', label: 'Chrome', visitors: 275 },
    { id: 'safari', label: 'Safari', visitors: 200 },
    { id: 'other', label: 'Other', visitors: 0 },
  ];
  readonly measure: ChartMeasure<Browser> = { id: 'visitors', key: 'visitors', label: 'Visitors' };
}
```

## Data and inputs

Supply immutable `data`, unique stable string row IDs, string category labels, and one required `measure: ChartMeasure<T>` (`id`, numeric `key`, text `label`). Category labels may repeat; row IDs distinguish sectors. There is no multi-series input. Nullish measures remain missing, not zero. Negative/nonfinite values, duplicate IDs, and overflowing totals produce a recoverable error. Absent, all-missing, and all-zero datasets produce the empty state without equal-size placeholder sectors.

| Input | Default | Meaning |
| --- | --- | --- |
| `title`, `data`, `rowIdKey`, `categoryKey`, `measure` | Required | Native title, immutable rows, identity, category label, and one numeric measure |
| `description`, `height` | `''`, `320` | Summary and positive finite plot height in CSS pixels |
| `innerRadius` | `0` | Ratio of outer radius, from 0 to 0.9; `0` is pie, `0.6` is a donut |
| `showTotal` | `false` | Show the formatted visible total and measure label in a donut with `innerRadius >= 0.4`; hidden for no positive visible values |
| `showLabels` | `false` | Outside category labels, with leader lines, truncation and overlap suppression |
| `theme`, `themeRevision` | `'light'`, `0` | Explicit theme and CSS/font refresh revision |
| `locale`, `numberFormatOptions`, `valueFormatter` | `'en-US'`, `undefined`, `undefined` | Shared numeric text in tooltips and table actions |
| `showDataTable` | `true` | Initially collapsed, complete native table with keyboard point actions |
| `loading`, `error`, `animation` | `false`, `null`, `true` | Shared state precedence and motion behavior; OS reduced motion overrides animation |

The outer radius is 80% of half the shorter plot dimension, reduced to 60% when labels are enabled. Labels follow short leader lines near the ring, with edge bounds and overlap suppression on narrow hosts. Ratios keep donuts responsive; this differs from the upstream example's fixed 60 px inner radius. Labels are category text rather than numeric percentages. Long/colliding labels may be shortened or hidden; the native legend and table retain complete text. No category-axis formatter applies to radial charts.

## Visibility, events, and keyboard controls

`legendChange` emits `CategoryVisibilityChange { rowId, visible }`, identifying a **category**, rather than a Cartesian series. Hidden IDs survive immutable row updates/reordering, and disappear when the corresponding row is removed from a valid dataset. Filtering retains each original palette slot. Reordering rows also reorders palette slots.

`pointSelect` emits `PointSelection<T>` with original `row`, `rowId`, measure ID in `seriesId`, raw `value`, and `source: 'plot' | 'table'`. Sector clicks select positive supplied observations. Zero and hidden values retain table actions; missing observations show “Missing” with no action. Visibility changes recompute proportions among visible values without changing event values. Native legends show each raw value and its locale-formatted share of the visible total; hidden/missing categories show a dash for share. Tooltips use the same denominator. When `showTotal` is enabled, the sum is validated through the value formatter alongside observations, so a formatter failure produces a recoverable chart error. Hiding every positive category keeps recovery controls and displays “No visible positive values”; it does not draw placeholder sectors. Empty/error/loading states reserve the plot height, keep controls inert and omit the ready table.

Keep the default table or provide equivalent keyboard point controls. Gallery previews and copied examples use `[showDataTable]="false"` at the user's request. Inspectable code does not replace keyboard actions. Native legend focus is retained across keyed updates; removal restores a usable local control without stealing external focus.

## Presentation and boundaries

Use shared `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, and `--nec-series-N` CSS tokens; `themeRevision` refreshes measured tokens/font. Colors cycle through the shared palette; supply additional numbered tokens for larger palettes. The gallery adapts the five upstream browser colors and observations, with Inter, Google Sans Code, and Heroicons.

Focused `/pie` lazily registers only Pie, Tooltip, and Canvas. It configures no axes and excludes Grid/Cartesian coordinate systems, Bar/Line, SVG, and other Angular chart components. ECharts Tooltip retains shared axis-pointer support, counted in measured bytes. Root imports reexport `PieChart` for compatibility; use focused entries for smallest output. Core has no ECharts/ZRender runtime. Rendering waits for browser hydration, stable layout and fonts; observers, pending frames, motion listeners and instances are disposed on teardown. Renderer failures offer Retry chart.

This API covers solid sectors, pie/donut radii, outside labels, missing/zero handling, native category visibility, formatting, and events. It excludes decorative gradients/patterns, padding/rounded/overlapping sectors, exploded persistent selection, multi-ring/progress compositions, custom tooltip templates, and raw ECharts options. Tested versions: Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, Node 24.22.2, npm 11.19.1. See [NG13 evidence](experiments/NG13_PIE_CHART.md).

The starting measured envelope is 12 categories; 100 categories is stress evidence, measured on a donut with labels off. Crowded outside labels have separate layout costs. [NG14](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) records current automated acceptance; human interpretation and final release gates remain pending.
