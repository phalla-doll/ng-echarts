# Linked demo UI refinement

Requested 13 November 2026 after the user rejected the initial linked-page filter styling. The [reported control row](captures/linked-ui/before/reported-filter.png) had a long label, strong browser-default select outline and redundant disabled reset. The surrounding example also repeated instructions and used nested card borders with oversized native controls. This round refines the linked demo while retaining its existing selection contract and private rc.1 library.

## Result

- A compact **Month** field uses the existing neutral surface/border tokens, 13 px text, one consistent chevron and native select behavior. Its native popup follows the active light/dark scheme. Hover and keyboard focus remain distinct from the quiet resting border.
- **Reset** appears only while a month is selected. It is a lightweight text action with an existing outline icon. Activating it clears selection and returns focus to Month before the disappearing reset could lose keyboard focus.
- A short visible count shares the toolbar with the filter on desktop and wraps consistently below it on narrow screens. Full month/device context remains in the polite status region. Missing/no-month states remain distinct from numeric zero; a previously selected device that becomes missing cannot mislabel an aggregate total.
- The heading-to-example gap is reduced, repeated instructions are shortened, each chart uses one border, and titles, legends and table toggles use compact gallery typography. Both device legends fit on one row at 320 px. The source plot height is 250 px; plots, tables and keyboard point actions remain available.

No new icon geometry, upstream source, dependency, library API or candidate artifact is introduced. Existing outline chevron/close icons retain their existing notice/provenance. The [linked guide](../LINKED_CHARTS.md) describes the current presentation and reset focus behavior; the underlying one-way link and stable-ID rules are unchanged.

## Visual evidence

The original [desktop](captures/linked-ui/before/desktop-dark.png), [mobile](captures/linked-ui/before/mobile-light.png) and user-reported filter are preserved. [The after manifest](captures/linked-ui/after/manifest.json) records **22 captures**, source/image hashes, dark/light themes, 1440/768/390/320 px, default/selected filters, full pages, source keyboard focus and narrow code. It reports no page overflow, browser or HTTP errors.

Reviewed comparisons:

| View | Before | After |
| --- | --- | --- |
| Filter at rest | [Reported filter](captures/linked-ui/before/reported-filter.png) | [Compact Month and total](captures/linked-ui/after/linked-dark-1440-all-months-filter.png) |
| Selected month | [Initial desktop page](captures/linked-ui/before/desktop-dark.png) | [Desktop page](captures/linked-ui/after/linked-dark-1440.png) |
| Narrow light theme | [Initial mobile page](captures/linked-ui/before/mobile-light.png) | [Refined mobile page](captures/linked-ui/after/linked-light-320.png) |
| Keyboard/table | Original linked behavior retained | [Current focused action](captures/linked-ui/after/linked-dark-320-keyboard.png) |

Reproduce after a production playground build:

```sh
LINKED_CAPTURE_OUTPUT=docs/experiments/captures/linked-ui/after npm run capture:linked
```

The output override preserves the initial NG20 capture record. Desktop fields remain 36 px high and narrow-screen fields/reset use 40 px; only the browser's decoration is replaced, not the native combobox or keyboard behavior. Focus outlines remain visible in both themes.

## Executed checks

- Production playground build and strict workspace TypeScript/templates pass.
- All **135 unit/integration tests** pass: 128 library + 7 playground. New summary coverage verifies current numeric labels after a selected device becomes missing.
- The targeted linked/site/navigation/four-family visual regression passes **42 scenarios** across Chromium, Firefox and WebKit. The final linked subset additionally repeats all **12 linked scenarios** after the summary guard, including conditional reset visibility, Month focus after reset, plot/table/select linking, stable instances, legends, missing/zero data, responsive themes, copy fallback and native cleanup.
- Isolated client and SSR applications pass all six three-engine modes against the retained exact rc.1 tarball. The checker uses the native combobox's accessible role/name, then exercises the linked month/reset/update/removal flow. [UI consumer evidence](data/linked-ui-consumers.json) retains this snapshot.
- The Pages production build prerenders all **29 routes**; local static checks pass in all three engines, including the updated Month selection, detail update and reload reset.

The retained rc.1 SHA-256 is still `2009034295ffaa07955e0ec2a6370689b2d8922e6e06a527dc97c8beeeaaaacb`. Library bundles and the standalone linking example source are unchanged, so this round does not claim new bundle, performance or public API results. Human interpretation remains deferred; this visual refinement does not close F09/R06/G2/G3/G4.

Formatting, 779 local documentation links/anchors, whitespace checks, all 22 capture/source hashes and the unchanged rc.1 checksum pass. Keyboard Reset activation is additionally confirmed in all three engines. Live delivery is recorded below.
