# rc.26 presentation consolidation and payload reduction

Superseded by the [rc.27 final review correction](RC27_FINAL_REVIEW.md), which restores radar scale-description styling while preserving this sealed artifact and its actual historical results.

Date: 16 November 2026. The user prioritized bundle headroom after verified rc.24 package/demo delivery. This increment prepares a separate local rc.26 candidate. npm next retains rc.24 and latest retains rc.18; the deployed demo retains source `42b27aa`. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Scope and behavior

An internal `ChartPresentation<T>` directive owns common signal inputs, theme defaults, renderer recovery and native table state once for Cartesian and pie components. Family-specific inputs, generic binding inference, validation and raw events retain their contracts. The browser-only lifecycle binding coordinates readiness, motion listeners, rendering, focus and teardown with the original render-effect registration and cleanup order. Chart initialization and per-family ECharts registration remain lazy and independent; no engine runtime enters core.

Pie/donut rules move from the shared Cartesian stylesheet to the pie component; bar row-feedback rules and composed scale-description rules move to their owning components. Existing selectors, declarations and rendered markup are retained. Native table templates remain family-owned. All implementation code is original; Angular packages continue using partial compilation and supported inheritance rather than custom Angular definitions or rewritten generated artifacts.

## Measured payload

The [rc.24 baseline](rc25/rc24-package-boundaries.json), current [module budgets](data/package-boundaries.json) and [complete comparison](rc26/payload-comparison.json) use the same Angular linking, minification, splitting and independently compressed chunk accounting. No budget or measurement switch changes.

| Scenario | rc.24 gzip | rc.26 gzip | Change | Remaining gzip budget |
| --- | --- | --- | --- | --- |
| Combined root | 221,985 | 221,060 | -925 | 940 |
| Bar | 186,899 | 186,678 | -221 | 13,322 |
| Line | 187,414 | 187,105 | -309 | 12,895 |
| Area | 187,902 | 187,592 | -310 | 12,408 |
| Composed | 197,218 | 196,942 | -276 | 3,058 |
| Pie | 163,878 | 163,577 | -301 | 36,423 |
| Core | 9,307 | 9,494 | +187 | 506 |

Root Brotli falls from 189,639 to 189,116 bytes, leaving 884 bytes under its unchanged 190,000-byte cap. All twelve scenarios pass; ECharts/ZRender contributing module sets are identical and every eager-engine count remains zero. The complete comparison records radar's reduction and the small calendar/Sankey/radial/root-frame increases from shared core metadata. This is a bounded cleanup: root and core budgets remain tight, and new features must receive fresh measurements.

The symlinked local worktree measures 221,060 gzip / 189,116 Brotli bytes for the root. Linux CI measures 221,051 / 189,104, leaving 949 / 896 bytes respectively. Both use the unchanged accounting and caps; the complete packaged archives are byte-identical. The small downstream consumer-total difference is recorded separately from package reproducibility.


## Verification

