# Customization control refinement — 16 November 2026

The user requested controls similar to the supplied [reference](captures/customization-controls/user-reference.png), and confirmed the scope as all customization and validation panels.

## Presentation

- Share an inset frame, rounded neutral control rows, consistent switches and native inline form values across the playground, validation pages, gallery disclosures, comparison choices and linked examples.
- Move the playground inspector below the example, with a Customize heading and Reset action. Preserve control names, state, chart bindings and keyboard navigation.
- Use three columns when space permits, two in narrower panels and one on phones. Keep panel controls at least 44 px high, with existing focus, hover, reduced-motion and disabled feedback. Preserve native disclosures and number/select inputs.
- Keep the library, package/archive contents, standalone dashboard source, registry tags, deployment identities and pending human release gates unchanged. These are local playground presentation changes.

Shared styling lives in `projects/playground/src/customization-controls.css`. The former settings and validation control rules were consolidated there; chart measurement/reference styles remain isolated.

## Visual evidence

The desktop before/after captures use a 1280 px viewport. Phone captures use 390 px, with an additional linked example at 320 px.

| Surface | Before | After |
| --- | --- | --- |
| Playground, dark | [Before](captures/customization-controls/playground-before-dark.png) | [After](captures/customization-controls/playground-after-dark.png) |
| Area validation, dark | [Before](captures/customization-controls/area-before-dark.png) | [After](captures/customization-controls/area-after-dark.png) |
| Playground, light phone | — | [After](captures/customization-controls/playground-after-light-390.png) |
| Area validation, light | — | [Desktop](captures/customization-controls/area-after-light.png), [phone](captures/customization-controls/area-after-light-390.png) |
| Linked controls, dark phone | — | [After](captures/customization-controls/linked-after-dark-320.png) |

Focused previews: [Customize](captures/customization-controls/customize-panel-dark.png), [validation](captures/customization-controls/validation-panel-dark.png) and [dashboard fields](captures/customization-controls/dashboard-fields-dark-390.png).

## Verification

Text receipts normalize terminal trailing whitespace for repository checks.

Production build and strict compilation use Node 24.22.2/npm 11.19.1. [Build](customization-controls/build.txt) and [typecheck](customization-controls/typecheck.txt) pass.

The existing playground suite passes all six browser cases. The [regression suite](customization-controls/regression-tests.txt) passes 66 cases across Chromium, Firefox and WebKit, covering site pages, gallery state geometry, linked selection/ranges, dashboard interactions and keyboard recovery.

The first new layout run sampled document width immediately after resizing, before ECharts' asynchronous resize observer settled. Its [diagnostic output](customization-controls/initial-layout-tests.txt) is preserved. The corrected assertion polls for the same viewport-width limit, matching existing browser-suite practice; it retains all widths, overlap checks and timeouts.

That corrected matrix passed 82 cases and exposed two WebKit dashboard failures: native select appearance reduced the menus to 20 px despite a 44 px minimum. The [failure evidence](customization-controls/webkit-select-failure.txt) is preserved. Explicit select appearance and a CSS chevron retain native selection and fix the measured target size.

The expanded matrix, playground and dashboard suite then passed 93 cases, including both corrected WebKit dashboard routes. The three pie checks caught component-scoped legend-choice styles retaining a 40 px minimum. The [failure record](customization-controls/legend-choice-failure.txt) is preserved; the final component rule uses 44 px and the shared control colors directly.

The new matrix covers 26 routes, both themes, and 320/390/768/900/1440 px. It checks control bounds, text overflow, 44 px targets, overlapping controls and document width, including the calendar year field and pie legend-layout choices. A separate test opens native disclosures without JavaScript. Final matrix results are recorded in [layout-tests.txt](customization-controls/layout-tests.txt).

The final pie correction passes all three responsive cases plus the three existing legend interaction cases ([six passes](customization-controls/pie-tests.txt)). Together with the 93 passing cases above, all 96 expanded scenarios are verified; the corrected pie cases were checked separately. Formatting and `git diff --check` pass. Full workspace CI, registry consumers and a new deployment were not run for this presentation-only change.

