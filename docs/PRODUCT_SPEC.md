# ng-echarts product specification

Status: proposed baseline for implementation. Updated 12 November 2026.

## Purpose and users

Enable Angular teams to build charts with the visual quality of selected EvilCharts examples through native Angular components. Developers should provide typed data and a small configuration, then customize appearance without introducing a React runtime.

The primary users are developers building Angular 22 dashboards and product interfaces. End users need readable values, useful comparisons, clear interaction states, and an accessible alternative to the plotted data.

## Product outcome

A reusable Angular library, an example application, and integration documentation. The MVP covers a deliberately selected subset of upstream behavior; it does not promise compatibility with the React component API or every upstream visual variant.

### MVP chart collection

| Chart | Required behavior |
| --- | --- |
| Bar | Grouped and stacked series; vertical and horizontal layouts; rounded bars; solid and gradient fills |
| Line | Multiple series, optional points, gaps for missing values, and straight or smooth interpolation |
| Area | Multiple series, filled gradients, and stacked areas |
| Pie and donut | One numeric measure across categories, labels, category legend selection, and configurable inner radius |

Shared features include tooltips, legends, theme tokens, loading and empty states, explicit error state, resizing, typed selection events, and motion preferences. The bar chart is the feasibility prototype, not the entire MVP.

### Subsequent scope

Composed charts, radar, radial charts, Sankey, calendar heatmaps, range brushing, advanced patterns, glow effects, custom tooltip templates, and additional animation variants follow after the shared architecture is stable. Each receives a separate parity checklist before implementation.

### Excluded from the MVP

- React embedding, Recharts integration, and automatic conversion of JSX.
- Rebuilding the entire EvilCharts website or its component registry CLI.
- Backend data fetching, authentication, dashboards as a service, and data persistence.
- Support promises for Angular majors other than 22.
- Server-generated chart images, full chart rendering on the server, and image export.
- Raw ECharts option overrides, automatic observation of arbitrary application CSS changes, and custom tooltip templates.
- Streaming APIs, time or logarithmic axes, and direct keyboard navigation within the painted plot. MVP Cartesian charts use category and linear value axes; values and point actions remain available through the data table.

## Functional requirements

| ID | Requirement | Acceptance |
| --- | --- | --- |
| F01 | Accept immutable, typed row arrays and series definitions | An external consumer builds with strict TypeScript and strict templates; invalid numeric keys fail type checks; runtime data and identifiers are validated |
| F02 | Update when inputs change | New rows, removed series, labels, and theme changes appear without stale graphics or duplicate chart instances |
| F03 | Format values consistently | Values use the same locale and formatter in axes, tooltips, and tables; legend labels match series or category labels; zero remains valid |
| F04 | Provide responsive layout | Resize within a dashboard card; recover when a hidden container becomes visible; no clipped required controls at 320 px host width |
| F05 | Provide tooltips and selection | Plot activation and keyboard-operated data-table actions emit the same typed point selection; legend controls emit visibility changes; both use stable identifiers |
| F06 | Support light and dark themes | CSS tokens control background, foreground, grid, series, and focus styles; explicit theme or theme-revision input changes refresh mounted charts |
| F07 | Distinguish application states | Loading, empty, error, and ready states have separate accessible messages and predictable plot visibility |
| F08 | Respect motion settings | Reduced-motion preference disables decorative and looping chart animation; consumers can disable animation explicitly |
| F09 | Support accessible interpretation | A chart title, concise summary, toggleable data table, and keyboard-operable legend expose values and point actions without hover, with visible focus and no color-only meaning |
| F10 | Work inside an SSR application | Server output contains a stable fallback; hydration produces one browser chart without browser-global errors or mismatch warnings |

## Data behavior

- Cartesian rows have a stable string identifier, a string category label, and one or more numeric measures. Pie/donut rows have a stable string identifier, a string category label, and one numeric measure. Row identifiers must be unique within a chart; Cartesian series identifiers must also be unique.
- Null or missing numeric values represent gaps or absent observations, never implicit zero. Lines and areas do not connect across gaps. In a stack, a missing observation contributes no segment and remains marked as missing in the table. Non-finite and nonnumeric supplied values produce a validation error.
- Cartesian charts permit negative values. Pie and donut reject negative values; an all-zero total produces an empty state.
- Preserve supplied category order unless the consumer explicitly transforms the data.
- An empty row list or a dataset with no plottable measures produces the empty state. An all-zero Cartesian series is valid data. A chart with all legend items hidden stays ready so its controls can restore visibility.
- Support duplicate display labels through separate stable identifiers. Preserve legend visibility by identifier across updates; new entries start visible and removed entries are discarded. Point activation emits an event without adding persistent point-selection state in MVP.
- Treat rows, series, and configuration as immutable inputs; changes require a new reference. Batch multiple input changes into one rendering update.
- Default to the explicit locale `en-US`; consumers may supply a locale, immutable `Intl.NumberFormatOptions`, or a pure synchronous value formatter returning text. Custom numeric text applies consistently to axes, tooltips, table cells, and action labels; callbacks must handle generated axis ticks as well as supplied observations. Missing values bypass numeric formatting, and events retain raw numbers. Use the same locale, configuration, formatter, and input data on server and client. Tooltip text is escaped before entering any HTML formatter.
- An optional pure, synchronous category-tick formatter may shorten axis labels. Preserve full category text in tooltips, tables, and action labels, and keep stable row identities independent of formatted text.

