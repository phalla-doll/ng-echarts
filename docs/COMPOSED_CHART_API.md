# Composed chart API

NG17's first composed increment combines vertical bars and lines on one category axis and one linear value axis. Use comparable units for all measures. It inherits the Cartesian formatting, states, stable identities, native legends/tables, motion, resizing, and SSR behavior.

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

`ComposedSeries<T>` is a discriminated union of `ComposedBarSeries<T>` and `ComposedLineSeries<T>`. Every descriptor requires a unique nonempty `id`, numeric/nullish numeric `key`, text `label`, and `kind: 'bar' | 'line'`. `color?: string` follows the existing explicit-color/token/default precedence.

| Kind | Additional settings |
| --- | --- |
| `bar` | None; vertical, unstacked, solid fill |
| `line` | `smooth?: boolean` (default false), `showPoints?: boolean` (default true) |

A missing/unknown kind, nonboolean line settings, or line settings on a bar produce a configuration error at runtime; typed templates/descriptors reject them during compilation. Replace the series reference to change its kind/settings. Stable IDs preserve legend visibility through reordering, renaming and kind changes; removing an ID discards its previous hidden state.

Bars and lines use the same category centers, with a half-category edge gap retained even when all bars are hidden. Lines render above bars and preserve missing-observation gaps. A line path without persistent markers remains clickable and resolves the nearest valid category on that series. Negative and zero values remain raw numeric values. Null/undefined values are missing; all-zero data is valid.

The library renders supplied trend values; it does not calculate a moving average. The demo computes an original trailing three-observation mean from the attributed monthly fixture. Early months use available observations, and its summary shows the latest mean rather than adding monthly averages together.

## Shared inputs and outputs

The shared inputs/defaults are `title` (required), `description` (empty), `data` (required), `rowIdKey`/`categoryKey` (required string fields), `series` (required mixed descriptors), `height` (320), `theme` (light), `themeRevision` (0), `locale` (en-US), `numberFormatOptions`, `valueFormatter`, `categoryTickFormatter`, `showDataTable` (true), `loading` (false), `error` (null), and `animation` (true; reduced motion wins).

`pointSelect: PointSelection<T>` includes the original row, row/series IDs, raw value and plot/table source. `legendChange: LegendVisibilityChange` includes series ID and visibility. Native table actions retain hidden-series values and provide keyboard point activation. Point activation does not add persistent selection state. Tooltips share full category/series labels and escaped formatted numeric text; category tick abbreviations do not change those full labels.

States follow application error, loading, data/configuration/renderer error, empty, then ready. All-hidden series remain ready so native controls can restore them. Theme/revision changes reread inherited tokens and keep one renderer instance; input changes use replacement options so obsolete bar/line settings do not remain.

## Entry points, scope and limits

Use `/composed` for `ComposedChart`, `ComposedSeries`, `ComposedBarSeries`, and `ComposedLineSeries`; root exports are compatible. Shared event/key/formatter types are reexported by `/composed` and `/core`. The focused entry lazily registers only bar, line, grid, tooltip and Canvas modules. Existing focused bar/line/area/pie entries do not acquire the composed component or additional engines.

This initial increment supports bar/line combinations on shared axes. Dual scales, horizontal composition, stacking, area composition, raw ECharts options and custom tooltip templates are outside this increment. Mixed units such as visits and percentages require a different design, not an unlabelled shared scale. Existing [compatibility and measured-envelope guidance](COMPATIBILITY.md) remains the starting point; the [NG17 report](experiments/NG17_COMPOSED_CHART.md) records composed-specific measurements and checks.

The gallery at `/composed` keeps the approved neutral styling and copyable source; `/composed-validation` exposes engineering controls separately. Human interpretation and complete release gates retain their deferred status.

The line layer uses a 2.5 px dashed stroke and 7 px diamond markers; the bar layer uses 2 px corners. These presentation cues do not change raw events, series identity or comparable-unit requirements. Nonready states preserve plot geometry and retain inert control space.
