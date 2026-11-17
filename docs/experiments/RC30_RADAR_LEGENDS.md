# rc.30 radar legend parity and presentation payload

Date: 17 November 2026. The user accepted a focused cleanup: reconcile verification records, complete radar list legends, measure payload and deliver a verified successor. Preserve rc.29 and every earlier archive. npm next remains rc.28/latest rc.18 until a separately verified publication; human F09/R06/G2/G3/G4 remain deferred/pending.

## Resolved baseline verification

Main `adbfac1dadc1cde18f41840040d4b7a9806f5dfd` passes all six jobs in [run 44004670471](https://github.com/phalla-doll/ng-echarts/actions/runs/44004670471): 342 unit tests, 575 browser passes/four expected skips, two separate WebKit horizontal probes, exact consumers, reproducibility and Pages/performance guards. Its archive retains canonical rc.29 SHA-256 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`. This closes the cold documentation-consumer readiness follow-up without changing the deployed UI identity. [CI receipt](rc30/baseline-ci.json), [result lines](rc30/baseline-ci-summary.txt).

## Changes

Radar applies its existing `legendLayout` input to chips or aligned lists, with chips remaining the default. Labels use the same wrapping and hidden-series cues as Cartesian charts. List rows align visibility or Missing data notes; chips keep missing-data notes visible and ordinary visibility text accessible. Keyed buttons, hidden comparison IDs, raw point actions, explicit scale descriptions and the browser renderer retain their identities. The gallery uses existing layout-choice styling, mirrors its selection into the copyable standalone source and resets to chips. Gallery routes continue to omit tables; explicit validation routes retain native table acceptance.

`ChartPresentation<T, Option>` now owns the common state validation, paginated row formatting, raw point lookup and browser binding previously repeated by Cartesian and pie components. Family hooks retain the original validation order, per-series versus per-category hiding, theme palettes and preview behavior. Scoped templates/styles and per-family lazy renderer registration remain unchanged apart from the radar legend binding. No new entry point, dependency or engine registration is introduced. Packaged README wording is corrected in the new version; earlier README/changelog/archive bytes are preserved.

## Payload experiments

The [preserved rc.29 baseline](rc30/rc29-package-boundaries.json) uses the existing Angular linking, minification, splitting and independently compressed chunk accounting. No cap or measurement change is made.

A shared native series-legend component prototype reduced raw JavaScript but increased aggregate independently compressed output. Its [diagnostic run](rc30/local/initial-bundle.txt) reports root 222,130 gzip / 190,360 Brotli bytes, failing both unchanged caps; core was 9,679 gzip bytes. The prototype was discarded completely. It is not part of the candidate or passing evidence.

The [shared-state intermediate](rc30/local/shared-state-bundle.txt) passes root 221,374 gzip / 189,274 Brotli and core 8,650 / 7,642. The subsequent [shared browser-binding measurement](rc30/local/shared-binding-bundle.txt) passes root **221,121 gzip / 188,993 Brotli**, leaving **879 / 1,007 bytes**; core is **8,697 / 7,673**, leaving **1,303 / 1,327 bytes**. Final candidate checks below own final measurements. This is a bounded improvement, not broad headroom for new engine features; general library zoom and graphical shared brushing remain subsequent work requiring fresh budgets.

## Verification and delivery

Pinned Node 24.22.2/npm 11.19.1 builds, strict compilation and all 342 unit tests pass. All [39 focused browser cases](rc30/local/focused-browser.txt) pass Chromium, Firefox and WebKit, covering radar layout/theme/width combinations, no-JavaScript chips, long labels, missing notes, keyboard focus, copied source, plot/table identities and existing pie/radar hydration, recovery and 100-cycle teardown. The [contract comparison](rc30/component-contracts.json) preserves all 16 supported component/export selectors and complete public input/output metadata. All [2,037 local links/anchors across 108 documents](rc30/links.json) pass.

The final [library build](rc30/local/final-library-build.txt) and [warm/two-clean comparison](rc30/local/reproducibility.txt) match SHA-256 `e19fbb40964251f5c1c6b7d10cc3808feb6fe10eb7419ae75fff7a880b7a7c6c`. The immutable candidate is **167,101 bytes**, 2,690 bytes smaller than rc.29. Its [exact artifact record](data/local-release-0.1.0-rc.30.json) and [consumer log](rc30/local/release-check.txt) pass notices/metadata, strict positive/negative declarations, the documented application and all six installed CSR/SSR modes, including the new radar list/missing-data keyboard flow. [Repeated preparation](rc30/local/immutability.txt) refuses archive/checksum/manifest replacement; [99 prior archive/checksum/versioned-manifest records](rc30/archive-preservation.json) are unchanged. The old current-manifest alias is preserved separately before advancing the alias to rc.30.

Visual comparison: [prior chips](rc30/local/radar-before-dark.png), [new chips](rc30/local/radar-after-chips-dark.png), [new aligned list](rc30/local/radar-after-list-dark.png). Responsive missing-data examples: [dark 390 px](rc30/visual/radar-list-dark-390.png), [light 1440 px](rc30/visual/radar-list-light-1440.png).

Full regression/source CI, npm publication and new demo deployment remain in progress and require separate receipts. The existing demo retains source `8f961cf8399677abf555b0a58f64d33b2a40fbc7` until a guarded deployment completes.
