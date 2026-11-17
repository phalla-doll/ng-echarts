# rc.30 radar legend parity and presentation payload

Date: 17 November 2026. The user accepted a focused cleanup: reconcile verification records, complete radar list legends, measure payload and deliver a verified successor. Preserve rc.29 and every earlier archive. rc.30 is published under npm next, latest remains rc.18, and the preserved rc.29 candidate remains unpublished; human F09/R06/G2/G3/G4 remain deferred/pending.

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

Pinned Node 24.22.2/npm 11.19.1 builds, strict compilation and all 342 unit tests pass. All [39 focused browser cases](rc30/local/focused-browser.txt) pass Chromium, Firefox and WebKit, covering radar layout/theme/width combinations, no-JavaScript chips, long labels, missing notes, keyboard focus, copied source, plot/table identities and existing pie/radar hydration, recovery and 100-cycle teardown. The [contract comparison](rc30/component-contracts.json) preserves all 16 supported component/export selectors and complete public input/output metadata. All [2,049 local links/anchors across 108 documents](rc30/links.json) pass.

The final [library build](rc30/local/final-library-build.txt) and [warm/two-clean comparison](rc30/local/reproducibility.txt) match SHA-256 `e19fbb40964251f5c1c6b7d10cc3808feb6fe10eb7419ae75fff7a880b7a7c6c`. The immutable candidate is **167,101 bytes**, 2,690 bytes smaller than rc.29. Its [exact artifact record](data/local-release-0.1.0-rc.30.json) and [consumer log](rc30/local/release-check.txt) pass notices/metadata, strict positive/negative declarations, the documented application and all six installed CSR/SSR modes, including the new radar list/missing-data keyboard flow. [Repeated preparation](rc30/local/immutability.txt) refuses archive/checksum/manifest replacement; [99 prior archive/checksum/versioned-manifest records](rc30/archive-preservation.json) are unchanged. The old current-manifest alias is preserved separately before advancing the alias to rc.30.

Visual comparison: [prior chips](rc30/local/radar-before-dark.png), [new chips](rc30/local/radar-after-chips-dark.png), [new aligned list](rc30/local/radar-after-list-dark.png). Responsive missing-data examples: [dark 390 px](rc30/visual/radar-list-dark-390.png), [light 1440 px](rc30/visual/radar-list-light-1440.png).

At the preparation checkpoint, full regression/source CI, npm publication and a new demo deployment remained in progress and required separate receipts. The existing demo retained source `8f961cf8399677abf555b0a58f64d33b2a40fbc7` until a guarded deployment completes.

## Initial CI and readiness correction

[CI 44010990276](https://github.com/phalla-doll/ng-echarts/actions/runs/44010990276) for implementation source `d1db099d30c633df3d4bda5f06b8f1533e6b3bfc` passes workspace/exact consumers, Pages/performance, Chromium and Firefox; WebKit fails an older concept-gallery test during its first `page.goto`, before chart assertions execute. The [trace summary](rc30/ci/initial-webkit-readiness.json) and [error context](rc30/ci/initial-webkit-error-context.txt) record the unchanged 30-second load-event wait, already rendered calendar SVG and HTTP 200 responses. They do not identify the precise cause of the delayed load event.

The verification-only correction uses `domcontentloaded` for that test's embedded/standalone navigations, then retains its explicit chart readiness, progressive rendering, theme, sample table, all fourteen plots, self-contained HTML/font/engine, offline controls and browser-error assertions. All timeouts remain unchanged. All [nine repeated local cases](rc30/ci/concept-readiness-local.txt) pass across the three engines. Package source, archive bytes, caps and renderer behavior are unchanged; fresh full CI is required before publication.

The [initial combined local regression](rc30/local/initial-combined-check.txt) passed Chromium and Firefox before a diagnostic Playwright invocation reused its `test-results` output directory. That invocation deleted in-flight trace files, causing WebKit `browserContext.close` ENOENT errors rather than application assertion failures. [Collision contexts](rc30/ci/local-trace-collision) preserve those diagnostics. The combined run cannot be called a pass; final WebKit verification uses a separate output directory and does not overlap another Playwright runner.

The initial Linux workspace artifact independently matches the canonical 167,101-byte rc.30 archive and all 68 members ([comparison](rc30/ci/initial-artifact-comparison.json), [actual manifest](rc30/ci/initial-release-manifest.json)). Its failed aggregate CI result does not authorize publication.

## Completed local regression follow-up

The isolated [full WebKit rerun](rc30/local/webkit-regression.txt) passes 194 cases/two expected browser-specific skips with `--output=tmp/rc30-webkit-results`, after the other runner has exited. The original clean Chromium portion passes 196 cases and Firefox passes 194/two skips; the corrected concept navigation additionally passes the nine repeated cases above. These scopes cover all 584 browser passes/four expected skips, without calling the artifact-collision run a successful combined check. Workspace/unit/exact-consumer results remain independently recorded. Fresh Linux CI owns complete verification of the corrected source.

Earlier unsealed workspace packaging in the combined log reports digest `63d0742eb12b0c3de1ff4737b42fe426b6ff1eafe7a2205d1bfaaac71f92ea06`, before the final packaged README availability correction. It was never archived as a candidate. The only sealed rc.30 archive is canonical `e19fbb40964251f5c1c6b7d10cc3808feb6fe10eb7419ae75fff7a880b7a7c6c`; its final README, exact consumers and independent Linux bytes are checked separately above.

## Completed implementation CI

Verification source `4caac5e63936e710d6870b55d2c86612df04fdd3` passes [all six jobs in CI 44012447993](https://github.com/phalla-doll/ng-echarts/actions/runs/44012447993): 342 unit tests, 584 browser passes/four expected skips, both separate WebKit horizontal probes, exact consumers, SSR, reproducibility and Pages/performance. The [CI receipt](rc30/ci/source-ci.json) and [result lines](rc30/ci/ci-summary.txt) supersede the failed aggregate run without erasing its diagnostics. The independent [Linux archive comparison](rc30/ci/artifact-comparison.json) and [actual manifest](rc30/ci/release-manifest.json) match canonical rc.30 bytes and all 68 members. No package/library source changes follow the implementation commit; the readiness follow-up changes tests and repository documentation only.

## Publication

[OIDC publishing run 44014710732](https://github.com/phalla-doll/ng-echarts/actions/runs/44014710732) succeeds from verified exact-main source `4caac5e63936e710d6870b55d2c86612df04fdd3` and CI `44012447993`. It uploads the reviewed archive once, verifies canonical registry bytes, waits for normal npm resolution and passes fresh strict/documentation/CSR/SSR consumers. npm next is **rc.30** and latest remains **rc.18**. [Workflow](public-rc30/workflow.json), [registry verification](public-rc30/registry-verification.json), [normal resolution](public-rc30/npm-resolution.json), [documented consumer](public-rc30/ng15-documentation-consumer.json) and [runtime consumers](public-rc30/packed-runtime.json) retain actual evidence.

Package README/changelog/notices and canonical SHA-256 `e19fbb40964251f5c1c6b7d10cc3808feb6fe10eb7419ae75fff7a880b7a7c6c` are immutable. The subsequent repository/demo availability update does not alter package contents. Human gates remain pending; demo delivery follows separately below.

The repository/demo status update also passes the [digest-verified rc.30 strict registry consumer](rc30/local/status-consumer.txt), retaining the existing Installation wording guard. Package files are unchanged; only current availability text and receipts advance.
