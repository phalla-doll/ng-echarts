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
