# NG17 stacked composed bars

Date: 15 November 2026. User-authorized follow-up after the rc.19 performance and Angular checkpoint. Named-stack implementation and automated verification are complete; the current rc.21 artifact remains a local candidate. Human F09/R06/G2/G3/G4 remain pending.

## Contract

`ComposedBarSeries<T>.stack?: string` opts a bar into a named stack. Omission keeps a bar grouped and unstacked. Names must be nonempty strings without surrounding whitespace; equal names form one group, distinct names form separate groups. `ComposedLineSeries<T>` rejects stack settings in strict types and runtime validation. Lines use supplied values and the same units/scale, never cumulative bar totals calculated by the library.

Within a stack, positive and negative observations accumulate separately from zero. Missing values contribute no segment and stay missing in native tables/tooltips; zero remains an observed zero. Supplied descriptor order determines segment order. Hiding a series removes its segment, recalculates exposed end corners and keeps its original values available through native table actions. Stable IDs retain legend state through reordering/group changes/kind changes. Immutable option replacement removes obsolete stack settings. Plot and table selections return the original row and raw segment value.

The demo adds desktop/mobile stacks with a supplied trailing mean of their combined monthly visits. Comparable units and explicit descriptions remain required. Horizontal composition, dual scales, stacked lines/areas, percentage normalization and tooltip templates remain outside this increment.

