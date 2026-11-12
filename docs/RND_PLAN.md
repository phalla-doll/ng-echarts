# ng-echarts research and development plan

Status: R01 toolchain scope passed; R02–R08 and G1–G4 remain pending. Updated 12 November 2026. See the [R01 evidence](experiments/R01_TOOLCHAIN.md) and [implementation plan](IMPLEMENTATION_PLAN.md).

## Objective

Establish that an Angular 22 and TypeScript 6.0 library can reproduce selected EvilCharts designs with reliable updates, accessible controls, and safe browser lifecycle behavior. Resolve the architectural uncertainties with one bar chart, then expand to the four-family MVP in the [product specification](PRODUCT_SPEC.md).

## Research experiments

| Experiment | Method | Evidence and pass condition |
| --- | --- | --- |
| R01 Toolchain | Scaffold a minimal Angular 22 library and consumer; lock supported Node, TypeScript, RxJS, and ECharts versions | Production builds and strict type checks, including dependency declarations without `skipLibCheck`, pass; exact versions and commands are recorded |
| R02 Integration choice | Build a small bar fixture with a direct adapter; inspect at most one wrapper after checking its peer dependencies and maintenance | Record an initial choice and comparison limits; confirm or revise it using R04, R05, and R08 before G1 |
| R03 Reuse and parity | Classify upstream bar helpers; port one agreed fixture and compare both themes at three widths; review template and derived-state boundaries | Provenance and references exist; visual checklist passes; state, legend, and table derivations follow the architecture conventions |
| R04 Lifecycle | Exercise hidden containers, resize, series removal, legend persistence, state precedence and recovery, import failures/races, and 100 mount/destroy cycles | One instance per host; no stale data, leaked resources, duplicate events, or late initialization; latest valid inputs recover after an error |
| R05 SSR and hydration | Hydrate a real server route with multiple charts and a deferred chart; update data, switch themes, and navigate away and back | Stable IDs and markup, no browser-global failures, hydration warnings, double initialization, or stability delays; no blanket hydration disablement |
| R06 Accessibility and motion | Use keyboard legend and table actions, inspect accessibility tree, read sample with a screen reader, change reduced-motion preference | Table and plot actions emit equivalent point events; all values are readable; focus survives updates; state messages and motion rules pass |
| R07 Renderer and cost | Compare Canvas and SVG production builds using the benchmark protocol in the product specification | Record raw timings, completion signal, p95 results, module loading, expanded-table cost, bundle composition, and visible differences; select renderer, size budget, and data limits |
| R08 Packaging and API | Pack a production library build and install it in a fresh Angular consumer outside the workspace | Client and SSR paths, styles, declarations, numeric-key type-error cases, and strict templates pass without aliases or symlinks; React dependencies are absent |

A failed experiment must produce a concrete design adjustment or narrower requirement and a rerun. Record outcomes as pass, fail, or pending with evidence links; writing a test does not count as passing it.

R02 is intentionally provisional: do not claim proven SSR or teardown behavior before R04 and R05 run. If no wrapper qualifies, record why and continue with the direct adapter. Bound initial wrapper exploration to half an engineering day; expand it only if a concrete prototype failure makes further comparison useful.

## Execution sequence

### Phase 0 Environment and upstream baseline

Estimate: 1 to 2 engineering days.

Pin the upstream revision, select exact tool versions, choose bar fixtures by exact registry name or file path, capture source reference images, and create a provenance ledger. Record viewport, host width, device-pixel ratio, font, theme, and animation state with each reference. Inventory the helpers behind the chosen example rather than copying the entire repository. Complete R01 and the initial reuse classification.

### Phase 1 Bar chart feasibility

Estimate: 4 to 6 engineering days.

Complete R02 through R08 using the same fixture. Produce a working bar prototype, comparison captures, measurements, an isolated consumer package test, and an updated architecture decision record. Prototype grouped and stacked data, dynamic updates, themes, state precedence, reduced motion, and accessible legend and table actions. Add the second layout when the adapter is stable. Resolve G1 and G2 before expanding to other chart families.

### Phase 2 Shared foundation and bar completion

Estimate: 4 to 6 engineering days after the feasibility gate.

Extract only the shared responsibilities demonstrated by the prototype. Complete bar variants in MVP scope, standardize data validation, formatting, selection, themes, loading and error behavior, and stabilize the public API through a consumer example.

### Phase 3 MVP chart collection

Estimate: 6 to 10 engineering days.

Implement line, area, and pie/donut using the agreed layers. Verify each family's missing-data and selection rules. Add fixed fixtures and visual comparisons; ensure one chart import does not pull every chart module into the consumer.

### Phase 4 Release readiness

Estimate: 4 to 6 engineering days.

