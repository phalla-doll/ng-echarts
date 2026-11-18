# Visits dashboard color refinement — 18 November 2026

The dashboard forced slate surfaces and blue borders inside the demo's neutral dark theme. Its grid children also added an outline around the library's own chart frame, producing doubled corners.

The application now uses charcoal surfaces (`#111`), neutral borders (`#292929`), and gray supporting text. Light mode uses white surfaces with the same neutral hierarchy. Teal desktop values, blue mobile values and a dashed gold mean distinguish the series without the previous bright pink/green pairing. Each chart has one frame outline. The introductory copy is muted to match the surrounding documentation.

The refinement applies to the live dashboard source and the published-rc.22-compatible native example. Both displayed standalone sources were regenerated. Independent dashboard/site themes still work. Library implementation, package metadata, immutable artifacts and release gates are unchanged.

## Visual review

- [Before: dark desktop](dashboard-colors/captures/before-dark-1440.png)
- [After: dark desktop](dashboard-colors/captures/after-dark-1440.png)
- [After: light desktop](dashboard-colors/captures/after-light-1440.png)
- [After: dark mobile](dashboard-colors/captures/after-dark-390.png)
- [After: light mobile](dashboard-colors/captures/after-light-390.png)
- [After: dark areas](dashboard-colors/captures/after-dark-area-1440.png)

[Capture provenance and hashes](dashboard-colors/captures/manifest.json) distinguish the deployed baseline from the local production build. Desktop and mobile screenshots were inspected for surface consistency, chart readability, legend wrapping and clipping.

## Verification

Node 24.22.2 and npm 11.19.1 were used.

- Production playground build, strict compilation and repository formatting pass.
- [42 dashboard cases](dashboard-colors/browser-final.txt) pass across Chromium, Firefox and WebKit. They include neutral panel/card surfaces, a single chart outline, independent themes, field contrast of at least 4.5:1, responsive widths from 320 to 1440 px, native keyboard controls and graphical range interaction.
- [33 additional cases](dashboard-colors/pixel-regression.txt) pass across the same engines for bar/composed hits, formatting, linked selection, previews and tooltips. The shared pixel probe now reads the rendered legend color rather than hard-coding green. The [initial run](dashboard-colors/browser-initial.txt) passed 36 cases and failed the three old-color probes; those failures are retained.
- Fresh standalone consumers compile, server-render and hydrate in all three engines: [digest-verified published rc.22 native example](dashboard-colors/native-consumer.json) and [exact rc.33 graphical example](dashboard-colors/interaction-consumer.json).
- The preserved rc.33 archive still has SHA-256 `5d0230b8b9fccdab7d3b32e846ca5bfb1780a9cb1094f2f21b006ebc4bf33735`. No library source or archived package bytes changed.

At the local verification checkpoint, the implementation was uncommitted and the deployed baseline was `4fe085b6ce3eae9b0bb5c334520dd53fa9e7bec4`. The following user-authorized delivery supersedes that demo identity. Package publication remains separate: npm `next` is rc.32, `latest` is rc.18, rc.33 is unpublished, and human F09/R06/G2/G3/G4 remain deferred/pending.


## Demo delivery

The user requested committing and redeploying the refinement. Implementation source `c597797e4a0ccf05087f6490de6183131e403f18` is committed and pushed to main. The guarded clean-source build/check/performance/deploy sequence publishes static commit `7199379c4a1f4f5d68296a9132c0bf06512dec86`, sealed SHA-256 `7988f252791282c84fdc9f311d0a34f5819861e4e6984634c6d907e9371ea507`. [Pages run 44234543474](https://github.com/phalla-doll/ng-echarts/actions/runs/44234543474) succeeds.

All 40 routes/148 sealed files pass local and public verification in Chromium, Firefox and WebKit. All 17 unchanged performance guards and normal-motion navigation pass. Initial dashboard transfer is 408,960 bytes under the unchanged 455,000-byte cap.

The public dashboard also passes 24 independent site-theme/dashboard-theme/width cases across all three engines. They assert neutral panel/card surfaces, single frame outlines, the actual painted series palette and absence of horizontal overflow at 390/1440 px. The live dark/light desktop/mobile captures were inspected. The capture harness waits for themed header images to load before taking each screenshot. The reproducible command is `PAGES_EXPECTED_COMMIT=c597797e4a0ccf05087f6490de6183131e403f18 node docs/experiments/dashboard-colors/deployed/verify-live-colors.mjs`.

[Deployment](dashboard-colors/deployed/deployment.json), [exact public marker](dashboard-colors/deployed/preview-build.txt), [exact verification receipt](dashboard-colors/deployed/preview-verification.txt), [public checks](dashboard-colors/deployed/public-verification.txt), [performance](dashboard-colors/deployed/performance.json), [live cases](dashboard-colors/deployed/live-colors.json), [captures](dashboard-colors/deployed/captures.json) and [Pages run](dashboard-colors/deployed/pages-run.json) retain actual evidence. The guarded deployment rebuilds clean source and preserves its sealed artifact; receipt-only follow-ups retain the implementation identity above.

[All six jobs in source CI 44234286678](https://github.com/phalla-doll/ng-echarts/actions/runs/44234286678) pass: 358 unit tests, 611 browser passes/four expected skips, two separate WebKit horizontal probes, exact consumers, reproducibility, Pages and unchanged budgets. The [CI receipt](dashboard-colors/deployed/source-ci.json) preserves the completed job identities. The independently downloaded 174,489-byte [CI archive](dashboard-colors/deployed/ci-artifact.json) matches canonical rc.33, all 73 members and 12 declarations; [Linux warm/two-clean builds](dashboard-colors/deployed/ci-reproducibility-linux.json) match as well. [Final preservation](dashboard-colors/deployed/preservation.json) rechecks every one of the 114 prior records, the exact public marker/receipt and unchanged implementation files. No npm upload accompanies this demo deployment. The rc.33 archive and every earlier artifact remain preserved; human gates remain pending.
