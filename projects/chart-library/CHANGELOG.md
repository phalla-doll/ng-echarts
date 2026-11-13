# Changelog

## 0.1.0-rc.3 — 13 November 2026

- Add controlled `BarChart.selectedRowIds` for multiple stable row IDs; a non-null array takes precedence over the existing scalar input, with an empty array clearing feedback.
- Highlight selected categories and native table rows together; retain `aria-current` only for one effective selected row.
- Extend linked charts with inclusive native From/To controls, supplied-order reconciliation, focus recovery, complete compiled source and three-engine consumer checks.

This private candidate preserves rc.0–rc.2 artifacts and notices. Graphical brushing and deferred human release acceptance remain open.

## 0.1.0-rc.2 — 13 November 2026

- Add controlled `BarChart.selectedRowId` feedback by stable row identity, with muted surrounding bars and a category band that remains visible for zero/missing values and hidden series.
- Mark the selected native table row as current with a visible “Selected” label; input changes do not emit point events or take ownership of application selection.
- Extend the linked demo, complete source example, strict package checks and browser coverage for selection, reset, updates, themes and native focus.

This private candidate retains the experimental API and deferred human release gates. Earlier rc.0/rc.1 artifacts remain preserved.

## 0.1.0-rc.1 — 13 November 2026

- Add `ComposedChart` and typed bar/line descriptors through `/composed` and root exports.
- Combine vertical bars and lines on shared category/value axes with stable identity, shared controls, raw events and lazy rendering.
- Add the visits/trend gallery, complete API example, strict packed-consumer checks and browser/lifecycle coverage.

This is an experimental private extension. Human interpretation and release gates remain pending. The earlier rc.0 artifact and its evidence are retained separately.

## 0.1.0-rc.0 — 13 November 2026

First private local release candidate of the four-family Angular 22 library:

- Typed standalone bar, line, area, and pie/donut components, with focused entry points and compatible root exports.
- Immutable updates, stable identities, token themes, numeric formatting, missing-value handling, native legend/table controls, and raw selection events.
- Lazy Canvas rendering, responsive resizing, reduced motion, SSR/hydration, and navigation cleanup.
- Complete installation/API examples, measured limits, MIT license for original library code, and preserved third-party notices.

The API and local package identity remain experimental. Human screen-reader interpretation is deferred; G2/G3/G4 release acceptance remains pending. This candidate is private and has not been published to npm. See the source repository's `docs/RELEASE_CHECKLIST.md` for artifact verification and remaining decisions.
