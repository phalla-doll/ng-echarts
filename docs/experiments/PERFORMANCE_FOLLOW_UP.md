# Chart performance follow-up

The user authorized the performance-review recommendations on 15 November 2026. Unreleased `@mantha911/ng-echarts@0.1.0-rc.19` source adds opt-in table pagination to bar, line, area, composed and pie, and bypasses stack-end scans for unstacked bars. Published rc.18 and all earlier archives are unchanged. Human F09/R06/G2/G3/G4 remain pending; this source change does not publish a package or deploy the demo.

## Behavior

`tablePageSize` defaults to `null`, preserving the complete native table. A positive safe integer limits row creation to the current page; validation rejects zero, negative, fractional, unsafe and nonnumeric sizes. Slicing precedes table-cell allocation and formatting. The plot still receives the full dataset. Native Previous/Next controls announce the visible row range; boundary controls retain focus with `aria-disabled` and clamped no-op actions. Every row remains reachable by keyboard. Zero, missing values, hidden-series actions, original-row references and raw selection events are preserved.

Replacing the immutable data reference or page size resets the table to page one. Collapse/reopen retains the current page. Page changes invalidate stale transient bar previews while leaving chart options and the existing canvas unchanged. Radar, calendar and Sankey keep their existing bounded tables.

The bar builder now guards its exposed-stack-corner scan with `stacked`. Its existing signed/zero/missing, theme, layout, selection and gradient behavior is retained. Option merging showed no meaningful gain in the initial review and remains unchanged.

## Validation and measurements

`npm run check:workspace` passes in an isolated snapshot of commit `979bf7d` plus the performance changes, excluding the concurrent demo icon edits. The [validation manifest](performance-follow-up/validation.json) binds the tested code files to their SHA-256 hashes. Checks include formatting, 20 provenance checks, five asset checks, production builds, strict compilation, **283 unit/integration tests**, installed declarations with `skipLibCheck: false`, the exact documented application, SSR and installed client/SSR runtime consumers. The [documentation receipt](performance-follow-up/documentation-consumer.json) and [runtime receipt](performance-follow-up/packed-runtime.json) record the rc.19 source tarball; they are not a prepared release artifact or publication receipt.

The full browser suite passes **434 scenarios**, with **four expected skips**, across Chromium, Firefox and WebKit. New scenarios cover all five paginated families, keyboard Previous/Next actions, partial final pages, boundary no-ops with retained focus, collapse/reopen, narrow layouts in both themes, unchanged canvas identity, zero extra ECharts updates while paging and teardown. Unit checks add immutable-data/page-size resets, invalid-size recovery, hidden/zero/missing observations, original-row identity and stale bar preview clearing. Existing rendering, hydration, range, preview, theme and 100-cycle lifecycle/retention checks also pass. After the concurrent icon change landed as `582309b`, the combined working-tree production build and strict compilation pass as well.

The [matched production measurements](data/table-pagination-performance.json) compare complete and 50-row tables in the same source build. Ten alternating pairs collect 30 samples per mode after warm-ups, using Chromium, DPR 1, disabled animation and no CPU/network throttling. Timings include row construction and DOM creation through Angular `afterNextRender`; subsequent layout and paint are excluded. All Cartesian fixtures have 2,000 rows and three series; pie retains its 100-category single-measure stress fixture.

| Family | Complete table p95 | 50-row page p95 |
| --- | ---: | ---: |
| Bar | 43.2 ms | 1.0 ms |
| Line | 39.3 ms | 1.1 ms |
| Area | 45.8 ms | 1.1 ms |
| Composed | 47.5 ms | 1.0 ms |
| Pie, 100 categories | 1.5 ms | 1.2 ms |

The large Cartesian tables improve by roughly 97–98% in this measured DOM-creation phase. The smaller pie fixture has little absolute saving. These machine-specific results do not extend the documented data envelope or establish field interaction latency. The chart still renders every observation; no plot-rendering speedup is inferred from table timing.

To repeat, build the production library/playground, then run `npm run benchmark:tables`. The benchmark command records samples and checks expected visible-cell counts and cleanup; it does not assert a portable latency threshold. Comparison captures show the [complete table](captures/table-pagination/complete-390-light.png) and [paged table](captures/table-pagination/paged-390-light.png) at 390 CSS pixels wide in the light theme.

The [package-boundary record](performance-follow-up/package-boundaries.json) measures 220,415 gzip / 188,284 Brotli bytes for the combined import, versus 219,105 / 187,148 in the initial review: **+1,310 gzip / +1,136 Brotli bytes**. Core measures 9,203 gzip bytes; focused entries increase by about 1.1 KB gzip, with engine module counts unchanged and none eager. All twelve package scenarios pass. Source combined-root allowances change from 219,500/187,500 to 222,000/190,000 gzip/Brotli bytes; emitted root-frame allowances change from 203,000/175,000 to 206,000/178,000. Focused-family/core limits and per-family lazy engine isolation remain unchanged. The old allowance overrun was detected before adjusting the source budget; preserved rc.18 keeps its original allowance and measured bytes.

## Requirement mapping

This follow-up extends automated F01/F02/F03/F05/F09/F10 evidence for strict input types, immutable updates, table formatting, native actions, keyboard focus, hydration and teardown. Human accessible interpretation is still pending. The [API guides](../BAR_CHART_API.md#optional-table-pagination-in-unreleased-rc19-source), [product specification](../PRODUCT_SPEC.md#opt-in-table-pagination-follow-up), [architecture](../TECHNICAL_ARCHITECTURE.md#table-pagination-and-bar-preparation-follow-up), [backlog](../BACKLOG.md#chart-performance-follow-up) and [acceptance matrix](../ACCEPTANCE_MATRIX.md#chart-performance-follow-up) describe the same source-only contract.
