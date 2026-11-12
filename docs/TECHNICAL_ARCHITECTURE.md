# ng-echarts technical architecture

Status: proposed design, to be resolved by the [R&D gates](RND_PLAN.md#decision-gates). Updated 12 November 2026.

## Architecture direction

Use standalone Angular components with strict templates, typed inputs and outputs, signals for local state, and OnPush change detection. Keep rendering behind a small adapter so deterministic data transformations can be tested separately from browser lifecycle behavior. The first experiment compares this direct adapter with an existing Angular wrapper only if that wrapper declares compatible peer dependencies.

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

## Proposed public contract

Names below illustrate the intended shape and are not an installed API.

```ts
interface RevenueRow {
  id: string;
  month: string;
  revenue: number | null;
  cost: number | null;
}

type NumericKey<T> = {
  [K in keyof T]-?: [NonNullable<T[K]>] extends [never]
    ? never
    : NonNullable<T[K]> extends number ? K : never
}[keyof T] & string;

interface ChartSeries<T> {
  id: string;
  key: NumericKey<T>;
  label: string;
  color?: string;
}

interface PointSelection<T> {
  rowId: string;
  seriesId: string;
  row: T;
  value: number;
  source: 'plot' | 'table';
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

Expected inputs cover rows, category and identity keys, series, dimensions, explicit `light` or `dark` theme, numeric theme revision, locale and formatting, loading, error, and animation preference. The theme revision lets an application request another CSS-token read after changing its palette within the same theme. Automatic observation of application classes or CSS is outside MVP.

Cartesian charts accept multiple `ChartSeries<T>` definitions. Pie/donut accepts one numeric measure with a stable measure identifier; each row becomes a slice. Both emit `PointSelection<T>` with the measure or series identifier and row identifier. A separate legend output identifies either a Cartesian series or a pie category and its new visibility. Legend visibility is internal state retained by identifier; there is no controlled-selection API or persistent point-selection state in MVP.

Row identity and category keys must resolve to strings. Numeric keys must reject string, unknown, and exclusively nullish fields. Runtime validation still checks external data, unique identifiers, and finite values. Prototype generic inference and intentional type-error cases in Angular templates before freezing the API; the sketch alone does not establish type safety.

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

Native Angular controls own keyboard navigation and selection. The plot reflects the same state through renderer actions. Provide a data table because pointer tooltips and a painted canvas alone do not expose all values accessibly.

The data table exposes equivalent point-activation buttons; the MVP does not require keyboard navigation inside Canvas or SVG marks. Respect reduced motion at initial render and when the preference changes. Consumer animation settings may disable motion but may not override a reduced-motion preference to force decorative motion.

Tooltips accept plain data by default. Escape strings before any HTML formatting; avoid arbitrary HTML insertion. Angular template customization, if added later, must have explicit positioning and focus behavior.

## Packaging and workspace

Scaffolded workspace layout; renderer and chart-specific implementation remain pending:

```text
projects/
  chart-library/       Angular package and public API
  playground/          Fixtures and interactive visual comparisons
tools/
  consumer-fixtures/   Templates for isolated consumer applications
docs/                  Product, research, and architecture records
```

Use Angular's library tooling and package format. Keep Angular runtime packages as compatible peer dependencies; decide and test the ECharts dependency contract during packaging. Secondary entry points are a candidate for per-chart imports and must be verified in the consumer build ([S8](SOURCES.md#platform-sources)).

R08 installs a production packed artifact into a consumer outside this workspace, without source aliases, symlinks, or parent-workspace dependency resolution. Exercise both client rendering and an SSR route from that artifact. Inspect the package contents, public declaration files, peer ranges, and consumer bundle. Run a dedicated declaration-compatibility check without `skipLibCheck`; broad error suppression cannot establish TypeScript 6 compatibility.

A temporary local package identity is sufficient for these tests. Finalize the local distributable's license and third-party notices at G4; public registry naming and publication remain later work.

The requested folder remains `ng-echarts`. Angular's naming guidance recommends avoiding `ng-` for published libraries, so select a distinct package namespace before registry release ([S8](SOURCES.md#platform-sources)).

## Decision record

| Decision | Current direction | Revisit trigger |
| --- | --- | --- |
| Rendering engine | ECharts, starting from upstream ECharts designs | Prototype fails required behavior or visual goals |
| Angular integration | Initial choice in R02; confirm after R04, R05, and R08 | Lifecycle, hydration, or packaging evidence invalidates the initial choice |
| Public API | Typed object inputs and Angular events | Template inference or consumer usability fails |
| SSR | Stable fallback with browser chart initialization | A later product requirement needs server-rendered chart images |
| Renderer | Canvas first; SVG comparison required | Measurements favor SVG or both need consumer selection |
| Styling | CSS tokens and independent core styles | A concrete consumer requires an optional theme integration |
| Distribution | Local library and packed consumer first | Package name, notices, and release checks are ready |

The first implementation should record exact choices and measured evidence here before widening scope.

### Scaffold decisions

The workspace uses Angular/CLI 22.2.6, TypeScript 6.0.3, Node 24.22.2, npm 11.19.1, RxJS 7.8.2, and ng-packagr 22.2.0. Strict TypeScript, strict templates, and dependency declaration checking are enabled. The zoneless playground has a real SSR route and client hydration configured. Vitest/jsdom cover Angular integration; Prettier formats the workspace.

`@ng-echarts/chart-library` is a private, temporary package identity. The playground resolves the production library output, while a separate tarball fixture checks declarations outside the workspace. Only the experimental `ChartFrame` presentation shell is exported. ECharts 6.1.0 is installed for declaration checks and the upcoming adapter; its library dependency contract remains undecided. See the [implementation plan](IMPLEMENTATION_PLAN.md) and [R01 report](experiments/R01_TOOLCHAIN.md).
