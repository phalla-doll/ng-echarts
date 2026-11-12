# ng-echarts delivery backlog

Updated 12 November 2026. NG01 and NG02 are complete for their initial scope; NG03 has an initial decision; NG04–NG07 are in progress; NG08–NG22 remain pending. Priority P0 blocks the next milestone, P1 belongs to MVP, and P2 follows MVP. IDs are stable so experiment reports and changes can reference them.

NG01 evidence: [R01 toolchain report](experiments/R01_TOOLCHAIN.md). The [implementation plan](IMPLEMENTATION_PLAN.md) sequences the remaining work. G1–G4 remain pending.

NG02 evidence: [reference fixtures and provenance](UPSTREAM_PROVENANCE.md). NG03 initial choice: [direct adapter review](experiments/R02_ADAPTER.md). [Initial bar prototype results](experiments/BAR_PROTOTYPE.md) and the reports below contribute to NG04–NG07 without closing their full task criteria.

Development update: [upstream captures and visual review](experiments/R03_VISUAL_REVIEW.md) are recorded at all required widths/themes. [Three-browser validation](experiments/R04_R05_VALIDATION.md) passes multiple/deferred hydration, navigation, hidden mounting, import failure/races, and real teardown scenarios. R05 passes for these bar fixtures; NG04–NG07 remain in progress while parity, the full input/retention matrix, and R06 are completed.

## Feasibility milestone

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

| ID | Priority | Work | Depends on | Done when |
| --- | --- | --- | --- | --- |
| NG09 | P1 | Complete shared state, formatting, validation, and motion behavior | NG08 | Shared contracts and fixtures cover F01 through F10; family-specific checks remain open |
| NG10 | P1 | Finish MVP bar layouts, stacks, and fills | NG09 | Bar acceptance and visual checklist pass |
| NG11 | P1 | Add line chart | NG09 | Multiple series, gaps, points, and straight/smooth interpolation validated |
| NG12 | P1 | Add area chart | NG11 | Gradients and stacks validated without cross-series contamination |
| NG13 | P1 | Add pie and donut | NG09 | Single-measure category API, legend visibility, labels, zero totals, and negative validation pass |
| NG14 | P1 | Complete acceptance matrix across all MVP families | NG10, NG12, NG13 | Functional, visual, browser, accessibility, lifecycle, and performance evidence passes; G3 resolved |
| NG15 | P1 | Finish API reference, integration examples, and compatibility table | NG14 | Fresh developer can install local package and reproduce examples |
| NG16 | P1 | Prepare local release candidate, artifact license, and notices | NG15 | Final isolated client/SSR consumer, attribution, dependencies, and G4 checks pass |

## Subsequent collection

| ID | Priority | Work | Start condition |
| --- | --- | --- | --- |
| NG17 | P2 | Composed Cartesian charts | Stable shared axes and series APIs |
| NG18 | P2 | Radar and radial charts | Separate geometry and accessibility requirements defined |
| NG19 | P2 | Sankey and calendar heatmaps | Family-specific data models and fixtures agreed |
| NG20 | P2 | Range brush and linked charts | Selection contract and keyboard interaction designed |
| NG21 | P2 | Patterns, glow, advanced animations, and tooltip templates | Per-variant visual and performance targets agreed |
| NG22 | P2 | Publication workflow and public package identity | Namespace availability checked and release destination chosen |

## Definition of done

A task is complete when its acceptance condition has observable evidence, relevant behavior has been verified, public documentation matches the implementation, and copied code has provenance. Update this backlog and the architecture record when a decision changes. Do not mark planned tests or proposed benchmarks as passing results.

Review Angular code against the [template and derived-state conventions](TECHNICAL_ARCHITECTURE.md#templates-and-derived-state): presentation bindings stay readable, derived chart logic lives in TypeScript, and browser side effects remain in the adapter. Apply this to the bar prototype and every later chart family.

Use the [acceptance matrix](ACCEPTANCE_MATRIX.md) to connect task completion to product requirements and gate evidence. NG03 selects a prototype candidate; NG08 confirms it. NG09 establishes shared behavior; NG14 verifies that behavior in every family. A successful bar prototype cannot close requirements for charts that have not been implemented.

Next: align category ticks and comparison-theme/plot spacing from R03, finish R04 input/heap review and R06 screen-reader/motion evidence, then run R07/R08 before resolving G1/G2. Do not expand chart families while those gates remain open.
