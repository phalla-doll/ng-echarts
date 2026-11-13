# NG20 graphical range selection

Approved 13 November 2026 after the [native month-range increment](NG20_MONTH_RANGE.md). The same application-owned period now accepts a snapped graphical range while retaining From/To for keyboard use. The approved gallery palette, focus/hover policy and updated sidebar remain in place.

## Contract and implementation

Select range arms the overview without changing its committed period. A primary mouse/pen/touch drag of at least four CSS pixels along the category axis previews a snapped inclusive band. Release emits once, normalized into supplied row order; reverse drags and equal-month ranges are supported. Releases outside the grid clip to its first/last category. A plain click while armed emits no range or point. The demo exits after commit and keeps focus on the stable mode button; ordinary point/table actions resume and still select one month.

Escape exits demo mode and cancels its draft. Resizing, options/theme/layout changes, lost/cancelled capture, blur, visibility changes and page scrolling cancel transient geometry without changing committed bounds. Data replacement exits the demo mode; the library additionally rejects stale normalized-model snapshots, including updates with identical IDs. Native field changes and Reset cancel mode; Reset clears the period and focuses Period. If unavailable data disables the focused mode button, focus returns to Period without taking focus from another control. Legends stay independent and categories remain selectable with zero/missing/hidden measures.

On the vertical overview, touch dragging follows the horizontal category axis while vertical scrolling and pinch zoom remain available. Horizontal charts reserve vertical category movement and retain horizontal scrolling/pinch zoom. From/To provides the complete native keyboard equivalent; the plot remains hidden from the accessibility tree. Safari's pointer click does not consistently focus a button, so arming explicitly preserves the initiating button before dragging.

Private rc.4 adds `rangeSelection: boolean = false` and `rangeSelect: BarRangeSelection<T>` on bars, exported through `/bar` and root. The event contains `{ fromRowId, toRowId, rowIds, rows, source: 'plot' }`, preserving original row references. Persistent feedback still belongs to `selectedRowIds`; emitting a range never mutates it or emits a point event. Other families gain no new public inputs.