Run the release matrix across all four chart families, including family-specific R03 through R08 checks. The renderer comparison can remain a prototype decision; repeat the selected renderer's correctness, accessibility, and performance checks for each new family. Finish examples and API documentation, finalize the local artifact's license and notices, and prepare a local distributable. Record tested versions and known limits.

Total planning estimate: 19 to 30 engineering days for one experienced engineer with access to the required browser and SSR environments. This is an effort range, not a delivery commitment. Re-estimate after Phase 1; advanced chart families and full upstream parity are outside it.

## Decision gates

| Gate | Required evidence | Result |
| --- | --- | --- |
| G1 Feasible Angular integration | R01, R04, R05, and R08 pass; R02 choice confirmed using their evidence | Select integration and lifecycle strategy before adding chart families |
| G2 Product quality | R03, R06, and R07 pass against the current specification | Accept the bar baseline, renderer, numeric size budget, supported data envelope, and revised effort |
| G3 MVP complete | Every applicable row of the acceptance matrix passes across four chart families | Freeze public API and produce release candidate |
| G4 Distribution ready | Isolated packed-consumer install, documentation, artifact license, notices, and compatibility matrix pass | Produce a local release package; publication remains a separate action |

The team can perform research and routine implementation decisions without repeatedly asking for approval. A material change to product scope, such as introducing React or dropping Angular 22, should be raised as a concrete decision with the experiment evidence.

A gate remains pending when evidence is missing and fails when its criterion is not met. Revising a target alone does not pass a gate: document the reason, align the specification, and rerun the affected checks. Use the [acceptance matrix](ACCEPTANCE_MATRIX.md) to ensure an experiment result is attached to every affected requirement. Prototype evidence applies to the bar chart until the other families are exercised.

## Verification matrix

| Dimension | Minimum coverage |
| --- | --- |
| Data | Empty, single row, all-zero Cartesian data, all-zero pie data, null gaps, invalid values, negative values, duplicate labels and rejected duplicate IDs, removed series, stable identifiers |
| Layout | 320, 768, and 1440 px hosts; initially hidden card; responsive grid; high-density display |
| Interaction | Pointer tooltip and activation, keyboard legend, equivalent table point action, visibility persistence, all-hidden legend recovery, focus retention |
| Rendering | Chosen default renderer plus comparison renderer during R&D; light and dark; reduced motion |
| Runtime | Client rendering, SSR and hydration, multiple and deferred chart instances, zoneless updates, import failure, state recovery, destroy before import completion |
| Browser | Chromium, Firefox, WebKit; record exact versions and environment |
| Consumption | Packed artifact installed outside the workspace, strict templates and declarations, deliberate invalid API cases, client and SSR production builds |

Use deterministic fixtures for assertions and meaningful unit tests for transformations. Use browser tests for behavior that depends on layout or lifecycle. Visual checks supplement behavioral tests; they do not establish data correctness by themselves.

Apply the [template and derived-state conventions](TECHNICAL_ARCHITECTURE.md#templates-and-derived-state) during R03 and NG09. In R07, inspect whether unchanged data causes unnecessary option rebuilds or renderer updates, and measure the actual cost when data changes. Keep DOM work in the adapter rather than hiding it inside computed builders or template getters.

## Risks and responses

| Risk | Response |
| --- | --- |
| React composition obscures reusable logic | Separate algorithms from component state; rewrite tightly coupled pieces |
| ECharts types conflict with TypeScript 6 | Find a supported version or adjust local boundaries; do not hide broad errors with permissive types |
| Generic inputs infer poorly in Angular templates | Test the consumer API early and simplify the data contract if necessary |
| Browser APIs break SSR | Isolate initialization and imports; keep stable fallback markup and test real hydration |
| Visual fidelity requires expensive effects | Measure normal and stress fixtures; defer costly variants beyond MVP |
| Theme or selection changes leave stale state | Use explicit identifiers and tested replacement rules |
| Custom tooltips mishandle data or focus | Escape text and keep accessible values outside hover-only UI |
| Project name conflicts at distribution | Keep local folder name; resolve public namespace before release |
| Full upstream parity expands scope | Maintain the MVP list and separate later families and variants |

## Experiment report format

For each experiment, record its question, exact versions and source revision, fixture, reproduction commands, expected outcome, observed result, screenshots or logs, decision, and remaining issue. Store reports under `docs/experiments/` when experiments start. Do not prefill outcomes or performance numbers.

Each report must identify the experiment ID, chart family, affected F01 through F10 requirements, backlog tasks, and gate. For benchmarks, include hardware, OS, browser version, build mode, renderer, host size, device-pixel ratio, animation and table settings, sample count, and raw samples. For visual evidence, link both the pinned upstream reference and the resulting capture with any accepted differences.
