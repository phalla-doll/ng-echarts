# Chart library

Experimental Angular 22 library. The local package identity is `@ng-echarts/chart-library`; it is private and is not a selected public npm name.

`BarChart<T>` is an experimental native Angular bar component. ECharts `^6.1.0` is a required peer; 6.1.0 is tested. Inputs include `title`, `description`, readonly `data` and `series`, string identity/category keys, `height`, `layout`, `stacked`, `gradient`, `theme`, `themeRevision`, `locale`, `loading`, `error`, and `animation`. `pointSelect` and `legendChange` emit stable identifiers. Replace input references when data changes.

`ChartSeries<T>` restricts measure keys to numeric/nullish numeric fields. `PointSelection<T>` includes the original row, numeric value, row/series IDs, and `plot` or `table` source. Locale defaults to `en-US`; custom value formatters remain pending. Null/missing values stay missing. The table is initially collapsed, and legend filtering preserves its full dataset.

Use `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and `--nec-series-1` onward for CSS tokens. Change `theme` or increment `themeRevision` to request new color reads. Reduced motion overrides decorative animation. The renderer initializes only in the browser.

`ChartFrame` remains a presentation shell with required `title`, optional `description`, and projected content. All APIs remain provisional until the bar feasibility experiments pass. Preserve the packaged upstream notice in `third-party/`.

Build with `npm run build:lib` from the workspace root. See the root README and `docs/IMPLEMENTATION_PLAN.md` for the implementation sequence and validation commands.