Apache ECharts documents named stacks and sign-aware stacking in its [bar series options](https://echarts.apache.org/en/option.html#series-bar.stack). No additional engine modules or dependencies are required. Preserve rc.19 and all earlier archives; this new public contract has a separate verified rc.20 candidate. A documentation-only rc.21 successor corrects packaged registry-availability text after rc.19 publication; it preserves rc.20 runtime/declarations. npm next remains rc.19 until a separate future publication decision.

## Validation

Using Node 24.22.2 and npm 11.19.1:

- The workspace check passes formatting, 20 provenance tests, five asset tests, production builds, strict compilation, **304 unit/integration tests** (288 library and 16 playground), isolated declarations/documentation/client/SSR consumers, server markup and all twelve package-budget scenarios.
- The focused composed/pagination browser run passes **36 scenarios** across Chromium, Firefox and WebKit. Real painted segments share a category center when stacked, separate when group names change or stacking is removed, and emit raw `40` rather than a cumulative total. Checks also cover negative/zero/missing table values, keyboard actions, hidden identity/focus retention, invalid-stack recovery and renderer reuse. The complete final runtime suite passes **449 scenarios with four expected skips** across the three engines. The four skips retain the existing Chromium-only touch-drag/memory-tool scope in Firefox/WebKit. An earlier interrupted run is excluded. The runtime matches rc.20 and the byte-identical rc.21 successor; the corrected final documentation/benchmark source additionally passes the isolated workspace check and later static verification.
- The test script now executes library and playground tests separately. A temporary intentional library test compilation error verified that `npm test` exits unsuccessfully before running the playground. The probe was removed; the complete positive unit suite passes.
- The metric-marker follow-up builds and strictly compiles; its third marker follows the line palette. Final responsive captures and the manual accessibility-tree observations are recorded separately from human interpretation.
- The final [rc.21 source validation](rc21/source-validation.json) passes the same complete workspace check and reproduces the prepared rc.21 bytes. Its [package budgets](rc21/source-package-boundaries.json) measure combined root at 220,764 gzip / 188,615 Brotli bytes, core at 9,254 / 8,212, and root-frame emitted chunks at 203,777 / 175,819. All existing caps pass without adjustment; per-family engine isolation remains intact. No general latency improvement is claimed.
- The [rc.20 candidate](data/local-release-0.1.0-rc.20.json) passes exact metadata/notices, strict declarations, documented installation and all six independently installed client/SSR engine modes, plus overwrite refusal. Archive: 162,637 bytes, SHA-256 `ac0834cf4aef51c33e7f76f3c22bccdb8a1a2c9456ef0eb4ab1d85ee690ab333`.
- The [rc.21 documentation correction](data/local-release-0.1.0-rc.21.json) independently passes the same exact-artifact checks and overwrite refusal. Archive: 162,701 bytes, SHA-256 `3b7b4af12f77af6065c10f27e175a84763c22a9409b9317c4711f114b691af11`. Retained [documentation](rc21/documentation-consumer.json) and [runtime](rc21/packed-runtime.json) receipts identify its exact bytes. The [package comparison](rc21/package-comparison.json) confirms that only `package.json`, `README.md` and `CHANGELOG.md` differ from rc.20; runtime, declarations and notices are byte-identical. All 47 earlier archived files/checksums/retained manifests keep their [recorded digests](rc21/preserved-artifacts.json); the mutable current-manifest pointer is excluded.
- Current npm publication remains rc.19 under `next`, with `latest` on rc.18. rc.20/rc.21 are verified local candidates. The already-live rc.19 demo identity is recorded independently; no new demo deployment is claimed by these local results.

## Visual and interpretation evidence

The [before](captures/stacked-composed/before/manifest.json) and [after](captures/stacked-composed/manifest.json) capture matrices cover 320/390/768/1440 px in both themes, including code, full-page and tooltip captures. Compare the [previous narrow gallery](captures/stacked-composed/before/composed-light-320-full.png) with the [stacked gallery](captures/stacked-composed/composed-light-320-full.png). The new chart uses the existing presentation; three metrics and native legend buttons wrap within the card.

The [stacked accessibility tree](captures/stacked-composed/accessibility-tree.txt) exposes row/column headers and distinct raw signed/zero/missing values; the [pagination tree](captures/stacked-composed/pagination-accessibility-tree.txt) records the second page after keyboard activation of Next. These are automated observations, not human listening results. A named Show paginated sample button on each existing benchmark route makes the native paging flow directly available for the deferred session.

## Stacked rendering measurements

`npm run benchmark:composed:stacked` passes against the final production build, run after other checks finished. The existing composed benchmark route uses `?stacked=1`; each mount/update asserts that the actual renderer has first/third bars in the same stack and an independent line. The [raw timing record](data/ng17-stacked-composed-benchmark.json) includes one warm-up and 30 measured samples per operation, DPR 1, no animation and the existing 768 px fixture.

| Categories / three series | Mount p95 | Update p95 | Legend p95 | Resize p95 |
| --- | ---: | ---: | ---: | ---: |
| 200 | 16.9 ms | 17.2 ms | 18.4 ms | 33.7 ms |
| 2,000 stress | 41.3 ms | 41.2 ms | 46.1 ms | 51.1 ms |

Normal mount/update pass the existing 200 ms p95 target. Interaction/resize and stress results remain machine-specific observations, not new limits or portable latency promises. No data-envelope expansion is inferred.

## Sealed Pages verification

Two shared-workspace attempts were rejected as stale when the concurrent illustration-color and documentation-hover edits/commits changed their inputs. Neither interrupted/stale attempt counts as final static acceptance; no marker was restamped and no stale guard was bypassed.

A fixed local clone of base commit `8d28f252def1fcb3f01dda6a9cff1a510a472791` plus the working changes passes `build:pages`, `check:pages` and enforced `check:demo-performance`. Its source SHA-256 is `4128b639a6aedb3989fe664c42e03fc15afbf9d64f9c9616365f6d138a073286`. The [static validation](rc21/static-validation.json), exact [raw build marker](rc21/pages-build.txt), exact [raw three-browser receipt](rc21/pages-verification.txt) and [performance record](rc21/demo-performance.json) bind the result to that snapshot.

The build prerenders 34 routes and seals 138 files, artifact SHA-256 `3c18186fa0095772e1045179bf523586522f681b4e644b84bfedf480072e2efe`. Both composed examples, deep-link reloads, lazy charts/fonts, anchors, focus, persisted themes and mobile navigation pass in Chromium, Firefox and WebKit. All 16 route payload budgets, six controlled mobile medians and normal-motion revisit checks pass. The later illustration/hover changes are preserved and covered by this static snapshot; the earlier isolated workspace's source-file inventory remains distinct.

A byte-preserving copy is retained in ignored `dist/review-pages-rc21-3c18186fa009/`. This is a local-only dirty snapshot, not a demo deployment or npm publication. The live Pages marker was rechecked and still identifies `fb6cb05e5c985bca7f2f06bddf6460795ab511a3`; the deployment guide retains that public identity. Future deployment must use the normal clean/pushed-source and fresh-receipt workflow.

The [current human review sheet](RC20_HUMAN_REVIEW.md) includes stacked composition and pagination, with actual listening results still pending.
