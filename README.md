# ng-echarts

An Angular 22 chart component library inspired by EvilCharts, using Apache ECharts for rendering and TypeScript for its public API.

Preview: **[Live demo on GitHub Pages](https://phalla-doll.github.io/ng-echarts/)**. See [deployment instructions](docs/GITHUB_PAGES.md) to rebuild and publish the current demo snapshot.

Status: experimental bar, line, area, and pie/donut components. Updated 13 November 2026. The Angular library and SSR playground now render bars, lines, areas, and pies/donuts with native controls; G1 technical feasibility passes for bar; the user has deferred the human screen-reader review to release acceptance, allowing development to continue while G2 remains pending.

## Project direction

Build native Angular components, beginning with the upstream ECharts implementations. Preserve the selected visual designs and interactions while replacing React lifecycle, composition, state, and overlays with Angular equivalents. Validate one bar chart before expanding to the MVP collection.

`ng-echarts` is the requested local project name. A public package name and namespace remain undecided; package availability and potential confusion with existing ECharts integrations must be checked before publication.

## Documents

| Document | Purpose |
| --- | --- |
| [Product specification](docs/PRODUCT_SPEC.md) | Users, scope, behavior, requirements, and acceptance criteria |
| [Local installation](docs/INSTALLATION.md) | Pack/install workflow, pinned fresh CLI application, bootstrap and SSR configuration |
| [Integration guide](docs/INTEGRATION_GUIDE.md) | Complete four-chart application, API/type index, updates, events and accessibility |
| [Compatibility and limits](docs/COMPATIBILITY.md) | Exact tested versions, peer contracts, browser coverage, measured envelopes and exclusions |
| [GitHub Pages preview](docs/GITHUB_PAGES.md) | Live URL, static subpath build, local/live verification, notices and manual republishing |
| [Implementation plan](docs/IMPLEMENTATION_PLAN.md) | Delivery increments, scaffold boundaries, and developer workflow |
| [Upstream provenance](docs/UPSTREAM_PROVENANCE.md) | Pinned fixtures, reuse decisions, and adapted-file notices |
| [Bar prototype evidence](docs/experiments/BAR_PROTOTYPE.md) | Implemented behavior, test results, captures, and open research |
| [Four-family visual audit](docs/experiments/VISUAL_AUDIT.md) | Official ECharts and EvilCharts review, mobile refinements, both-theme captures and browser evidence |
| [Visual comparison](docs/experiments/R03_VISUAL_REVIEW.md) | Pinned upstream comparisons at three host widths and remaining alignment work |
| [Playground layout review](docs/experiments/PLAYGROUND_LAYOUT_REVIEW.md) | Responsive site design, before/after captures, navigation, and interface checks |
| [Bar gallery correction](docs/experiments/BAR_GALLERY_VISUAL_REVIEW.md) | Reference-aligned home page, four existing bar variants, copyable Angular examples, and verification |
| [Site-wide theme alignment](docs/experiments/SITE_THEME_ALIGNMENT.md) | Consistent documentation/tools, setup and component pages, and a shared theme across navigation |
| [UI spacing review](docs/experiments/UI_SPACING_REVIEW.md) | Shared gutters, aligned headings, consistent panels/controls, breakpoint checks, and before/after captures |
| [Code presentation](docs/experiments/CODE_PRESENTATION_REVIEW.md) | Google Sans Code, theme-aware syntax colors, and corrected copy actions |
| [Area-block reference audit](docs/experiments/AREA_BLOCKS_VISUAL_AUDIT.md) | User's visual target, current layout gaps, and gallery correction brief |
| [Pie/donut API reference](docs/PIE_CHART_API.md) | Single-measure categories, responsive radii, labels, visibility, and raw events |
| [NG13 pie/donut implementation](docs/experiments/NG13_PIE_CHART.md) | Pie/donut source comparisons, package isolation, browser behavior, and performance |
| [Area API reference](docs/AREA_CHART_API.md) | Independent gradient/solid fills, same-sign stacks, gap/event semantics, and integration |
| [NG12 area implementation](docs/experiments/NG12_AREA_CHART.md) | Area source comparisons, gallery, package isolation, browser geometry checks, and performance |
| [Line API reference](docs/LINE_CHART_API.md) | Multi-series lines, interpolation/points/gaps, shared inputs/events, and local integration |
| [NG11 line implementation](docs/experiments/NG11_LINE_CHART.md) | Line source comparisons, gallery, package isolation, browser behavior, and performance |
| [Bar API reference](docs/BAR_CHART_API.md) | Implemented inputs/defaults, events, integration, formatting, versions, and limits |
| [Foundation/bar acceptance](docs/experiments/NG09_NG10_ACCEPTANCE.md) | NG09/NG10 implementation checklist, bar requirement evidence, and remaining release checks |
| [Cross-family acceptance](docs/experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) | F01–F10 reconciliation, 100-cycle cleanup, actual Angular interaction/resize measurements, and deferred human evidence |
| [Documentation acceptance](docs/experiments/NG15_DOCUMENTATION.md) | Reproducible first-install/bootstrap path, complete examples, compatibility review and fresh-consumer evidence |
| [Package boundaries](docs/experiments/NG09_PACKAGE_BOUNDARIES.md) | Focused core/bar imports, compatible root API, strict packed consumers, and module/size checks |
| [Shared value formatting](docs/experiments/NG09_SHARED_FORMATTING.md) | Currency/percentage options, custom numeric text, and consistent axis/tooltip/table behavior |
| [Lifecycle and hydration validation](docs/experiments/R04_R05_VALIDATION.md) | Three-browser results, input/focus/retention, teardown, and hydration |
| [Renderer and cost](docs/experiments/R07_RENDERER_COST.md) | Actual Angular timings, Canvas/SVG comparison, data envelope, and size budget |
| [Packed runtime](docs/experiments/R08_PACKED_RUNTIME.md) | Isolated client/SSR production builds and three-browser package checks |
| [Screen-reader review](docs/experiments/R06_MANUAL_REVIEW.md) | Deferred human listening checklist, required before release acceptance |
| [Research findings](docs/RESEARCH_FINDINGS.md) | Upstream inventory, verified compatibility facts, reuse assessment, and unknowns |
| [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) | Implemented Angular design, public API, rendering lifecycle, and provisional release decisions |
| [Research and development plan](docs/RND_PLAN.md) | Experiments, deliverables, decision gates, and effort estimates |
| [Delivery backlog](docs/BACKLOG.md) | Ordered implementation tasks and release checks |
| [Acceptance matrix](docs/ACCEPTANCE_MATRIX.md) | Requirements mapped to experiments, delivery tasks, and release evidence |
| [Sources](docs/SOURCES.md) | Primary references and the pinned upstream revision |

## How the plans fit together

The product specification defines scope and required behavior. Research findings own the checked toolchain ranges and upstream facts. The architecture describes how to meet the specification; the R&D plan resolves uncertainties before the backlog expands the implementation. The acceptance matrix connects these documents without replacing their detailed criteria.

Keep the four-family MVP separate from later chart families and advanced visual variants. The bar prototype establishes feasibility; it does not establish release readiness for the other charts. Decisions remain provisional until the relevant experiment passes and its evidence is recorded.

Before coding, read the [template and derived-state conventions](docs/TECHNICAL_ARCHITECTURE.md#templates-and-derived-state). They apply Angular's template guidance to chart states, legends, accessible tables, and the renderer boundary.

## Development

Use Node 24.22.2 (`.nvmrc`) and npm 11.19.1. Angular/CLI 22.2.6, TypeScript 6.0.3, RxJS 7.8.2, and ECharts 6.1.0 are locked for the initial experiments.

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build:lib
npm start -- --port 4310
```

Open `http://localhost:4310` for the bar-block gallery, or `http://localhost:4310/playground` for interactive settings. In another terminal, run `npm run watch:lib` while editing the library. The playground consumes its built package from `dist/chart-library`.

The site includes [Get Started](http://localhost:4310/get-started), [Installation](http://localhost:4310/installation), and [Components](http://localhost:4310/components). Site text and chart labels use local Inter with whole CSS pixel sizes and line heights. All pages share the neutral styling and a dark-by-default theme; the header toggle retains its choice during client-side navigation. Measurement fixtures keep their own chart conditions.

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the library and production browser/server playground |
| `npm run build:pages` / `npm run check:pages` | Build and verify the static demo under its GitHub project path |
| `npm run deploy:pages` | Rebuild, verify and publish the current demo to the dedicated `gh-pages` branch |
| `npm test` | Run library and playground Vitest tests once |
| `npm run test:browser` | Run Chromium, Firefox, and WebKit scenarios against the production SSR build |
| `npm run reference:prepare` | Prepare the isolated pinned React reference source and build its harness |
| `npm run capture:pie` | Capture pinned pie/donut references, both themes, and narrow labeled galleries |
| `npm run benchmark:pie` | Measure actual Angular donut mount/update and table cost at 12/100 categories |
| `npm run capture:area` | Capture pinned area references and Angular variants in both themes and three host widths |
| `npm run benchmark:area` | Measure actual Angular stacked-gradient area mount/update and table cost |
| `npm run capture:line` | Capture pinned line references and Angular variants in both themes and three host widths |
| `npm run benchmark:line` | Measure actual Angular line mount/update and expanded-table cost |
| `npm run capture:bar` | Capture all four reference variants at three widths/two themes, plus narrow tooltips |
| `npm run typecheck` | Strict Angular/TypeScript compilation with `skipLibCheck: false` |
| `npm run check:consumer` | Check a built tarball's declarations in an isolated Angular consumer |
| `npm run check:docs` | Execute the installation guide in a fresh CLI app, compile its exact example and verify three-engine hydration/actions |
| `npm run check:runtime` | Build/run isolated client and SSR consumers in all three browser engines |
| `npm run benchmark:bar` | Measure actual Angular mount/update and compare production Canvas/SVG harnesses |
| `npm run benchmark:acceptance` | Measure all four Angular families: normal/stress mount, update, legend interaction, resize, cold loading, and tables |
| `npm run check:bundle` | Check core/bar/root module boundaries and size budgets, excluding Angular/RxJS peers |
| `npm run check:ssr` | Check production server markup and hydration metadata after a build |
| `npm run format` / `npm run format:check` | Apply/check Prettier formatting |
| `npm run check` | Run formatting, builds, compilation, unit, declaration/runtime consumers, SSR, browser, and size checks |

The latest full check passes 119 unit/integration tests and 160 browser scenarios (plus two skipped CDP-only cases), including three-engine [site/theme](docs/experiments/SITE_THEME_ALIGNMENT.md), [gallery](docs/experiments/BAR_GALLERY_VISUAL_REVIEW.md), layout, and [numeric-formatting checks](docs/experiments/NG09_SHARED_FORMATTING.md). The [lifecycle validation report](docs/experiments/R04_R05_VALIDATION.md) retains the earlier resource baseline. `/validation` provides lifecycle scenarios; `/comparison` provides four reference variants and neutral theme tokens; `/formatting` checks locale/options/custom text and recovery; `/updates` checks immutable inputs/focus; `/retention` checks obsolete-model collection; `/away` verifies route cleanup. CI is configured for all three engines. No lint rules or coverage threshold are configured yet.

The [visual review](docs/experiments/R03_VISUAL_REVIEW.md) records 80 current captures and accepted bar differences. R01–R05, [R07 renderer/cost](docs/experiments/R07_RENDERER_COST.md), and [R08 packed consumption](docs/experiments/R08_PACKED_RUNTIME.md) pass for bar. Canvas meets the normal 200×3 benchmark target and the measured size budget. G1 passes; G2 requires the [R06 listening result](docs/experiments/R06_MANUAL_REVIEW.md). The user has deferred that human review to release acceptance; it no longer blocks development. Automated cross-family evidence is reconciled in [NG14](docs/experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md); human interpretation and final release evidence remain pending.

## Target environment

Angular 22 with strict TypeScript and template checking. The selected toolchain follows the supported ranges recorded in [research findings](docs/RESEARCH_FINDINGS.md#angular-22-toolchain).

## Implemented chart families

Package entries below follow `@ng-echarts/chart-library`. All four families are experimental; implementation completion does not close NG14 or the release gates.

| Component | Entry | Gallery / behavior fixture | API and evidence |
| --- | --- | --- | --- |
| `BarChart<T>` | `/bar` | `/` / `/playground`, `/validation` | [API](docs/BAR_CHART_API.md), [bar acceptance](docs/experiments/NG09_NG10_ACCEPTANCE.md) |
| `LineChart<T>` | `/line` | `/line` / `/line-validation` | [API](docs/LINE_CHART_API.md), [NG11](docs/experiments/NG11_LINE_CHART.md) |
| `AreaChart<T>` | `/area` | `/area` / `/area-validation` | [API](docs/AREA_CHART_API.md), [NG12](docs/experiments/NG12_AREA_CHART.md) |
| `PieChart<T>` (pie and donut) | `/pie` | `/pie` / `/pie-validation` | [API](docs/PIE_CHART_API.md), [NG13](docs/experiments/NG13_PIE_CHART.md) |

Cartesian charts take `series: readonly ChartSeries<T>[]`; pie/donut takes one `measure: ChartMeasure<T>`. Cartesian legend events identify a `seriesId`; pie legend events identify a `rowId`. Both point events retain the original row and numeric value. See the guides for zero/missing/negative rules and optional keyboard table actions.

Focused families keep the 200,000 gzip / 175,000 Brotli byte cap; `/core` keeps 10,000/9,000. The combined four-family root uses 210,000/175,000; its frame-only scenario keeps 200,000/175,000. [Current measured boundaries](docs/experiments/data/package-boundaries.json) include all lazy chunks; prefer focused imports.

## Bar feasibility baseline

Build a standalone Angular bar chart with typed data, light and dark themes, responsive resizing, tooltip, selectable legend, reduced motion, and safe destruction. Prove that it works in both a client application and an application using server rendering and hydration. Use its measured results to decide the MVP architecture.

NG09/NG10 implementation is complete for the current foundation/bar baseline; NG11 line charts are implemented; NG12 area charts are implemented; NG13 pie/donut is implemented; [NG14 automated cross-family acceptance](docs/experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) is recorded, with human interpretation still pending. [NG15 installation/integration documentation](docs/experiments/NG15_DOCUMENTATION.md) and fresh-consumer verification are complete. NG16 local artifact preparation is next; human interpretation and release gates remain open.

The `/pie` page presents browser shares, donuts, and outside labels in the same gallery design. `/pie-validation` exercises single-measure category behavior and deferred hydration.

The `/area` page presents independent gradients, stacks, solid fills, and missing observations using the same gallery design. `/area-validation` exercises area behavior and deferred hydration.

The `/line` page presents straight/smooth lines, optional points, and missing-value gaps using the same gallery design. `/line-validation` exercises line behavior and deferred hydration.

The home page presents the existing grouped, stacked, gradient, and horizontal bars in a neutral gallery with code/preview controls, calculated totals, copyable Angular examples, and light/dark themes. The `/playground` route retains the pinned Desktop/Mobile fixture and grouped settings. It retains layout, stack, gradient, state, update, and remount controls. `@ng-echarts/chart-library` is a private, experimental package identity. ECharts is a peer dependency; no package has been published. Adapted fixture data and colors are tracked in the provenance ledger with the upstream MIT notice.
