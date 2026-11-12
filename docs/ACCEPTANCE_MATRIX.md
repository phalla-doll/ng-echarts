# ng-echarts acceptance matrix

Updated 12 November 2026. R01 scaffold evidence is available; product requirement acceptance remains pending. This matrix connects the [product specification](PRODUCT_SPEC.md) to experiments and delivery tasks; the specification owns the detailed criteria and numeric targets.

The [R01 report](experiments/R01_TOOLCHAIN.md) records passing builds, strict compilation, isolated declarations, unit integration tests, and an SSR response check. These results contribute to F01 and package-isolation research but do not complete typed chart inputs, browser hydration, R08, or any gate.

## Requirement coverage

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

## Gate completion

G1 requires technical feasibility evidence and a confirmed integration choice. G2 requires the bar quality checks to pass and records the chosen renderer, size budget, data envelope, and revised estimate. G3 requires the full MVP matrix to pass. G4 checks the final packaged artifact and its documentation and notices.

Store reports under `docs/experiments/` when work begins and link each report to its requirement, chart family, task, and gate. Keep status as pending, pass, or fail. A planned check, revised target, or screenshot alone cannot substitute for a required behavioral result.
