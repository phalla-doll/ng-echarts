# rc.32 payload cleanup final review

Date: 17 November 2026. Local source candidate `0.1.0-rc.32`; unpublished. npm next remains rc.30/latest rc.18 and the demo now serves clean source `db10dc5` (delivery receipts below). Human F09/R06/G2/G3/G4 remain deferred/pending.

The [rc.31 investigation](RC31_PAYLOAD_CLEANUP.md) records bounded lifecycle, color and descriptor-validation cleanup, discarded prototypes, exact preparation and its late theme regression. Preserve that archive and every earlier artifact. rc.32 drops the descriptor-validation consolidation and restores the original separate normalization, legend and theme checks. The tiny saving did not justify adding modes to policies with different acceptance rules. Lifecycle and color sharing remain. A browser-mode Angular regression checks light rendering, duplicate-ID error, dark error-frame colors and valid-data recovery.

## Final source verification

Strict compilation and all **356 unit tests** pass, including the new error-frame regression. The complete browser projects use isolated ports/output directories and one worker per engine: [Chromium](rc32/local/browser-chromium.txt) passes 197, [Firefox](rc32/local/browser-firefox.txt) passes 195/two expected skips, and [WebKit](rc32/local/browser-webkit.txt) passes 195/two expected skips. Combined scope is **587 passes/four expected skips**, including native point actions, responsive themes, recovery, reduced motion and 100-cycle cleanup. The final package retains [all 16 supported component/export contracts](rc32/component-contracts.json); [2,060 color results and 143 model results](rc32/pure-behavior-comparison.json) match baseline.

The [warm/two-clean macOS packages](data/reproducibility-0.1.0-rc.32-darwin.json) match SHA-256 `6984b9b20edd69fd0c326e6361d45459f3b36fe8f4c9d390f8962de8cee4f3f9`. Independent Linux CI and demo delivery are documented separately below.

## Measured headroom

The [unchanged measurement and caps](rc32/local/bundle.txt) pass all twelve scenarios. All [engine module sets, scenario exports and eager boundaries](rc32/bundle-comparison.json) match rc.30. The checker now prints and records remaining gzip/Brotli headroom.

| Measurement | Published rc.30 baseline | Local rc.32 | Remaining cap margin |
| --- | ---: | ---: | ---: |
| Root gzip | 221,121 | 221,007 | 993 |
| Root Brotli | 188,993 | 188,935 | 1,065 |
| Core gzip | 8,697 | 8,697 | 1,303 |
| Core Brotli | 7,673 | 7,673 | 1,327 |

Root saves only **114 gzip / 58 Brotli bytes**. Calendar saves 288 gzip bytes, Sankey 282 and radial progress 177. Focused bar/area/composed have small increases within unchanged caps; the comparison records every delta. These bounded savings do not establish broad feature capacity. A focused opt-in interaction entry is the next design to evaluate for keeping optional zoom/brushing code outside the compatibility root; it still needs its own contract and budget evidence.

## Exact local artifact

The immutable **164,022-byte** [rc.32 candidate](data/local-release-0.1.0-rc.32.json) is 3,079 bytes smaller than published rc.30 and matches the warm/two-clean digest above. [Exact artifact checks](rc32/local/release-local.txt) pass metadata/notices, strict positive/negative declarations, a fresh documented application and all six installed CSR/SSR browser modes. [Repeated preparation](rc32/local/immutability.txt) refuses archive/checksum/manifest replacement. All [109 prior archive/checksum/versioned evidence records](rc32/archive-preservation.json), including rc.31, remain unchanged; its [old current-manifest alias](rc32/rc31-manifest-alias.json) is preserved byte-for-byte.

## Local static verification checkpoint

The [isolated Pages build](rc32/local/pages-build.txt) seals 145 files with SHA-256 `a37eb6e8d6aa4bc212e858337178be5e4e09580ecee891652a2e5f17822e2bdd`. Its [marker](rc32/local/preview-build.txt) identifies a working-tree snapshot based on `7c9bda1`; it is local-only. All 40 routes/145 files pass [Chromium, Firefox and WebKit verification](rc32/local/pages-check.txt). All 17 unchanged [performance guards](rc32/local/performance.json) and [normal-motion navigation checks](rc32/local/pages-performance.txt) pass. The [receipt](rc32/local/preview-verification.txt) and final all-file digest check preserve the actual identity.

At the local checkpoint, [verification](rc32/verification-summary.json) records the completed scopes. Formatting, local documentation links/anchors and `git diff --check` pass. Registry next remains rc.30/latest rc.18; the public marker still identifies deployed source `0e40644` and sealed hash `bb8949c9d205c4c30074361ebc76082dc394c63ad1bb858481f52621c0522150`. These checks do not publish rc.32, deploy this local snapshot or close human gates. At the local-verification checkpoint, source changes were uncommitted; independent Linux CI and delivery require their own receipts.


