# ng-echarts

An Angular 22 chart component library inspired by EvilCharts, using Apache ECharts for rendering and TypeScript for its public API.

Status: experimental bar and line components. Updated 12 November 2026. The Angular library and SSR playground now render bars and lines with native controls; G1 technical feasibility passes for bar; the user has deferred the human screen-reader review to release acceptance, allowing development to continue while G2 remains pending.

## Project direction

Build native Angular components, beginning with the upstream ECharts implementations. Preserve the selected visual designs and interactions while replacing React lifecycle, composition, state, and overlays with Angular equivalents. Validate one bar chart before expanding to the MVP collection.

`ng-echarts` is the requested local project name. A public package name and namespace remain undecided; package availability and potential confusion with existing ECharts integrations must be checked before publication.

## Documents

| Document | Purpose |
| --- | --- |
| [Product specification](docs/PRODUCT_SPEC.md) | Users, scope, behavior, requirements, and acceptance criteria |
| [Implementation plan](docs/IMPLEMENTATION_PLAN.md) | Delivery increments, scaffold boundaries, and developer workflow |
| [Upstream provenance](docs/UPSTREAM_PROVENANCE.md) | Pinned fixtures, reuse decisions, and adapted-file notices |
| [Bar prototype evidence](docs/experiments/BAR_PROTOTYPE.md) | Implemented behavior, test results, captures, and open research |
| [Visual comparison](docs/experiments/R03_VISUAL_REVIEW.md) | Pinned upstream comparisons at three host widths and remaining alignment work |
| [Playground layout review](docs/experiments/PLAYGROUND_LAYOUT_REVIEW.md) | Responsive site design, before/after captures, navigation, and interface checks |
| [Bar gallery correction](docs/experiments/BAR_GALLERY_VISUAL_REVIEW.md) | Reference-aligned home page, four existing bar variants, copyable Angular examples, and verification |
| [Site-wide theme alignment](docs/experiments/SITE_THEME_ALIGNMENT.md) | Consistent documentation/tools, setup and component pages, and a shared theme across navigation |
| [UI spacing review](docs/experiments/UI_SPACING_REVIEW.md) | Shared gutters, aligned headings, consistent panels/controls, breakpoint checks, and before/after captures |
| [Code presentation](docs/experiments/CODE_PRESENTATION_REVIEW.md) | Google Sans Code, theme-aware syntax colors, and corrected copy actions |
| [Area-block reference audit](docs/experiments/AREA_BLOCKS_VISUAL_AUDIT.md) | User's visual target, current layout gaps, and gallery correction brief |
| [Line API reference](docs/LINE_CHART_API.md) | Multi-series lines, interpolation/points/gaps, shared inputs/events, and local integration |
| [NG11 line implementation](docs/experiments/NG11_LINE_CHART.md) | Line source comparisons, gallery, package isolation, browser behavior, and performance |
| [Bar API reference](docs/BAR_CHART_API.md) | Implemented inputs/defaults, events, integration, formatting, versions, and limits |
| [Foundation/bar acceptance](docs/experiments/NG09_NG10_ACCEPTANCE.md) | NG09/NG10 implementation checklist, bar requirement evidence, and remaining release checks |
| [Package boundaries](docs/experiments/NG09_PACKAGE_BOUNDARIES.md) | Focused core/bar imports, compatible root API, strict packed consumers, and module/size checks |
| [Shared value formatting](docs/experiments/NG09_SHARED_FORMATTING.md) | Currency/percentage options, custom numeric text, and consistent axis/tooltip/table behavior |
| [Lifecycle and hydration validation](docs/experiments/R04_R05_VALIDATION.md) | Three-browser results, input/focus/retention, teardown, and hydration |
| [Renderer and cost](docs/experiments/R07_RENDERER_COST.md) | Actual Angular timings, Canvas/SVG comparison, data envelope, and size budget |
| [Packed runtime](docs/experiments/R08_PACKED_RUNTIME.md) | Isolated client/SSR production builds and three-browser package checks |
| [Screen-reader review](docs/experiments/R06_MANUAL_REVIEW.md) | Deferred human listening checklist, required before release acceptance |
| [Research findings](docs/RESEARCH_FINDINGS.md) | Upstream inventory, verified compatibility facts, reuse assessment, and unknowns |
| [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) | Proposed Angular design, public API, rendering lifecycle, and decisions |
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
| `npm test` | Run library and playground Vitest tests once |
| `npm run test:browser` | Run Chromium, Firefox, and WebKit scenarios against the production SSR build |
| `npm run reference:prepare` | Prepare the isolated pinned React reference source and build its harness |
| `npm run capture:line` | Capture pinned line references and Angular variants in both themes and three host widths |
| `npm run benchmark:line` | Measure actual Angular line mount/update and expanded-table cost |
| `npm run capture:bar` | Capture all four reference variants at three widths/two themes, plus narrow tooltips |
| `npm run typecheck` | Strict Angular/TypeScript compilation with `skipLibCheck: false` |
| `npm run check:consumer` | Check a built tarball's declarations in an isolated Angular consumer |
| `npm run check:runtime` | Build/run isolated client and SSR consumers in all three browser engines |
| `npm run benchmark:bar` | Measure actual Angular mount/update and compare production Canvas/SVG harnesses |
| `npm run check:bundle` | Check core/bar/root module boundaries and size budgets, excluding Angular/RxJS peers |
| `npm run check:ssr` | Check production server markup and hydration metadata after a build |
| `npm run format` / `npm run format:check` | Apply/check Prettier formatting |
| `npm run check` | Run formatting, builds, compilation, unit, declaration/runtime consumers, SSR, browser, and size checks |

