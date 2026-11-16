# rc.25 presentation consolidation and payload reduction

Date: 16 November 2026. The user prioritized bundle headroom after verified rc.24 package/demo delivery. This increment prepares a separate local rc.25 candidate. npm next retains rc.24 and latest retains rc.18; the deployed demo retains source `42b27aa`. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Scope and behavior

An internal `ChartPresentation<T>` directive owns common signal inputs, theme defaults, renderer recovery and native table state once for Cartesian and pie components. Family-specific inputs, generic binding inference, validation and raw events retain their contracts. The browser-only lifecycle binding coordinates readiness, motion listeners, rendering, focus and teardown with the original render-effect registration and cleanup order. Chart initialization and per-family ECharts registration remain lazy and independent; no engine runtime enters core.

Pie/donut rules move from the shared Cartesian stylesheet to the pie component; bar row-feedback rules and composed scale-description rules move to their owning components. Existing selectors, declarations and rendered markup are retained. Native table templates remain family-owned. All implementation code is original; Angular packages continue using partial compilation and supported inheritance rather than custom Angular definitions or rewritten generated artifacts.

## Measured payload

The [rc.24 baseline](rc25/rc24-package-boundaries.json), current [module budgets](data/package-boundaries.json) and [complete comparison](rc25/payload-comparison.json) use the same Angular linking, minification, splitting and independently compressed chunk accounting. No budget or measurement switch changes.

| Scenario | rc.24 gzip | rc.25 gzip | Change | Remaining gzip budget |
| --- | --- | --- | --- | --- |
| Combined root | 221,985 | 221,051 | −934 | 949 |
| Bar | 186,899 | 186,679 | −220 | 13,321 |
| Line | 187,414 | 187,104 | −310 | 12,896 |
| Area | 187,902 | 187,594 | −308 | 12,406 |
| Composed | 197,218 | 196,943 | −275 | 3,057 |
| Pie | 163,878 | 163,578 | −300 | 36,422 |
| Core | 9,307 | 9,494 | +187 | 506 |

Root Brotli falls from 189,639 to 189,104 bytes, leaving 896 bytes under its unchanged 190,000-byte cap. All twelve scenarios pass; ECharts/ZRender contributing module sets are identical and every eager-engine count remains zero. The complete comparison records radar's reduction and the small calendar/Sankey/radial/root-frame increases from shared core metadata. This is a bounded cleanup: root and core budgets remain tight, and new features must receive fresh measurements.

## Verification

The final workspace check passes formatting, publication/Pages/asset guards, production builds, warm/two-clean reproducibility, strict compilation, 335 unit tests, isolated declarations/negative bindings, fresh documented installation, the digest-verified npm rc.22 dashboard pilot, SSR, six installed client/SSR modes and all twelve module budgets. The [exact candidate](data/local-release-0.1.0-rc.25.json) passes metadata/notices, strict declarations, fresh documentation and all six installed client/SSR modes. The [local log](rc25/local/release-check.txt) and [overwrite-refusal check](rc25/local/immutability.txt) preserve results. Full browser regression remains in progress; no pending result is counted as passed.

The 390 px light-theme [rc.24 donut](rc25/visual/pie-rc24.png) and [rc.25 donut](rc25/visual/pie-rc25.png) have identical PNG bytes and computed styles in the [comparison](rc25/visual/pie-comparison.json). The [rc.24 selected bar table](rc25/visual/bar-rc24.png) and [rc.25 selected bar table](rc25/visual/bar-rc25.png) also have identical PNG bytes and computed styles in their [comparison](rc25/visual/bar-comparison.json). Broader responsive/themes/focus/preview/lifecycle checks belong to the full browser run.

## Limits and preservation

The diagnostic shared-table prototype exceeded the unchanged core budget and was discarded; native tables remain in their original family templates. Shortened internal filenames provided negligible savings and were also discarded. Neither experiment is part of the candidate or passing regression evidence. The 165,879-byte rc.25 archive has SHA-256 `a5b5edf7a03e975bfceb9db21973445d1f82d7abbe0685afde860cb574085732`, 4,551 bytes smaller than rc.24. The [preservation receipt](rc25/local/archive-preservation.json) checks 69 existing archive/checksum/versioned-manifest files unchanged. The advancing current-manifest alias retains its prior rc.24 bytes in a versioned manifest, verified against the baseline digest. Published rc.24 and earlier archives must remain immutable; this local candidate does not close human release acceptance.
