# ng-echarts

An Angular 22 chart component library inspired by EvilCharts, using Apache ECharts for rendering and TypeScript for its public API.

Status: experimental bar prototype. Updated 12 November 2026. The Angular library and SSR playground now render bars with native controls; feasibility and product-quality gates remain pending.

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
| [Lifecycle and hydration validation](docs/experiments/R04_R05_VALIDATION.md) | Three-browser results, real teardown cycles, accessibility snapshots, and open checks |
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
npm start
```

Open `http://localhost:4200`. In another terminal, run `npm run watch:lib` while editing the library. The playground consumes its built package from `dist/chart-library`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the library and production browser/server playground |
| `npm test` | Run library and playground Vitest tests once |
| `npm run test:browser` | Run Chromium, Firefox, and WebKit scenarios against the production SSR build |
| `npm run reference:prepare` | Prepare the isolated pinned React reference source and build its harness |
| `npm run capture:bar` | Capture both implementations at three widths in both themes after preparing/building |
| `npm run typecheck` | Strict Angular/TypeScript compilation with `skipLibCheck: false` |
| `npm run check:consumer` | Check a built tarball's declarations in an isolated Angular consumer |
| `npm run check:ssr` | Check production server markup and hydration metadata after a build |
| `npm run format` / `npm run format:check` | Apply/check Prettier formatting |
| `npm run check` | Run formatting, builds, compilation, unit, package, SSR, and browser checks |

The latest [validation report](docs/experiments/R04_R05_VALIDATION.md) records 22 unit/integration tests and 30 passing browser checks, including multiple/deferred hydration and real resource cleanup. `/validation` provides the dedicated scenarios; `/away` verifies route cleanup. CI is configured for all three engines. No lint rules or coverage threshold are configured yet.

The [visual review](docs/experiments/R03_VISUAL_REVIEW.md) records 12 upstream/Angular captures and outstanding axis/spacing differences. R05 passes for the tested workspace bar paths; R03, R04, R06–R08 and G1/G2 remain open. The full leak audit, manual screen-reader review, performance/renderer selection, and packed-runtime consumers are still required.

## Target environment

Angular 22 with strict TypeScript and template checking. The selected toolchain follows the supported ranges recorded in [research findings](docs/RESEARCH_FINDINGS.md#angular-22-toolchain).

## First development milestone

Build a standalone Angular bar chart with typed data, light and dark themes, responsive resizing, tooltip, selectable legend, reduced motion, and safe destruction. Prove that it works in both a client application and an application using server rendering and hydration. Use its measured results to decide the MVP architecture.

The playground renders the pinned Desktop/Mobile bar fixture, with controls for themes, layouts, stacks, gradients, states, updates, and remounting. `@ng-echarts/chart-library` is a private, experimental package identity. ECharts is a peer dependency; no package has been published. Adapted fixture data and colors are tracked in the provenance ledger with the upstream MIT notice.
