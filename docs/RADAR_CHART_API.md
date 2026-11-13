# Radar chart API

Experimental NG18 first increment, private `0.1.0-rc.5`. Import `RadarChart` from `@ng-echarts/chart-library/radar`; it is deliberately absent from the compatibility root so existing imports retain their engine/bundle boundaries. Radial progress is separate subsequent work.

## Example

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RadarChart, type ChartSeries } from '@ng-echarts/chart-library/radar';

interface Capability {
  id: string; dimension: string; max: number;
  current: number | null; target: number | null;
}
@Component({
  selector: 'app-capability-profile',
  imports: [RadarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-radar-chart
    title="Capability profile"
    description="Current and target scores, each out of 100."
    [data]="rows" rowIdKey="id" categoryKey="dimension" maxKey="max"
    [series]="series" [height]="320"
  />`,
})
export class CapabilityProfile {
  readonly rows: readonly Capability[] = [
  {
    "id": "speed",
    "dimension": "Speed",
    "max": 100,
    "current": 78,
    "target": 92
  },
  {
    "id": "reliability",
    "dimension": "Reliability",
    "max": 100,
    "current": 90,
    "target": 95
  },
  {
    "id": "usability",
    "dimension": "Usability",
    "max": 100,
    "current": 72,
    "target": 88
  },
  {
    "id": "coverage",
    "dimension": "Coverage",
    "max": 100,
    "current": 65,
    "target": 85
  },
  {
    "id": "support",
    "dimension": "Support",
    "max": 100,
    "current": 85,
    "target": 90
  },
  {
    "id": "value",
    "dimension": "Value",
    "max": 100,
    "current": 82,
    "target": 90
  }
];
  readonly series: readonly ChartSeries<Capability>[] = [
    { id: 'current', key: 'current', label: 'Current' },
    { id: 'target', key: 'target', label: 'Target' },
  ];
}
```

## Data contract

Each immutable row is one dimension. `rowIdKey` identifies it, `categoryKey` supplies its label, and required `maxKey: NumericKey<T>` supplies a positive finite maximum. Each `ChartSeries<T>` supplies one comparison through its stable `id`, numeric `key`, text `label` and optional `color`. Display labels may repeat; IDs may not. Supplied dimension order is preserved.

The bounded first increment accepts 3–12 dimensions and 1–4 comparisons. Values must be finite, nonnegative and no larger than their dimension's maximum. Every axis starts at zero. Maxima never auto-scale when scores update or comparisons are hidden; replacing the supplied maxima explicitly changes the scales. For a fair profile comparison, choose meaningful, consistent scales. Polygon area is not an aggregate score.

Zero is a valid observation. `null` or absent measures are missing. A comparison with any missing observation is omitted from the polygon and named in an explicit notice. Its observed values remain available in the data table. An all-missing dataset is empty; an all-zero dataset is ready. This avoids assigning zero geometry to missing observations; see the [upstream missing-dimension issue](https://github.com/apache/echarts/issues/20811). Maxima themselves cannot be missing.

## Inputs and states

Shared inputs follow the [bar API](BAR_CHART_API.md#inputs): required title/data/rowIdKey/categoryKey/series; description, height (320), theme, themeRevision, locale, numberFormatOptions, valueFormatter, categoryTickFormatter, showDataTable (true), loading, error and animation. Radar does not have Cartesian layout, stack, gradient, range or controlled row-selection inputs. `filled` is a boolean, default true, for the quiet polygon fill; vertex markers and solid/dashed comparison outlines remain visible. Geometry is polygonal with four fixed scale intervals.

Application error takes precedence over loading, validation/renderer errors, empty and ready. Non-ready states hide old plot/table actions. Updates recover without replacing the component. Formatting of observed values and maxima uses the same locale/options/formatter in tooltips and the table; raw events retain numbers. Numeric callbacks must also handle each maximum. Truncated plot labels preserve full labels in tooltips/table; categoryTickFormatter affects only plotted labels.

## Interaction and accessibility

`legendChange: LegendVisibilityChange` emits `{ seriesId, visible }`. Visibility follows stable comparison IDs across updates. Every comparison remains available in the legend when all are hidden.

`pointSelect: PointSelection<T>` emits `{ rowId, seriesId, row, value, source }`. The original input row and raw number are preserved. A plot click activates an unambiguous vertex within ten CSS pixels; clicking a polygon interior has no dimension identity. Coincident vertices within a comparison, including multiple zeros at the center, require an explicit table action. No private engine event fields are used. The table provides keyboard actions for every observed value, including hidden or incomplete comparisons and zero; missing values have no action.

The chart has a title/description, keyboard legend and collapsible table. The table includes a Scale column for every dimension. Keep it enabled unless the application provides an equivalent keyboard interface; `showDataTable=false` removes it. Solid/dashed outlines provide an additional comparison cue. Reduced-motion preference overrides decorative animation, including changes while mounted. The browser adapter owns lazy Canvas registration, resize/theme updates, event listeners and disposal. SSR emits the stable title/native controls and hydrates one browser renderer.

## Limits and evidence

No negative/logarithmic scales, circular grid, variable minima, auto-normalization, range selection, radar-only custom tooltips or radial-progress API. Labels may truncate in narrow cards; the full table and tooltip remain available. Data-count bounds are a readability/validation scope, not measured performance guarantees. Human screen-reader interpretation and release gates remain pending.

The [NG18 implementation report](experiments/NG18_RADAR_CHART.md) records validation, screenshots, package boundaries and actual private-candidate results. The original four-family MVP remains unchanged.
