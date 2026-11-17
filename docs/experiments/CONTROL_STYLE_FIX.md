# Shared control cascade correction — 17 November 2026

The reported calendar Year field combined a shared inset background with older component padding and an independently bordered input. On the deployed baseline, the row was 60 px tall with 16 px top padding and no bottom padding; its input retained a separate background and border. Angular's scoped selectors won ties against shared selectors when component styles were attached later. Radar/radial action groups and linked/dashboard layouts had related duplicate declarations.

The correction makes `customization-controls.css` own calendar/radial numeric fields and radar/radial control presentation, removing the obsolete component rules. The Year field is now one 44 px surface with vertically centered content and a transparent, borderless native input. Native number stepping and keyboard focus remain available. Action buttons use equal-width responsive rows and retain boolean switch/selected feedback. Linked/dashboard component layout defaults use `:where()` so the shell's existing responsive design takes precedence; the standalone dashboard keeps its defaults. Its displayed source is regenerated.

Comparison and review images:

- Calendar: [before](control-style-fix/calendar-before.png), [after](control-style-fix/calendar-after.png), mobile [dark](control-style-fix/calendar-mobile-after.png) / [light](control-style-fix/calendar-mobile-light-after.png).
- [Radar action rows](control-style-fix/radar-after.png), radial [desktop](control-style-fix/radial-after.png) / [mobile](control-style-fix/radial-mobile-after.png).
- [Linked range controls](control-style-fix/linked-mobile-after.png) and [dashboard controls](control-style-fix/dashboard-mobile-after.png).

Validation uses Node 24.22.2 and npm 11.19.1. The production playground build passes without component budget warnings. The digest-verified rc.22 standalone dashboard consumer builds, renders and hydrates in Chromium, Firefox and WebKit; its fresh [receipt](control-style-fix/dashboard-registry-consumer.json) is separate from the earlier historical receipt. Changed-file formatting and `git diff --check` pass.

Browser regression checks cover 26 customization/validation routes at 320/390/768/900/1440 px in both themes, independent dashboard theming, native disclosures without JavaScript, forced colors, numeric keyboard stepping/reset and repeated client navigation. Added geometry assertions catch the original off-center numeric field and action groups incorrectly collapsing to one full-width button per row. Calendar behavior is checked separately alongside the control matrix.

The final [browser run](control-style-fix/browser-results.txt) passes all **114 cases** in Chromium, Firefox and WebKit, including calendar selection, missing/error states, native tables and 100 mount cycles per engine. The [build log](control-style-fix/build.txt) and [standalone consumer log](control-style-fix/dashboard-consumer.txt) preserve their results.

The user subsequently authorized committing, pushing and redeploying this playground/test correction. The preceding evidence records local verification; delivery receipts will identify the checked source and public deployment separately. Library source, published rc.30 bytes, earlier archives, npm tags and pending human release gates remain unchanged. No package publication is part of this delivery.

## Deployment

Clean pushed source `0e40644f2835250a2c719f725c34c4b2e90897f4` is deployed as static commit `18091600dd8c37aa6adc5c52577b6d8707daae68`, sealed SHA-256 `bb8949c9d205c4c30074361ebc76082dc394c63ad1bb858481f52621c0522150`. [Pages run 44021783733](https://github.com/phalla-doll/ng-echarts/actions/runs/44021783733) succeeds. The official `deploy:pages` flow rebuilds an isolated clean snapshot, verifies it and publishes the unchanged sealed output. [Deployment receipt](control-style-fix/deployed/deployment.json), [workflow](control-style-fix/deployed/pages-ci.json), [marker bytes](control-style-fix/deployed/preview-build.txt), [local verification receipt](control-style-fix/deployed/preview-verification.txt) and [deployment log](control-style-fix/deployed/deploy.txt) preserve the identity.

All 40 routes/145 files pass local and [public three-engine verification](control-style-fix/deployed/public-verification.txt). All 17 unchanged performance guards and normal-motion navigation pass ([performance evidence](control-style-fix/deployed/performance.json)). The [live control journey](control-style-fix/deployed/live-controls.json) passes calendar field geometry in both themes at 390/1440 px, native stepping/reset, radial values, radar action rows and keyboard switches, linked range/reset and dashboard zoom/reset in Chromium, Firefox and WebKit with no browser errors. Its [script](control-style-fix/deployed/live-controls.mjs), [log](control-style-fix/deployed/live-controls.txt) and live calendar screenshots ([dark](control-style-fix/deployed/calendar-dark-390.png), [light](control-style-fix/deployed/calendar-light-390.png)) retain the checks.

Receipt-only follow-ups preserve deployed source `0e40644`. Published rc.30 and earlier archives remain immutable; human F09/R06/G2/G3/G4 remain deferred/pending.

## Completed source CI

[CI run 44021501148](https://github.com/phalla-doll/ng-echarts/actions/runs/44021501148) passes all six jobs for deployed source `0e40644f2835250a2c719f725c34c4b2e90897f4`: 342 unit tests, 587 browser passes/four expected skips, two separate WebKit horizontal probes, exact consumers, SSR, reproducibility, Pages and unchanged package budgets. Its preparation reports the canonical 167,101-byte rc.30 archive with SHA-256 `e19fbb40964251f5c1c6b7d10cc3808feb6fe10eb7419ae75fff7a880b7a7c6c`; release consumers and immutability checks pass. [Workflow receipt](control-style-fix/deployed/source-ci.json) and [result lines](control-style-fix/deployed/ci-summary.txt) retain actual outcomes.

[Preservation checks](control-style-fix/deployed/preservation.json) confirm the sealed 145-file output, copied marker/receipt bytes, unchanged canonical package archive and implementation identity across the receipt-only documentation follow-up. [Link checks](control-style-fix/deployed/links.json), formatting and `git diff --check` pass. The final receipt commit does not trigger another demo deployment or change package contents.
