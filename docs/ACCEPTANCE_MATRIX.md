# ng-echarts acceptance matrix

Updated 13 November 2026. The [NG14 cross-family review](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) reconciles automated evidence across all four families. Full-MVP product acceptance remains pending for human interpretation. This matrix connects the [product specification](PRODUCT_SPEC.md) to experiments and delivery tasks; the specification owns the detailed criteria and numeric targets.

The [R01 report](experiments/R01_TOOLCHAIN.md) records passing builds, strict compilation, isolated declarations, unit integration tests, and an SSR response check. Those initial scaffold results alone contribute to F01/package research without completing chart inputs, browser hydration, R08, or a gate.

The [initial bar report](experiments/BAR_PROTOTYPE.md) adds valid/invalid packed-template checks, data/state/control tests, and a passing single-chart Chromium SSR/hydration path. At that initial snapshot it contributed evidence to F01–F10 for bar only, leaving broader checks open. The current reports below record their later completion; the snapshot alone closed no requirement or gate.

Current bar evidence: [R03](experiments/R03_VISUAL_REVIEW.md) accepts four reference variants and tooltip hierarchy; [R04/R05](experiments/R04_R05_VALIDATION.md) pass update/focus, resource/retention, and hydration/navigation scenarios. [R07](experiments/R07_RENDERER_COST.md) passes normal Angular timing targets and selects Canvas with a measured size budget. [R08](experiments/R08_PACKED_RUNTIME.md) builds and runs installed tarballs in isolated client and SSR applications across all three engines. R02 is confirmed and G1 passes. R06 automated checks pass, but its [human listening result](experiments/R06_MANUAL_REVIEW.md) and G2 remain pending. NG14 records the family-by-family reconciliation below; human F09 interpretation still prevents full acceptance. The user deferred human listening on 12 November 2026: it no longer blocks development, but remains required before G3/G4 release acceptance.

The [NG09 package increment](experiments/NG09_PACKAGE_BOUNDARIES.md) adds public `/core` and `/bar` entries, root compatibility, strict exported declarations, installed client/SSR checks, and module-level size/isolation assertions. This strengthens F01/F10 and package evidence without completing family-wide acceptance or deferred release review.

The [consolidated NG09/NG10 review](experiments/NG09_NG10_ACCEPTANCE.md) records implementation completion and a bar-specific F01–F10 status table. F09 human interpretation and release gates remain pending; that snapshot preceded the NG11–NG13 implementations below. The [bar API](BAR_CHART_API.md) describes current behavior and its integration example is compiled from the document itself.

The [NG11 line report](experiments/NG11_LINE_CHART.md) adds line evidence for F01–F10 automated behavior, pinned visual comparisons, installed client/SSR consumption, Canvas performance, and family-isolated bundles. Human interpretation and full-MVP requirements remain open; at that snapshot area and pie/donut were unimplemented.

The [NG12 area report](experiments/NG12_AREA_CHART.md) adds F01–F10 automated evidence for independent fills, same-sign stacks, raw events, gaps, inherited state/formatting/motion controls, SSR/deferred hydration, and installed consumers. At that snapshot, three-family package budgets and area performance targets passed, while pie/donut was still unimplemented. NG13 now supplies its evidence; human interpretation and full-MVP acceptance remain open.

The [NG13 pie/donut report](experiments/NG13_PIE_CHART.md) adds automated F01–F10 evidence for one-measure categories, labels, zero-total and negative rules, raw events, category visibility/focus, states/motion, SSR/deferred hydration and installed consumers. Pie-specific source, timing and bundle evidence is recorded there. The subsequent NG14 review reconciles these results across all families without closing human R06/G2 or G3/G4.

## Implemented family evidence

This index records automated implementation acceptance, not completed human NG14/G3 acceptance. The latest regression has 119 unit/integration tests, 172 passing browser scenarios (plus two CDP-only skips), and six installed-package client/SSR modes. [Package evidence](experiments/data/package-boundaries.json) covers seven import scenarios.

| Family | Contract and automated behavior | Visual/performance evidence |
| --- | --- | --- |
| Bar | [API](BAR_CHART_API.md), [browser scenarios](../tests/browser/bar-chart.spec.ts), [foundation review](experiments/NG09_NG10_ACCEPTANCE.md) | [R03](experiments/R03_VISUAL_REVIEW.md), [R07](experiments/R07_RENDERER_COST.md) |
| Line | [API](LINE_CHART_API.md), [browser scenarios](../tests/browser/line-chart.spec.ts) | [NG11](experiments/NG11_LINE_CHART.md) |
| Area | [API](AREA_CHART_API.md), [browser scenarios](../tests/browser/area-chart.spec.ts) | [NG12](experiments/NG12_AREA_CHART.md) |
| Pie/donut | [API](PIE_CHART_API.md), [browser scenarios](../tests/browser/pie-chart.spec.ts) | [NG13](experiments/NG13_PIE_CHART.md) |

