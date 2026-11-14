# Combined preview and navigation performance checkpoint

The user authorized integration and verification of the finished concurrent performance edits with the month-preview work. Private rc.16 combines the verified rc.15 preview API/focus/Escape behavior with the shared controller, renderer and demo-loading corrections. All earlier archives and receipts retain their original identities. Human F09/R06/G2/G3/G4, public naming, registry publication and demo deployment remain pending.

## Combined behavior

- Chart factories initialize at the current host size. Unchanged-size observer deliveries and same-size option updates avoid redundant resize calls that interrupt entrance animation. Dimensions are remeasured after loading and reset on disposal. Repeated observer frames retain the same pending renderer import.
- Actual resizes still precede pending option updates. Calendar and radar skip rebuilding stale options when the next update owns that work; pure resizes retain their responsive layout rebuilds.
- Bar, line, area and composed gallery families have independent deferred blocks with the existing placeholder, viewport, hydration and print behavior. The chosen component and route static graphs are preloaded; unrelated chart-engine graphs remain rejected.
- Sidebar pointer/keyboard intent warms a destination once without navigation or chart mounting. Native focus, reduced motion, linked selection/ranges and opt-in previews keep their existing contracts.

The [navigation/animation report](DEMO_PERFORMANCE_FIXES.md#navigation-and-animation-follow-up) and [matched measurements](data/demo-navigation-performance.json) retain the concurrent task's before/after evidence. The [preview report](NG20_MONTH_PREVIEWS.md) retains the rc.13–rc.15 corrections and exact-artifact results. Neither earlier result is restamped as a new combined run.

## Verification

Verified 14 November 2026. [The combined receipt](data/combined-preview-performance.json) records all 362 runtime/tool/test source hashes, which remained unchanged across the checks.

- Every workspace-check stage passes: formatting, **20 provenance tests**, **five demo-asset tests**, production builds, strict compilation, **266 unit/integration tests**, strict installed declarations, fresh documented installation, SSR, independently installed runtime consumers and **all twelve package scenarios**.
- The complete browser suite passes **380 scenarios with four expected skips**, using three workers with unchanged assertions and no retries. Coverage includes all nine families, normal-motion progression, fresh component-request isolation, sidebar intent warming, input updates, themes, focus, linked preview/range/Escape behavior, hydration and cleanup.
- Exact **rc.16** passes metadata/notices, strict declarations and negative bindings, copied guide examples, fresh locked installation and all **six installed client/SSR modes**. Each runtime mode checks keyboard preview followed by Enter selection. The **155,195-byte, 68-file** archive has SHA-256 `b2796c4e12ae2a4349d1f4b5cd6e5a9726150d3f454079472f9c6a56a8944c0e`; [its immutable manifest](data/local-release-0.1.0-rc.16.json) binds every consumer stage to that same file.
- All **17 rc.0–rc.16 archives** retain their recorded digests. The earlier rc.13 failure and rc.14/rc.15 verification records keep their original scopes. Human F09/R06/G2/G3/G4 remain pending.

Combined package costs are **218,957 gzip / 187,036 Brotli bytes** for root, **202,475 / 174,598** for emitted root-frame chunks, and **7,973 / 7,016** for core. Caps remain 219,500 / 187,500, 203,000 / 175,000 and 10,000 / 9,000 respectively; focused family caps remain 200,000 / 175,000. Core and the reachable root-frame import contain no engine code.

The earlier preview-only static run was rejected when concurrent source changed; no stale snapshot was promoted. Final `build:pages`, `check:pages` and `check:demo-performance` run after these tracked evidence updates. Their actual source/artifact identity, three-engine receipt, sixteen cold-route budgets and normal-motion navigation samples are ignored outputs at `dist/pages/browser/preview-build.json`, `dist/pages/pages-verification.json` and `dist/demo-performance.json`. Dirty snapshots remain local-only. This work performs no deployment or registry publication.