## State and interaction behavior

Apply state precedence in this order: supplied application error, loading, validation or renderer error, empty, ready. Loading hides previous plot data and its point actions. Error states show an accessible message without exposing internal exception details. Empty states keep the title and message visible; ready states expose the legend and table controls. Recovering from any state must render the latest valid inputs without remounting the Angular component.

The table is collapsed by default behind a labeled button. When expanded, it exposes every supplied row and numeric value, including explicit missing-value text, and a keyboard-operable action for each plottable point. Table point actions and plot activation emit the same event with an interaction source. A Cartesian legend toggles series; a pie/donut legend toggles category rows. Legend changes preserve focus and do not remove rows from the accessible table.

Title, summary, table controls, and identifiers must be deterministic between server output and the initial client render. The renderer owns only its dedicated plot surface. SSR support means hydrating the surrounding Angular UI and starting the plot safely in the browser, rather than rendering the plot on the server.

## Visual design

The user's 12 November 2026 [area-block reference review](experiments/AREA_BLOCKS_VISUAL_AUDIT.md) establishes a neutral chart-block gallery as the site direction: reference-led typography, subdued chrome, compact code/preview headers, and complete chart compositions. Keep engineering settings and validation fixtures separate from the gallery. The earlier blue-accented workspace layout is not the visual acceptance target. The area examples and advanced dotted-fill behavior identified in the audit need an explicit implementation-scope decision; this direction does not claim they already exist.

Capture reference images for the agreed upstream examples at the pinned revision. Match typography, spacing, axis treatments, color use, fills, tooltip hierarchy, and legend behavior. Compare the same fixture data at 320, 768, and 1440 px host widths in both themes.

Require a reviewed visual baseline for each MVP chart. Canvas and SVG rasterization can differ, so evaluate measured differences and visible defects rather than promising pixel identity. Document intentional changes for readability or accessibility.

## Quality and performance targets

These engineering targets apply to the full MVP. [R07](experiments/R07_RENDERER_COST.md) records measured bar-prototype results; other families and environments still need validation.

- Normal Cartesian fixture: 200 categories and three series; stress fixture: 2,000 categories and three series. Pie/donut fixtures use 12 and 100 categories respectively. These are benchmark inputs, not promised data limits.
- On a recorded reference machine using a production build, each normal fixture's warm mount and input update should complete within 200 ms at p95 over 30 measured runs after one warm-up. Disable animation, preload modules, use a visible 768 px host, and keep the table collapsed. Start before validation and option building; end when the render triggered by that operation finishes. Use the 29th sorted sample as p95. Record the completion signal and raw timings in R07.
- Report cold module loading and expanded-table cost separately. Excluding them from the warm rendering target must not hide them from the benchmark report.
- Record interaction, resizing, and stress-fixture performance separately. Identify the supported data envelope from measurements before release.
- Repeatedly mount and destroy 100 charts without orphaned instances, observers, event listeners, tooltips, or animation callbacks.
- Report compressed production bundle sizes for the adapter, required renderer, and each chart entry point. Establish the numeric size budget after the prototype rather than inventing one now.
- Exercise Chromium, Firefox, and WebKit integration paths; align the published browser policy with Angular 22's documented baseline.

## Delivery and acceptance

The MVP is ready when all four chart families meet their requirements, visual references are reviewed, accessibility scenarios pass, and a packaged build installs into a fresh Angular 22 consumer. The consumer must pass client rendering, SSR and hydration, data updates, theme changes, resizing, and navigation cleanup.

Deliver installation instructions, typed examples, an API reference, data limits, accessibility guidance, attribution, and a compatibility table containing exact tested versions. Describe any unported upstream features explicitly.

Use the [acceptance matrix](ACCEPTANCE_MATRIX.md) to track F01 through F10, visual parity, and quality targets. Every required check must pass against its current criterion. A revised target needs a recorded rationale, an aligned specification, and a successful rerun before its gate can pass.

The local project name is fixed by the user. Public package naming, distribution licensing, and registry publication remain future release decisions; the current work produces an experimental local library and playground.
