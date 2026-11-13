# ng-echarts delivery backlog

The user-requested [four-family visual audit and refinement](experiments/VISUAL_AUDIT.md) is recorded with official Apache ECharts/EvilCharts comparisons, mobile readability fixes, reproducible captures and three-engine checks. This demo presentation work remains separate from NG16 artifact/release acceptance.

Updated 13 November 2026. NG01–NG05 are complete for the bar feasibility scope. NG06 awaits human listening review; NG07 implementation and NG08 measurement/package evidence pass, with their NG06/G2 dependencies still open. NG09/NG10 implementation is complete for the bar-proven baseline; NG11 line, NG12 area, and NG13 pie/donut implementations are complete; NG14 automated cross-family evidence is reconciled; NG15 documentation and fresh-consumer verification are complete; NG16 automated local-candidate checks pass; NG17 first-increment implementation is recorded below; NG20 first linked-chart integration is recorded below; range brushing, complete human release acceptance and NG18/NG19/NG21/NG22 remain pending. Human release evidence remains separate. The user deferred R06 on 12 November 2026 so it no longer blocks development; it remains required before release acceptance. Priority P0 blocks the next milestone, P1 belongs to MVP, and P2 follows MVP. IDs are stable so experiment reports and changes can reference them.

NG01 evidence: [R01 toolchain report](experiments/R01_TOOLCHAIN.md). The [implementation plan](IMPLEMENTATION_PLAN.md) sequences the remaining work. G1 passes for bar; G2 awaits R06, and G3/G4 remain pending.

Demo delivery: the [GitHub Pages preview](GITHUB_PAGES.md) is deployed and verified in Chromium, Firefox and WebKit. Rebuild/publish with `npm run deploy:pages`; source pushes alone do not update the manual preview. This completes the user's demo-hosting request, not NG16 final artifact acceptance or NG22 public package publication.

NG02 evidence: [reference fixtures and provenance](UPSTREAM_PROVENANCE.md). NG03 initial choice: [direct adapter review](experiments/R02_ADAPTER.md). [Initial bar prototype results](experiments/BAR_PROTOTYPE.md) and the reports below contribute to NG04–NG07 without closing their full task criteria.

Development update: [R03](experiments/R03_VISUAL_REVIEW.md) passes the four agreed bar references and tooltip review. [R04/R05](experiments/R04_R05_VALIDATION.md) pass input/focus, lifecycle/retention, and hydration paths. [R07](experiments/R07_RENDERER_COST.md) selects Canvas with actual Angular timings and a measured size budget; [R08](experiments/R08_PACKED_RUNTIME.md) passes external packed client/SSR consumption. Record the [R06 human result](experiments/R06_MANUAL_REVIEW.md) before resolving G2 and release acceptance. Development may continue under the user’s explicit deferral.

The user selected a [reference-aligned gallery](experiments/BAR_GALLERY_VISUAL_REVIEW.md) for the existing bar charts. That historical site correction retained `/playground` for engineering controls without completing NG09 or adding area-chart behavior; the later consolidated review below records current completion.

## Feasibility milestone

The [site-wide theme update](experiments/SITE_THEME_ALIGNMENT.md) adds basic Get Started, Installation, and Components pages and aligns existing tool pages with the approved gallery. That initial catalog labeled unimplemented families as planned; all four MVP families are now available following NG11–NG13. This supports later NG15 documentation work without completing its full API, compatibility, or release requirements.

| ID | Priority | Work | Depends on | Done when |
| --- | --- | --- | --- | --- |
| NG01 | P0 | Lock the Angular 22 toolchain and build a library workspace | None | Exact versions and reproducible production build recorded |
| NG02 | P0 | Pin source fixtures and create reuse ledger | None | Reference revision, selected examples, and copied-code attribution rules recorded |
| NG03 | P0 | Make provisional adapter choice and assess one eligible wrapper | NG01 | R02 initial choice and comparison limits recorded; final confirmation waits for NG08 |
| NG04 | P0 | Build typed bar prototype, states, token theme, and reduced motion | NG02, NG03 | Fixed data renders in both themes; R03 template-boundary review, basic parity, and typed inputs work |
| NG05 | P0 | Implement lifecycle, resize, state recovery, and legend persistence | NG04 | R04 hidden-container, repeated teardown, and async-failure/race checks pass |
| NG06 | P0 | Add tooltip, keyboard legend, table point actions, and accessibility checks | NG04 | R06 values, equivalent pointer/keyboard events, focus, and motion checks pass |
| NG07 | P0 | Validate SSR and hydration | NG05, NG06 | R05 server route, multiple/deferred instances, and navigation pass without warnings |
| NG08 | P0 | Measure renderers and validate isolated packed consumer | NG07 | R07/R08 pass; R02 choice confirmed; G1/G2 evidence complete |