## Installed-consumer navigation readiness

Initial workspace verification passes formatting/guards, builds, warm/two-clean packaging, strict compilation, all 356 unit tests, strict declarations, documentation/dashboard consumers and SSR. Its installed-runtime stage reports one `Importing a module script failed` console error at `/away` ([initial log](rc32/local/initial-workspace-runtime.txt)). The initial run does not capture the failed request's origin.

The preceding `/linked-dashboard` gallery check asserted only absent table toggles, which can succeed before hydration and allow navigation during lazy module loading. The verification-only correction additionally waits for the two dashboard canvases before retaining that absence assertion and navigating. Existing actions, error assertions and timeouts remain unchanged. Package contents are unchanged; the [fresh rerun](rc32/local/runtime-corrected.txt) passes all six client/SSR modes. The initial aggregate command remains recorded as failed; no assertion or timeout is weakened.


## User-authorized delivery continuation

The user authorized committing, pushing and redeploying the verified cleanup. The guarded deployment will rebuild from clean pushed main and retain its own source/static identities and public checks. npm publication is separate; rc.32 remains unpublished and human gates remain pending. Actual delivery receipts will be recorded after completion.


## Demo delivery

The user-authorized source commit `db10dc5f2b55f4992badad6fbce0a8cb7b2206cc` is pushed to main and deployed as static `2657f71631b1d3fa3b5052e3286eab26d024bbc2`, sealed SHA-256 `3d0657280efdceeec53984ec75d9f33bf2b6c75535458aa864d082a088a3c07a`. [Pages run 44128686550](https://github.com/phalla-doll/ng-echarts/actions/runs/44128686550) succeeds. The official [deploy flow](rc32/deployed/deploy.txt) rebuilds a clean pushed snapshot and checks it before publication; the earlier dirty local artifact is not promoted or restamped.

The [deployment](rc32/deployed/deployment.json), [marker bytes](rc32/deployed/preview-build.txt), [receipt bytes](rc32/deployed/preview-verification.txt) and [Pages workflow](rc32/deployed/pages-ci.json) preserve the clean identity. All 40 routes/145 sealed files pass local and [public three-engine verification](rc32/deployed/public-verification.txt); all 17 unchanged [performance guards](rc32/deployed/performance.json) and normal-motion navigation pass. A [live agent-browser journey](rc32/deployed/live-controls.json) checks the actual installation copy, raw zero calendar/Sankey keyboard actions, separate node totals, and native radial stepping/full/reset.

[Independent source CI 44128193872](https://github.com/phalla-doll/ng-echarts/actions/runs/44128193872) subsequently passes all six jobs, as recorded below. npm next remains rc.30/latest rc.18, rc.32 is not published, every archive remains preserved and human gates remain pending. Receipt-only follow-ups retain deployed source `db10dc5`.


## Completed delivery-source CI and preservation

[All six jobs in CI 44128193872](https://github.com/phalla-doll/ng-echarts/actions/runs/44128193872) pass for deployed source `db10dc5f2b55f4992badad6fbce0a8cb7b2206cc`: 356 unit tests, 587 browser passes/four expected skips, two separate WebKit horizontal probes, strict/documentation/dashboard/CSR/SSR consumers, Pages, reproducibility and unchanged budgets. [Source CI](rc32/deployed/source-ci.json) and [result lines](rc32/deployed/ci-summary.txt) retain actual outcomes. Linux root gzip also measures 221,007 bytes (993 headroom).

The independently downloaded Linux CI archive is **164,022 bytes** and matches canonical SHA-256 `6984b9b20edd69fd0c326e6361d45459f3b36fe8f4c9d390f8962de8cee4f3f9`, all **68 members** and **11 declarations** ([comparison](rc32/deployed/ci-artifact-comparison.json), [actual manifest](rc32/deployed/ci-release-manifest.json)). Its [warm/two-clean Linux result](rc32/deployed/ci-reproducibility.json) matches the preserved macOS archive. No local archive or earlier manifest is overwritten.

The receipt-only documentation follow-up retains deployed source `db10dc5`, static commit `2657f71631b1d3fa3b5052e3286eab26d024bbc2` and the clean seal above. [Final preservation](rc32/deployed/final-preservation.json) rechecks implementation identity, copied marker/receipt bytes, the canonical package and all 109 prior records. npm next remains rc.30/latest rc.18; rc.32 remains unpublished and human gates remain pending. No second deployment or package upload is part of the receipt update.
