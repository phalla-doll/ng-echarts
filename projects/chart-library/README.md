# Chart library

Experimental Angular 22 library. The local package identity is `@ng-echarts/chart-library`; it is private and is not a selected public npm name.

`BarChart<T>` is an experimental native Angular bar component. ECharts `^6.1.0` is a required peer; 6.1.0 is tested. Inputs include `title`, `description`, readonly `data` and `series`, string identity/category keys, `height`, `layout`, `stacked`, `gradient`, `theme`, `themeRevision`, `locale`, `numberFormatOptions`, `valueFormatter`, `categoryTickFormatter`, `showDataTable`, `loading`, `error`, and `animation`. `pointSelect` and `legendChange` emit stable identifiers. Replace input references when data changes.

`ChartSeries<T>` restricts measure keys to numeric/nullish numeric fields. `PointSelection<T>` includes the original row, numeric value, row/series IDs, and `plot` or `table` source. Null/missing values stay missing. The table is initially collapsed, and legend filtering preserves its full dataset. Set `[showDataTable]="false"` to omit both its toggle and contents, as the gallery does; the default is `true`. Keep it enabled or provide equivalent controls when users need keyboard point selection. Reenabling preserves the previous expansion state.

## Numeric formatting

Locale defaults to the explicit `en-US`. Bind immutable `Intl.NumberFormatOptions` for currency, percent, precision, or units, for example `readonly money: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }` and `[numberFormatOptions]="money"`.

For custom text, bind a pure, synchronous `ValueFormatter = (value: number) => string` through `[valueFormatter]="formatValue"`. It overrides the generated numeric text everywhere: value-axis ticks, tooltip values, table cells, and action labels. It must handle any finite axis tick, including values absent from the dataset. Keep the locale, options, formatter, and data deterministic on server and client. Locale/options are validated even when a custom callback is supplied.

Known observation labels are cached for custom formatters; missing values never reach the callback and remain `Missing`. Zero and negative values stay numeric, and selection events retain the original number. Callback output is plain text and escaped in HTML tooltips. Invalid options or observation callbacks show a generic configuration error; failures on generated axis ticks are contained by the renderer and recover when valid inputs replace them.

`categoryTickFormatter` changes only category-axis text. Full categories remain in tooltips, table headings, and point-action labels.

Use `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and `--nec-series-1` onward for CSS tokens. Change `theme` or increment `themeRevision` to request new color reads. Reduced motion overrides decorative animation. The renderer initializes only in the browser.

Chart axes and tooltips inherit the host element's CSS `font-family`. Initial browser rendering waits for that font to load; failed font requests use the normal fallback stack. The package does not bundle or require Inter. When changing fonts after initialization, load the new face first and increment `themeRevision` to reread the host style.

`ChartFrame` remains a presentation shell with required `title`, optional `description`, and projected content. All APIs remain provisional until the bar feasibility experiments pass. Preserve the packaged upstream notice in `third-party/`.

Build with `npm run build:lib` from the workspace root. See the root README and `docs/IMPLEMENTATION_PLAN.md` for the implementation sequence and validation commands.