## MVP milestone

NG09 first increment: [shared numeric formatting](experiments/NG09_SHARED_FORMATTING.md) adds locale/options/custom value text across axes, tooltips, and tables, with raw numeric events and failure recovery. The [package-boundary increment](experiments/NG09_PACKAGE_BOUNDARIES.md) adds focused `/core` and `/bar` entries, compatibility checks, and module/size assertions. The [consolidated foundation/bar review](experiments/NG09_NG10_ACCEPTANCE.md) records NG09/NG10 implementation completion and requirement-level evidence. Shared runtime responsibilities should only be extracted when another implementation demonstrates reuse; cross-family acceptance and deferred human review remain open.

| ID | Priority | Work | Depends on | Done when | Implementation status |
| --- | --- | --- | --- | --- | --- |
| NG09 | P1 | Complete shared state, formatting, validation, and motion behavior | NG08 technical evidence; R06 deferred by user | Shared contracts and fixtures cover F01 through F10; family-specific checks remain open | Complete for bar baseline; deferred human release review remains open |
| NG10 | P1 | Finish MVP bar layouts, stacks, and fills | NG09 | Bar acceptance and visual checklist pass | Complete for bar baseline; deferred human release review remains open |
| NG11 | P1 | Add line chart | NG09 | Multiple series, gaps, points, and straight/smooth interpolation validated | Complete for current implementation; release review remains open |
| NG12 | P1 | Add area chart | NG11 | Gradients and stacks validated without cross-series contamination | Complete for current implementation; release review remains open |
| NG13 | P1 | Add pie and donut | NG09 | Single-measure category API, legend visibility, labels, zero totals, and negative validation pass | Complete for current implementation; release review remains open |
| NG14 | P1 | Complete acceptance matrix across all MVP families | NG10, NG12, NG13 | Functional, visual, browser, accessibility, lifecycle, and performance evidence passes; G3 resolved | Automated evidence reconciled; human F09 interpretation/G3 pending ([report](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md)) |
| NG15 | P1 | Finish API reference, integration examples, and compatibility table | NG14 automated evidence; user continued with human review deferred | Fresh developer can install local package and reproduce examples | Complete for experimental docs; [fresh CLI consumer and three-browser evidence](experiments/NG15_DOCUMENTATION.md); release gates remain open |
| NG16 | P1 | Prepare local release candidate, artifact license, and notices | NG15 | Final isolated client/SSR consumer, attribution, dependencies, and G4 checks pass | Automated candidate checks pass; `0.1.0-rc.0` MIT/notices and exact artifact consumers recorded ([report](experiments/NG16_LOCAL_RELEASE.md)); human/G4 pending |

## Subsequent collection

| ID | Priority | Work | Start condition |
| --- | --- | --- | --- |
| NG17 | P2 | Composed Cartesian charts: first vertical bar/line increment implemented; dual-axis/stacked/area extensions deferred | [API and evidence](experiments/NG17_COMPOSED_CHART.md); user-authorized experimental continuation |
| NG18 | P2 | Radar and radial charts | Separate geometry and accessibility requirements defined |
| NG19 | P2 | Sankey and calendar heatmaps | Family-specific data models and fixtures agreed |
| NG20 | P2 | Application-owned overview/detail link and controlled bar row feedback implemented; range brush, zoom/hover and two-way selection deferred | [Initial contract](experiments/NG20_LINKED_CHARTS.md) and [selection feedback](experiments/LINKED_SELECTION_FEEDBACK.md); user prioritized linked charts after NG17 |
| NG21 | P2 | Patterns, glow, advanced animations, and tooltip templates | Per-variant visual and performance targets agreed |
| NG22 | P2 | Publication workflow and public package identity | Namespace availability checked and release destination chosen |

