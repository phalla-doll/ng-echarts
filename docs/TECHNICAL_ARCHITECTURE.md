# ng-echarts technical architecture

Status: implemented experimental architecture for bar, line, area, and pie/donut. Automated cross-family evidence is reconciled in [NG14](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md); human interpretation and [release gates](RND_PLAN.md#decision-gates) remain open. Updated 13 November 2026.

## Architecture direction

Use standalone Angular components with strict templates, typed inputs and outputs, signals for local state, and OnPush change detection. Keep rendering behind a small adapter so deterministic data transformations can be tested separately from browser lifecycle behavior. The direct lazy Canvas adapter is selected by [R02](experiments/R02_ADAPTER.md), confirmed for bar by lifecycle, hydration, and packed-runtime evidence; NG11–NG13 record its implementation in the remaining families.

The library runtime must have no React, React DOM, Recharts, Next.js, or Motion for React dependency.

## Layers

| Layer | Responsibility |
| --- | --- |
| Public chart components | Input validation, chart states, accessible title and summary, and consumer events |
| Option builders | Transform typed rows, series, theme, and selection into ECharts options |
| Renderer adapter | Register required modules, initialize, update, resize, attach events, and dispose |
| Angular overlays | Keyboard-operable legend, state messages, and accessible data table |
| Theme utilities | Resolve CSS tokens and normalize series colors at the browser boundary |

Prefer object inputs to reproducing upstream JSX composition. Use the chart-specific behavior defined in the product specification. Raw ECharts overrides and template slots are deferred; if introduced later, specify merge precedence and protect lifecycle-owned fields before exposing them.

## Templates and derived state

Angular recommends straightforward template expressions and moving complex logic into TypeScript, typically `computed`; it gives no fixed complexity threshold ([S13](SOURCES.md#platform-sources)). Computed values are lazy and cached until their tracked dependencies change ([S14](SOURCES.md#platform-sources)). Reading a signal in a template is expected, not an expensive-method-call rule violation.

Apply that guidance to this project's boundaries:

| Concern | Implementation location |
| --- | --- |
| Error, loading, empty, and ready precedence | One derived `chartState` used by the template and renderer coordinator |
| Legend labels, identifiers, colors, and visibility | Derived `legendItems` built from normalized chart data and visibility state |
| Accessible values and point actions | Derived `tableRows`; defer formatting the full table until it is expanded |
| Stacks, gaps, gradients, and series options | Pure option-builder functions consumed through derived options |
| Browser dimensions and resolved CSS colors | Browser adapter publishes measured values; derivations consume them |

Templates should render these values, use simple guards, and call named actions. Do not encode state precedence or recalculate datasets in binding expressions. Keep formatting rules shared across plot and accessible UI rather than repeating formulas in cells.

For example, this bar-legend excerpt illustrates the boundary; the builder and component inputs are defined during implementation:

```ts
protected readonly legendItems = computed(() =>
  buildLegendItems(this.series(), this.hiddenSeriesIds())
);
```

```html
@for (item of legendItems(); track item.id) {
  <button
    type="button"
    [attr.aria-pressed]="item.visible"
    (click)="toggleSeriesVisibility(item.id)">
    {{ item.label }}
  </button>
}
```

Use `protected` for template-only members, `readonly` references for signal inputs/outputs and queries, action-oriented handler names, and direct class/style bindings where appropriate ([S13](SOURCES.md#platform-sources)). Keep renderer internals private and lifecycle callbacks short.

Computed builders must be deterministic: no DOM reads, signal writes, output emission, or ECharts initialization, `setOption`, resize, or disposal. Keep those operations in the browser adapter. Do not copy derivable values into writable state merely to synchronize them. Memoization does not make expensive rebuilds free; R07 must still measure invalidation cost, including expansion of the data table.

Review these boundaries in the bar prototype and preserve them as other chart families are added. There is no arbitrary template line limit or blanket ban on function calls.

## Current public contract

Use the exported types rather than copying their mapped-type definitions. The installed API remains experimental; the [bar](BAR_CHART_API.md), [line](LINE_CHART_API.md), [area](AREA_CHART_API.md), and [pie/donut](PIE_CHART_API.md) guides own exact inputs/defaults and each includes an integration example compiled against the packed artifact.

```ts
import type {
  ChartSeries, ChartMeasure, PointSelection,
  LegendVisibilityChange, CategoryVisibilityChange,
} from '@mantha911/ng-echarts/core';

interface RevenueRow {
  id: string;
  month: string;
  revenue: number | null;
  cost: number | null;
}
```

```html
<nec-bar-chart
  title="Monthly revenue and cost"
  description="Revenue and cost by month in US dollars"
  [data]="revenueRows()"
  categoryKey="month"
  rowIdKey="id"
  [series]="revenueSeries"
  [loading]="loading()"
  [height]="320"
  (pointSelect)="showDetails($event)"
/>
```

Shared inputs cover rows, category and identity keys, dimensions, explicit `light` or `dark` theme, numeric theme revision, locale and formatting, loading, error, and animation preference. The theme revision lets an application request another CSS-token read after changing its palette within the same theme. Automatic observation of application classes or CSS is outside MVP.

Cartesian charts accept multiple `ChartSeries<T>` definitions. Pie/donut accepts one numeric measure with a stable measure identifier; each row becomes a slice. Both emit `PointSelection<T>` with the measure or series identifier and row identifier. A separate legend output identifies either a Cartesian series or a pie category and its new visibility. Legend visibility is internal state retained by identifier; there is no controlled-selection API or persistent point-selection state in MVP.

Row identity and category keys must resolve to strings. Numeric keys must reject string, unknown, and exclusively nullish fields. Runtime validation still checks external data, unique identifiers, and finite values. Strict installed consumers verify generic inference and intentionally invalid templates across all four families. Preserve these checks before changing or freezing the API.

Implement the state precedence and table actions from [the product specification](PRODUCT_SPEC.md#state-and-interaction-behavior) in the shared component layer. Missing values use one shared presentation rule. Legend filtering affects the plot but preserves the full table, its stable focus targets, and missing-value indicators.

## Browser lifecycle

1. Render deterministic Angular markup with a reserved chart area and accessible fallback.
2. Initialize through an Angular render callback, such as `afterNextRender`, with a browser boundary and lazy renderer imports where needed. A render callback is not proof that an arbitrary subtree has completed hydration; verify the chosen timing and plot ownership in R05 ([S7, S11, and S12](SOURCES.md#platform-sources)).
3. Wait for a nonzero container size, then create one chart instance and apply the latest inputs.
4. Observe the host using `ResizeObserver`; coalesce resize work into animation frames and recover from initially hidden containers.
5. Batch changes and update options with explicit series identifiers and a tested merge strategy. Removal must remove old series, rather than leaving them visible.
6. Recompute resolved theme tokens on explicit theme or theme-revision input changes and publish the result to derived options. Automatic observation is deferred beyond MVP.
7. Translate renderer events into Angular outputs. Keep high-frequency work away from unnecessary Angular updates. Zoneless operation is required for MVP; a Zone.js compatibility check is exploratory and no support claim follows without evidence.
8. On destruction, remove handlers, observers, pending callbacks, and overlays, then dispose the chart. Guard asynchronous imports so they cannot initialize after destruction.

ECharts documents the need for dimensions, resizing, and disposal ([S10](SOURCES.md#platform-sources)); hidden containers, update races, and Angular navigation still require integration tests.

Only the dedicated plot surface may receive renderer-created nodes. Angular retains ownership of the title, status messages, legend, and table. Use deterministic per-instance IDs and explicit table markup. R05 must exercise multiple charts, a deferred chart, and reduced-motion/loading combinations that might delay application stability. Do not silently satisfy hydration checks by disabling hydration across the component; a scoped workaround requires a recorded limitation and a revised acceptance criterion.

## Rendering and theming

Start the prototype with Canvas and compare an SVG build using the same fixtures. Register only needed chart modules and the selected renderer. Do not import all ECharts functionality through a convenience barrel. Compare production output to verify actual module exclusion rather than assuming tree shaking works ([S9](SOURCES.md#platform-sources)).

Expose library-scoped CSS custom properties for background, text, muted text, border, focus, and series colors. Core styles must work without Tailwind or a specific application UI kit. A compatibility recipe may map existing application tokens into these properties.

The shared frame inherits public CSS colors from the first server render. Chart templates pass theme defaults through private properties; the frame resolves inherited colors on its host before supplying scoped defaults to projected controls. This avoids shadowing the application's palette with inline defaults while hydration or the lazy renderer is pending. Browser color measurement still supplies normalized Canvas/tooltip colors; `themeRevision` requests a new measurement after CSS-only palette changes. See the [theme handoff review](experiments/THEME_HANDOFF.md).

Native Angular controls own keyboard navigation and selection. The plot reflects the same state through renderer actions. Provide a data table because pointer tooltips and a painted canvas alone do not expose all values accessibly.

`showDataTable` is a boolean signal input, defaulting to `true`. Guard both the toggle and expanded table in the template and skip table-row derivation while disabled. The gallery explicitly binds `false` in its previews and generated source; other consumers keep the default. Disabling and reenabling the input preserves the prior expansion preference. An application that disables the table owns any equivalent keyboard point-action interface; the gallery's Code tab exposes sample data rather than replacing those actions.

The data table exposes equivalent point-activation buttons; the MVP does not require keyboard navigation inside Canvas or SVG marks. Respect reduced motion at initial render and when the preference changes. Consumer animation settings may disable motion but may not override a reduced-motion preference to force decorative motion.

Tooltips accept plain data by default. Escape strings before any HTML formatting; avoid arbitrary HTML insertion. Angular template customization, if added later, must have explicit positioning and focus behavior.

## Packaging and workspace

Current workspace layout; all nine chart-family implementations and their browser fixtures are present:

```text
projects/
  chart-library/
    core/src/          Shared contracts and ChartFrame
    bar/src/           Bar component, builders, adapter, and tests
    line/src/          Line component, options, adapter, and tests
    area/src/          Area component, fills/stacks, adapter, and tests
    pie/src/           Single-measure pie/donut, category controls, adapter, and tests
    composed/src/      Shared-axis bar/line composition
    radar/src/         Scaled dimensions and comparison profiles
    radial/src/        Scalar progress and native progress semantics
    calendar/src/      Single-year date/value heatmaps
    sankey/src/        Directed acyclic node/link flows
    src/public-api.ts  Compatibility exports
  playground/          Fixtures and interactive visual comparisons
tools/
  consumer-fixtures/   Templates for isolated consumer applications
docs/                  Product, research, and architecture records
```

Use Angular's library tooling and package format. The package exposes `/core` for shared contracts, `ChartFrame`, and internal Cartesian policy, plus focused `/bar`, `/line`, `/area`, `/pie`, `/composed`, `/radar`, `/radial`, `/calendar` and `/sankey` entries with applicable contract type exports. The root entry reexports bar, line, area, pie/donut and composed identities plus `ChartFrame` for compatibility; radar, radial, calendar and Sankey require focused imports. Secondary entry points are generated by ng-packagr, never hand-written package-export paths ([S8](SOURCES.md#platform-sources)). Bar imports core through its public package specifier; core has no runtime bar or ECharts dependency. NG11 demonstrates common Cartesian runtime behavior across bar and line; shared helpers use explicitly unsupported `ɵ` exports in core, while renderer-family options and loaders stay private.

Gallery examples and the playground use focused imports for all nine families and `/core` for shared contracts. The workspace maps subpaths to built output; isolated consumers delete all workspace aliases and compile against the tarball. The library source root spans secondary folders so unit-test discovery includes every entry. `npm run check:bundle` verifies all focused entries, the compatibility root, and a root-only frame import. It records contributing modules, static versus lazy engine imports, emitted orphan chunks, and compressed totals. `/core` excludes ECharts/ZRender entirely; `/bar` retains Bar while `/line` and `/area` retain the shared ECharts Line engine, required helpers, and Canvas in their lazy renderer chunks. ECharts core's custom-series registry is shared support code, not a registered custom-chart implementation. Root imports offer compatibility rather than a chart-isolation guarantee: esbuild may emit an unreachable renderer chunk for a frame-only root import. Prefer `/core` for the lightweight frame. See [NG09 package evidence](experiments/NG09_PACKAGE_BOUNDARIES.md).

Angular and ECharts peer requirements remain unchanged. A core-only bundle excludes renderer bytes but does not make the package's required ECharts peer optional.

R08 installs a production packed artifact into a consumer outside this workspace, without source aliases, symlinks, or parent-workspace dependency resolution. Exercise both client rendering and an SSR route from that artifact. Inspect the package contents, public declaration files, peer ranges, and consumer bundle. Run a dedicated declaration-compatibility check without `skipLibCheck`; broad error suppression cannot establish TypeScript 6 compatibility.

A temporary local package identity is sufficient for these tests. The user selected MIT for original library code. NG16 established packaging, NG17 advanced the private candidate to rc.1, and NG20 scalar/range feedback advanced it through rc.2/rc.3 to rc.4. Later focused families and presentation work advanced it through rc.11; the preserved rc.12 corrected documentation only. Each candidate preserves original/upstream/dependency notices and its own inventory/checksum manifest and archive. Exact-artifact strict/docs/client/SSR checks are documented in the [release checklist](RELEASE_CHECKLIST.md). G4 still requires the deferred human evidence; NG22 records the experimental public rc.18 publication under the user’s explicit human-review deferral.

The requested folder remains `ng-echarts`. Angular's naming guidance recommends avoiding `ng-` for published libraries, so select a distinct package namespace before registry release ([S8](SOURCES.md#platform-sources)).

## Decision record

| Decision | Current direction | Revisit trigger |
| --- | --- | --- |
| Rendering engine | ECharts, starting from upstream ECharts designs | Prototype fails required behavior or visual goals |
| Angular integration | Direct adapter confirmed by R02/R04/R05/R08 for bar | Lifecycle, hydration, or packaging evidence invalidates the initial choice |
| Public API | Typed object inputs and Angular events | Template inference or consumer usability fails |
| SSR | Stable fallback with browser chart initialization | A later product requirement needs server-rendered chart images |
| Renderer | Canvas selected by R07 bar measurements | Measurements favor SVG or both need consumer selection |
| Styling | CSS tokens and independent core styles | A concrete consumer requires an optional theme integration |
| Distribution | Local library and packed consumer first | Package name, notices, and release checks are ready |

The first implementation should record exact choices and measured evidence here before widening scope.

### Scaffold decisions

The workspace uses Angular/CLI 22.2.6, TypeScript 6.0.3, Node 24.22.2, npm 11.19.1, RxJS 7.8.2, and ng-packagr 22.2.0. Strict TypeScript, strict templates, and dependency declaration checking are enabled. The zoneless playground has a real SSR route and client hydration configured. Vitest/jsdom cover Angular integration; Prettier formats the workspace.

`@mantha911/ng-echarts` is the experimental public npm identity. The playground resolves the production library output, while a separate tarball fixture checks declarations outside the workspace. The experimental `ChartFrame`, `BarChart<T>`, and typed contracts are exported. ECharts `^6.1.0` is a provisional peer; 6.1.0 is tested. See the [implementation plan](IMPLEMENTATION_PLAN.md) and [R01 report](experiments/R01_TOOLCHAIN.md).

### Initial bar implementation

The [initial adapter decision](experiments/R02_ADAPTER.md) selects a direct, lazy Canvas adapter. Pure model/option modules are separate from the browser lifecycle controller and theme utility. The component waits for a browser render callback and application stability; it retains Angular ownership of the legend, status messages, and table. Options use stable series/row IDs and full replacement to remove stale series. Visibility is retained in Angular state. Browser failures invalidate pending work and allow retry or input-driven recovery.

Theme colors and the inherited font family are read at the component host when series, theme, or revision changes; temporary color probes stay inside the plot surface. CSS measurement does not run inside `computed` builders. Before creating the Canvas renderer, the browser adapter loads the host font at the axis size through `document.fonts.load`, alongside the lazy renderer import. Font failure permits the normal fallback stack; disposal still invalidates pending initialization. The resolved family supplies both axis text and HTML tooltips. The library bundles no font assets and imposes no Inter dependency. The [prototype report](experiments/BAR_PROTOTYPE.md) records the initial slice; the validation evidence below records later progress. The [renderer comparison](experiments/R07_RENDERER_COST.md) selects Canvas, and [R08](experiments/R08_PACKED_RUNTIME.md) passes packed client/SSR consumption.

### Numeric value formatting

`BarChart<T>` accepts `numberFormatOptions?: Intl.NumberFormatOptions` and `valueFormatter?: ValueFormatter`, with the exported type `ValueFormatter = (value: number) => string`. The existing explicit `locale` defaults to `en-US`. The shared pure `createValueFormatting` helper validates the locale/options, then uses a custom callback when present or the bound `Intl.NumberFormat` method otherwise. See the [library guide](../projects/chart-library/README.md#numeric-formatting).

The same function supplies value-axis ticks, escaped tooltip values, and native table cells/action labels. Custom callbacks are checked against unique observed numbers and cached, with positive/negative zero distinguished; missing values bypass them. Native table row derivation stays deferred until expansion. Consumer callbacks must remain pure and deterministic and handle all finite axis values. Replacing immutable configuration/data recreates the formatting state; theme/layout changes reuse it. Selection events retain original numeric values.

Invalid locale/options or observed-value callbacks participate in normal configuration-error precedence and permit input-driven recovery. Generated ticks may introduce unseen values: callback exceptions or nontext results are sanitized, and the browser controller contains update/resize failures and disposes the chart. No raw exception details enter the UI. The `/formatting` fixture exercises locale/options/custom text, SSR errors, precedence, escaping, and renderer recovery.

### Category tick formatting

The experimental `BarChart<T>` exports an optional `categoryTickFormatter` input and the type `CategoryTickFormatter = (category: string, index: number) => string`. Omitting it preserves full axis labels. For month ticks, a consumer can bind a readonly function such as `readonly monthTick: CategoryTickFormatter = (label) => label.slice(0, 3)` through `[categoryTickFormatter]="monthTick"`.

The function must be pure, synchronous, and deterministic on server and client. A cached `computed` evaluates it against original category strings and zero-based row positions when the model/function changes; layout, theme, resize, and tooltip rendering do not invoke consumer code again. Empty strings intentionally suppress ticks. Duplicate labels remain distinct through row IDs. Full category strings remain in tooltip titles, table headings, and action labels. This input does not format numeric values.

Thrown exceptions, nonfunction JavaScript inputs, and nontext results produce a generic configuration error without leaking exception details. Application error and loading retain precedence; replacing the input permits recovery. TypeScript and packed Angular template checks reject incorrect signatures. Normal comparison routes follow the shared site layout and `SiteAppearance` theme. Their explicit `?reference=1` mode preserves the independent measurement layout, typography, and palette used by capture helpers; the [comparison alignment review](experiments/COMPARISON_PAGE_ALIGNMENT.md) records the boundary. The `/comparison` route exercises valid/invalid inputs and documents the neutral theme mapping in the [R03 review](experiments/R03_VISUAL_REVIEW.md).

Axes retain explicit 12 px labels and value ticks for readability. The plot keeps insets of left 12, right 16, top 12, bottom 8 px, using ECharts 6 `outerBoundsMode: 'same'` and `outerBoundsContain: 'axisLabel'` instead of deprecated `containLabel`. The title and native controls occupy separate space from the plot; the upstream brush is excluded. These are reviewed prototype design choices, not a claim of completed visual parity.

### Static demo hosting

The [GitHub Pages preview](GITHUB_PAGES.md) uses the separate `production,pages` build configuration. It prerenders all 24 routes with base `/ng-echarts/`, while the normal production configuration retains request-time SSR. Every static route has its own `index.html` and hydration metadata. Angular router links/fragments preserve the project prefix; route labels/layouts normalize directory trailing slashes, and anchor scrolling preserves same-page navigation and keyboard skip focus.

The preparation helper prefixes font URLs in emitted CSS, inlined critical CSS and generated preload links, adds `.nojekyll`, and copies upstream/dependency notices. These transformations apply only to the static artifact; normal SSR/measurement font paths remain unchanged. The three-engine Pages check uses a project-subpath server without an SPA fallback and also supports the deployed URL. Publishing pushes compiled output to `gh-pages` through Git/GitHub CLI authentication; source pushes and experimental library release acceptance remain separate.

### Validation fixtures

The demo's `HighlightCode` directive computes escaped syntax markup using a private highlight.js core instance with TypeScript, XML/HTML, and Bash grammars. Normal Angular HTML binding sanitization is retained, with no bypass or browser-only mutation. SSR and client use the same pinned highlighter; clipboard handlers retain raw source. Code uses a local Google Sans Code variable face with an included OFL notice. The highlighter/font remain outside the packaged chart library. See the [code presentation review](experiments/CODE_PRESENTATION_REVIEW.md).

`site-controls.css` owns shared `--site-page-*`, `--site-title-*`, `--site-header-height`, and panel-radius tokens. Route styles consume these values instead of choosing separate page gutters and heading scales. The workbench and page outlines share the 1250 px layout breakpoint; settings stack when the persistent sidebar leaves a narrow content column. See the [UI spacing review](experiments/UI_SPACING_REVIEW.md) for measured before/after geometry and visual evidence.

Demo icons use a local `SiteIcon` component with a pinned subset of Heroicons v2.2.0 24 px outline paths. SVG geometry is preserved, and native Angular template control flow supports multiple paths. Icons inherit `currentColor`, stay decorative/nonfocusable, and rely on the surrounding action's accessible label. The upstream MIT notice is served in public assets; no icon dependency enters the chart-library package. See the [provenance ledger](UPSTREAM_PROVENANCE.md#demo-site-icons-heroicons).

The shell uses one root-provided, dark-by-default appearance signal, computed route labels, and a native navigation disclosure on small screens. `Gallery`, `App` at `/playground`, and utility/deferred charts follow this shared theme; client-side navigation retains it. Each `BarBlockExample` composes a real bar chart with derived totals, code/preview state, copy feedback, and reset. Documentation at `/get-started`, `/installation`, and `/components` uses shared code/copy components and a truthful availability catalog. The actual quick-start, four family API examples, and 30 generated gallery examples (both themes) compile in the isolated consumer. Site-only styles and the local Inter font stay outside the package. The site uses whole-number CSS pixel font sizes, line heights, and tracking, with native text antialiasing and browser zoom preserved. Comparison and benchmark plot hosts retain independent measurement themes, full-width contexts, and original system typography; their surrounding documentation uses Inter. See the [site alignment report](experiments/SITE_THEME_ALIGNMENT.md).

`Root` owns navigation and the router outlet; `Gallery` is the home page and `App` is the settings playground. The lazy `/validation` page contains regular, initial-loading, and initial-hidden bars, plus a separate `DeferredChart` inside `@defer (hydrate on interaction)`. `/away` has no charts. These paths passed the [R05 workspace bar checks](experiments/R04_R05_VALIDATION.md) in Chromium, Firefox, and WebKit without a hydration bypass. R04 and R08 now also pass, confirming R02 and G1 for this bar boundary. The R06 human review and G2 remain pending.

Native resource counters are installed by browser tests before application code. They track ResizeObserver targets, motion listeners, and scheduled frames; post-GC Chromium counters are retained as diagnostic data. The separate `/retention` fixture now checks collection of obsolete unique row identities through post-GC snapshots; the recorded growth is dominated by V8 code nodes, with stable DOM/listener/closure counts. The `/updates` route checks immutable identity changes and focus retention. `ChartFocusKeeper` restores native focus after keyed DOM moves and falls back to table/status controls after removal, without taking focus from another control or pointer target; document listeners are cleaned up on destroy. The `/benchmark` route subscribes to the public ECharts completion hook without adding instrumentation to the package API. The [visual reference harness](../tools/reference/README.md) has its own private development dependencies and never enters Angular library builds.

## Foundation and bar acceptance

The [NG09/NG10 implementation review](experiments/NG09_NG10_ACCEPTANCE.md) consolidates the typed public contracts, formatting/state policies, lifecycle isolation, package boundaries, and all bar layout/stack/fill combinations. Keep existing bar behavior and budgets covered while adding line charts. Extract only runtime helpers whose semantics are demonstrated by both implementations; do not share a renderer family by importing bar internals from line. The [bar API reference](BAR_CHART_API.md) documents the current input/output contract and a strictly compiled integration example. Human R06/G2 and family-wide release acceptance remain open.

## Line and demonstrated shared Cartesian behavior

NG11 adds a focused `/line` entry and a native `LineChart<T>` with `smooth` and `showPoints` inputs. Bar and line share normalization, formatting, state precedence, native controls, focus repair, font/color reads, and the generic option lifecycle controller through core. An internal `@Directive()` base preserves inherited signal-input/output metadata; strict installed consumers verify generic inference. Core imports no ECharts runtime, and `ɵ` exports support package implementation rather than stable consumer APIs. Components own their family options and lazy loaders; neither focused family imports the other. Shared templates/styles stay in core. See the [NG11 report](experiments/NG11_LINE_CHART.md) and [line API](LINE_CHART_API.md).

Line never connects missing observations, including under smooth interpolation. Marker and painted-line events resolve stable category/series identity, with nearest-category selection for path clicks and missing cells excluded. The table remains the keyboard alternative. The gallery opts out of table controls, matching the approved bar presentation. Existing bar helper modules are compatibility bridges to shared core policy, preserving its tests and benchmark callers.

## Area and shared curve policy

NG12 adds `AreaChart<T>` with gradient/solid fills and explicit same-sign stacking. Line and area now share pure curve options and stable event decoding through unsupported core `ɵ` helpers; core imports only ECharts types, never its runtime. Each family owns its Angular component and lazy engine registration/instance adapter. Area uses the ECharts Line engine with `areaStyle`, while excluding the LineChart component entry. The module-budget matrix asserts both engine contents and component-entry isolation.

Area constructs independent per-series fill objects, multiplies original color alpha, preserves raw numeric data, and never connects missing values. Painted polygon/outline clicks resolve the nearest supplied category on that series, while table actions remain complete and unambiguous. Signed-stack order and actual fill gaps are checked through browser pixels. Gallery chrome/source generation is shared across all three Cartesian families with simple template guards. See the [area API](AREA_CHART_API.md) and [NG12 report](experiments/NG12_AREA_CHART.md).

## NG13 radial contract

`PieChart<T>` implements both pies and donuts from one `ChartMeasure<T>` (`id`, numeric `key`, `label`), with a separate native template for row-category legends. `CategoryVisibilityChange` emits `{ rowId, visible }`; existing `PointSelection<T>.seriesId` carries the measure ID. Stable row IDs distinguish duplicate labels. Shared core normalization is reused with one measure, followed by nonnegative and finite-total validation. Empty/all-missing/all-zero totals are empty; zero values remain valid table actions when other positive observations make the dataset ready. Hiding all positives retains category recovery controls and displays a status without fictitious sectors.

Radial code owns its ready-state/options and browser lifecycle coordination while reusing PlotController, ChartFocusKeeper, theme probing, formatting, state precedence and ChartFrame. This avoids exposing Cartesian-only series/axis inputs. Its lazy adapter registers Pie/Tooltip/Canvas without Grid or Cartesian engines. Per-row palette slots survive filtering; reordering also reorders colors. `innerRadius` is a responsive ratio from 0 to 0.9. Labels are optional outside category text with overlap suppression, edge alignment and extra plot margin. The [pie API](PIE_CHART_API.md) lists explicit behavior and limits.

The [NG13 report](experiments/NG13_PIE_CHART.md) records the cumulative root budget adjustment: adding a third distinct engine across four families changes the combined root gzip cap from 200,000 to 210,000 bytes; its Brotli cap stays 175,000. Focused family, core, and root-frame caps remain unchanged. Focused entries remain recommended.


## NG17 composed Cartesian extension

`ComposedChart<T>` uses `CartesianChart<T, Option, Series>` with a default-compatible third generic parameter. The mixed series union refines the required input without changing existing component contracts. Normalization, stable identity, visibility, focus, formatting, state precedence, theme/motion and plot coordination remain shared. The pure composed builder maps each validated descriptor to a bar or line, retains category centers when bars are hidden, renders lines above bars and replaces options on every update. No sibling family internals are imported.

The focused `/composed` entry owns its browser loader and registers Bar/Line/Grid/Tooltip/Canvas lazily. The shared curve point decoder handles direct bar/marker events and nearest-category whole-line events. Root exports preserve class identity. All component/engine boundaries retain existing size caps. The [API](COMPOSED_CHART_API.md) and [NG17 report](experiments/NG17_COMPOSED_CHART.md) cover the initial one-scale, vertical, unstacked scope and its validation.


## NG20 application-owned links

`LinkedVisits` in the playground demonstrates a context link without modifying chart internals. A `linkedSignal` reconciles the selected month ID against immutable input rows, preserving an available ID and clearing a removed one. `computed` derives the current month, nullable device totals, detail title and live status from current data. Point handlers consume `rowId`; they do not retain an event row or use category text/index as identity. The month selector and overview table provide equivalent keyboard paths, with focus left on the initiating control.

The companion pie chart keeps stable Desktop/Mobile IDs and its own legend state across context changes. Shared visibility, ECharts instance connection and bidirectional propagation are outside the integration, avoiding event feedback loops. Null-only aggregates stay missing, zero remains numeric and application messages distinguish no observations from zero. The [guide](LINKED_CHARTS.md) contains the compiled source pattern; [NG20 evidence](experiments/NG20_LINKED_CHARTS.md) covers source→selection→derived data→plot/table and installed CSR/SSR flow. The verified private rc.1 artifact remains unchanged.


The linked demo's [UI refinement](experiments/LINKED_UI_REFINEMENT.md) adds a native Month field with shared neutral tokens and a conditional Reset. Reset explicitly returns focus to that field before its action disappears. A compact visible summary mirrors the full polite status announcement; chart selection still leaves focus on the initiating control. These are playground presentation/focus responsibilities, with no chart-library API or artifact change.

The subsequent [selection-feedback increment](experiments/LINKED_SELECTION_FEEDBACK.md) introduces `BarChart.selectedRowId: string | null` in rc.2. Its pure builder resolves the ID against current rows, retains selected-category opacity, fades other bars and uses the existing category-axis split area for a band. The band survives zero/missing/hidden bars without another engine registration. When a selected tick is displayed, its text uses the current theme's primary color and stronger weight. Automatic responsive tick spacing is retained; the linked overview description names the current month even when narrow axes omit its tick. Unknown IDs use normal options. The shared Cartesian table opts into feedback through a protected default-null method; other families gain no selection input or new state. A matching row receives `aria-current` and a visible “Selected” label. Input updates do not emit events, reset legend state, move focus or replace instances. The library deliberately does not reconcile ownership: the application clears removed IDs using its existing `linkedSignal`.

The controlled row-feedback increment measures a 573-byte Brotli increase in the combined root (174,834 → 175,407). Its previous 175,000-byte cap had only 166 bytes of headroom. The bounded root Brotli allowance advances to 176,000; its 210,000 gzip cap and every focused/core/root-frame cap remain unchanged. The [selection-feedback review](experiments/LINKED_SELECTION_FEEDBACK.md) records this explicit cumulative adjustment; source/package boundary checks still run normally.

## Shared demo focus

`site-focus.css` owns focus-visible presentation for the demo shell. `--site-focus` supplies neutral gray in both themes; ordinary controls use a 1 px outline with a 2 px gap, while code/table/measurement scroll regions use an inset offset. A scoped chart-frame/table selector wins over the library component's emulated style without changing package defaults. Former page-specific rules are removed. Negative-tabindex page/settings anchors retain programmatic focus behavior; keyboard control indicators use the browser's focus-visible heuristic. Forced-colors mode overrides the ordinary and nested-table rules with a 2 px system-color outline. The [focus review](experiments/FOCUS_REFINEMENT.md) records control/theme/width coverage and captures.

`site-hover.css` owns demo hover/press feedback by role. Shared theme tokens provide soft hover/press surfaces and borders; comparison reference mode resolves them from its own palette. Hover is gated to fine pointers; transient press feedback remains available to coarse pointers. Underlines/current-route attributes and hidden-series text/dashes/swatch opacity persist across hover. Native/ARIA-disabled controls are excluded. Only background, border, ink and text-decoration color transition (120 ms), with immediate reduced-motion updates. Forced-color hover uses system colors; focus outlines remain owned by `site-focus.css`. The [hover review](experiments/HOVER_REFINEMENT.md) records the before/after control matrix and synthetic disabled probes.

The shared `bar-block.css` owns gallery tab geometry for bar/line/area/composed and the pie block: equal 64 px widths, 4 px gaps/insets, 32/40 px button heights and 40/48 px header heights. The selected indicator is a separate pseudo-element at the header edge, so the rounded hover fill remains inset. Gallery mobile overrides no longer compete with those dimensions; `site-hover.css` supplies state colors, while workbench tab geometry remains independent. [The tab correction](experiments/HOVER_REFINEMENT.md#codepreview-tab-spacing-correction) records source hashes and layout evidence.

The [native range increment](experiments/NG20_MONTH_RANGE.md) adds `BarChart.selectedRowIds: readonly string[] | null` in rc.3. A non-null plural input overrides the scalar, including empty to clear. The bar resolves known IDs into a deduplicated set and shares it with the pure builder and native table; only a single effective row is current. Multiple rows retain visible Selected labels and shading. Neither input emits events or adds engine registrations. The application keeps a discriminated month/range/null signal, pure supplied-order slicing/reconciliation and crossing logic. A view effect recovers Period focus only when conditional range fields containing focus are removed; other active controls retain focus. Native option selected bindings keep conditional From/To values correct on creation, including a last-row initial To. No brush renderer, DOM selection widget or global event bus is introduced.

The [graphical-range increment](experiments/GRAPHICAL_RANGE_SELECTION.md) adds an opt-in bar input/output in rc.4. Internal bar render requests separate ECharts options from interaction metadata. A browser-only surface uses public `convertToPixel`/`containPixel` after `setOption` to find the actual adjusted grid; it snaps along the category axis and captures one primary pointer. Draft geometry stays local to the adapter, while Angular receives one ordered range plus original rows on release. The internal controller forwards a range callback without adding public inputs to other families. A normalized-model snapshot rejects callbacks from replaced data even when IDs match. Resize/options/capture/visibility/scroll changes cancel drafts, and disposal removes all surface/global listeners. The app owns armed mode, committed IDs, native equivalence and initiating-button focus. No chart instance, date parsing or global selection bus reaches the application.

The combined-root allowance advances to **212,000 gzip / 178,000 Brotli bytes** for the bounded range adapter; focused family, core and root-frame budgets remain unchanged. The [range review](experiments/GRAPHICAL_RANGE_SELECTION.md) records the initial budget detection, measured delta and final rerun rather than treating an overrun as passing evidence.

## Preview build provenance

The [Pages hardening workflow](experiments/PREVIEW_DEPLOYMENT_HARDENING.md) captures commit/tree/source identity before compilation. Clean builds extract that Git tree into an isolated workspace; dirty snapshots are exact local-only copies. Internal relative aliases are preserved, installed pinned dependencies are shared, and pre/post source hashes detect changes. A final output inventory binds route HTML, chunks, fonts, standalone concepts and notices. Local checks issue a three-browser receipt for the immutable marker; publication requires clean/current pushed source, unchanged output and that receipt. The helper verifies its copied artifact and never restamps build metadata. Shared operation locks prevent overlapping output mutations. Public checks validate source, receipt and every file; they never certify a local candidate. CI checks Pages before evidence-generating tests. This is source/output provenance for the supported workflow, not a change to library APIs, candidate bytes or human release acceptance.


## Demo loading and rendering

The original [performance implementation](experiments/DEMO_PERFORMANCE_FIXES.md) covers playground/build delivery. The [navigation and animation follow-up](experiments/DEMO_PERFORMANCE_FIXES.md#navigation-and-animation-follow-up) also corrects the shared library rendering controller without changing public chart inputs or outputs. The controller records initialized dimensions, ignores unchanged-size observer deliveries, and updates options without an unconditional resize. Real resizes receive pending-update context so Calendar/Radar avoid rebuilding stale options before the latest snapshot. Observer and input frames share one pending renderer import. Disposal clears measured dimensions; hidden hosts and asynchronous imports retain generation/error guards. The runtime corrections ship in the preserved private rc.16 and public rc.18 candidates; earlier private archives remain unchanged. See the [combined checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) and [publication result](PUBLICATION.md#first-publication-result).

Gallery chart views use a separate viewport hydration/deferral block per chart family, retain full SSR metadata and hydrate on print. A shared shell/placeholder preserves layout without making a bar example wait for Line, Area and Composed component imports. Full source views and syntax highlighting are instantiated when Code is opened; fixed import snippets use a small deterministic template.

Build-derived renderer and component graphs emit route-specific preload links into static and SSR HTML, and supply client-navigation hints. Static dependency traversal excludes dynamic imports, preserving focused chart/loading boundaries and on-demand highlighting. Sidebar pointer/keyboard intent warms only the destination route; deduplicated navigation-start warming remains a fallback. Intent listeners attach to the rendered sidebar and are removed on teardown. Preloading fetches code without evaluating ECharts during SSR or mounting offscreen plots. The concept iframe URL is present in prerendered HTML. A same-origin/source-validated handshake synchronizes theme, height and readiness, including a child that finished before Angular hydration. Intersection observation in the child clips through ancestor frames, so progressive rendering also works with cached wrappers that lack a viewport protocol. The concept document renders near-visible plots one per animation frame, caches applied themes/sizes, and initializes remaining visible plots for print. A changed theme reaches deferred plots when they become visible.

The self-contained concept document remains the source of the web edition, which shares a hashed modular engine and the site's font. Generation checks and exact derived-asset comparisons extend the sealed Pages inventory. Dedicated route/asset byte budgets and controlled readiness checks complement library package budgets; their timing thresholds are lab regression guards, not field Web Vitals claims. GitHub Pages retains its platform cache policy; the normal SSR server marks only hashed script/style assets immutable.

## NG18 radar first increment

The user-approved [radar increment](experiments/NG18_RADAR_CHART.md) adds the focused `/radar` Angular entry and a site-aligned demo with explicit dimension maxima, stable comparisons, missing-data policy, native scale/value table and vertex/table actions. The [API](RADAR_CHART_API.md) defines the bounded contract. The subsequent radial-progress increment below is implemented. The compatibility root and four-family MVP retain their scope; private rc.5 is separate from the preserved rc.4 artifact. Human F09/R06/G2/G3/G4 remain pending. This private-origin increment now ships in [public rc.18](PUBLICATION.md#first-publication-result).


## NG18 radial progress increment

The user-approved [radial progress increment](experiments/NG18_RADIAL_PROGRESS.md) adds the focused `/radial` Angular entry and two demo examples. Required scalar value and explicit positive maximum supply native progress semantics, visible formatted values and a noninteractive ring. The [API](RADIAL_PROGRESS_API.md) defines zero/null/invalid states, formatting, motion and SSR behavior. This advances the private candidate to rc.6 while preserving rc.5 and earlier artifacts and the existing compatibility root. Native progress provides the scalar alternative; legends, point actions and a data table are inapplicable. Human interpretation and public release gates remain pending.

## Focused calendar heatmap

`/calendar` exports `CalendarHeatmap<T>` and its raw-date selection contract without expanding compatibility-root exports. Pure Gregorian normalization owns validation and complete year enumeration. The browser adapter alone registers Heatmap/Calendar/piecewise VisualMap/Tooltip/Canvas, applies responsive year/quarter options and maps observed dates back to original rows. Native monthly disclosures/tables render during SSR. Shared plot lifecycle, formatting, themes, state and focus behavior remain in use; [the API](CALENDAR_HEATMAP_API.md) defines the bounded semantics.


## NG19 Sankey first increment

The next NG19 increment adds a focused experimental `/sankey` entry and visitor-flow demo, with typed node/link IDs, directed acyclic validation, separate incoming/outgoing totals, native table actions and lazy Canvas rendering. The [API](SANKEY_CHART_API.md) defines the bounded 24-node/60-link contract; the [implementation record](experiments/NG19_SANKEY_CHART.md) records verification and scope. Private rc.10 preserves rc.9, rc.8 and earlier artifacts. Circular/vertical/drag variants, broader linked interactions and human F09/R06/G2/G3/G4 acceptance remain pending.

## Shared chart presentation refinement

The internal core `ChartStage` reserves plot geometry for loading, empty and error states and owns state messages/retry controls. Family controls retain their footprint while unavailable through native inert/disabled semantics and hidden visibility. Calendar stage geometry uses its host container width for the same year/quarter layout in ready and unavailable states. Expanded tables are not retained as stale interactive data. Core remains free of ECharts runtime code.

Internal tooltip helpers share escaped title/label/value markup, tabular numeric alignment, spacing, confinement styling and a quiet shadow across families. Pie legends and optional `showTotal` use the visible-category denominator; percentage locale follows `locale`, while raw values/totals follow value formatting. The optional calendar/Sankey `valueLabel` supplies application units without changing raw numeric contracts. These source refinements do not modify existing candidate archives or close human release gates.

At the rc.11 presentation checkpoint, the combined-root budget was 218,000 gzip / 186,000 Brotli bytes. Current root/root-frame caps are 219,500/187,500 and 203,000/175,000 respectively; see [compatibility and package boundaries](COMPATIBILITY.md). Measured aggregate growth over rc.10 is 3,479 gzip / 2,635 Brotli bytes (217,597 / 185,843 total). The frame-only root stays engine-free while its emitted orphan allowance becomes 201,500 gzip / 175,000 Brotli bytes (measured 201,395 / 173,611, up 1,277 / 1,125 over rc.10). Focused/core caps and engine-isolation assertions remain unchanged; no existing candidate archive is repacked by this source refinement.

Private rc.11 combines the completed [presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md) with Sankey and independent lazy chart loading. It preserves rc.10 and earlier archives. At rc.11 the combined-root aggregate allowance was 218,000 gzip / 186,000 Brotli bytes; emitted root-frame orphan chunks allow 201,500 / 175,000, with zero reachable engine modules. Focused/core and demo route guards remain unchanged. Publication was pending at this private checkpoint; [public rc.18](PUBLICATION.md#first-publication-result) is now verified. Human acceptance remains pending.

The embedded concept gallery waits for `document.fonts.load('12px Inter')`, with fallback-font recovery on rejection, before scheduling its existing viewport-driven SVG renders. WebKit can leave the whole-set `document.fonts.ready` unresolved despite the face being loaded. Public verification waits for document DOM and actual plots instead of the embedded window-load signal. This [demo-only correction](experiments/DEMO_PERFORMANCE_FIXES.md#webkit-embedded-font-readiness-follow-up) does not change library renderer registration or private candidate implementation.


## NG20 transient month previews

The user-authorized [month-preview follow-up](experiments/NG20_MONTH_PREVIEWS.md) adds opt-in bar pointer/table-focus previews and one-way temporary device-share context introduced in rc.13 and corrected in the preserved private rc.15. Committed period/range feedback, totals and local legends stay independent; keyboard actions can commit through the existing point event. The browser adapter owns delegated listeners, touch guards and cleanup. Shared zoom and bidirectional linking remain open; [public rc.18 publication](PUBLICATION.md#first-publication-result) is complete. The mobile range button uses an explicit tap policy; the original report retains the local/CI evidence available at that checkpoint. Current release-source CI is recorded in the [publication result](PUBLICATION.md#first-publication-result). Human F09/R06/G2/G3/G4 remain pending, with calendar/Sankey checklists now included.


The [combined rc.16 checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) verifies the month-preview behavior together with the completed resize/animation/navigation changes: 266 unit tests, 380 browser passes with four expected skips, exact artifact consumers and unchanged focused/core/route guards. Earlier archives and human release gates remain unchanged.