At the local review checkpoint, no new npm publication, Pages deployment or human acceptance was claimed.

## Final code review

The final review reproduced and corrected two regressions:

- **Independent dashboard theme:** changing the dashboard to light while the site stayed dark painted `rgb(24, 32, 44)` labels on `rgb(23, 23, 23)` rows. The dashboard host now owns its control, hover, pressed and focus tokens according to its own theme. The standalone component/example remains unchanged. The regression test covers both site themes crossed with both dashboard themes and measures normal/hover select contrast at a minimum of 4.5:1.
- **Forced-color selection:** comparison choices lost their selected appearance when the browser replaced their fill colors. Selected customization choices now retain an underline and system-color border; custom switch tracks/thumbs use explicit system colors. The regression test changes the selected comparison choice with the keyboard and verifies that gallery switch positions remain distinct in forced colors.

The review includes the complete source diff, CSS scope/cascade, keyboard/disabled behavior, standalone-source synchronization and the new browser assertions. Final build, compilation and browser receipts are preserved alongside the earlier diagnostic records under `customization-controls/final-review-*`.

Final result: **105 browser cases pass in one combined run** across Chromium, Firefox and WebKit ([receipt](customization-controls/final-review-tests.txt)). The [production build](customization-controls/final-review-build.txt), [strict compilation](customization-controls/final-review-types.txt), dashboard source synchronization, changed-file formatting and `git diff --check` pass. No review findings remain in this diff. The work is ready for commit; full CI and deployment remain subsequent delivery steps.

## Deployment