The warm rc.26 package and two independent clean roots match SHA-256 `62109131e98fe79e7f4556df12f1ba7194d1e6b02a4b629ba1f474f5bdfe7b2b`. Strict type checking, all 335 unit tests and all twelve module budgets pass locally. The [public signal comparison](rc26/local/public-signal-comparison.json) confirms all ten supported components retain the rc.24 input/output names, required flags, type arguments and defaults; installed consumers separately verify actual Angular inference and behavior. The [exact local candidate](data/local-release-0.1.0-rc.26.json), [consumer log](rc26/local/release-check.txt) and [overwrite-refusal check](rc26/local/immutability.txt) pass: metadata/notices, strict declarations, fresh documentation and all six installed client/SSR modes. The 166,359-byte archive is 4,071 bytes smaller than rc.24. [Full PR CI 43796458090](https://github.com/phalla-doll/ng-echarts/actions/runs/43796458090) passes all six jobs for implementation head `8b8b08ed31d84d3243fb4e01cfcc2f4d3e3c2f92` against base `aa7087e`, using merge checkout `8f8badc2e5e07239b763780a2fbcdea81c9dbcec`: 335 unit tests and 476 browser passes with four expected skips. The separate early WebKit check passes two cases. The [workflow receipt](rc26/ci/workflow.json), [test summary](rc26/ci/test-summary.txt) and [budget summary](rc26/ci/budget-summary.txt) preserve actual results. Pages verifies a clean sealed snapshot and performance guards; exact consumers and Linux reproduction pass. Receipt-only follow-ups preserve this verified implementation identity. The type-only axis contract replaces inferred category/value return unions; it does not change runtime statements. The prior rc.25 functional checks are historical evidence below; only checks actually completed for rc.26 will be recorded as passing here.

The prior [rc.24 donut](rc25/visual/pie-rc24.png) and [rc.25 donut](rc25/visual/pie-rc25.png), plus the selected bar-table pair, have identical PNG bytes and computed styles. The [runtime comparison](rc26/local/runtime-comparison.json) confirms every rc.26 FESM runtime member is byte-identical to rc.25; the declaration correction is type-only, so those captures represent the retained runtime.

## Preserved rc.25 attempt and isolation

The 165,879-byte rc.25 archive, SHA-256 `a5b5edf7a03e975bfceb9db21973445d1f82d7abbe0685afde860cb574085732`, passes exact consumers. An independent checkout reproduces all runtime members but changes inferred `xAxis`/`yAxis` union member ordering in one core declaration file, producing `12bd51fc1a0c31aabd0c35d088dff467a772b008dc0b1df5e4115269ebdfadd3`. The [comparison](rc25/diagnostics/isolated-rebuild.json) and [declaration diff](rc25/diagnostics/declaration-order.diff) preserve this failed complete-byte comparison. Both archives remain preserved; rc.26 adds explicit category/value axis and Cartesian option types rather than changing rc.25 in place.

Concurrent legend-layout edits and a rebuild arrived in the original shared checkout during local browser verification. That run was stopped and excluded from complete passing evidence. Work continued in the isolated `codex/payload-headroom` checkout, reconstructed from the verified rc.25 source maps and unchanged baseline files. The reconstructed archive differs only in the declaration ordering above. The independent PR CI and isolated checks own final rc.26 results; concurrent legend work remains separate.

## Limits and preservation

The diagnostic shared-table prototype exceeded the unchanged core budget and was discarded; native tables remain in their original family templates. Shortened internal filenames provided negligible savings and were also discarded. Neither experiment is part of the candidate or passing regression evidence. The canonical rc.26 archive is SHA-256 `62109131e98fe79e7f4556df12f1ba7194d1e6b02a4b629ba1f474f5bdfe7b2b`. Both rc.25 variants and their original receipts remain preserved. The current-manifest alias advances to rc.26 while a byte-identical versioned rc.25 manifest is retained. The prior [archive-preservation receipt](rc25/local/archive-preservation.json) records unchanged rc.24 and earlier files. The [Linux PR artifact comparison](rc26/ci/artifact-comparison.json), [actual manifest](rc26/ci/release-manifest.txt) and [Linux reproduction record](rc26/ci/reproducibility-linux.json) match all 68 members and 11 declaration files to the canonical archive. The PR head is `8b8b08e`; the artifact records actual merge checkout `8f8badc2e5e07239b763780a2fbcdea81c9dbcec` and `includesWorkingTree: true` after CI refreshes tracked evidence. This PR artifact is verification evidence, not an exact-main publication authorization. The [preservation receipt](rc26/local/archive-preservation.json) confirms all 69 prior archive/checksum/versioned-manifest files remain unchanged, and both rc.25 variants remain preserved. All three full browser suites and the aggregate PR gate pass as recorded above. The candidate remains isolated for review in [PR #1](https://github.com/phalla-doll/ng-echarts/pull/1); the original concurrent legend work is preserved separately. Published rc.24 and earlier archives remain immutable; human release gates remain pending.
