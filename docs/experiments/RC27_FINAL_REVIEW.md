# rc.27 final review and readiness

Date: 16 November 2026. This reviews the isolated payload-reduction PR against published rc.24. It preserves the [rc.26 implementation and historical CI evidence](RC26_PAYLOAD_REDUCTION.md) and advances package contents to a new rc.27 candidate. npm next retains rc.24/latest rc.18, the demo retains source `42b27aa`, and human F09/R06/G2/G3/G4 remain deferred/pending.

## Review finding and correction

The review found one P2 visual regression: radar uses the same `.scale-context` paragraph as composed charts, but payload consolidation moved its rule into the composed-only stylesheet. Radar therefore inherited browser paragraph margins and could inherit consumer typography. The [regression check before correction](rc27/radar-regression-before.txt) fails on Chromium with `margin-top: 12px` instead of `0px`.

The rule now lives in an internal shared stylesheet imported by radar and composed only. The existing responsive/theme tests assert its font, line height and top/bottom margins for both families; the installed runtime consumer asserts the same contract for radar in all client/SSR browser modes. Existing lifecycle effect ordering, cleanup, required signal inputs/defaults, generic event identities, lazy engine registration and other relocated CSS consumers were reviewed without further findings. This is a scoped code review, not completion of deferred human interpretation.

## Local evidence

- [Targeted browser results](rc27/radar-composed-green.txt): all 18 radar/dual-axis cases pass across Chromium, Firefox and WebKit, including resize, themes, keyboard focus, hydration and repeated teardown.
- [Published baseline screenshot](rc27/radar-rc24-light-390.png) and [corrected candidate screenshot](rc27/radar-rc27-light-390.png): identical PNG bytes at 390px, light theme and reduced motion; [comparison receipt](rc27/radar-visual-comparison.json). Visual inspection confirms the compact scale description and chart layout.
- [Reproducibility](data/reproducibility-0.1.0-rc.27-darwin.json): warm and two cache-free independent roots match complete archive SHA-256 `7ed653831c8180317777ffce5713102b383c1e409d7df163549e952780464730`.
- [All twelve module budgets](data/package-boundaries.json) pass with unchanged caps/accounting. Root remains 221,060 gzip / 189,116 Brotli bytes, leaving 940 / 884 bytes. Core remains 9,494 gzip / 8,405 Brotli bytes; engine modules remain lazy. rc.27 restores radar's style without changing the compatibility root total because radar is a focused entry point.

The candidate is 166,508 bytes, 3,922 bytes smaller than rc.24. The [rc.26 preservation receipt](rc27/rc26-preservation.json) records its untouched archive and byte-identical versioned manifest before the current-manifest alias advanced. All prior archived candidates remain preserved. [Exact installed consumers](data/local-release-0.1.0-rc.27.json) pass metadata/notices, strict declarations, fresh documentation and all six client/SSR modes with the same archive digest; [consumer log](rc27/release.txt). The [overwrite-refusal check](rc27/immutability.txt), [335 unit tests](rc27/unit.txt) and [strict compilation](rc27/typecheck.txt) pass. These are local preparation receipts. The PR checks and its readiness receipt own the subsequent full Linux CI result and cross-platform archive comparison; neither is inferred from the local checks.

## Delivery boundary

[PR #1](https://github.com/phalla-doll/ng-echarts/pull/1) remains isolated from concurrent legend-layout work in the original checkout. Full CI for the corrected source and complete Linux/macOS archive comparison are required before marking it ready. The PR description records the verified source, run and digest when those checks finish. Merge, npm publication and demo deployment are subsequent delivery actions; no current result changes the published tags, deployed identity or human gates.
