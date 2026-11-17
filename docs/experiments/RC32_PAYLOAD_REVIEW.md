# rc.32 payload cleanup final review

Date: 17 November 2026. Local source candidate `0.1.0-rc.32`; unpublished. npm next remains rc.30/latest rc.18 and the demo retains `0e40644`. Human F09/R06/G2/G3/G4 remain deferred/pending.

The [rc.31 investigation](RC31_PAYLOAD_CLEANUP.md) records bounded lifecycle, color and descriptor-validation cleanup, discarded prototypes, exact preparation and its late theme regression. Preserve that archive and every earlier artifact. rc.32 drops the descriptor-validation consolidation and restores the original separate normalization, legend and theme checks. The tiny saving did not justify adding modes to policies with different acceptance rules. Lifecycle and color sharing remain. A browser-mode Angular regression checks light rendering, duplicate-ID error, dark error-frame colors and valid-data recovery.

## Final source verification

Strict compilation and all **356 unit tests** pass, including the new error-frame regression. The complete browser projects use isolated ports/output directories and one worker per engine: [Chromium](rc32/local/browser-chromium.txt) passes 197, [Firefox](rc32/local/browser-firefox.txt) passes 195/two expected skips, and [WebKit](rc32/local/browser-webkit.txt) passes 195/two expected skips. Combined scope is **587 passes/four expected skips**, including native point actions, responsive themes, recovery, reduced motion and 100-cycle cleanup. The final package retains [all 16 supported component/export contracts](rc32/component-contracts.json); [2,060 color results and 143 model results](rc32/pure-behavior-comparison.json) match baseline.

The [warm/two-clean macOS packages](data/reproducibility-0.1.0-rc.32-darwin.json) match SHA-256 `6984b9b20edd69fd0c326e6361d45459f3b36fe8f4c9d390f8962de8cee4f3f9`. Linux CI and any publication/deployment remain separate evidence.

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

## Local static verification and final status

The [isolated Pages build](rc32/local/pages-build.txt) seals 145 files with SHA-256 `a37eb6e8d6aa4bc212e858337178be5e4e09580ecee891652a2e5f17822e2bdd`. Its [marker](rc32/local/preview-build.txt) identifies a working-tree snapshot based on `7c9bda1`; it is local-only. All 40 routes/145 files pass [Chromium, Firefox and WebKit verification](rc32/local/pages-check.txt). All 17 unchanged [performance guards](rc32/local/performance.json) and [normal-motion navigation checks](rc32/local/pages-performance.txt) pass. The [receipt](rc32/local/preview-verification.txt) and final all-file digest check preserve the actual identity.

[Final local verification](rc32/verification-summary.json) records completed scopes. Formatting, local documentation links/anchors and `git diff --check` pass. Registry next remains rc.30/latest rc.18; the public marker still identifies deployed source `0e40644` and sealed hash `bb8949c9d205c4c30074361ebc76082dc394c63ad1bb858481f52621c0522150`. These checks do not publish rc.32, deploy this local snapshot or close human gates. At the local-verification checkpoint, source changes were uncommitted; independent Linux CI and delivery require their own receipts.


## Installed-consumer navigation readiness

Initial workspace verification passes formatting/guards, builds, warm/two-clean packaging, strict compilation, all 356 unit tests, strict declarations, documentation/dashboard consumers and SSR. Its installed-runtime stage reports one `Importing a module script failed` console error at `/away` ([initial log](rc32/local/initial-workspace-runtime.txt)). The initial run does not capture the failed request's origin.

The preceding `/linked-dashboard` gallery check asserted only absent table toggles, which can succeed before hydration and allow navigation during lazy module loading. The verification-only correction additionally waits for the two dashboard canvases before retaining that absence assertion and navigating. Existing actions, error assertions and timeouts remain unchanged. Package contents are unchanged; the [fresh rerun](rc32/local/runtime-corrected.txt) passes all six client/SSR modes. The initial aggregate command remains recorded as failed; no assertion or timeout is weakened.


## User-authorized delivery continuation

The user authorized committing, pushing and redeploying the verified cleanup. The guarded deployment will rebuild from clean pushed main and retain its own source/static identities and public checks. npm publication is separate; rc.32 remains unpublished and human gates remain pending. Actual delivery receipts will be recorded after completion.
