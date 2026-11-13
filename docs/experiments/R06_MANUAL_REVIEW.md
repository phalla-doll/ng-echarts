# R06 screen-reader review

Status: human listening review deferred at the user’s request on 12 November 2026; no listening result is recorded. Chart: bar. Task: NG06. Requirements: F05, F08, F09. Gate: G2.

The [R&D plan](../RND_PLAN.md#research-experiments) requires a sample to be read with a screen reader. Automated accessibility-tree, keyboard, focus, and motion checks support this review but cannot record a human listening result.

## Reproduce

Use Node from `.nvmrc`, run `npm run build:lib` and `npm start -- --host 127.0.0.1 --port 4310`, then open `http://127.0.0.1:4310/validation`. On macOS, enable VoiceOver with Command-F5 (or the configured system shortcut). Enable the browser's full keyboard navigation if necessary.

## Listening checklist

1. Navigate to “Primary visits”. Verify that its heading and description explain the chart without needing the canvas.
2. Focus Desktop and Mobile legend buttons. Verify that names and pressed states identify which series are visible, including after keyboard toggling.
3. Open the data table. Verify its expanded state, caption, row/column headings, numeric values, and point action names. Activate January's Desktop value with the keyboard.
4. Hide both series. Verify that the complete table is still available and legend controls can restore the plot.
5. On `/updates`, check row action names after reordering/renaming. Check loading/error/empty messages from `/playground`.
6. Test both themes and a narrow window. Check that focus remains visible. With Reduce Motion enabled, check that no decorative chart animation is apparent.

## Record a result

Record the tested commit, OS, browser/version, screen-reader/version, pass/fail per item, and any exact announcement or navigation problem. Store that result here before marking R06 passed. R06 and G2 remain pending. Per the user’s 12 November 2026 direction, this deferred review does not block NG09–NG13 development. Complete the human review before G3/G4 release acceptance; automated checks continue during implementation.

## Development sequencing decision

The user asked to skip this review for now after clarifying that VoiceOver is a quality check rather than a technical build prerequisite. This supersedes the earlier G2-before-expansion sequencing in the contributor guide and historical reports. It does not mark R06 passed or remove keyboard, table, focus, motion, or SSR checks.

## Cross-family release review

The [NG14 review](NG14_CROSS_FAMILY_ACCEPTANCE.md) records automated coverage across the four implemented families. Human F09 interpretation remains pending for every family. Apply the title/summary, legend, complete values/missing text, keyboard actions, focus, state and motion checklist to `/line-validation`, `/area-validation`, and `/pie-validation` as well as the bar routes above. For pie/donut, check category names/visibility and the one-measure table; there are no axes or series-visibility controls. For line/area, verify that missing observations are announced as missing rather than zero and that negative values remain readable. Record a family-specific result, tested commit and environment before resolving NG14/G3. No human listening result is supplied by the automated lifecycle or performance runs.

NG17 extends the pending human review to `/composed-validation` and the visits/trend summary on `/composed`. Verify that comparable units and the supplied trend meaning are understandable, mixed bar/line series retain clear native legend/table actions, zero and missing values remain distinct, and reordering/kind changes retain meaningful focus and visibility. This is a checklist for the deferred session, not a recorded listening result.


NG20 also adds `/linked` to the deferred listening checklist. Check that the selected month, reset and updated device-share context are understandable, plot and table actions have equivalent meaning, focus stays on the initiating control, and independent legend visibility is clear. Verify no-month/all-missing/zero announcements and selection clearing after removal on `/linked-validation`. These are pending human checks, not listening results.


## Experimental radar follow-up

The NG18 radar extension also requires human interpretation before release acceptance. Use `/radar` to review reading order, comparison visibility, zero and missing observations, per-dimension scale announcements and keyboard table selection. Confirm that missing comparisons are understood as absent from the plot rather than zero, and that polygon area is not interpreted as a total score. No human result is recorded by the automated checks; this session remains deferred. [Radar contract](../RADAR_CHART_API.md).
