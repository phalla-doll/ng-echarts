# Angular chart implementation plan

Updated 12 November 2026. Begin with the Angular workspace and one bar chart. Expand to the other MVP families only after the feasibility and quality gates pass. The [product specification](PRODUCT_SPEC.md) owns behavior; this plan sequences the [backlog](BACKLOG.md) into reviewable increments.

## Initial scaffold

The workspace contains an Angular library, a zoneless SSR playground with client hydration configured, Vitest tests, Prettier, and production build scripts. `ChartFrame` provides a small presentation shell for validating the package boundary. Its local package name, `@ng-echarts/chart-library`, and API are experimental; both workspace and library packages are private.

The selected toolchain is Node 24.22.2, npm 11.19.1, Angular/CLI 22.2.6, TypeScript 6.0.3, RxJS 7.8.2, ECharts 6.1.0, and ng-packagr 22.2.0. The lockfiles pin the full dependency graphs. These versions fit Angular's [supported ranges](https://angular.dev/reference/versions). Reproduction commands and results belong in [R01 evidence](experiments/R01_TOOLCHAIN.md).

```text
projects/chart-library/src/
  lib/chart-frame.*            Shared presentation shell
  public-api.ts               Experimental package exports
projects/playground/
  src/app/                    SSR page and interactive fixtures
  public/                     Static assets
tools/
  consumer-fixtures/          Independent, locked declaration consumer
  check-consumer.mjs           Pack, install outside workspace, compile
  check-ssr.mjs                Production server response check
docs/experiments/              Results and gate decisions
```

The first bar slice now loads a modular Canvas adapter lazily and renders the pinned fixture. Adapted data and palette values are tracked in the [provenance ledger](UPSTREAM_PROVENANCE.md); React implementation bodies have not been copied. The [prototype report](experiments/BAR_PROTOTYPE.md) records behavior, captures, and remaining research.

## Delivery increments

Each increment should be reviewable independently. Keep source, tests, decision records, and affected acceptance entries together. The existing R&D estimates remain provisional until G2.

| Order | Tasks | Concrete changes | Completion evidence |
| --- | --- | --- | --- |
| 1 | NG01 / R01 | Strict library workspace, SSR playground, reproducible scripts, lockfiles, declaration consumer, CI configuration | Clean install, production builds, strict compiler checks, unit tests, isolated declarations, server response |
| 2 | NG02 | Inspect the pinned upstream bar examples and helpers; select a reference dataset and three widths; create a per-file reuse ledger | Exact example paths and revision, fixture provenance, reuse/rewrite/defer decisions, required notice text |
| 3 | NG03 / R02 | Define the renderer interface and provisional direct adapter; inspect at most one wrapper with compatible peers | Dependency comparison and initial decision; no final adapter claim |
| 4 | NG04 / R03 | Implement typed bar inputs, runtime validation, pure option builder, state precedence, theme tokens, reduced motion | Valid and deliberately invalid template examples, deterministic fixtures, reference captures, template-boundary review |
| 5 | NG05–NG06 / R04, R06 | Add resize coordination, update recovery, legend persistence, tooltip, keyboard controls, and equivalent table actions | Hidden-container and removal tests, async failure/race checks, focus/motion review, 100 teardown cycles |
| 6 | NG07 / R05 | Exercise browser initialization on real server routes, multiple/deferred charts, and navigation | Matching server/client markup, no hydration warnings, no duplicate or late instances, cleanup evidence |
| 7 | NG08 / R07, R08 | Compare Canvas/SVG; measure prescribed fixtures; build and run packed client and SSR consumers outside workspace | Raw timings, selected renderer and bundle budget, package contents, dependency contract, confirmed R02 decision; G1/G2 decision |
| 8 | NG09–NG13 | Complete shared behavior, then bar variants, line, area, and pie/donut | Family-specific tests and captures against the product specification |
| 9 | NG14–NG16 | Complete the acceptance matrix, integration docs, license/notices, and local release candidate | G3/G4 pass with final packed consumers and documented limits |

## Implementation boundaries

- Keep the public API provisional until Angular template inference and intentionally invalid input examples are proven. Do not expose raw renderer options to avoid deciding the typed API.
- Use `computed` for derived state, legend items, table presentation, and options. Keep DOM measurement, lazy imports, and renderer calls in the adapter; follow the [template conventions](TECHNICAL_ARCHITECTURE.md#templates-and-derived-state).
- Keep Angular ownership of titles, state messages, legend, and table separate from the dedicated renderer surface. An SSR response check does not prove browser hydration.
- Import only required ECharts modules when the adapter begins. Decide its peer/dependency contract through R08; the scaffold does not settle distribution.
- Preserve upstream notices before copying or adapting code. Pin comparisons to the existing reference revision; record later revisions separately.

## Developer workflow

Use Node from `.nvmrc`; `nvm use` is available if you use nvm. Then run:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build:lib
npm start
```

The playground runs at `http://localhost:4200`. In another terminal, `npm run watch:lib` rebuilds library changes. The playground resolves the built package in `dist/chart-library`, rather than library source files.

Before review, run `npm run check`. It checks formatting, production builds, strict Angular/TypeScript compilation, unit tests, isolated packed declarations and invalid-key examples, a production SSR response, and Playwright scenarios in Chromium, Firefox, and WebKit. `npm run test:watch` starts interactive unit tests; `npm run format` applies formatting. No ESLint configuration or numeric coverage gate exists yet.

The `/comparison` route exercises pure category-tick formatting and maps pinned neutral tokens; `/validation` exercises multiple/loading/hidden/deferred charts; `/away` exercises cleanup. Use `npm run reference:prepare` to install the separate reference harness and prepare pinned upstream source, then `npm run build` and `npm run capture:bar` for reproducible comparison images. See the [visual review](experiments/R03_VISUAL_REVIEW.md) and [browser evidence](experiments/R04_R05_VALIDATION.md).

## Gate status and next action

Only scaffold results can close NG01/R01. The package declaration fixture does not close R08, and SSR metadata does not close R05 or F10. Keep G1–G4 pending until their complete criteria in the [R&D plan](RND_PLAN.md#decision-gates) pass.

NG02's fixture/provenance record and NG03's initial adapter decision are recorded. R05 passes for workspace bar fixtures. Category ticks, comparison tokens, and documented plot/axis spacing now have a follow-up baseline. Next compare remaining bar variants and tooltip hierarchy, complete the broader R04 input matrix/heap attribution and R06 screen-reader/motion checks, then collect R07 renderer/performance and R08 packed-runtime evidence. Do not start line, area, or pie/donut while G1/G2 remain open.
