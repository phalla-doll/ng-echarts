# ng-echarts delivery backlog

The user-requested [four-family visual audit and refinement](experiments/VISUAL_AUDIT.md) is recorded with official Apache ECharts/EvilCharts comparisons, mobile readability fixes, reproducible captures and three-engine checks. This demo presentation work remains separate from NG16 artifact/release acceptance.

Updated 14 November 2026. NG01–NG05 are complete for the bar feasibility scope. NG06 awaits human listening review; NG07 implementation and NG08 measurement/package evidence pass, with their NG06/G2 dependencies still open. NG09/NG10 implementation is complete for the bar-proven baseline; NG11 line, NG12 area, and NG13 pie/donut implementations are complete; NG14 automated cross-family evidence is reconciled; NG15 documentation and fresh-consumer verification are complete; NG16 automated local-candidate checks pass; NG17 first-increment implementation is recorded below; NG20 graphical month-range and NG18 first radar integration are recorded below; NG19 calendar and Sankey first-increment implementations are recorded below; broader linked interaction and Sankey variants, complete human release acceptance and NG21/NG22 remain pending. Human release evidence remains separate. The user deferred R06 on 12 November 2026 so it no longer blocks development; it remains required before release acceptance. Priority P0 blocks the next milestone, P1 belongs to MVP, and P2 follows MVP. IDs are stable so experiment reports and changes can reference them.

NG01 evidence: [R01 toolchain report](experiments/R01_TOOLCHAIN.md). The [implementation plan](IMPLEMENTATION_PLAN.md) sequences the remaining work. G1 passes for bar; G2 awaits R06, and G3/G4 remain pending.

Demo delivery: the [GitHub Pages preview](GITHUB_PAGES.md) is deployed and verified in Chromium, Firefox and WebKit. Rebuild/publish with `npm run deploy:pages`; source pushes alone do not update the manual preview. This completes the user's demo-hosting request, not NG16 final artifact acceptance or NG22 public package publication.

Demo performance: the [audit](experiments/DEMO_PERFORMANCE_AUDIT.md) and [implementation record](experiments/DEMO_PERFORMANCE_FIXES.md) cover modular concept assets, earlier renderer delivery, viewport rendering, deferred full-source highlighting and route performance guards. These are demo/build changes; library candidates and human release gates retain their existing status. GitHub Pages' platform-controlled cache lifetime remains a hosting constraint.