The user authorized committing to main and redeploying. UI source `8f961cf8399677abf555b0a58f64d33b2a40fbc7` is pushed and deployed as static commit `9d0fa64b1ef57cacd0ce73ac9427652e5723ceb2`, sealed SHA-256 `07b7965449d0576d03ee01ace5ba52229597faaa65b62b9409b73d75f5316cd8`. [Pages run 43902888292](https://github.com/phalla-doll/ng-echarts/actions/runs/43902888292) succeeds. The guarded deployment rebuilds clean pushed source; no earlier review artifact was promoted or restamped.

Local and public verification pass 40 routes/145 sealed files in Chromium, Firefox and WebKit. All 17 performance caps remain unchanged and pass. Live checks pass keyboard toggles/reset, focus retention, 390 px layout, independent dashboard themes and forced-color selected states in all three engines. [Delivery](customization-controls/deployed/deployment.json), [marker](customization-controls/deployed/preview-build.txt), [verification receipt](customization-controls/deployed/preview-verification.txt), [public verification](customization-controls/deployed/public-verification.txt), [performance](customization-controls/deployed/performance.json) and [live controls](customization-controls/deployed/live-controls.json) preserve actual evidence.

Initial [source CI 43902412000](https://github.com/phalla-doll/ng-echarts/actions/runs/43902412000) passes Pages but the Chromium theme contrast test reads the old dashboard theme immediately after clicking the global theme toggle. Its trace shows the test then toggling the already-updated dashboard back to dark while expecting light. The [failed job record](customization-controls/deployed/initial-ci-chromium-failure.txt) is preserved. The verification-only correction waits for the rendered site-to-dashboard theme propagation before reading/clicking the independent dashboard toggle, retaining all four theme combinations, contrast assertions and timeouts. All [15 local repeated cases](customization-controls/deployed/theme-race-local.txt) pass across the three engines. Fresh full Linux CI remains separate evidence.

Preserve deployed source `8f961cf` across this test/receipt follow-up. Library rc.29, npm next rc.28/latest rc.18, all archived bytes and human F09/R06/G2/G3/G4 retain their prior status.

The initial Firefox job separately exposed an older pie plot-hit test measuring its canvas below the viewport after the controls panel became taller. The trace records a click at y=918 in a 720 px viewport, so the chart correctly receives no click. The [failure log](customization-controls/deployed/initial-ci-firefox-failure.txt) is preserved. The verification-only correction scrolls the canvas into view before measuring the hit point; all raw-value and interaction assertions remain unchanged. All [three local engine cases](customization-controls/deployed/pie-viewport-local.txt) pass. This also preserves the deployed UI identity.

### Completed Linux verification

Verification source `b26039763eb496f7a88d02df9d1e989b5ebec9ba` passes all six jobs in [CI run 43904655587](https://github.com/phalla-doll/ng-echarts/actions/runs/43904655587): 342 unit tests, 575 browser passes/four expected skips and the two separate WebKit horizontal probes. Workspace checks cover strict/exact consumers, standalone source synchronization, reproducibility, SSR and unchanged package budgets; Pages checks cover static integrity and performance. The [CI receipt](customization-controls/deployed/source-ci.json), [summary](customization-controls/deployed/verification-summary.json) and [result lines](customization-controls/deployed/ci-summary.txt) preserve actual outcomes.

The independently downloaded CI candidate remains 169,791 bytes with canonical rc.29 SHA-256 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`. Runtime/library source, package metadata and all playground implementation files are unchanged between deployed `8f961cf` and verified `b260397`; only test/receipt files follow the UI commit. Receipt-only completion records retain the deployed source, static commit and seal above.

### Documentation consumer readiness follow-up — 17 November

The later receipt-only source `beffae29f81b9e8804ecdd7c61a8207ddaf7e18d` fails workspace checks in [run 43907684258](https://github.com/phalla-doll/ng-echarts/actions/runs/43907684258). The installed integration example finds zero of four canvases within the default five-second assertion timeout (`tools/check-documentation-consumer.mjs:215`). Pages and all three browser jobs pass. That run did not identify the consumer engine or retain browser diagnostics, so the log cannot distinguish slow cold initialization from a browser error. The unchanged consumer passes locally in all three engines; a specific runtime defect is not established.

The verification-only correction gives the initial four-canvas assertion a bounded 30 seconds, matching navigation's readiness allowance for production hydration, application stability and lazy renderer imports. It retains the exact canvas count, all interaction assertions and their five-second timeouts, and the final browser-error assertion. Each consumer now logs its engine and saves browser errors, failed requests, server output, page HTML and a screenshot on failure. The workspace job uploads that evidence even when consumer verification fails.

With Node 24.22.2/npm 11.19.1, the [exact canonical rc.29 integration consumer](customization-controls/deployed/docs-readiness-local.txt) and [digest-verified published rc.22 dashboard consumer](customization-controls/deployed/dashboard-readiness-local.txt) both pass Chromium, Firefox and WebKit. Their [integration receipt](customization-controls/deployed/docs-readiness-consumer.json) and [dashboard receipt](customization-controls/deployed/dashboard-readiness-consumer.json) retain actual versions, source hashes and artifact digests. All 22 prerelease guards, changed-file formatting and `git diff --check` pass. Fresh Linux CI remains separate evidence. Deployed UI identity, library/archive bytes, npm tags and pending human gates remain unchanged.

### Completed documentation readiness verification — 17 November

Source `adbfac1dadc1cde18f41840040d4b7a9806f5dfd` passes all six jobs in [CI run 44004670471](https://github.com/phalla-doll/ng-echarts/actions/runs/44004670471): 342 unit tests, 575 browser passes/four expected skips, both separate WebKit probes, exact documentation/runtime consumers, reproducibility, Pages and unchanged budgets. Its archive retains canonical rc.29 SHA-256 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`. The [receipt](rc30/baseline-ci.json) and [result lines](rc30/baseline-ci-summary.txt) close the readiness follow-up; the preceding failed run and diagnostic limits remain preserved. This test-only correction retains deployed UI source `8f961cf` and all prior archive/human-gate identities. The separate [rc.30 cleanup](RC30_RADAR_LEGENDS.md) owns subsequent runtime/package work.