The [NG14 report](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md#requirement-reconciliation) maps every requirement to each family's checks. It adds 100-cycle cleanup in all three engines for every family, explicit mounted palette-refresh checks, per-binding negative consumer assertions, and actual Angular normal/stress legend/resize measurements. Its verification section records current outcomes. Human F09 interpretation remains pending in all four families, so NG14/G3 remain open. Radial charts have no axes, so axis-specific checks are inapplicable; numeric tooltip/table formatting, category labels, and keyboard actions still apply.

The [four-family visual audit](experiments/VISUAL_AUDIT.md) supplements pinned comparisons with dated official ECharts/EvilCharts observations, 32 gallery/theme/width combinations and narrow tooltip/label evidence. It records the intentional horizontal numeric-axis interval change and gallery refinements. The new browser checks measure painted label spacing and keyboard operation; human F09 remains pending.

## Requirement coverage

The [NG09 formatting increment](experiments/NG09_SHARED_FORMATTING.md) adds bar evidence for F01/F03/F05/F07/F10: typed numeric formatting, consistent visible text, raw numeric events, configuration-error recovery, and hydrated server errors. Later family reports extend the evidence; this historical formatting increment alone does not close cross-family acceptance or the deferred human review.

| Requirement | Experiments | Delivery tasks | Required evidence |
| --- | --- | --- | --- |
| F01 Typed data | R01, R08 | NG01, NG04, NG09, NG13, NG14 | Strict external consumer builds; intended invalid-key examples fail; runtime numeric and identity checks pass for Cartesian and pie contracts |
| F02 Input updates | R04 | NG05, NG09, NG10–NG14 | Added/removed rows and series, reordered identifiers, label changes, batched updates, and legend visibility persistence behave correctly |
| F03 Formatting | R03, R05, R06 | NG06, NG09, NG14 | Zero/missing values and locale formatting agree across plot, tooltip, and table; initial server/client text agrees |
| F04 Responsive layout | R03, R04, R07 | NG04, NG05, NG14 | Captures at required widths, hidden-to-visible recovery, resize behavior, and usable controls |
| F05 Interaction events | R04, R06, R08 | NG06, NG09, NG13, NG14 | Plot and keyboard table actions emit equivalent identifiers and values; correct legend visibility event for each chart family |
| F06 Themes | R03, R04, R05 | NG04, NG05, NG09, NG14 | Both themes and a palette change triggered by theme revision update mounted charts without stale colors or hydration errors |
| F07 Chart states | R04, R05, R06 | NG04–NG07, NG09, NG14 | State precedence, no stale plot during loading, error recovery, no-data rules, and all-hidden legend recovery |
| F08 Motion | R05, R06 | NG04, NG06, NG09, NG14 | Initial and changed reduced-motion preference override decorative animation; explicit consumer disable works |
| F09 Accessible interpretation | R05, R06 | NG06, NG09, NG14 | Screen-reader review, keyboard legend and table controls, visible focus, readable missing values, and stable labels across instances |
| F10 SSR and hydration | R05, R08 | NG07, NG08, NG14, NG16 | Real hydrated server route with multiple/deferred charts, stable markup/IDs, navigation cleanup, and no blanket hydration bypass |

Ranges such as NG10–NG14 refer to every task in that inclusive range. Prototype checks apply to bar only. Before G3, record a result for bar, line, area, and pie/donut for every applicable requirement. A non-applicable check needs a chart-specific reason; it does not waive a requirement shared by all charts.

## Additional release evidence

| Area | Experiments and tasks | Required evidence |
| --- | --- | --- |
| Visual parity | R03; NG02, NG04, NG10–NG14 | Exact upstream example paths, pinned revision, matching fixtures, before/after captures, and reviewed differences in both themes |
| Performance | R07; NG08, NG14 | Recorded completion signal and raw samples for product benchmarks, per-family results, cold loading and table costs, data envelope, and chosen bundle budget |
| Resource cleanup | R04; NG05, NG14 | 100 mount/destroy cycles, handlers and observers removed, failed/late imports handled, and no duplicate instances or callbacks |
| Implementation conventions | R03, R07; NG04, NG09–NG14 | Template-boundary review follows the architecture; derived state is separate from browser side effects; recomputation cost is included in performance evidence |
| Package isolation | R01, R08; NG08, NG16 | Production tarball installed outside workspace, strict declaration checks, client and SSR build/runtime results, package contents, dependency ranges, and no React runtime |
| Documentation and notices | NG02, NG15, NG16 | Integration example, public API, exact tested versions, limits, provenance ledger, artifact license, and third-party notices |

The [NG15 documentation review](experiments/NG15_DOCUMENTATION.md) completes the current API/integration/compatibility documentation criterion: a fresh CLI application installs the packed library, repeats from its lockfile, compiles the exact guide with strict declarations/templates, builds and hydrates four charts in all three engines. This does not close human F09 or NG16 final-artifact license/notices/G4.

The separate [GitHub Pages preview](GITHUB_PAGES.md) has deployed static-route HTML, hydration, repository-prefix links/fonts and three-engine live verification. It supplements demo-distribution evidence; it does not substitute for request-time SSR tests, human interpretation or the final library artifact/release checks. CI also builds/checks the static preview without publishing it.

## Gate completion

G1 requires technical feasibility evidence and a confirmed integration choice. G2 requires the bar quality checks to pass and records the chosen renderer, size budget, data envelope, and revised estimate. G3 requires the full MVP matrix to pass. G4 checks the final packaged artifact and its documentation and notices.

Store reports under `docs/experiments/` when work begins and link each report to its requirement, chart family, task, and gate. Keep status as pending, pass, or fail. A planned check, revised target, or screenshot alone cannot substitute for a required behavioral result.

The [NG16 local candidate](experiments/NG16_LOCAL_RELEASE.md) adds final-artifact automated evidence for F01/F10, metadata, notices, dependencies and distribution contents. All three isolated consumer stages use the same `0.1.0-rc.0` tarball and digest, with snapshots in the candidate record. Original library code is MIT licensed by user choice. G4, NG14/G3 and F09 remain pending for the deferred human interpretation evidence; automated packaging success does not close those gates.


## NG17 extension evidence

The first [composed increment](experiments/NG17_COMPOSED_CHART.md) applies the existing F01–F10 automated behavior to a shared-axis bar/line chart: typed numeric descriptors, immutable updates and kind changes, stable IDs/visibility/focus, signed/zero/missing observations, native controls/events, states, responsive themes, motion, lifecycle and SSR/deferred hydration. The [API](COMPOSED_CHART_API.md) defines the bounded extension; dedicated tests and exact rc.1 consumers extend the four-family baseline. Human interpretation remains deferred and NG14/G2/G3/G4 remain pending.


## NG20 linked integration evidence

The [NG20 report](experiments/NG20_LINKED_CHARTS.md) extends the application evidence for immutable updates/identity, raw point events, equivalent keyboard actions, accessible context/status, theme/resizing, SSR and teardown. A source point or month selector updates current companion data without replacing either chart instance. Selection follows IDs through reordering and clears on removal; missing/zero observations retain their meaning. The original standalone source compiled against the installed rc.1 artifact; the [current example](LINKED_CHARTS.md) follows the later candidate increments below. This bounded integration does not complete range brushing or deferred human F09/R06/G2/G3/G4 evidence.

The later [selection-feedback review](experiments/LINKED_SELECTION_FEEDBACK.md) adds controlled bar presentation in rc.2 and updates the displayed/compiled example to bind it. Feedback follows the same row ID across plot/table/select paths and updates; Reset/removal clears both plot and native-table feedback. This extends F02/F04/F05/F06/F09/F10 automated evidence without closing human interpretation or range-selection scope.

The [native month-range increment](experiments/NG20_MONTH_RANGE.md) extends those automated checks to inclusive From/To selection, current-order endpoint reconciliation, crossing, endpoint/interior removal, keyboard focus recovery and touch Reset. Plural bar feedback and native table Selected labels use the same included IDs; multiple rows have no `aria-current`. The copied guide example and exact rc.3 consumer checks cover the new public input. This bounded range integration does not close graphical brushing, broader performance claims or human F09/R06/G2/G3/G4.

The [graphical-range review](experiments/GRAPHICAL_RANGE_SELECTION.md) extends F02/F04/F05/F06/F09/F10 automated evidence with real forward/reverse drags, release-only totals, native bounds/table feedback, clipped release, cancellation, stale-model guards, both orientations and 16 stack/fill/theme combinations. Native fields preserve keyboard equivalence; touch evidence separates Chromium CDP swiping from other engines' mouse/native checks. Exact rc.4 declarations/docs/runtime checks and static preview verification remain recorded separately from human F09/R06/G2/G3/G4.


## NG18 radar first increment

The user-approved [radar increment](experiments/NG18_RADAR_CHART.md) adds the focused `/radar` Angular entry and a site-aligned demo with explicit dimension maxima, stable comparisons, missing-data policy, native scale/value table and vertex/table actions. The [API](RADAR_CHART_API.md) defines the bounded contract. Radial progress remains subsequent work. The compatibility root and four-family MVP retain their scope; private rc.5 is separate from the preserved rc.4 artifact. Human F09/R06/G2/G3/G4 and public publication remain pending.


## NG18 radial progress increment

The user-approved [radial progress increment](experiments/NG18_RADIAL_PROGRESS.md) adds the focused `/radial` Angular entry and two demo examples. Required scalar value and explicit positive maximum supply native progress semantics, visible formatted values and a noninteractive ring. The [API](RADIAL_PROGRESS_API.md) defines zero/null/invalid states, formatting, motion and SSR behavior. This advances the private candidate to rc.6 while preserving rc.5 and earlier artifacts and the existing compatibility root. Native progress provides the scalar alternative; legends, point actions and a data table are inapplicable. Human interpretation and public release gates remain pending.