The [navigation and animation follow-up](experiments/DEMO_PERFORMANCE_FIXES.md#navigation-and-animation-follow-up) corrects shared runtime resize/import coordination, separates deferred gallery dependencies by family and warms destination components on navigation intent. These are unreleased source changes; preserved candidate archives, public deployment and human release gates retain their prior status. Normal-motion navigation timing and deterministic animation-continuity checks supplement the original cold-load guards.

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

The [Chart possibilities gallery](experiments/CHART_POSSIBILITIES.md) previews twelve user-approved chart styles in the demo. These are interactive design proposals; NG18 has focused radar/radial components and NG19 adds focused calendar heatmap and Sankey components; other proposals and their family-specific acceptance remain subsequent work.

| ID | Priority | Work | Start condition |
| --- | --- | --- | --- |
| NG17 | P2 | Composed Cartesian charts: first vertical bar/line increment implemented; dual-axis/stacked/area extensions deferred | [API and evidence](experiments/NG17_COMPOSED_CHART.md); user-authorized experimental continuation |
| NG18 | P2 | First radar and radial progress increments implemented; human interpretation pending | [Radar contract and verification](experiments/NG18_RADAR_CHART.md); human interpretation remains pending |
| NG19 | P2 | First single-year calendar heatmap and bounded Sankey implemented; broader windows and flow variants deferred | [Calendar contract and evidence](experiments/NG19_CALENDAR_HEATMAP.md); family-specific human interpretation pending |
| NG20 | P2 | Application-owned overview/detail link, inclusive native/graphical month ranges and controlled bar feedback implemented; opt-in one-way hover/focus preview added in rc.13; shared zoom, disjoint and two-way selection deferred | [Initial contract](experiments/NG20_LINKED_CHARTS.md) and [selection feedback](experiments/LINKED_SELECTION_FEEDBACK.md); user prioritized linked charts after NG17 |
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

The follow-up [hover/press audit](experiments/HOVER_REFINEMENT.md) fills missing feedback on header, linked, table and workbench controls; preserves selected tabs/current navigation/hidden series; and consolidates fine-pointer hover, touch press, disabled-state probes and reduced-motion handling. The shared focus policy and private rc.2 API remain separate from this demo styling increment.

The [gallery tab-spacing correction](experiments/HOVER_REFINEMENT.md#codepreview-tab-spacing-correction) gives Code/Preview equal widths, consistent gaps, inset hover fills and a separate selected indicator. It removes competing mobile tab rules and records geometry/keyboard evidence across all five galleries and both themes.

The user-approved [month-range increment](experiments/NG20_MONTH_RANGE.md) adds native Period/From/To controls with inclusive supplied-order bounds, crossing/removal/reset rules and focus recovery. Controlled `BarChart.selectedRowIds` shades every included category and labels matching native table rows without multiple current rows. The private candidate advances to rc.3, preserving rc.0–rc.2 artifacts. Graphical brushing, linked zoom/hover, shared legends, two-way selection and human acceptance remain open.

The next user-approved [graphical-range increment](experiments/GRAPHICAL_RANGE_SELECTION.md) adds one contiguous snapped pointer range with explicit mode, release-only commit, interruption/stale-data cancellation and native From/To equivalence. It supports both bar orientations and existing stack/fill variants, retains orthogonal touch scrolling, and advances the private package to rc.4. Shared zoom/hover, disjoint/two-way selection, publication and human release acceptance remain open.

The [preview-hardening checkpoint](experiments/PREVIEW_DEPLOYMENT_HARDENING.md) finalizes the committed concept gallery, isolates build inputs, seals output digests and requires an exact three-browser receipt plus clean/current pushed source before publication. Public verification checks the marker, receipt and every asset. Private rc.4 and human release gates remain unchanged.


## NG18 radar first increment

The user-approved [radar increment](experiments/NG18_RADAR_CHART.md) adds the focused `/radar` Angular entry and a site-aligned demo with explicit dimension maxima, stable comparisons, missing-data policy, native scale/value table and vertex/table actions. The [API](RADAR_CHART_API.md) defines the bounded contract. The subsequent radial-progress increment below is implemented. The compatibility root and four-family MVP retain their scope; private rc.5 is separate from the preserved rc.4 artifact. Human F09/R06/G2/G3/G4 and public publication remain pending.


## NG18 radial progress increment

The user-approved [radial progress increment](experiments/NG18_RADIAL_PROGRESS.md) adds the focused `/radial` Angular entry and two demo examples. Required scalar value and explicit positive maximum supply native progress semantics, visible formatted values and a noninteractive ring. The [API](RADIAL_PROGRESS_API.md) defines zero/null/invalid states, formatting, motion and SSR behavior. This advances the private candidate to rc.6 while preserving rc.5 and earlier artifacts and the existing compatibility root. Native progress provides the scalar alternative; legends, point actions and a data table are inapplicable. Human interpretation and public release gates remain pending.

## NG19 calendar first increment

The [calendar API](CALENDAR_HEATMAP_API.md) and [implementation record](experiments/NG19_CALENDAR_HEATMAP.md) define the focused date/value contract, year/maximum bounds, missing-vs-zero semantics, responsive year/quarter layout and native daily actions. Workspace and exact rc.8 artifact verification pass for calendar; broader date windows and human release acceptance remain pending. The following increment adds Sankey.


## NG19 Sankey first increment

The next NG19 increment adds a focused experimental `/sankey` entry and visitor-flow demo, with typed node/link IDs, directed acyclic validation, separate incoming/outgoing totals, native table actions and lazy Canvas rendering. The [API](SANKEY_CHART_API.md) defines the bounded 24-node/60-link contract; the [implementation record](experiments/NG19_SANKEY_CHART.md) records verification and scope. Private rc.10 preserves rc.9, rc.8 and earlier artifacts. Circular/vertical/drag variants, broader linked interactions and human F09/R06/G2/G3/G4 acceptance remain pending.

Private rc.11 combines the completed [presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md) with Sankey and independent lazy chart loading. It preserves rc.10 and earlier archives. At rc.11 the combined-root aggregate allowance was 218,000 gzip / 186,000 Brotli bytes; emitted root-frame orphan chunks allow 201,500 / 175,000, with zero reachable engine modules. Focused/core and demo route guards remain unchanged. Human acceptance and publication remain pending.

Current delivery checkpoint: [Sankey/presentation/WebKit demo deployment](GITHUB_PAGES.md#rc11-sankey-presentation-and-webkit-deployment) is verified publicly in all three engines. Private rc.12 corrects documentation only, preserving rc.11 runtime/declarations and all earlier archives. Its [candidate checklist](RELEASE_CHECKLIST.md) keeps human F09/R06/G2/G3/G4 and public package publication pending. The 353-browser full regression and later 30-scenario WebKit check are distinct recorded scopes.


## NG20 transient month previews

The user-authorized [month-preview follow-up](experiments/NG20_MONTH_PREVIEWS.md) adds opt-in bar pointer/table-focus previews and one-way temporary device-share context introduced in rc.13 and corrected in the current private rc.15. Committed period/range feedback, totals and local legends stay independent; keyboard actions can commit through the existing point event. The browser adapter owns delegated listeners, touch guards and cleanup. Shared zoom, bidirectional linking and public publication remain open. The mobile range button uses an explicit tap policy; the report distinguishes local evidence from the still-required pushed CI result. Human F09/R06/G2/G3/G4 remain pending, with calendar/Sankey checklists now included.


The [combined rc.16 checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) verifies the month-preview behavior together with the completed resize/animation/navigation changes: 266 unit tests, 380 browser passes with four expected skips, exact artifact consumers and unchanged focused/core/route guards. Earlier archives and human release gates remain unchanged.


The [rc.17 release follow-up](experiments/RC17_RELEASE_REVIEW.md) includes pre-hydration theme inheritance and separate CI browser jobs. Exact candidate verification is recorded separately from the preserved rc.16 checkpoint. The [human result sheet](experiments/RC17_HUMAN_REVIEW.md) and [NG22 publication plan](PUBLICATION.md) keep listening evidence, public identity and registry access explicit. Human F09/R06/G2/G3/G4 remain pending.


The [NG22 public prerelease](experiments/NG22_PUBLIC_PRERELEASE.md) uses `@mantha911/ng-echarts@0.1.0-rc.18` with npm public access and the `next` tag. The user selected the authenticated personal scope and explicitly skipped the listening session while requesting this experimental publication. Earlier private candidates remain preserved; human F09/R06/G2/G3/G4 remain pending.