## Definition of done

A task is complete when its acceptance condition has observable evidence, relevant behavior has been verified, public documentation matches the implementation, and copied code has provenance. Update this backlog and the architecture record when a decision changes. Do not mark planned tests or proposed benchmarks as passing results.

Review Angular code against the [template and derived-state conventions](TECHNICAL_ARCHITECTURE.md#templates-and-derived-state): presentation bindings stay readable, derived chart logic lives in TypeScript, and browser side effects remain in the adapter. Apply this to the bar prototype and every later chart family.

Use the [acceptance matrix](ACCEPTANCE_MATRIX.md) to connect task completion to product requirements and gate evidence. NG03 selects a prototype candidate; NG08 confirms it. NG09 establishes shared behavior; NG14 verifies that behavior in every family. A successful bar prototype cannot close requirements for charts that have not been implemented.

Current: [NG14 automated acceptance](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) records F01–F10 reconciliation, 100-cycle cleanup in each browser engine, mounted palette refreshes, strict per-binding consumer errors, and actual Angular interaction/resize measurements. Human F09 interpretation is the remaining NG14/G3 criterion. [NG15 documentation](experiments/NG15_DOCUMENTATION.md) and its fresh-developer check are complete under the user’s continuation; NG16 now has a verified private MIT-licensed local candidate, notices, inventory/checksums and exact-artifact consumers in its [report](experiments/NG16_LOCAL_RELEASE.md); human/G4 acceptance remains pending. G3/G4 remain pending. NG13 pie/donut evidence is recorded in the [pie/donut report](experiments/NG13_PIE_CHART.md). NG12 area evidence is recorded in the [area report](experiments/NG12_AREA_CHART.md). See the [NG11 line report](experiments/NG11_LINE_CHART.md) for implementation and verification evidence. The user deferred the R06 listening session on 12 November 2026; keep R06/G2 pending and complete that evidence before G3/G4. Continue automated keyboard, focus, motion, and hydration checks during development.


NG17 adds the [shared-axis composed API](COMPOSED_CHART_API.md), a matching visits/trend gallery and a private rc.1 artifact. The [implementation report](experiments/NG17_COMPOSED_CHART.md) records strict declarations, actual plot/table actions, stable kind changes, lifecycle/SSR, bundle measurements and remaining scope. This user-authorized post-MVP increment does not close deferred human interpretation or release gates.


The user selected NG20 linked charts as the next increment after NG17. The [linked-chart guide](LINKED_CHARTS.md) and [report](experiments/NG20_LINKED_CHARTS.md) document plot/table/select actions, stable IDs, reset/removal semantics, independent legends, SSR and installed consumers. The existing `pointSelect` event and Angular signals supply the integration; no library API or rc.1 artifact change is required. Broader NG20 range/zoom/hover/two-way behavior remains open.


The requested [linked-demo UI refinement](experiments/LINKED_UI_REFINEMENT.md) replaces the heavy filter row with a compact native Month field, conditional Reset and concise totals, and aligns chart cards/controls with the gallery. Reset returns focus to the month field; linking/state semantics and the rc.1 artifact remain unchanged.

The subsequent [selection-feedback increment](experiments/LINKED_SELECTION_FEEDBACK.md) adds controlled `BarChart.selectedRowId` presentation: a category band, focused bar colors and a visibly/current-marked table row. The link remains application-owned and clears removed IDs. Reset restores the overview without changing local legends. This public input advances the private package to rc.2; earlier artifacts and evidence remain preserved. Range selection and deferred human release acceptance remain open.

The user-requested [shared focus refinement](experiments/FOCUS_REFINEMENT.md) replaces the demo's mixed bright rings with one thin neutral outline across controls, links, summaries and keyboard scroll regions, retaining system-color emphasis in forced-colors mode. Chart controls inherit the site policy through scoped presentation overrides. The rc.2 library and deferred human acceptance remain unchanged.
