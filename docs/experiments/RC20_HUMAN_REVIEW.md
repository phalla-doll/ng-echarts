# Current human interpretation review

Status: pending. The existing human-review deferral remains in effect until the user resumes a listening session. Automated checks do not establish human F09/R06 interpretation or close G2/G3/G4. Preserve the [rc.17 result sheet](RC17_HUMAN_REVIEW.md) as the historical record.

## Identity and procedure

Follow the [R06 cross-family procedure](R06_MANUAL_REVIEW.md#cross-family-release-review) for all nine chart families and linked selection/range/preview flows. Before starting, record reviewer/date, exact source commit, package version/checksum if installed, OS, browser, screen reader, keyboard navigation setting, theme/viewport and Reduce Motion setting. Use the current checked source or identify a deployed build using its `preview-build.json`; do not infer identity from its URL.

Use Node 24.22.2 and npm 11.19.1. Run `npm run build:lib`, then `npm start -- --host 127.0.0.1 --port 4310`. Begin at `http://127.0.0.1:4310/validation`. On macOS, activate VoiceOver using Command-F5 or the configured shortcut. Record exact announcements and navigation issues, including failures and their corrected-source reruns.

## Additional flows since the previous sheet

| Flow | Procedure and required interpretation | Human result |
| --- | --- | --- |
| Paginated Cartesian and pie tables | Visit `/benchmark`, `/line-benchmark`, `/area-benchmark`, `/composed-benchmark` and `/pie-benchmark`. Activate Show paginated sample, then Show data table. Discover the row range and Previous/Next controls, reach first/last/partial pages, understand disabled boundaries and activate values. Verify focus survives paging and collapse/reopen, hidden-series values stay accessible and replacing the sample resets to page one. Use the family validation routes to review missing/zero values. Repeat all five families. | Pending |
| Stacked composed bars and line | At `/composed-validation`, enable stacked bars and open the table. Understand which bars share a stack and that the line is a separate supplied value on the same scale. Distinguish positive/negative, zero and missing values. Verify hiding a segment changes the plotted stack without removing its raw table values; changing groups/kinds retains meaningful focus and does not announce cumulative values as raw observations. | Pending |
| Composed areas | At `/composed-validation`, enable areas and stacked areas. Understand separate bar/area groups and the independent line; distinguish gaps from zero and observed partial stacks from complete totals. Verify exact raw keyboard values, fill changes, legend state and kind-change focus. Requires rc.22 source or later. | Pending |
| Composed dashboard and horizontal layout | At `/linked-dashboard`, distinguish raw segment/trend actions from partial device sums, follow month selection through refresh/reorder/removal and verify reset focus. At `/composed-validation`, enable horizontal composition and compare order, gaps and signed stacks with the native table. Requires rc.23 for horizontal composition; the dashboard supports rc.22. | Pending |
| Independent composed value axes | With rc.24 source, review Revenue & Conversion at `/composed` and Use dual axes at `/composed-validation`. Identify each unit and left/right or bottom/top axis. Explain why equal plot heights cannot compare revenue with conversion; hear `0.12` as `12%` while actions retain the original observation. Hide/show series, switch layout and restore the shared scale; verify the native description, focus and units stay coherent. | Pending |
| Persisted demo theme | Choose light/dark, reload and navigate to a chart. Confirm focus visibility and readable controls in the restored theme and narrow viewport; check reduced-motion behavior. | Pending |

## Full result record

All original family criteria remain pending: meaning/units, values/native controls, updates/focus, loading/error/empty/all-hidden states, and presentation/motion. Record pass/fail/pending for bar, line, area, pie/donut, composed, radar, radial progress, calendar, Sankey and linked flows following R06. New flow results alone do not close the original review.

Reviewer/environment/source identity: pending. Exact announcements/issues: pending. Final decision and reruns: pending. Reconcile actual results into the acceptance matrix before changing any human gate.
