# rc.17 human interpretation result sheet

Status: pending. No human listening result is recorded. This sheet accompanies the [R06 procedure](R06_MANUAL_REVIEW.md); automated keyboard, accessibility-tree, motion and hydration results do not supply the listening evidence required by F09/R06/G2/G3/G4.

## Test identity

Fill these fields before recording results. Use the local checkout for rc.17, including the typography and pre-hydration theme corrections. A deployed preview must identify the exact source commit from its `preview-build.json`; an older preview is not rc.17 evidence.

| Field | Recorded value |
| --- | --- |
| Reviewer and date | Pending |
| Tested source commit | Pending |
| Package version and SHA-256, if reviewing an installed consumer | Pending |
| OS and version | Pending |
| Browser and version | Pending |
| Screen reader and version | Pending |
| Full keyboard navigation setting | Pending |
| Themes and viewport widths | Pending |
| Reduce Motion setting | Pending |

## Start the session

Use the pinned Node 24.22.2 and npm 11.19.1, then run:

```sh
npm run build:lib
npm start -- --host 127.0.0.1 --port 4310
```

Open `http://127.0.0.1:4310/validation`. On macOS, enable VoiceOver with Command-F5 or the configured system shortcut. Use native table/legend controls on the validation routes; the gallery previews intentionally omit some controls.

For each row below record pass, fail or pending for each criterion and an exact announcement or navigation issue. Use N/A only with a family-specific reason. Record failures before fixing them, then repeat the affected item against the corrected source commit.

1. **Meaning:** heading, description, units and series/category identity explain the data without Canvas or color.
2. **Values and controls:** discover table expansion, captions and headers; distinguish zero, missing and negative values where applicable; understand legend pressed states and activate equivalent keyboard actions.
3. **Updates and focus:** retain a meaningful focus target through updates, reorder/removal and hide/show recovery; read selected values and status messages without excessive repeated announcements.
4. **States:** understand loading, error, empty and all-hidden outcomes; recover using native controls.
5. **Presentation:** visible focus in light/dark themes and a narrow window; reduced motion suppresses decorative animation.

| Family or flow | Route(s) | Meaning | Values/controls | Updates/focus | States | Presentation | Exact announcement or issue |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bar | `/validation`, `/updates`, `/playground` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Line | `/line-validation` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Area | `/area-validation` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Pie/donut | `/pie-validation` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Composed | `/composed-validation`, `/composed` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Radar | `/radar` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Radial progress | `/radial` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Calendar | `/calendar` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Sankey | `/sankey` | Pending | Pending | Pending | Pending | Pending | Not reviewed |
| Linked selection/ranges/previews | `/linked`, `/linked-validation` | Pending | Pending | Pending | Pending | Pending | Not reviewed |

Apply the family-specific instructions in [R06](R06_MANUAL_REVIEW.md#cross-family-release-review). In particular: radar maxima and missing polygons must be understandable; native progress must expose the raw value/maximum; calendar must distinguish unrecorded days from zero; Sankey incoming/outgoing totals must remain separate. Linked previews must sound temporary, Escape/blur must restore committed context, and pointer movement must not cause repeated live announcements.

## Decision

Reviewer conclusion: pending. Unresolved defects: not assessed. F09/R06/G2/G3/G4 remain pending until the applicable results and any necessary reruns are recorded and reconciled in the [acceptance matrix](../ACCEPTANCE_MATRIX.md).


## User decision — 14 November 2026

During the guided session the user replied “Skip this part please.” No per-item human results or browser announcements were supplied. All results above remain pending. The user selected `@mantha911/ng-echarts` and requested completing the experimental prerelease under this deferral; this does not convert automated evidence into human interpretation or close F09/R06/G2/G3/G4.
