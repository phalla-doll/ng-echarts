# ng-echarts research sources

Checked 12 November 2026. Primary sources support the observations below; the product scope, architecture preferences, effort ranges, and performance targets are project proposals.

## Upstream sources

Reference repository: [legions-developer/evilcharts](https://github.com/legions-developer/evilcharts). Initial research baseline: commit [`4c2dd7c9bae780703244265c9a4b509d40c055ad`](https://github.com/legions-developer/evilcharts/commit/4c2dd7c9bae780703244265c9a4b509d40c055ad), committed 29 October 2026.

| ID | Source | Supports |
| --- | --- | --- |
| S1 | [Pinned README](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/README.md) | Project positioning and React/Next.js targets |
| S2 | [Pinned package manifest](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/package.json) | Declared framework, engine, and TypeScript dependencies; ranges are not installed versions |
| S3 | [Pinned registry](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/registry.json) | Component inventory and derived entry/example counts |
| S4 | [Pinned ECharts bar implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-bar-chart.tsx) | React coupling and ECharts module registration in the proposed starting component |
| S5 | [Pinned license](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/LICENSE) | MIT terms and upstream copyright notice |

The registry count includes every entry in `items`. The ECharts example count filters names beginning with `ex-` and containing `echarts`. There are fourteen entries whose names begin with `echarts-`: five shared components and nine chart components.

## Platform sources

| ID | Source | Supports |
| --- | --- | --- |
| S6 | [Angular version compatibility](https://angular.dev/reference/versions) | Angular 22 Node.js, TypeScript, RxJS, and browser baseline requirements |
| S7 | [Angular server and hybrid rendering](https://angular.dev/guide/ssr) | Server/browser boundaries and SSR integration planning |
| S8 | [Creating Angular libraries](https://angular.dev/tools/libraries/creating-libraries) | Library tooling, public APIs, entry points, and package naming guidance |
| S9 | [ECharts modular imports and TypeScript options](https://echarts.apache.org/handbook/en/basics/import/) | Modular chart registration, renderer imports, and typed option composition |
| S10 | [ECharts container size and lifecycle](https://echarts.apache.org/handbook/en/concepts/chart-size/) | Container dimensions, resize behavior, and disposal |
| S11 | [Angular hydration](https://angular.dev/guide/hydration) | Matching server/client markup, DOM ownership risks, and limitations of hydration workarounds |
| S12 | [Angular component lifecycle](https://angular.dev/guide/components/lifecycle) | Render callbacks and lifecycle planning; integration timing still requires R05 evidence |
| S13 | [Angular template complexity guidance](https://angular.dev/style-guide#avoid-overly-complex-logic-in-templates) and neighboring component conventions | Simple template expressions, TypeScript derivations, and component member conventions |
| S14 | [Angular computed signals](https://angular.dev/guide/signals#computed-signals-are-both-lazily-evaluated-and-memoized) | Lazy cached derivation, tracked dependencies, and the distinction between derived state and side effects |
| S15 | [Angular unit testing](https://angular.dev/guide/testing) | CLI Vitest integration and DOM-based unit test setup |
| S16 | [Angular incremental hydration](https://angular.dev/guide/incremental-hydration) | Server-rendered deferred content, hydration triggers, and event replay |

Recheck platform documentation when development begins and when compatibility ranges change. Preserve the pinned upstream revision for reproducible comparisons, even if a later revision is evaluated separately.

## Research boundaries

Initial research inspected repository metadata, registry structure, source excerpts, and official documentation. The Angular scaffold and initial bar checks are recorded in the [R01 report](experiments/R01_TOOLCHAIN.md) and [prototype report](experiments/BAR_PROTOTYPE.md). Adapted fixture data and palette values are listed in the [provenance ledger](UPSTREAM_PROVENANCE.md); no React implementation bodies have been copied into the Angular library. Full chart compatibility, measured performance, completed accessibility compliance, npm name availability, and release timing remain subject to the implementation gates.

Current visual and browser evidence is recorded in the [R03 review](experiments/R03_VISUAL_REVIEW.md) and [R04/R05 report](experiments/R04_R05_VALIDATION.md). The reference harness executes unmodified upstream React code separately from Angular library builds. Its font/CSS/build context is documented so the captures are not mistaken for the full upstream website.
