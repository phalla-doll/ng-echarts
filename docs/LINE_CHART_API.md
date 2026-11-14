# Line chart API

Use [installation](INSTALLATION.md), the [complete application example](INTEGRATION_GUIDE.md), and the [tested compatibility/limits table](COMPATIBILITY.md) with this API.

Experimental native Angular 22 line charts. Use the local workspace or packed artifact; the package has not been published to npm.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LineChart, type ChartSeries } from '@ng-echarts/chart-library/line';

interface Reading { id: string; label: string; value: number | null; }

@Component({
  selector: 'app-readings',
  imports: [LineChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-line-chart
    title="Daily readings" description="Missing readings remain gaps."
    [data]="rows" rowIdKey="id" categoryKey="label" [series]="series"
    [smooth]="false" [showPoints]="true"
  />`,
})
export class Readings {
  readonly rows: readonly Reading[] = [
    { id: 'mon', label: 'Monday', value: 10 },
    { id: 'tue', label: 'Tuesday', value: null },
    { id: 'wed', label: 'Wednesday', value: -5 },
    { id: 'thu', label: 'Thursday', value: 0 },
  ];
  readonly series: readonly ChartSeries<Reading>[] = [{ id: 'value', key: 'value', label: 'Value' }];
}
```

## Inputs and outputs

`LineChart<T>` shares the bar chart's typed rows, series, events, formatting, theme tokens, native controls, state precedence, motion preference, and SSR/lifecycle behavior through a renderer-free Cartesian foundation. See the [bar API](BAR_CHART_API.md) for those shared rules.

| Input | Default | Meaning |
| --- | --- | --- |
| `title`, `data`, `rowIdKey`, `categoryKey`, `series` | Required | Same typed Cartesian contract as bars; stable string identities and numeric/nullish measure keys |
| `description` | `''` | Native concise summary |
| `height` | `320` | Positive finite plot height in CSS pixels |
| `smooth` | `false` | Smooth interpolation instead of straight segments |
| `showPoints` | `true` | Persistent 6 px circular point markers |
| `theme`, `themeRevision` | `'light'`, `0` | Explicit palette and browser CSS/font refresh revision |
| `locale`, `numberFormatOptions`, `valueFormatter` | `'en-US'`, `undefined`, `undefined` | Consistent numeric text across ticks, tooltips, table values, and action labels |
| `categoryTickFormatter` | `undefined` | Shorten axis labels while preserving full labels elsewhere |
| `showDataTable` | `true` | Include the initially collapsed native table and its toggle |
| `loading`, `error`, `animation` | `false`, `null`, `true` | Shared state/motion rules; reduced motion overrides animation |

`pointSelect` emits the original row, stable row/series IDs, raw numeric value, and `source: 'plot' | 'table'`. Clicking a marker selects its observation. Clicking the painted line, including with persistent markers disabled, selects the nearest category on that series; missing values never emit. A lone observation with hidden markers has no line segment to click, so retain its table action. `legendChange` emits `{ seriesId, visible }`.

Null/undefined values remain gaps with `connectNulls: false` under both interpolation modes. Zero and negative numbers remain numeric. Preserve supplied row order and replace array/configuration references when updating. Visibility persists by ID across updates, and filtering preserves the supplied series palette slots; table values remain complete. Duplicate display labels are allowed because axis identity uses row IDs.

## Appearance and boundaries

Lines use 2 px strokes with theme-colored, 2 px bordered circular markers. Category axes have no boundary gap. CSS tokens and host-font loading match bars. The gallery uses Inter for the interface/plot and Google Sans Code for highlighted examples, with native Heroicons controls. Gallery previews opt out of table controls and include the same option in their copied Angular source.

Import `/line` for a line-only consumer. It lazily registers Line, Grid, Tooltip, and Canvas modules and excludes Bar/SVG implementations. `/bar` continues to exclude Line. The root entry reexports all four chart components for compatibility. Shared `ɵ`-prefixed exports exist only for package implementation; they are unsupported consumer APIs. Do not import renderer classes or package source internals.

Line supports category/linear-value axes, multiple series, straight/smooth interpolation, optional markers, gaps, numeric formatting, and shared controls. Area fills, line stacks, step/bump/monotone-specific interpolation controls, brushes, animated/decorative strokes, custom tooltips, and raw ECharts options are outside this API.

## Validation and limits

Tested versions remain Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, Node 24.22.2, and npm 11.19.1. Peer ranges remain provisional. The [NG11 report](experiments/NG11_LINE_CHART.md) records source comparisons, browser/packed-consumer checks, measured performance, and bundle budgets. NG14 automated acceptance is recorded. Human listening and release acceptance remain open. The starting measured envelope is 200 categories and three series; 2,000 categories is stress evidence.

Use `/line` for the gallery, `/line-validation` for engineering behavior checks, and `/line-comparison` for pinned-reference conditions. `npm run benchmark:line` measures the actual Angular component on a fixed visible 768 px host; `npm run capture:line` reproduces the comparison captures after preparing the reference harness.

Series alternate solid/circle and dashed/diamond outlines/markers, with identity-based palette and style slots retained when filtering. Endpoint markers are not clipped at the grid edge. Loading, empty and error states reserve the plot height and keep unavailable controls inert.
