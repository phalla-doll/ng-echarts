# ng-echarts product specification

Status: implementation baseline; all four selected chart families are present and automated cross-family evidence is reconciled. Human interpretation and release acceptance remain pending. Updated 14 November 2026. See the [current evidence index](ACCEPTANCE_MATRIX.md#implemented-family-evidence).

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

The demo's `/chart-possibilities` route presents twelve interactive design proposals using the approved [standalone gallery](experiments/chart-style-gallery.html). The existing site owns navigation and theme selection. Calendar heatmap, waterfall, scatter/bubble, bullet, dumbbell, Sankey, treemap, radial progress, radar, KPI sparklines, 100% stacked bars and ranked lollipop examples use illustrative data. This preview does not add public Angular chart APIs or establish family acceptance. See the [integration record](experiments/CHART_POSSIBILITIES.md).

Composed charts, radar, radial charts, Sankey, calendar heatmaps, advanced patterns, glow effects, custom tooltip templates, and additional animation variants follow after the shared architecture is stable. Each receives a separate parity checklist before implementation.

The user authorized NG17 development after the verified private candidate. Its first increment is vertical, unstacked bars plus straight/smooth lines on shared category/linear axes, with comparable units, stable series IDs, optional line points and the existing shared controls/events/states. The [composed API](COMPOSED_CHART_API.md) owns the exact contract; [NG17 evidence](experiments/NG17_COMPOSED_CHART.md) records implementation checks. Dual axes, horizontal/stacked/area composition and advanced tooltips remain subsequent work. The original four-family MVP and deferred human gates retain their scope.

The user subsequently prioritized NG20 linked charts. The first [application-owned overview/detail integration](LINKED_CHARTS.md) selects one month from a visits overview and updates device share, with plot clicks, equivalent keyboard table actions and a native selector/reset. Stable IDs retain current selection through immutable updates and reordering; removing a selected month clears the filter. Legends remain local to each chart. The follow-up controlled bar `selectedRowId` input reflects the chosen category with its full series colors, a quiet band and a current-row table label; the application still owns selection and reset. The next [native month-range increment](experiments/NG20_MONTH_RANGE.md) adds inclusive From/To fields and controlled `selectedRowIds` feedback. Ranges follow supplied order, preserve endpoint IDs through reordering and clear if either endpoint disappears. Crossing a bound moves its counterpart to the same month; source plot/table actions return to one month. The following [graphical-range increment](experiments/GRAPHICAL_RANGE_SELECTION.md) adds an explicit pointer mode with inclusive snapped preview, release-only commit, cancellation and native keyboard equivalence. The user-authorized [rc.13 preview follow-up](experiments/NG20_MONTH_PREVIEWS.md) adds opt-in transient pointer/table-focus month context without changing committed filters. Shared zoom, bidirectional hover, disjoint and two-way selection remain later work.

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
| F01 | Accept immutable, typed row arrays and Cartesian series or one pie measure | An external consumer builds with strict TypeScript and strict templates; invalid numeric keys fail type checks; runtime data and identifiers are validated |
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
- Cartesian charts permit negative values. Pie and donut reject negative values and non-finite totals; an all-zero or all-missing dataset produces an empty state. Missing pie observations have no slice. Hiding all positive slices preserves ready-state recovery controls without drawing equal-size placeholder slices.
- Preserve supplied category order unless the consumer explicitly transforms the data.
- An empty row list or a dataset with no plottable measures produces the empty state. An all-zero Cartesian series is valid data. A chart with all legend items hidden stays ready so its controls can restore visibility.
- Support duplicate display labels through separate stable identifiers. Preserve legend visibility by identifier across updates; new entries start visible and removed entries are discarded. Point activation emits an event without adding persistent point-selection state in MVP.
- Treat rows, series, and configuration as immutable inputs; changes require a new reference. Batch multiple input changes into one rendering update.
- Default to the explicit locale `en-US`; consumers may supply a locale, immutable `Intl.NumberFormatOptions`, or a pure synchronous value formatter returning text. Custom numeric text applies consistently to axes, tooltips, table cells, and action labels; callbacks must handle generated axis ticks as well as supplied observations. Missing values bypass numeric formatting, and events retain raw numbers. Use the same locale, configuration, formatter, and input data on server and client. Tooltip text is escaped before entering any HTML formatter.
- An optional pure, synchronous category-tick formatter may shorten axis labels. Preserve full category text in tooltips, tables, and action labels, and keep stable row identities independent of formatted text.

Pie/donut uses `ChartMeasure<T>` with one stable measure ID, numeric key, and label. `innerRadius` is a ratio of outer radius from 0 to 0.9 (`0` pie, `0.6` donut). Optional outside category labels reserve plot space and may truncate or suppress overlaps; full labels remain in native controls. `CategoryVisibilityChange` emits `{ rowId, visible }`, while Cartesian `LegendVisibilityChange` emits `{ seriesId, visible }`. A pie `PointSelection<T>.seriesId` carries the measure ID. Zero and hidden supplied values retain table actions in a ready dataset; missing values have no action. Native pie legends show raw values and locale-formatted percentages of the visible total. Optional `showTotal` (default false) displays the formatted visible sum in a donut with `innerRadius >= 0.4`. See the [pie/donut API](PIE_CHART_API.md).

## State and interaction behavior

Apply state precedence in this order: supplied application error, loading, validation or renderer error, empty, ready. Loading hides previous plot data and its point actions. Loading, empty and error messages retain the allocated plot area; unavailable native controls preserve their layout space while remaining inert and hidden from assistive technology. Error states show an accessible message without exposing internal exception details. Empty states keep the title and message visible; ready states expose the legend and table controls. Recovering from any state must render the latest valid inputs without remounting the Angular component.

The table is collapsed by default behind a labeled button. When expanded, it exposes every supplied row and numeric value, including explicit missing-value text, and a keyboard-operable action for each plottable point. Table point actions and plot activation emit the same event with an interaction source. A Cartesian legend toggles series; a pie/donut legend toggles category rows. Legend changes preserve focus and do not remove rows from the accessible table.

`showDataTable` defaults to `true`; setting it to `false` omits both the toggle and table. Gallery previews and their copied examples use this option at the user's request, with datasets available in each Code tab. The playground and validation fixtures retain table controls. Source code inspection does not provide the equivalent keyboard point actions of the table; applications needing those actions should retain the default or provide an equivalent interface.

Title, summary, table controls, and identifiers must be deterministic between server output and the initial client render. The renderer owns only its dedicated plot surface. SSR support means hydrating the surrounding Angular UI and starting the plot safely in the browser, rather than rendering the plot on the server.

## Visual design

Provide theme-aware syntax colors for TypeScript, Angular templates, and terminal examples. Copy actions must retain the original plain source and keep their icon and label aligned on one line. See the [code presentation review](experiments/CODE_PRESENTATION_REVIEW.md).

Use shared page widths, responsive gutters, title scales, panel radii, and control spacing across gallery, documentation, and engineering pages. Follow the [spacing review](experiments/UI_SPACING_REVIEW.md) for current dimensions and breakpoint behavior; keep measurement plots isolated.

Use Heroicons 24 px outline icons for demo navigation and controls, keeping visible text or accessible labels on actions.

Use the locally hosted Inter font for site prose, navigation, controls, metrics, and chart labels. Define whole-number CSS pixel font sizes, line heights, and tracking for the site, keeping normal browser zoom and text antialiasing. Code examples and inline code use locally hosted Google Sans Code with monospace fallbacks; historical measurement plots retain their explicit reference typography.

The user's 12 November 2026 [area-block reference review](experiments/AREA_BLOCKS_VISUAL_AUDIT.md) establishes a neutral chart-block gallery as the site direction: reference-led typography, subdued chrome, compact code/preview headers, and complete chart compositions. Keep engineering settings and validation fixtures separate from the gallery. The user selected existing bar charts for the first [gallery correction](experiments/BAR_GALLERY_VISUAL_REVIEW.md). The settings workspace remains an engineering fixture. Area examples are implemented following NG12; advanced dotted-fill behavior remains outside the MVP.

The same neutral style now applies to setup documentation, the component catalog, and engineering pages through the [site alignment](experiments/SITE_THEME_ALIGNMENT.md). Keep theme selection consistent across navigation, distinguish working components from planned ones, and preserve explicit conditions for measurement fixtures. Setup guidance must use the actual local package workflow until registry publication exists.

The [four-family visual audit](experiments/VISUAL_AUDIT.md) records the current gallery review against live Apache ECharts and EvilCharts references, with mobile axis/code/control refinements and both-theme evidence. Dated live observations complement the pinned-fixture comparisons below.

Comparison pages must share the ordinary site navigation, gutters, typography and theme. Keep historical measurement conditions in explicit `?reference=1` views, as recorded in the [comparison alignment](experiments/COMPARISON_PAGE_ALIGNMENT.md).

Capture reference images for the agreed upstream examples at the pinned revision. Match typography, spacing, axis treatments, color use, fills, tooltip hierarchy, and legend behavior. Compare the same fixture data at 320, 768, and 1440 px host widths in both themes.

Require a reviewed visual baseline for each MVP chart. Canvas and SVG rasterization can differ, so evaluate measured differences and visible defects rather than promising pixel identity. Document intentional changes for readability or accessibility.

## Quality and performance targets

These engineering targets apply to the full MVP. [R07](experiments/R07_RENDERER_COST.md) records the original bar results; [NG11](experiments/NG11_LINE_CHART.md), [NG12](experiments/NG12_AREA_CHART.md), and [NG13](experiments/NG13_PIE_CHART.md) add family-specific measurements. The [NG14 review](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) reconciles the automated criteria, including 100-cycle lifecycle repetitions and actual Angular interaction/resize profiles across the four families. Human F09 interpretation remains pending; passing automated checks does not close that evidence.

- Normal Cartesian fixture: 200 categories and three series; stress fixture: 2,000 categories and three series. Pie/donut fixtures use 12 and 100 categories respectively. These are benchmark inputs, not promised data limits.
- On a recorded reference machine using a production build, each normal fixture's warm mount and input update should complete within 200 ms at p95 over 30 measured runs after one warm-up. Disable animation, preload modules, use a visible 768 px host, and keep the table collapsed. Start before validation and option building; end when the render triggered by that operation finishes. Use the 29th sorted sample as p95. Record the completion signal and raw timings in R07.
- Report cold module loading and expanded-table cost separately. Excluding them from the warm rendering target must not hide them from the benchmark report.
- Record interaction, resizing, and stress-fixture performance separately. Identify the supported data envelope from measurements before release.
- Repeatedly mount and destroy 100 charts without orphaned instances, observers, event listeners, tooltips, or animation callbacks.
- Report compressed production bundle sizes including all emitted lazy renderer chunks, excluding Angular/RxJS peers. Recorded gzip/Brotli caps in bytes are 200,000/175,000 per focused family, 10,000/9,000 for core, 219,500/187,500 for the combined root, and 203,000/175,000 for root-frame. The root gzip cap changed from 200,000 after adding the Pie engine; [NG13](experiments/NG13_PIE_CHART.md#performance-and-packaging) records the rationale and successful rerun. NG20 controlled row feedback adds 573 measured Brotli bytes to a root baseline with 166 bytes of headroom, so its combined-root Brotli cap advances from 175,000 to 176,000; [selection evidence](experiments/LINKED_SELECTION_FEEDBACK.md) records the change and rerun. The rc.4 graphical range adapter adds a bounded measured cost to the nearly-full combined root; its allowance advances to 212,000 gzip / 178,000 Brotli bytes, as recorded in the [graphical-range review](experiments/GRAPHICAL_RANGE_SELECTION.md). The later lazy-loading and presentation increments record aggregate compression costs and current root/root-frame allowances in the [Sankey report](experiments/NG19_SANKEY_CHART.md#lazy-engine-loading-correction) and [presentation report](experiments/PREMIUM_CHART_REFINEMENT.md#package-cost). The [rc.13 preview record](experiments/NG20_MONTH_PREVIEWS.md#package-cost) records the subsequent bounded preview cost. Focused-family and core caps remain unchanged. Keep unrelated chart engines out of focused entries and engine runtime out of core.
- Exercise Chromium, Firefox, and WebKit integration paths; align the published browser policy with Angular 22's documented baseline.

## Delivery and acceptance

The MVP is ready when all four chart families meet their requirements, visual references are reviewed, accessibility scenarios pass, and a packaged build installs into a fresh Angular 22 consumer. The consumer must pass client rendering, SSR and hydration, data updates, theme changes, resizing, and navigation cleanup.

Deliver installation instructions, typed examples, an API reference, data limits, accessibility guidance, attribution, and a compatibility table containing exact tested versions. Describe any unported upstream features explicitly.

Use the [acceptance matrix](ACCEPTANCE_MATRIX.md) to track F01 through F10, visual parity, and quality targets. Every required check must pass against its current criterion. A revised target needs a recorded rationale, an aligned specification, and a successful rerun before its gate can pass.

The local project name is fixed by the user. Original library code is MIT licensed under the user’s 13 November 2026 decision; upstream/dependency notices remain separate. Public package naming and registry publication remain future decisions. The current work produces an experimental private `0.1.0-rc.4` candidate and playground; the [release checklist](RELEASE_CHECKLIST.md) records final-artifact checks and open human acceptance.


## NG18 radar first increment

The user-approved [radar increment](experiments/NG18_RADAR_CHART.md) adds the focused `/radar` Angular entry and a site-aligned demo with explicit dimension maxima, stable comparisons, missing-data policy, native scale/value table and vertex/table actions. The [API](RADAR_CHART_API.md) defines the bounded contract. Radial progress remains subsequent work. The compatibility root and four-family MVP retain their scope; private rc.5 is separate from the preserved rc.4 artifact. Human F09/R06/G2/G3/G4 and public publication remain pending.


## NG18 radial progress increment

The user-approved [radial progress increment](experiments/NG18_RADIAL_PROGRESS.md) adds the focused `/radial` Angular entry and two demo examples. Required scalar value and explicit positive maximum supply native progress semantics, visible formatted values and a noninteractive ring. The [API](RADIAL_PROGRESS_API.md) defines zero/null/invalid states, formatting, motion and SSR behavior. This advances the private candidate to rc.6 while preserving rc.5 and earlier artifacts and the existing compatibility root. Native progress provides the scalar alternative; legends, point actions and a data table are inapplicable. Human interpretation and public release gates remain pending.

## Experimental calendar heatmaps

User-authorized NG19 continuation adds a bounded single-year calendar heatmap outside the four-family MVP. Strict date-only observations, an explicit maximum, zero/missing separation and native daily-value actions follow the [calendar API](CALENDAR_HEATMAP_API.md). Arbitrary date windows and human release acceptance remain pending; the following increment records Sankey.


## NG19 Sankey first increment

The next NG19 increment adds a focused experimental `/sankey` entry and visitor-flow demo, with typed node/link IDs, directed acyclic validation, separate incoming/outgoing totals, native table actions and lazy Canvas rendering. The [API](SANKEY_CHART_API.md) defines the bounded 24-node/60-link contract; the [implementation record](experiments/NG19_SANKEY_CHART.md) records verification and scope. Private rc.10 preserves rc.9, rc.8 and earlier artifacts. Circular/vertical/drag variants, broader linked interactions and human F09/R06/G2/G3/G4 acceptance remain pending.

## Presentation refinement after rc.10

The user-authorized [chart presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md) improves all implemented families without expanding chart-family scope: stable state geometry, simpler native legends, consistent escaped tooltip rows, visible gradient bases and area bands, redundant line cues, quantitative donut context, radar scales, calendar interval labels, Sankey stage colors/totals and responsive linked panels. Calendar/Sankey `valueLabel` names the measure in tooltips. Archived candidates and human release gates retain their original status.
