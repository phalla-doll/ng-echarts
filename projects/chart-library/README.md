# Chart library

Experimental Angular 22 library. The local package identity is `@ng-echarts/chart-library`; it is private and is not a selected public npm name.

`PieChart<T>` renders pie and donut layouts from one `ChartMeasure<T>`; see the [pie/donut API](https://github.com/phalla-doll/ng-echarts/blob/main/docs/PIE_CHART_API.md). Category legend events identify rows, and negative values are rejected.

`LineChart<T>` is now available from `/line`; see the [line API reference](https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINE_CHART_API.md) for smooth/straight interpolation, optional points, gaps, and shared input/event behavior.

`BarChart<T>` is an experimental native Angular bar component. ECharts `^6.1.0` is a required peer; 6.1.0 is tested. Inputs include `title`, `description`, readonly `data` and `series`, string identity/category keys, `height`, `layout`, `stacked`, `gradient`, `theme`, `themeRevision`, `locale`, `numberFormatOptions`, `valueFormatter`, `categoryTickFormatter`, `showDataTable`, `loading`, `error`, and `animation`. `pointSelect` and `legendChange` emit stable identifiers. Replace input references when data changes.

`ChartSeries<T>` restricts measure keys to numeric/nullish numeric fields. `PointSelection<T>` includes the original row, numeric value, row/series IDs, and `plot` or `table` source. Null/missing values stay missing. The table is initially collapsed, and legend filtering preserves its full dataset. Set `[showDataTable]="false"` to omit both its toggle and contents, as the gallery does; the default is `true`. Keep it enabled or provide equivalent controls when users need keyboard point selection. Reenabling preserves the previous expansion state.

The [bar API reference](https://github.com/phalla-doll/ng-echarts/blob/main/docs/BAR_CHART_API.md) lists every input/default, event payload, behavior, tested version, and current limit.

`AreaChart<T>` is available from `/area`; see the [area API reference](https://github.com/phalla-doll/ng-echarts/blob/main/docs/AREA_CHART_API.md) for independent fills, same-sign stacks, raw events, and gap semantics.

## Imports and package boundaries

```ts
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library/bar';
import { LineChart } from '@ng-echarts/chart-library/line';
import { AreaChart } from '@ng-echarts/chart-library/area';
import { PieChart, type ChartMeasure } from '@ng-echarts/chart-library/pie';
import { ChartFrame } from '@ng-echarts/chart-library/core';
```

`/bar` owns the component and lazy modular Canvas renderer. `/line` owns the line component and its lazy Canvas renderer. `/core` owns `ChartFrame`, shared types, and internal Cartesian behavior and includes no ECharts/ZRender runtime bytes. Root imports remain compatible and refer to the same classes; use focused subpaths for new code. Internal source paths are not public exports. All entries ship in one tarball with the existing required Angular/ECharts peers.

`npm run check:bundle` measures focused and compatibility imports and rejects unrelated chart families, SVG, or eagerly included engine code. Focused family gzip/Brotli budgets remain 200,000/175,000 bytes; core is limited to 10,000/9,000 bytes, excluding Angular/RxJS peers. The combined four-family root uses 210,000/175,000; root-frame retains 200,000/175,000. [NG13](https://github.com/phalla-doll/ng-echarts/blob/main/docs/experiments/NG13_PIE_CHART.md#performance-and-packaging) records the additional Pie-engine budget and measured totals. See [package evidence](https://github.com/phalla-doll/ng-echarts/blob/main/docs/experiments/NG09_PACKAGE_BOUNDARIES.md).

## Numeric formatting

Locale defaults to the explicit `en-US`. Bind immutable `Intl.NumberFormatOptions` for currency, percent, precision, or units, for example `readonly money: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }` and `[numberFormatOptions]="money"`.

For custom text, bind a pure, synchronous `ValueFormatter = (value: number) => string` through `[valueFormatter]="formatValue"`. It overrides the generated numeric text everywhere: value-axis ticks, tooltip values, table cells, and action labels. It must handle any finite axis tick, including values absent from the dataset. Keep the locale, options, formatter, and data deterministic on server and client. Locale/options are validated even when a custom callback is supplied.

Known observation labels are cached for custom formatters; missing values never reach the callback and remain `Missing`. Zero values stay numeric. Cartesian charts accept negatives; pie/donut rejects negatives and treats zero totals as empty. Selection events retain the original number. Callback output is plain text and escaped in HTML tooltips. Invalid options or observation callbacks show a generic configuration error; failures on generated axis ticks are contained by the renderer and recover when valid inputs replace them.

`categoryTickFormatter` changes only category-axis text. Full categories remain in tooltips, table headings, and point-action labels.

Use `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and `--nec-series-1` onward for CSS tokens. Change `theme` or increment `themeRevision` to request new color reads. Reduced motion overrides decorative animation. The renderer initializes only in the browser.

Chart axes and tooltips inherit the host element's CSS `font-family`. Initial browser rendering waits for that font to load; failed font requests use the normal fallback stack. The package does not bundle or require Inter. When changing fonts after initialization, load the new face first and increment `themeRevision` to reread the host style.

`ChartFrame` remains a presentation shell with required `title`, optional `description`, and projected content. All APIs remain provisional through cross-family and release acceptance; bar technical feasibility passes, while the human quality review remains deferred. Preserve the packaged upstream notice in `third-party/`.

Build with `npm run build:lib` from the workspace root. See the root README and `docs/IMPLEMENTATION_PLAN.md` for the implementation sequence and validation commands.

`ɵ`-prefixed core exports support implementation across entry points and are not stable consumer APIs. Focused `/bar` excludes line rendering, focused `/line` excludes bar rendering, and core excludes engine runtime modules.

`/area` owns its component, independent fills/stacks, and lazy Line/Grid/Tooltip/Canvas registration. It shares pure curve policy with line through core, excludes Bar/SVG and other component entries, and follows the unchanged 200,000 gzip / 175,000 Brotli family budget. The root compatibility entry reexports all three Cartesian components and PieChart.

Pie and donut: import `PieChart` and `ChartMeasure<T>` from `@ng-echarts/chart-library/pie`. Supply one measure; use `[innerRadius]="0.6"` for a donut. Category legend changes emit row IDs. See the [pie/donut API](https://github.com/phalla-doll/ng-echarts/blob/main/docs/PIE_CHART_API.md) and [NG13 evidence](https://github.com/phalla-doll/ng-echarts/blob/main/docs/experiments/NG13_PIE_CHART.md).
