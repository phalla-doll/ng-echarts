# Area chart API

Use [installation](INSTALLATION.md), the [complete application example](INTEGRATION_GUIDE.md), and the [tested compatibility/limits table](COMPATIBILITY.md) with this API.

Experimental native Angular 22 area charts. Import from `@ng-echarts/chart-library/area` using the local workspace or packed artifact; no public npm installer is available.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AreaChart, type ChartSeries } from '@ng-echarts/chart-library/area';

interface Reading { id: string; label: string; desktop: number | null; mobile: number | null; }

@Component({
  selector: 'app-area-readings',
  imports: [AreaChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-area-chart
    title="Device readings" description="Stacked readings; missing observations remain gaps."
    [data]="rows" rowIdKey="id" categoryKey="label" [series]="series"
    [stacked]="true" [gradient]="true"
  />`,
})
export class AreaReadings {
  readonly rows: readonly Reading[] = [
    { id: 'mon', label: 'Monday', desktop: 10, mobile: 4 },
    { id: 'tue', label: 'Tuesday', desktop: 12, mobile: 0 },
    { id: 'wed', label: 'Wednesday', desktop: null, mobile: null },
    { id: 'thu', label: 'Thursday', desktop: -5, mobile: -2 },
    { id: 'fri', label: 'Friday', desktop: -2, mobile: -1 },
  ];
  readonly series: readonly ChartSeries<Reading>[] = [
    { id: 'desktop', key: 'desktop', label: 'Desktop' },
    { id: 'mobile', key: 'mobile', label: 'Mobile' },
  ];
}
```

## Inputs and outputs

Area shares the [bar API's](BAR_CHART_API.md) typed Cartesian data, formatting, themes, states, native controls, events, motion preferences, resizing, and SSR lifecycle. The curve behavior follows the [line API](LINE_CHART_API.md); area has its own component/options/loader and does not import the line component entry.

| Input | Default | Behavior |
| --- | --- | --- |
| `title`, `data`, `rowIdKey`, `categoryKey`, `series` | Required | Ordered immutable rows and typed numeric/nullish measures; unique stable string IDs |
| `description`, `height` | `''`, `320` | Concise summary and positive finite plot height in CSS pixels |
| `stacked` | `false` | Stack visible series in one group, keeping positive and negative stacks separate |
| `gradient` | `true` | Vertical per-series fill from 10% color alpha at the top to transparent at the bottom; `false` uses uniform 10% alpha |
| `smooth`, `showPoints` | `false`, `false` | Smooth interpolation and optional persistent 6 px bordered markers |
| `theme`, `themeRevision` | `'light'`, `0` | Explicit palette defaults and CSS/font refresh revision |
| `locale`, `numberFormatOptions`, `valueFormatter` | `'en-US'`, `undefined`, `undefined` | Same numeric text in axes, tooltips, tables, and action labels |
| `categoryTickFormatter` | `undefined` | Axis labels only; retain full text in tooltips/tables/events |
| `showDataTable` | `true` | Include the initially collapsed table and its labeled toggle |
| `loading`, `error`, `animation` | `false`, `null`, `true` | Shared state precedence; reduced motion overrides decorative animation |

Each series owns its fill object and original palette slot; filtering one series does not recolor the others. Fill alpha multiplies any existing CSS/series color alpha. Gradient coordinates are relative to each painted area and fade from screen top to bottom, including negative areas. Use solid fills when a uniform tint is preferable.

Missing measures never become zero and are never connected by strokes or fills, including with smooth/stacked settings. A missing stacked observation contributes no segment; other supplied series remain numeric. Zero and negative values stay valid. Visibility survives immutable updates by series ID; table data stays complete even when every series is hidden.

`pointSelect` emits the original row, stable row/series IDs, **raw numeric value**, and `source: 'plot' | 'table'`; it does not emit a stack total. Clicking a marker selects it. Clicking a painted outline or filled region selects the nearest category on the hit series; missing observations never emit. A lone observation with markers disabled has no fill/outline segment, so retain its table action or enable points. Overlapping areas use the renderer's hit order; the native table provides unambiguous keyboard actions for every supplied value. `legendChange` emits `{ seriesId, visible }`.

## Presentation, packaging, and scope

Area uses 2 px outlines, theme-aware independent fills, the same host-font loading, and the same `--nec-*` tokens as bars/lines. Gallery previews omit table controls and include `[showDataTable]="false"` in copied source. Applications needing keyboard point actions should retain the default table or provide equivalent controls.

`/area` lazily registers ECharts Line, Grid, Tooltip, and Canvas: ECharts implements area fill through its line engine. Focused area imports exclude Bar/SVG and other component entries. Focused line imports exclude the AreaChart component; both intentionally use the line engine. The package root reexports AreaChart alongside existing components. Core's `ɵ` exports are unsupported implementation APIs.

Area covers multi-series gradient/solid fills, grouping/stacking, straight/smooth curves, optional points, and gaps. Latency/portfolio compositions, dotted/hatched textures, brush, normalized/expanded stacks, step/bump curves, decorative strokes, custom tooltip templates, and raw ECharts option overrides remain outside this API.

Use `/area` for the gallery, `/area-validation` for behavior checks, and `/area-comparison` for pinned reference conditions. `npm run benchmark:area` measures the actual Angular component; `npm run capture:area` reproduces the source comparisons after preparing the reference harness. Tested toolchain versions remain Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, Node 24.22.2, and npm 11.19.1. See the [NG12 report](experiments/NG12_AREA_CHART.md) for validation, measurements, supported envelope, and release limitations.

The starting measured envelope is 200 categories and three series; 2,000 categories is stress evidence. [NG14](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) records current automated acceptance; human interpretation and final release gates remain pending.
