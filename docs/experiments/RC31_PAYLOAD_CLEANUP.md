# rc.31 bounded payload cleanup

Date: 17 November 2026. Local source candidate `0.1.0-rc.31`; unpublished. npm next remains rc.30/latest rc.18. The demo retains verified source `0e40644`. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Retained changes

Calendar, Sankey and radial progress now use the existing browser binding for readiness, reduced-motion listeners, controller lifetime, render phases and focus cleanup. Each family retains its own theme inputs, option builder, focus dependencies and point callbacks. Cartesian descriptor validation is shared between normalization and legend reconciliation. Bar and area opacity parsing share one implementation while preserving bar prefix/fallback behavior and area complete-token/transparent fallback behavior. Thirteen additional color cases cover hex, RGB/RGBA, zero alpha and unsupported/incomplete tokens.

Supported signal contracts, eleven entry identities, templates/CSS, lazy renderer registration, dependencies, measurement and caps remain unchanged. The budget checker now prints remaining gzip/Brotli headroom and records it per scenario without changing measurement or caps. This increment does not add zoom or brushing.

## Measurements and limits

The baseline is rebuilt under Node 24.22.2/npm 11.19.1 with the unchanged package-budget checker: root 221,121 gzip / 188,993 Brotli bytes; core 8,697 / 7,673. The final [unchanged checker](rc31/local/final-bundle.txt) measures root **220,993 gzip / 188,889 Brotli**, leaving **1,007 / 1,111 bytes**; core **8,677 / 7,661**, leaving **1,323 / 1,339 bytes**. Root saves only **128 gzip / 104 Brotli bytes** (about 0.06% of baseline gzip). Calendar saves 300 gzip bytes, Sankey 309 and radial progress 197; focused bar/area/composed have small compressed-size increases that remain within unchanged caps. The [complete comparison](rc31/bundle-comparison.json) records every gain and regression. All twelve ECharts/ZRender module sets, scenario exports, budgets and eager boundaries match baseline; no engine runtime is eager.

Savings are bounded. The proposed shared-table/legend approach is not a general source of headroom under the existing core cap. Additional library zoom or graphical two-way brushing still requires a separately measured payload design; do not raise caps or treat this cleanup as broad feature capacity.

## Discarded experiments

- A preliminary shared-table component retained duplicate legend styles and exceeded the core cap at 10,381 gzip / 9,187 Brotli bytes ([diagnostic](rc31/local/discarded-table-bundle.txt)). It is not retained or accepted evidence for a finished component.
- A corrected experiment extending the existing pager passed caps but used core 9,886 / 8,771, leaving only 114 / 229 bytes. Root improved to 220,799 gzip but Brotli increased to 189,368; the trade used almost all core headroom ([diagnostic](rc31/local/discarded-pager-bundle.txt)). It is discarded.
- Concurrent dynamic chart-registration imports fragmented compression and failed composed at 203,148 gzip / 177,328 Brotli ([diagnostic](rc31/local/discarded-registration-bundle.txt)). Original per-chart imports remain.
- Sharing raw renderer-event decoding introduced an additional core dependency into the bar lazy graph: focused bar grew to 188,189 gzip while root improved only 50 bytes against its preceding experiment ([diagnostic](rc31/local/discarded-event-bundle.txt)). That change is discarded.

## Verification

Strict compilation and 355 unit tests pass at the initial checkpoint. Initial full workspace verification stops at the strict consumer's existing Installation guard: local package version advanced while the displayed tarball still named rc.30. The correction names unreleased rc.31 and its local tarball while preserving published rc.30/rc.18 wording; no assertion is weakened. The [continuation](rc31/local/workspace-continuation-consumer.txt) passes the same strict consumer. Fresh [documentation](rc31/local/documentation-consumer.txt), [published-rc.22 dashboard](rc31/local/dashboard.txt), [SSR](rc31/local/ssr.txt) and [six installed runtime modes](rc31/local/runtime.txt) pass. [Sixteen supported component/export contracts](rc31/component-contracts.json) match rc.30. [Baseline behavior comparisons](rc31/pure-behavior-comparison.json) match 2,060 color results across 515 tokens and 143 malformed/valid descriptor/data combinations. A [manual agent-browser calendar journey](rc31/manual-calendar.json) activates the raw zero value by keyboard and observes `2024-01-31: 0 contributions`.

The [warm/two-clean macOS comparison](data/reproducibility-0.1.0-rc.31-darwin.json) matches SHA-256 `bbbe3a98e4a12b672a285d40f61148ec454be6f2905619d56e314c5a31549e6f`. The prepared immutable candidate is **163,860 bytes**, 3,241 bytes smaller than published rc.30, with the same digest. The [exact artifact](data/local-release-0.1.0-rc.31.json) passes metadata/notices, strict positive/negative declarations, a fresh documentation application and all six installed CSR/SSR modes ([log](rc31/local/release-local.txt)). [Repeated preparation](rc31/local/immutability.txt) refuses archive/checksum/manifest replacement. All [104 prior records](rc31/archive-preservation.json) remain unchanged, including the byte-identical [old current-manifest alias](rc31/rc30-manifest-alias.json). All 587 workspace browser cases pass with four expected skips, before the additional review test below. Linux CI and any publication/deployment require separate receipts.


## Local static verification

The [isolated Pages build](rc31/local/pages-build.txt) seals 145 files with SHA-256 `ed7ab80eb741f3385fd46e9f374ce885e3c5bee3fd4bf96f45090d2bb470fdae`. Its [marker](rc31/local/preview-build.txt) identifies a working-tree snapshot from base `7c9bda1`; it is local-only and does not replace the deployed source `0e40644`. All 40 routes/145 files pass [Chromium, Firefox and WebKit static verification](rc31/local/pages-check.txt). All 17 unchanged [performance guards](rc31/local/performance.json) and [normal-motion navigation checks](rc31/local/pages-performance.txt) pass. The [receipt](rc31/local/preview-verification.txt) retains actual verification identity. No deployment occurred.


## Late theme review — superseded candidate

The completed [three-engine regression](rc31/local/browser-regression.txt) passes 587 cases/four expected skips. A subsequent browser-mode Angular test exposes a regression introduced by shared descriptor validation: after rendering valid light data, duplicate series IDs still produce the expected error, but changing the theme to dark leaves the error-frame fallback background at `#ffffff` instead of `#18202c` ([failure](rc31/local/final-theme-review.txt)). Normalization and legend reconciliation require unique IDs; theme sampling historically accepts duplicate but well-shaped descriptors while displaying the validation error.

Do not deliver rc.31. Its archive, checksum, manifests and passing preparation receipts remain immutable as historical scopes; the late failure is preserved here. [rc.32](RC32_PAYLOAD_REVIEW.md) restores the distinct theme-validation policy and adds the regression test without replacing the rc.31 artifact. npm next remains rc.30/latest rc.18 and the deployed demo is unchanged.
