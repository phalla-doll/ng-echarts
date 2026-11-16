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
