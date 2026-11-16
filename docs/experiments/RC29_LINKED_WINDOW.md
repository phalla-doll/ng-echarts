# rc.29 payload and shared dashboard window

Date: 16 November 2026.

The user authorized payload reduction, delivery of the integrated package, shared zoom/bidirectional selection and status reconciliation. [rc.28 delivery](RC28_PUBLICATION.md) is complete. New library runtime/declarations use rc.29; preserve rc.28 and all earlier artifacts. npm next is rc.28/latest rc.18. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Retained payload changes

Bar-only plot/table preview state, reconciliation effects and listeners now belong to `BarChart`, rather than every Cartesian family. Base hooks preserve browser-adapter ordering, cleanup, raw actions, range cancellation and opt-in behavior. Internal lifecycle helpers and non-template component state use ES2022 native private slots; template/query inputs retain their supported Angular contracts. Shared validation avoids a repeated series-shape check.

All twelve budget scenarios pass with the original measurement and caps. Root gzip changes from 221,792 to **221,664 bytes**, leaving **336 bytes**; core changes from 9,531 to **8,616 bytes**, leaving **1,384 bytes**. Root Brotli is 189,538, leaving 462 bytes. This is a limited aggregate improvement, with larger focused/core gains; it is not broad headroom for new engine features. The [module comparison](rc29/module-comparison.json) confirms identical ECharts/ZRender contributing sets and unchanged caps in all twelve scenarios against rc.28. No new entry point or renderer component is introduced.

Two discarded consolidation experiments attempted shared legends/native table controls. They increased core or aggregate compressed output and failed unchanged caps; neither implementation is retained. Source and measurements never treat those diagnostic failures as passes. The final runtime retains family-scoped presentation styles and existing legend/table DOM.

## Shared-window interaction

The actual standalone composed dashboard now owns one inclusive stable-ID category window. Native From/To, Zoom in/out, Previous/Next window and Reset zoom controls derive both charts from the same visible rows. Crossed bounds collapse to the changed endpoint; reordering normalizes endpoint order; removing an endpoint restores the full window. A selected month persists only while visible. Reset month and Reset zoom have separate, labelled jobs. Zoom/pan buttons keep native keyboard focus and guard unavailable operations with `aria-disabled`.

Selecting a device from the breakdown or Device field opens its monthly detail. Overview and monthly detail actions commit the same month ID; detail bands/table-current feedback and the Month field show selection. All devices restores the aggregate breakdown. Legends remain independent. Missing values and recorded zero retain their meanings. The trailing mean is computed over full supplied history before slicing, so zoom does not change the statistic.

This is application-owned category slicing, not a general ECharts DataZoom or library two-way brushing API. The complete displayed source is regenerated and tested against the preserved published rc.22 baseline; it needs no new library input, package dependency or renderer registration. Graphical shared brushing/disjoint selection and arbitrary chart-family linking remain outside this increment.

## Verification

Pinned Node 24.22.2/npm 11.19.1 production builds and strict compilation pass. All 342 unit tests pass (322 library, 20 playground). The shared dashboard journey passes six local Chromium/Firefox/WebKit cases, including type-ahead, raw keyboard/table actions, stable renderer instances, reordering/removal, crossed endpoints, disabled actions, reset focus, empty/restore and 320/390/768/1440 px. Initial test attempts used platform-dependent select keys and attempted Playwright clicking an aria-disabled button; type-ahead/Tab and native Enter now exercise these controls without changing product behavior or test deadlines.

Warm and two independent cache-free macOS builds match SHA-256 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda` ([reproducibility](data/reproducibility-0.1.0-rc.29-darwin.json)). The immutable 169,791-byte candidate passes strict/negative declarations, the documented application and all six installed CSR/SSR modes ([exact artifact record](data/local-release-0.1.0-rc.29.json)); repeated preparation refuses to replace archive/checksum/manifest. The final displayed dashboard also passes its independent published-rc.22 consumer in all three engines. Nine final focused cases include actual canvas clicks in both chart directions. Existing SSR, publication/provenance and demo-asset guards pass.

An initial long regression was invalidated when its shared production output was rebuilt during execution. Its subsequent stale-module failures are not product-regression evidence or a completed pass; it was interrupted. The full suite is restarted on the final build with a separate output/server and no production-file mutation. Final full regression, clean-source CI and static/public deployment remain pending at this checkpoint; actual receipts must be recorded before claiming them complete.

Canvas/UI inspection captures: [full dashboard](rc29/visual/dashboard-full-1440.png), [shared window](rc29/visual/dashboard-window-1440.png), [390 px controls](rc29/visual/dashboard-window-390.png). Earlier [dashboard captures](captures/composed-dashboard) remain preserved for comparison.
