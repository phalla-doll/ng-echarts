# R03 bar visual comparison

Status: category-tick and neutral-theme alignment implemented; variant and tooltip styling review remains pending. Recorded 12 November 2026. Chart: grouped vertical bar. Tasks: NG02, NG04. Requirements: F03, F04, F06, F09. Gate: G2.

## Reference and method

The isolated [reference harness](../../tools/reference/README.md) builds the unmodified pinned `ex-echarts-bar-chart` React example and its real imported bar/UI modules at revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. It extracts the source's light/dark theme tokens and generates Tailwind utilities. It uses a system font, rather than the full upstream website's Next.js font integration. React is confined to the reference tool's development dependencies.

Both implementations use the original twelve-month Desktop/Mobile values and their green/rose colors. Chromium 158.0.8127.18 captured each at DPR 1, reduced motion, a 1000 px viewport height, and a viewport 40 px wider than the specified **host**. The reference host is 360 px high including its brush/legend; Angular reserves 360 px for the plot and adds its title and controls. This geometry difference is recorded, not hidden through image scaling.

The [capture manifest](captures/bar-reference/manifest.json) records exact host/canvas rectangles, fonts, browser, and SHA-256 hashes of the primary example, bar module, and upstream theme CSS. All twelve captures were inspected.

| Host width | Light reference / Angular | Dark reference / Angular |
| --- | --- | --- |
| 320 px | [Upstream](captures/bar-reference/upstream-light-320.png) / [Angular](captures/bar-reference/angular-light-320.png) | [Upstream](captures/bar-reference/upstream-dark-320.png) / [Angular](captures/bar-reference/angular-dark-320.png) |
| 768 px | [Upstream](captures/bar-reference/upstream-light-768.png) / [Angular](captures/bar-reference/angular-light-768.png) | [Upstream](captures/bar-reference/upstream-dark-768.png) / [Angular](captures/bar-reference/angular-dark-768.png) |
| 1440 px | [Upstream](captures/bar-reference/upstream-light-1440.png) / [Angular](captures/bar-reference/angular-light-1440.png) | [Upstream](captures/bar-reference/upstream-dark-1440.png) / [Angular](captures/bar-reference/angular-dark-1440.png) |

## Initial findings and disposition

This table describes the original `bar-reference/` baseline. The follow-up below records the implemented changes.

| Concern | Observed result | Next action |
| --- | --- | --- |
| Values, order, and series palette | Twelve groups preserve their relative values/order and the selected light/dark colors | Retain fixture and behavioral tests |
| Narrow controls | At 320 px, the title/description wrap and the legend buttons stack without clipping | Retain wrapping and visible button labels |
| Brush | Present upstream and absent in Angular | Intentional MVP exclusion; do not add it to satisfy visual similarity |
| Legend and table | Upstream overlays a small legend above the plot; Angular supplies buttons below it and a table control | Intentional accessible UI difference; retain keyboard operation and visible state |
| Axis labels | Upstream abbreviates months and uses smaller labels; Angular uses full names, reducing visible tick density at 320/768 px | Prototype a pure category-tick formatter while retaining full table/tooltip labels; verify its typed input and error behavior |
| Plot spacing and axes | Angular's title/card padding, explicit value labels, grid treatment, and plot height differ | Normalize a comparison theme and review spacing/axis defaults after the formatter work; retain useful value interpretation |
| Default surface colors | Upstream uses neutral surfaces; the playground uses its blue-gray theme tokens | Add a documented token-mapping comparison fixture; do not present current default-theme captures as identical styling |
| Tooltip and other variants | Captures show the default grouped view with no hover | Add tooltip captures and stacked/horizontal/gradient references before final visual acceptance |

## Follow-up: category ticks and neutral tokens

The `/comparison` route uses the same monthly values, three-character category ticks, and four pinned upstream neutral tokens. The [provenance ledger](../UPSTREAM_PROVENANCE.md) records the source and mapping: `background → --nec-background`, `foreground → --nec-text`, `muted-foreground → --nec-muted`, and `border → --nec-border`. Library defaults and the default playground palette remain unchanged. The ordinary playground also uses the new category-tick formatter.

The [follow-up manifest](captures/bar-alignment/manifest.json) records the source hashes, comparison stylesheet hash, CSS token values, host/canvas rectangles, fonts, browser, and DPR. Conditions match the initial method; captures are not scaled. All sixteen follow-up images were inspected.