The latest full check passes 75 unit/integration tests and 106 browser scenarios (plus two skipped CDP-only cases), including three-engine [site/theme](docs/experiments/SITE_THEME_ALIGNMENT.md), [gallery](docs/experiments/BAR_GALLERY_VISUAL_REVIEW.md), layout, and [numeric-formatting checks](docs/experiments/NG09_SHARED_FORMATTING.md). The [lifecycle validation report](docs/experiments/R04_R05_VALIDATION.md) retains the earlier resource baseline. `/validation` provides lifecycle scenarios; `/comparison` provides four reference variants and neutral theme tokens; `/formatting` checks locale/options/custom text and recovery; `/updates` checks immutable inputs/focus; `/retention` checks obsolete-model collection; `/away` verifies route cleanup. CI is configured for all three engines. No lint rules or coverage threshold are configured yet.

The [visual review](docs/experiments/R03_VISUAL_REVIEW.md) records 80 current captures and accepted bar differences. R01–R05, [R07 renderer/cost](docs/experiments/R07_RENDERER_COST.md), and [R08 packed consumption](docs/experiments/R08_PACKED_RUNTIME.md) pass for bar. Canvas meets the normal 200×3 benchmark target and the measured size budget. G1 passes; G2 requires the [R06 listening result](docs/experiments/R06_MANUAL_REVIEW.md). The user has deferred that human review to release acceptance; it no longer blocks development. Other chart families and release acceptance remain pending.

## Target environment

Angular 22 with strict TypeScript and template checking. The selected toolchain follows the supported ranges recorded in [research findings](docs/RESEARCH_FINDINGS.md#angular-22-toolchain).

## Bar feasibility milestone

Build a standalone Angular bar chart with typed data, light and dark themes, responsive resizing, tooltip, selectable legend, reduced motion, and safe destruction. Prove that it works in both a client application and an application using server rendering and hydration. Use its measured results to decide the MVP architecture.

NG09/NG10 implementation is complete for the current foundation/bar baseline; NG11 line charts are implemented; NG12 area charts are next. Deferred release evidence and family-wide acceptance remain open.

The `/line` page presents straight/smooth lines, optional points, and missing-value gaps using the same gallery design. `/line-validation` exercises line behavior and deferred hydration.

The home page presents the existing grouped, stacked, gradient, and horizontal bars in a neutral gallery with code/preview controls, calculated totals, copyable Angular examples, and light/dark themes. The `/playground` route retains the pinned Desktop/Mobile fixture and grouped settings. It retains layout, stack, gradient, state, update, and remount controls. `@ng-echarts/chart-library` is a private, experimental package identity. ECharts is a peer dependency; no package has been published. Adapted fixture data and colors are tracked in the provenance ledger with the upstream MIT notice.