The existing lazy bar adapter owns pointer capture, draft DOM and listener cleanup. Internal render requests keep interaction metadata separate from ECharts options. Geometry follows public `convertToPixel`/`containPixel` queries after coordinate initialization, including auto-adjusted axis-label bounds; no fixed canvas padding or private engine model is used. The [official drag guide](https://echarts.apache.org/handbook/en/how-to/interaction/drag/) documents coordinate conversion after `setOption`; [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) documents capture/cancellation and touch-action behavior. Implementation code is original; existing engine registrations, peers, fixture attribution and notice bytes remain unchanged.

The [complete linked guide](../LINKED_CHARTS.md) and copied demo source remain identical and include the typed graphical handler, explicit focus, Escape and native synchronization. Validation controls exercise both orientations, stacking and gradients without adding settings to the public demo.

## Review and verification

The [capture manifest](captures/linked-brush/manifest.json) covers native and graphical states in both themes at 1440/768/390/320 px. A draft keeps the committed **February / 1,367 visits** context while outlining February–April; release updates the detail and native bounds to **February–April / 3,189 visits**. The final mobile toolbar shares the mode button and total on one row and keeps From/To together. Focus/hover styling follows the existing site tokens, and no page-width overflow is permitted.

| Review | Before | Graphical range |
| --- | --- | --- |
| Desktop dark | [Native-only range](captures/linked-range/linked-dark-1440-range.png) | [Draft over committed February](captures/linked-brush/linked-dark-1440-drag-draft.png) |
| Narrow light | [Native-only controls](captures/linked-range/linked-light-320-range.png) | [Compact armed state](captures/linked-brush/linked-light-320-drag-draft.png) |
| Committed detail | [Single-month feedback](captures/linked-selection/linked-light-1440.png) | [Inclusive range after release](captures/linked-brush/linked-light-1440-drag-committed.png) |

Reproduce after `npm run build`:

```sh
LINKED_CAPTURE_OUTPUT=docs/experiments/captures/linked-brush npm run capture:linked
```

The complete workspace check passes production builds, strict compilation, unit tests, strict installed declarations/examples, a fresh documented application, SSR, **230 browser scenarios with four expected skips**, six installed client/SSR modes and all eight bundle scenarios. Two skips are the existing CDP-only retention audit outside Chromium; two are real-swipe transport outside Chromium. Real mouse drags/native controls pass in all three engines. Coverage includes forward/reverse and clipped ranges, release-only totals, unchanged instances, all 16 layout/stack/fill/theme combinations, missing/zero/hidden categories, cancellation, typed raw-row payloads, runtime-type recovery and stale-model guards. Resource instrumentation checks all four gesture-global listeners return to baseline after repeated commits and to zero after armed navigation, alongside observer/motion/frame cleanup. Real Chromium touch swiping selects months while a vertical swipe scrolls without committing.

After the final mobile/focus refinements, a fresh build passes all **176 unit/integration tests** (165 library, 11 playground) and **40 linked/graphical browser scenarios with two expected swipe-transport skips**. This includes Escape from outside the chart controls, focus recovery before disabling an unavailable mode button, initial empty-data recovery and native reset focus. All **60 capture hashes, 20 source hashes and eight layout measurements** match the reviewed final files; no browser or HTTP errors are recorded. `PLAYWRIGHT_PORT` permits isolated worktree servers after the initial aggregate run encountered an occupied default port; normal CI retains 4173. No running server or behavioral assertion is bypassed.

The initial range implementation measures **210,017 gzip / 177,167 Brotli bytes** at the combined root, exceeding the previous **210,000 / 176,000** caps. The explicit root allowance advances to **212,000 / 178,000** for this bounded adapter; focused/core/root-frame caps remain unchanged. The final rerun passes all eight scenarios: combined root **210,031 / 177,172**, focused bar **181,855 / 155,118**, and core **5,758 / 5,052**. Against rc.3, the root adds **1,695 gzip / 1,533 Brotli bytes** (under 1%). Lazy registration/module counts remain intact and core has no engine runtime. No separate latency or large-data benchmark is claimed.

`npm run release:local` passes metadata/notices, strict installed declarations, the fresh documentation application and six client/SSR modes against byte-identical copies of one rc.4 candidate. The [candidate record](data/local-release-0.1.0-rc.4.json) identifies **80,087 bytes, 44 files**, SHA-256 `fba7223700cbcd849cd9b3015cf1152e625c8652a7305d8ba85ffd0208b92df0`. Every stage checks that digest; original/upstream/dependency notice bytes pass inspection, and retained rc.0–rc.3 archive checksums remain unchanged.

The Pages build prerenders **29 physical routes**. Local static checks pass in Chromium, Firefox and WebKit, including an actual graphical drag, release-only totals, native bounds/table feedback, initiating-button focus, Reset/reload, fonts, fragments, themes and mobile navigation. Documentation links/anchors and whitespace are checked before committing. Live delivery is recorded after publication.

## Remaining scope

One contiguous category range is supported. Shared zoom/hover, disjoint selection, editable drag handles, shared legends and bidirectional links remain later work. No new large-data/latency or broad mobile-device support claim is made. Human F09/R06/G2/G3/G4 remain pending, the package remains private and earlier rc.0–rc.3 artifacts/evidence remain preserved.

## Live delivery

Feature/evidence commit `58e0fde5c9bb61a288100630044ba73ac64c9b12` is pushed to main. The [live linked demo](https://phalla-doll.github.io/ng-echarts/linked/) is served from shared static commit `03c0a8cdb8ab6154cf853b7a10a199e06a39b5e8`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43418949846) succeeds. Its marker identifies the committed range-feature source and records `includesWorkingTree: true` because the shared preview also includes separate, uncommitted chart-possibility work. Those edits remain unstaged and are not included in the range-feature commit.

A fresh shared build prerenders **30 routes** and passes local and public checks in Chromium, Firefox and WebKit, preserving the separate preview additions. The live suite performs an actual graphical drag, proves the detail stays unchanged until release, verifies native bounds/Selected table rows and initiating-button focus, then checks Reset/reload, fonts, fragments, themes and mobile navigation. The independently retained rc.4 archive/checksum remains byte-identical to the verified candidate. Workspace CI runs separately; these statements identify executed local and live checks and do not close human release gates or publish to npm.