| Host width | Light reference / Angular neutral | Dark reference / Angular neutral |
| --- | --- | --- |
| 320 px | [Upstream](captures/bar-alignment/upstream-light-320.png) / [Angular](captures/bar-alignment/angular-light-320.png) | [Upstream](captures/bar-alignment/upstream-dark-320.png) / [Angular](captures/bar-alignment/angular-dark-320.png) |
| 768 px | [Upstream](captures/bar-alignment/upstream-light-768.png) / [Angular](captures/bar-alignment/angular-light-768.png) | [Upstream](captures/bar-alignment/upstream-dark-768.png) / [Angular](captures/bar-alignment/angular-dark-768.png) |
| 1440 px | [Upstream](captures/bar-alignment/upstream-light-1440.png) / [Angular](captures/bar-alignment/angular-light-1440.png) | [Upstream](captures/bar-alignment/upstream-dark-1440.png) / [Angular](captures/bar-alignment/angular-dark-1440.png) |
| January tooltip, 768 px | [Upstream](captures/bar-alignment/upstream-light-768-tooltip.png) / [Angular](captures/bar-alignment/angular-light-768-tooltip.png) | [Upstream](captures/bar-alignment/upstream-dark-768-tooltip.png) / [Angular](captures/bar-alignment/angular-dark-768-tooltip.png) |

### Decisions and remaining differences

- Category ticks now abbreviate months through an optional pure, synchronous `categoryTickFormatter(category, index): string`. Without it, the library preserves full ticks. Both layouts use precomputed labels; row identities, tooltip titles, table headings, and action labels retain full values. Empty tick text is allowed; exceptions/nontext results yield a generic recoverable configuration error.
- At 320 px, both examples show alternate abbreviated months; Angular now shows all twelve at 768 and 1440 px. Native legend/table controls wrap without horizontal overflow in both themes.
- Keep Angular's 12 px tick text, visible numeric value axis, and card title/summary for interpretation. The primary upstream example uses 10 px category text and no value labels. Keep native legend/table buttons below the plot and omit the out-of-scope brush. These decisions intentionally preserve a taller card and different plot proportions.
- Keep plot insets at left 12, right 16, top 12, bottom 8 px, independently of title/controls. Replace deprecated `containLabel` with ECharts 6 `outerBoundsMode: 'same'` and `outerBoundsContain: 'axisLabel'`. The current captures verify containment rather than copying the upstream legend/brush bands.
- Neutral surfaces and foreground/muted/border tokens now match the pinned source in the comparison fixture. This is an opt-in consumer theme, not a change to library defaults. Grid opacity, bar width/spacing, and canvas typography still differ and need comparison across the remaining variants before the baseline is accepted.
- Tooltip values and full category title agree. Angular still uses simple label/value lines without the upstream color markers and aligned numeric column; placement, padding, font size, and shadow differ. Refine the default hierarchy and review narrow-host containment. These tooltip screenshots do not close visual acceptance.

The complete local `npm run check` passed with 31 unit/integration tests and 36 browser scenarios. New tests inspect actual Canvas tick text, verify full tooltip/table labels, recover from a throwing formatter, and check controls/plot containment at every review width/theme in Chromium, Firefox, and WebKit. Pure tests cover original row indices, duplicate/empty tick labels, both layouts, and invalid runtime callback results. An isolated packed Angular consumer accepts the typed callback and rejects a numeric-returning callback.

## Template review

The component derives state, options, legend items, and table rows in TypeScript. The table's formatting is deferred until expansion. Templates use simple guards, named actions, and stable `@for` identifiers. DOM reads, CSS color resolution, renderer imports, and instance calls stay in browser modules. No computed builder initializes or mutates the renderer.

## Reproduction and status

Run `npm run reference:prepare`, `npm run build`, and `npm run capture:bar`. The pinned source and tool lockfile make the reference reproducible; screenshots still depend on recorded fonts and browser versions.

R03 remains pending for stacked/horizontal/gradient comparisons and the remaining tooltip/spacing review. Category ticks, theme mapping, and the documented plot/axis decisions complete this alignment increment. These screenshots establish comparison evidence, not pixel equivalence or a passed G2. The product specification's visual criteria and performance targets remain unchanged.
