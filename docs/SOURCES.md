# ng-echarts research sources

Initial research checked 12 November 2026; calendar/timezone sources checked 13 November 2026. Primary sources support the observations below; the product scope, architecture preferences, effort ranges, and performance targets are project proposals.

## Upstream sources

Reference repository: [legions-developer/evilcharts](https://github.com/legions-developer/evilcharts). Initial research baseline: commit [`4c2dd7c9bae780703244265c9a4b509d40c055ad`](https://github.com/legions-developer/evilcharts/commit/4c2dd7c9bae780703244265c9a4b509d40c055ad), committed 29 October 2026.

| ID | Source | Supports |
| --- | --- | --- |
| S1 | [Pinned README](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/README.md) | Project positioning and React/Next.js targets |
| S2 | [Pinned package manifest](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/package.json) | Declared framework, engine, and TypeScript dependencies; ranges are not installed versions |
| S3 | [Pinned registry](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/registry.json) | Component inventory and derived entry/example counts |
| S4 | [Pinned ECharts bar implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-bar-chart.tsx) | React coupling and ECharts module registration in the proposed starting component |
| S5 | [Pinned license](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/LICENSE) | MIT terms and upstream copyright notice |
| S19 | [Pinned line implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-line-chart.tsx) | NG11 curve, marker, and gap reference; exact example mappings remain in its report |
| S20 | [Pinned area implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-area-chart.tsx) | NG12 independent fills, stacks, and selected reference variants |
| S21 | [Pinned pie implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-pie-chart.tsx) | NG13 browser data, pie/donut references, and documented implementation differences |

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
| S17 | [ECharts basic pie](https://echarts.apache.org/handbook/en/how-to/chart-types/pie/basic-pie/) | Proportional numeric values, radius configuration, and disabling equal sectors for zero totals |
| S18 | [ECharts donut](https://echarts.apache.org/handbook/en/how-to/chart-types/pie/doughnut/) | Inner/outer radii and label-overlap behavior |
| S22 | [ECharts calendar options](https://github.com/apache/echarts-doc/blob/master/en/option/component/calendar.md) and [6.1.0 calendar implementation](https://github.com/apache/echarts/blob/6.1.0/src/coord/calendar/Calendar.ts) | Date ranges, calendar sizing/first-day semantics and local date arithmetic; NG19 retains pure date identity and native-table fallback |
| S23 | [IANA timezone source, Australasia](https://github.com/eggert/tz/blob/main/australasia) | Pacific/Apia's skipped civil date; verified native fallback in the calendar browser scenarios |
| S24 | [Angular dependent state with linkedSignal](https://angular.dev/guide/signals/linked-signal) | Writable state derived from changing inputs, with previous-value reconciliation; checked 15 November 2026 |
| S25 | [Angular effects](https://angular.dev/guide/signals/effect) | Prefer computed/dependent signals for state derivation; effects bridge imperative APIs; checked 15 November 2026 |
| S26 | [Angular afterRenderEffect](https://angular.dev/api/core/afterRenderEffect) | Explicit render phases and justified mixed DOM reads/writes; checked 15 November 2026 |
| S27 | [Angular feature organization](https://angular.dev/style-guide#organize-your-project-by-feature-areas) | Feature directories with colocated source, styles, templates and tests; checked 15 November 2026 |
| S28 | [ECharts line/area options](https://github.com/apache/echarts-doc/blob/master/en/option/series/line.md) | Area fills use the Line engine; whole-line/area event identity; checked 15 November 2026 against the implemented rc.22 contract |
| S29 | [ECharts bar options](https://github.com/apache/echarts-doc/blob/master/en/option/series/bar.md) | Named stack option entry; separate project bar/area namespaces and raw-value semantics are local design decisions verified by tests |
| S30 | [npm trusted publishers](https://docs.npmjs.com/trusted-publishers/) | GitHub OIDC permissions, supported runner setup and provenance; checked 15 November 2026; actual project registration/upload receipts are in PUBLICATION.md |
| S31 | [npm trust CLI](https://docs.npmjs.com/cli/v11/commands/npm-trust/) | Repository/workflow/environment mapping and publishing permissions; checked 15 November 2026 with pinned npm 11.19.1 |

Recheck platform documentation when development begins and when compatibility ranges change. Preserve the pinned upstream revision for reproducible comparisons, even if a later revision is evaluated separately.

## Research boundaries

Initial research inspected repository metadata, registry structure, source excerpts, and official documentation. The Angular scaffold and initial bar checks are recorded in the [R01 report](experiments/R01_TOOLCHAIN.md) and [prototype report](experiments/BAR_PROTOTYPE.md). Adapted fixture data and palette values are listed in the [provenance ledger](UPSTREAM_PROVENANCE.md); no React implementation bodies have been copied into the Angular library. Those initial observations did not establish chart compatibility, measured performance, completed accessibility compliance or npm account rights. Current implementation, benchmark and package evidence is indexed in [compatibility](COMPATIBILITY.md); [rc.22 publication](PUBLICATION.md#rc22-oidc-publication) records the selected identity and verified registry access. Human acceptance remains pending.

Current visual and browser evidence is recorded in the [R03 review](experiments/R03_VISUAL_REVIEW.md) and [R04/R05 report](experiments/R04_R05_VALIDATION.md). The reference harness executes unmodified upstream React code separately from Angular library builds. Its font/CSS/build context is documented so the captures are not mistaken for the full upstream website.

Family implementation evidence now includes [NG11 line](experiments/NG11_LINE_CHART.md), [NG12 area](experiments/NG12_AREA_CHART.md), and [NG13 pie/donut](experiments/NG13_PIE_CHART.md). Their reports pair exact pinned examples with current Angular captures and record accepted differences. The [family evidence index](ACCEPTANCE_MATRIX.md#implemented-family-evidence) distinguishes recorded implementation checks from pending full acceptance.

Sankey source review (14 November 2026): [Apache Sankey options](https://github.com/apache/echarts-doc/blob/master/en/option/series/sankey.md); installed ECharts 6.1.0 Sankey layout/series/view modules. [Local interpretation and limits](experiments/NG19_SANKEY_CHART.md).
