# Angular chart implementation plan

Current delivery (17 November 2026): npm `next` is rc.30 and `latest` remains rc.18. The exact 167,101-byte rc.30 archive is published and fresh registry consumers pass; preserve rc.29 and every earlier archive. Published-package delivery source `e09aa7f` passes [all six CI jobs](https://github.com/phalla-doll/ng-echarts/actions/runs/44015944947): 342 unit tests, 584 browser passes/four expected skips, exact consumers, reproducibility, Pages and unchanged budgets. The [increment/delivery record](experiments/RC30_RADAR_LEGENDS.md) owns actual receipts; the [Pages record](GITHUB_PAGES.md) owns the separately sealed demo identity. Human F09/R06/G2/G3/G4 remain deferred/pending.

Historical increment sections below retain their original version-specific evidence and limits; use the current delivery summary for npm, candidate and deployment status.

Local continuation: rc.32 consolidates internal lifecycle and color parsing while retaining descriptor/theme validation policies. It remains unpublished; npm next is rc.30/latest rc.18 and the demo retains verified control-styling source `0e40644`. The [payload cleanup record](experiments/RC32_PAYLOAD_REVIEW.md) owns current measurements and verification; its bounded savings do not establish broad room for new engine features.

## Immediate next work

1. Obtain independent Linux CI for local rc.32 and separate delivery receipts before publication or redeployment. Preserve every earlier archive.
2. Evaluate a focused opt-in interaction entry and further root payload reduction before general-purpose library zoom or graphical two-way brushing. Keep every existing root/core cap unchanged. Application-owned dashboard zoom and bidirectional month selection are implemented.
3. Design one bounded NG20 graphical-linking increment once its payload and interaction envelope are agreed. Disjoint selection and arbitrary family linking remain subsequent work.
4. Resume F09/R06 human interpretation when the user lifts the existing deferral; keep G2/G3/G4 pending until its evidence exists.

## Historical delivery plan


Initial implementation plan updated 14 November 2026; current delivery status reconciled 16 November 2026. Begin with the Angular workspace and one bar chart. Expand from the technically proven bar baseline while tracking outstanding release quality checks. The [product specification](PRODUCT_SPEC.md) owns behavior; this plan sequences the [backlog](BACKLOG.md) into reviewable increments.

## Initial scaffold

The workspace contains an Angular library, a zoneless SSR playground with client hydration configured, Vitest tests, Prettier, and production build scripts. `ChartFrame` provides a small presentation shell for validating the package boundary. Its public package name is `@mantha911/ng-echarts` and its API remains experimental. The workspace is private; the library publishes prereleases to npm under `next`.

The selected toolchain is Node 24.22.2, npm 11.19.1, Angular/CLI 22.2.6, TypeScript 6.0.3, RxJS 7.8.2, ECharts 6.1.0, and ng-packagr 22.2.0. The lockfiles pin the full dependency graphs. These versions fit Angular's [supported ranges](https://angular.dev/reference/versions). Reproduction commands and results belong in [R01 evidence](experiments/R01_TOOLCHAIN.md).

```text
projects/chart-library/
  core/src/                   Shared contracts and presentation shell
  bar/src/                    Bar implementation and colocated tests
  line/src/                   Line implementation and colocated tests
  area/src/                   Area implementation and colocated tests
  pie/src/                    Pie/donut implementation and colocated tests
  src/public-api.ts           Compatibility exports
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
npm start -- --port 4310
```

The playground is reviewed at `http://127.0.0.1:4310`, leaving Angular's default port available for other projects. In another terminal, `npm run watch:lib` rebuilds library changes. The playground resolves the built package in `dist/chart-library`, rather than library source files.

Before review, run `npm run check`. It checks formatting, production builds, strict Angular/TypeScript compilation, unit tests, isolated packed declarations and invalid-key examples, a production SSR response, Playwright scenarios in Chromium/Firefox/WebKit, isolated client/SSR runtime consumers, and the linked package budget. Run the affected `npm run benchmark:bar`, `benchmark:line`, `benchmark:area`, or `benchmark:pie` separately on the reference machine after relevant performance changes. Family-specific `capture:*` commands follow reference preparation and a production build; see the [harness guide](../tools/reference/README.md). `npm run test:watch` starts interactive unit tests; `npm run format` applies formatting. No ESLint configuration or numeric coverage gate exists yet.

The `/comparison` route exercises pure category-tick formatting and maps pinned neutral tokens; `/validation` exercises multiple/loading/hidden/deferred charts; `/away` exercises cleanup. Use `npm run reference:prepare` to install the separate reference harness and prepare pinned upstream source, then `npm run build` and `npm run capture:bar` for reproducible comparison images. See the [visual review](experiments/R03_VISUAL_REVIEW.md) and [browser evidence](experiments/R04_R05_VALIDATION.md).

## Gate status and next action

Earlier rc.24 delivery checkpoint: [published rc.24](experiments/RC24_PUBLICATION.md) includes named composed bar/area stacks, horizontal layout and independent labeled value axes. Its preserved archive matches across macOS/Linux warm and clean builds; exact-main [CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43737237117) and fresh registry consumers pass. The implementation records 335 unit tests and 476 browser passes with four expected skips. The [demo record](GITHUB_PAGES.md) owns its separate deployed identity. The separate [rc.25 payload increment](experiments/RC26_PAYLOAD_REDUCTION.md) adds bounded root/core headroom work before shared zoom and bidirectional selection; human F09/R06/G2/G3/G4 remain deferred/pending.

The [playground layout review](experiments/PLAYGROUND_LAYOUT_REVIEW.md) adds a responsive navigation shell, grouped chart settings, preview/code views, and local typography without expanding the library scope. It includes before/after captures and three-engine interface checks. Comparison and benchmark fixtures preserve their full-width measurement conditions.

R01–R05, R07, and R08 now pass for bar, including real packed-runtime consumers. G1 passes; G2 remains pending for the human R06 listening review. G3/G4 still require human interpretation and complete release acceptance; automated cross-family and rc.22 artifact checks are recorded below. A declaration fixture or SSR response alone would not establish those results; see the [R&D gates](RND_PLAN.md#decision-gates).

On 12 November 2026 the user deferred the [R06 human listening review](experiments/R06_MANUAL_REVIEW.md) and authorized continued development. R06 and G2 remain pending; they no longer block NG09–NG13. This direction supersedes earlier G2-before-expansion instructions in `AGENTS.md` and historical reports. Retain the human review before G3/G4 release acceptance.

Current: [NG14 automated cross-family acceptance](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) is reconciled; human F09 interpretation remains pending before G3. [NG15 documentation](experiments/NG15_DOCUMENTATION.md) is complete for the experimental package after the user continued development; NG16 now has a verified private local candidate and exact-artifact checks; its complete release gate remains pending. NG13 pie/donut has [implementation evidence](experiments/NG13_PIE_CHART.md). NG12 area charts have [implementation evidence](experiments/NG12_AREA_CHART.md). NG11 multi-series line charts now have [implementation evidence](experiments/NG11_LINE_CHART.md). The [NG09/NG10 acceptance review](experiments/NG09_NG10_ACCEPTANCE.md) records implementation completion for the current foundation/bar baseline, with cross-family acceptance and deferred human release evidence still open. Continue automated accessibility, lifecycle, and hydration checks throughout. The local review server uses port 4310.

NG09 now has a [shared numeric-formatting increment](experiments/NG09_SHARED_FORMATTING.md): locale/options/custom callbacks produce consistent numeric text across the chart and native table. The `/formatting` route demonstrates the API and failure recovery. The [package-boundary increment](experiments/NG09_PACKAGE_BOUNDARIES.md) now adds measured `/core` and `/bar` entries, compatible root exports, and strict installed-package checks before additional renderer families are loaded.

The user selected a reference-aligned gallery using existing bars first. The [gallery correction](experiments/BAR_GALLERY_VISUAL_REVIEW.md) moves the original workspace to `/playground` and makes `/` a neutral, dark-by-default gallery. It adds no chart-family implementation or library API. That gallery snapshot predates the completed NG09 package-boundary increment.

The follow-up [site alignment](experiments/SITE_THEME_ALIGNMENT.md) extends the approved visual language to the remaining pages and adds basic setup/component documentation. One shared theme now spans navigation; comparison and benchmark plots retain their measurement conditions. These preview docs do not complete the full NG15 API/compatibility acceptance, and no planned chart family is presented as implemented.

The [bar API reference](BAR_CHART_API.md) now lists implemented inputs/defaults, outputs, formatting, state behavior, versions, and limits; its actual integration example is compiled by the isolated consumer check. The combined layout/stack/fill checklist covers all eight combinations in both themes. This closes the NG09/NG10 implementation review and makes NG11 the next development task without closing G2/G3/G4.

NG11 adds `/line`, `/line-validation`, a focused `/line` package entry, and shared Cartesian policy now demonstrated by bar and line. The [line API](LINE_CHART_API.md) and generated gallery examples are compiled against the packed artifact; source/visual, timing, package, and browser evidence are recorded in the NG11 report. The following NG12 area increment is now recorded below.

NG12 adds `/area`, `/area-validation`, a focused `/area` entry, and shared pure curve options/event decoding demonstrated by line and area. The [area API](AREA_CHART_API.md), generated examples, pinned-source comparisons, signed-stack/gap browser checks, runtime consumers, and performance results are recorded in the NG12 report. The following NG13 pie/donut increment is recorded below; full-MVP and deferred release evidence remain open.

NG13 adds a focused `/pie` entry, `/pie` gallery, `/pie-validation`, and a single-measure `ChartMeasure<T>` contract with category-row visibility. The [API guide](PIE_CHART_API.md) and [NG13 report](experiments/NG13_PIE_CHART.md) record zero/negative rules, responsive donut radii, labels, package budgets, source comparisons and verification.

The [NG14 cross-family review](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) now reconciles F01–F10 evidence, raises every family's lifecycle scenario to 100 cycles in all three browsers, checks explicit palette refreshes on actual painted plots, and adds per-family invalid-binding assertions. `npm run benchmark:acceptance` records normal/stress mount/update, legend and resize timings on the actual Angular components, with separate cold/table costs. Run it separately from other workloads. The human interpretation review remains deferred; NG14/G3 and public API freeze remain pending until it is recorded. NG15 now records its completed documentation/fresh-consumer check in the report below; NG16 owns final artifact acceptance.

NG15 adds the [installation](INSTALLATION.md), [integration](INTEGRATION_GUIDE.md), and [compatibility](COMPATIBILITY.md) guides, a root-bootstrap-compatible first chart, and a self-contained packaged README. The [documentation report](experiments/NG15_DOCUMENTATION.md) records API input/output inventory, exact installed-guide compilation, a new CLI-generated SSR consumer and three-browser checks. `npm run check:docs` is part of `npm run check`. Human NG14/F09 and G3/G4 remain open; NG16 automated candidate evidence is recorded below.

The requested [GitHub Pages preview](GITHUB_PAGES.md) is deployed from a dedicated compiled-output branch. `build:pages` prerenders the existing demo, `check:pages` verifies its repository subpath in all three engines, and `deploy:pages` publishes the checked clean, committed snapshot already pushed to current remote main; dirty snapshots remain local-only. CI runs workspace/exact-candidate checks, Pages/performance checks and one browser job per engine separately; the required aggregate `check` passes only when every job succeeds. Demo publishing remains an explicit guarded command. The preview does not change the package identity, supported API scope or release gates.

The requested [four-family visual audit](experiments/VISUAL_AUDIT.md) compares the gallery with official Apache ECharts examples and the approved EvilCharts block direction. It refines narrow numeric axes, plotting insets, native controls, import readability/focus and pie summary semantics. `npm run capture:visual` reproduces the family/theme/width matrix and tooltip evidence; three-engine regression covers the interactions. This presentation increment leaves NG16 and deferred human release evidence separate.

NG16 prepares `0.1.0-rc.0` with user-selected MIT licensing for original library code, preserved upstream/dependency notices, package metadata and a content/checksum inventory. The [local candidate report](experiments/NG16_LOCAL_RELEASE.md) records ordinary-mode regression and three exact-tarball consumer stages. `release:local` packs once and verifies identical candidate bytes across strict declarations, a fresh guide application and client/SSR consumers. The [release checklist](RELEASE_CHECKLIST.md) preserves deferred human acceptance and separates NG22 public identity/publication.


## NG17 first composed increment

The user authorized continuation after NG16. Start with vertical unstacked bars and lines on shared category/value axes, comparable units and a discriminated series contract. Reuse the existing Cartesian state/lifecycle/control policies; retain separate focused/lazy registration and unchanged bundle budgets. The [composed API](COMPOSED_CHART_API.md) and [NG17 report](experiments/NG17_COMPOSED_CHART.md) record this increment. Later dual-axis, stacked, horizontal and area composition require their own design/checklist. rc.1 distinguishes this new API from the preserved rc.0 artifact. Human F09/R06/G2/G3/G4 remain pending.


## NG20 first linked-chart integration

After NG17 the user prioritized linked charts. The first scope uses existing raw point events and application-owned signals to link a monthly overview to device share. It defines plot/table/select equivalence, explicit all-month reset, stable-ID reconciliation, local legends and focus preservation. The [guide](LINKED_CHARTS.md) and [report](experiments/NG20_LINKED_CHARTS.md) record the implementation and targeted verification. Range brushing and broader two-way/hover/zoom designs remain open. This increment reuses the exact rc.1 library without changing its public surface or dependency graph; human gates remain pending.

The user then prioritized persistent overview feedback. The [selection increment](experiments/LINKED_SELECTION_FEEDBACK.md) binds an optional controlled `BarChart.selectedRowId` to the same application signal, draws a quiet band and keeps the matching native table row current. It uses existing renderer components; no ECharts instance is exposed. A separate private rc.2 candidate distinguishes the new input from the retained rc.1 artifact. That increment compiled its guide against rc.2; the [current guide](LINKED_CHARTS.md) follows the range increment below. Range brushing and human release evidence remain pending.

The next approved increment implements [inclusive native month ranges](experiments/NG20_MONTH_RANGE.md) before graphical brushing. Define stable endpoint IDs, supplied-order slicing, crossing and endpoint-removal policy first; derive the companion data and plural bar feedback from that same signal. Verify keyboard/type-ahead, focus recovery, touch Reset, all themes/widths and data replacement through the installed rc.3 artifact and Pages preview. Preserve the scalar API and previous candidate evidence. Graphical brushing and human release acceptance remain pending.

The following [graphical-range increment](experiments/GRAPHICAL_RANGE_SELECTION.md) builds on the native contract: explicit arming, snapped local draft, inclusive release-only output, cancellation/stale-data guards and one application-owned commit path. Use public engine coordinate APIs in the browser adapter and retain native keyboard fields. Verify both orientations/stack/fill themes, touch scrolling, focus and cleanup; compile the displayed guide against a distinct rc.4 artifact, update the preview and preserve earlier candidates. Shared zoom/hover and disjoint/two-way selection remain deferred.

The user next approved [preview deployment hardening](experiments/PREVIEW_DEPLOYMENT_HARDENING.md). Finalize the pending concept gallery, capture immutable build-time source and output identities, require complete local browser verification and clean/current pushed source for publishing, then verify the clean public deployment. Preserve the exact rc.4 artifact and reconcile CI evidence without closing human release gates.


## NG18 radar first increment

The user-approved [radar increment](experiments/NG18_RADAR_CHART.md) adds the focused `/radar` Angular entry and a site-aligned demo with explicit dimension maxima, stable comparisons, missing-data policy, native scale/value table and vertex/table actions. The [API](RADAR_CHART_API.md) defines the bounded contract. The subsequent radial-progress increment below is implemented. The compatibility root and four-family MVP retain their scope; private rc.5 is separate from the preserved rc.4 artifact. Human F09/R06/G2/G3/G4 remain pending. This private-origin increment now ships in [public rc.18](PUBLICATION.md#first-publication-result).


## NG18 radial progress increment

The user-approved [radial progress increment](experiments/NG18_RADIAL_PROGRESS.md) adds the focused `/radial` Angular entry and two demo examples. Required scalar value and explicit positive maximum supply native progress semantics, visible formatted values and a noninteractive ring. The [API](RADIAL_PROGRESS_API.md) defines zero/null/invalid states, formatting, motion and SSR behavior. This advances the private candidate to rc.6 while preserving rc.5 and earlier artifacts and the existing compatibility root. Native progress provides the scalar alternative; legends, point actions and a data table are inapplicable. Human interpretation and public release gates remain pending.

NG19 calendar first increment follows the demo-performance checkpoint: strict date-only/single-year contract, fixed scale and missing-vs-zero semantics, focused lazy adapter, native daily actions, matching demo/docs and isolated artifact verification. [Evidence](experiments/NG19_CALENDAR_HEATMAP.md) distinguishes passing checks from deferred Sankey, broader ranges and human acceptance.


## NG19 Sankey first increment

The next NG19 increment adds a focused experimental `/sankey` entry and visitor-flow demo, with typed node/link IDs, directed acyclic validation, separate incoming/outgoing totals, native table actions and lazy Canvas rendering. The [API](SANKEY_CHART_API.md) defines the bounded 24-node/60-link contract; the [implementation record](experiments/NG19_SANKEY_CHART.md) records verification and scope. Private rc.10 preserves rc.9, rc.8 and earlier artifacts. Circular/vertical/drag variants, broader linked interactions and human F09/R06/G2/G3/G4 acceptance remain pending.

Private rc.11 combines the completed [presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md) with Sankey and independent lazy chart loading. It preserves rc.10 and earlier archives. At rc.11 the combined-root aggregate allowance was 218,000 gzip / 186,000 Brotli bytes; emitted root-frame orphan chunks allow 201,500 / 175,000, with zero reachable engine modules. Focused/core and demo route guards remain unchanged. Publication was pending at this private checkpoint; [public rc.18](PUBLICATION.md#first-publication-result) is now verified. Human acceptance remains pending.

Historical rc.12 delivery checkpoint: [Sankey/presentation/WebKit demo deployment](GITHUB_PAGES.md#rc11-sankey-presentation-and-webkit-deployment) is verified publicly in all three engines. Private rc.12 corrects documentation only, preserving rc.11 runtime/declarations and all earlier archives. At that checkpoint, human F09/R06/G2/G3/G4 and public package publication were pending. The [candidate checklist](RELEASE_CHECKLIST.md) now records the completed rc.18 publication while preserving pending human gates. The 353-browser full regression and later 30-scenario WebKit check are distinct recorded scopes.


## NG20 transient month previews

The user-authorized [month-preview follow-up](experiments/NG20_MONTH_PREVIEWS.md) adds opt-in bar pointer/table-focus previews and one-way temporary device-share context introduced in rc.13 and corrected in the preserved private rc.15. Committed period/range feedback, totals and local legends stay independent; keyboard actions can commit through the existing point event. The browser adapter owns delegated listeners, touch guards and cleanup. Shared zoom and bidirectional linking remain open; [public rc.18 publication](PUBLICATION.md#first-publication-result) is complete. The mobile range button uses an explicit tap policy; the original report retains the local/CI evidence available at that checkpoint. Current release-source CI is recorded in the [publication result](PUBLICATION.md#first-publication-result). Human F09/R06/G2/G3/G4 remain pending, with calendar/Sankey checklists now included.


The [combined rc.16 checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) verifies the month-preview behavior together with the completed resize/animation/navigation changes: 266 unit tests, 380 browser passes with four expected skips, exact artifact consumers and unchanged focused/core/route guards. Earlier archives and human release gates remain unchanged.


The [rc.17 release follow-up](experiments/RC17_RELEASE_REVIEW.md) includes pre-hydration theme inheritance and separate CI browser jobs. Exact candidate verification is recorded separately from the preserved rc.16 checkpoint. The [human result sheet](experiments/RC17_HUMAN_REVIEW.md) and [NG22 publication plan](PUBLICATION.md) keep listening evidence, public identity and registry access explicit. Human F09/R06/G2/G3/G4 remain pending.


The [NG22 public prerelease](experiments/NG22_PUBLIC_PRERELEASE.md) uses `@mantha911/ng-echarts@0.1.0-rc.18` with npm public access and the `next` tag. The user selected the authenticated personal scope and explicitly skipped the listening session while requesting this experimental publication. Earlier private candidates remain preserved; human F09/R06/G2/G3/G4 remain pending.


NG22 first public prerelease: [`@mantha911/ng-echarts@0.1.0-rc.18`](experiments/NG22_PUBLIC_PRERELEASE.md#completed-publication) is published and verified from the registry in strict/docs/client/SSR consumers across all three engines. The [registry receipt](experiments/public-rc18/registry-verification.json) preserves actual tags (`next` plus npm’s initial `latest` alias). Human F09/R06/G2/G3/G4 remain pending under the user’s explicit deferral; no stable API acceptance is claimed.


## rc.19 delivery and NG17 named bar stacks

The user approved all recommended follow-ups on 15 November. Preserve the exact rc.19 performance/Angular checkpoint, complete its artifact checks and registry delivery when authenticated, and reconcile the already-live demo identity. The [rc.19 report](experiments/RC19_RELEASE_REVIEW.md) records exact artifact evidence. The separate rc.20 [stacked-composition increment](experiments/NG17_STACKED_COMPOSED.md) adds optional bar stack names, same-sign accumulation, native raw values and independent supplied lines on the existing shared scale. At that checkpoint dual axes, horizontal composition and area composition remained subsequent work; the area increment below completes the last of those. The user explicitly continued the human deferral; use the [current sheet](experiments/RC20_HUMAN_REVIEW.md) without changing F09/R06/G2/G3/G4 until actual listening evidence exists.


## NG17 composed-area follow-up

The user authorized the [area composition increment](experiments/NG17_COMPOSED_AREAS.md) after publishing the preserved rc.21 archive. Published rc.22 adds typed area descriptors, gradient/solid fills and separate same-sign area stack groups on the existing shared category/value scale. Supplied lines and point/table values remain raw, missing observations remain missing, and immutable kind changes clear obsolete presentation. The pure area-fill helper is shared with standalone areas; no additional engine or dependency is introduced. The linked report owns actual source, consumer, browser, performance and candidate results. Public next is rc.22 after the exact OIDC publication; human F09/R06/G2/G3/G4 remain deferred/pending.

## Composed dashboard and horizontal continuation

The user approved the three recommended follow-ups: NG20 composed-to-detail integration, a realistic npm-installed dashboard pilot, and NG17 horizontal composition. The [dashboard guide](COMPOSED_DASHBOARD.md) defines the app-owned contract and source reproduction; the [increment record](experiments/NG20_COMPOSED_DASHBOARD.md) owns actual test/consumer/candidate evidence. The dashboard supports published rc.22; new library layout behavior belongs to local rc.23. Keep npm/deployment identities separate, preserve archived candidates and leave human release gates pending. At that checkpoint, dual axes and broader linking remained subsequent work; the rc.24 continuation below implements bounded independent axes.

## rc.23 registry delivery and rc.24 explicit axes

The user approved rc.23 npm delivery, declaration stability and bounded dual axes. [rc.23](experiments/RC23_PUBLICATION.md) is published and verified with next rc.23/latest rc.18. The separate [rc.24 increment](experiments/NG17_DUAL_AXES.md) implements labeled independent value axes, isolated numeric formatting, raw native actions and stack validation, with explicit declaration types and warm/clean/cross-platform artifact checks. Preserve prior archives, budget limits, engine boundaries and pending human gates.

Final review advances the local candidate to rc.27 after restoring shared radar/composed scale-description styling. The [review record](experiments/RC27_FINAL_REVIEW.md) owns regression, artifact and readiness evidence; rc.26 and all earlier archives remain preserved.

## Shared month-window continuation

The user approved all four recommendations on 16 November: payload work, rc.28 delivery, shared zoom/bidirectional selection and status reconciliation. [rc.28](experiments/RC28_PUBLICATION.md) is published from exact successful main CI. The [rc.29 continuation](experiments/RC29_LINKED_WINDOW.md) keeps runtime changes separate from that archive and implements application-owned windowing before any ECharts zoom registration: stable inclusive endpoints, full-history trend calculation, native controls and device/month drill-down. General-purpose library zoom remains separate; preserve caps, archive identities and pending human gates.
