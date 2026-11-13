# NG20 native month ranges

Approved 13 November 2026 after selected-month feedback and the shared focus/hover refinements. This increment extends the application-owned overview/detail link with native inclusive ranges. It retains the existing neutral gallery design and the separately delivered Orbit e branding.

## Contract

Period offers All months, Custom range and individual month options. Custom range reveals From/To beneath Period; it starts at a selected month or first through last available row. Both endpoints count, and equal bounds mean one month. Crossing one bound moves its counterpart to the edited row. Plot/table actions collapse the range to one month. Reset clears it and returns focus to Period.

Stable row IDs define the endpoints. Membership follows current supplied/displayed order; no date-label parsing or hidden chronological sort occurs. Reordering keeps endpoint IDs and normalizes their orientation; interior insertion/removal recomputes membership. Removing either endpoint clears the filter and restoring it later does not resurrect it. If that update removes a focused range field, a view effect moves focus to Period before teardown; another active control retains focus. The conditional native fields explicitly select their current option on creation, avoiding an initial To field that visually shows the first row while aggregating through the last.

Both charts keep independent legend visibility and stable renderer instances. Missing observations remain null, zero remains numeric, and range aggregation excludes missing cells. No data, no observations and a zero total remain separate states. The native selectors, table actions and polite status supply equivalent accessible context; this automated coverage does not replace human screen-reader interpretation.

## Library API

Private rc.3 adds `BarChart.selectedRowIds: readonly string[] | null`, default null. A non-null array overrides existing `selectedRowId`, including `[]` to clear feedback. Known IDs are deduplicated; unknown/empty IDs are ignored. Both input types are validated independently. The chart never mutates selection or emits a point event for an input update.

Selected categories retain series colors and quiet category bands while surrounding bars fade. Bands survive zero/missing values and hidden series. The native table visibly labels and shades every matching row, with `aria-current` only for one effective selected row. This is controlled presentation; the application owns membership, endpoint reconciliation and reset. The scalar API remains supported and other families gain no new selection input. The implementation adds no renderer registration, dependency, global bus or exposed ECharts instance.

The [guide](../LINKED_CHARTS.md) and copied demo source contain the same complete standalone Angular example, including pure range functions and focus recovery. Strict installed-consumer compilation checks the actual source and rejects numeric plural input. The existing monthly fixture attribution and all original/upstream notice bytes are preserved.

## Visual review and verification

The [capture manifest](captures/linked-range/manifest.json) records 44 images with source/image hashes, dark/light themes and 1440/768/390/320 px. All eight combinations show the expected February–April total of **3,189 visits**, without horizontal page overflow, browser or HTTP errors. Reviewed screenshots retain the approved compact native fields, subtle borders, thin focus outlines and quiet selected bands. From/To stay side by side below Period; the total moves to its own row on narrow layouts. Native fields remain at least 40 px tall on mobile. The same Selected labels remain readable in the native table without claiming multiple current rows.

| Review | Earlier feedback | Range increment |
| --- | --- | --- |
| Desktop dark | [One selected category](captures/linked-selection/linked-dark-1440.png) | [Three included months](captures/linked-range/linked-dark-1440-range.png) |
| Narrow light | [Single-month filter](captures/linked-selection/linked-light-320.png) | [Range controls and derived detail](captures/linked-range/linked-light-320-range.png) |
| Keyboard focus | [Earlier shared treatment](captures/focus-refinement/month-light-320.png) | [Native To field](captures/linked-range/linked-light-320-range-focus.png) |
| Multiple table rows | [One current row](captures/linked-selection/linked-dark-320-keyboard.png) | [Visible Selected labels](captures/linked-range/linked-light-320-range-table.png) |

Reproduce after `npm run build`:

```sh
LINKED_CAPTURE_OUTPUT=docs/experiments/captures/linked-range npm run capture:linked
```

All **173 unit/integration tests** pass (163 library, ten playground). New coverage includes plural precedence/clearing/deduplication/runtime recovery, all 16 theme/layout/stack/gradient combinations, supplied-order range reconciliation/crossing and focus fallback before field teardown. The strict installed checker compiles the exact guide/gallery source and rejects numeric plural IDs. The fresh documented application and SSR check pass. Native-select keyboard type-ahead passes in all three engines; macOS popup arrow handling remains outside headless automation.

`npm run check` passes: formatting, production builds, strict compilation, all 173 unit tests, strict installed declarations/examples, a fresh documented application, SSR, **214 browser scenarios with two expected skips**, six independently installed client/SSR modes and all eight bundle scenarios. The skipped cases are the existing CDP-only retention audit outside Chromium. All 24 linked scenarios pass across Chromium, Firefox and WebKit; native keyboard type-ahead, painted group counts, table feedback, stable instances, missing/zero aggregates, update/reorder/removal, all eight theme/width combinations and touch Reset are covered.

Bundle caps remain unchanged. The combined root measures **208,336 gzip / 175,639 Brotli bytes**, and focused bar **180,283 / 153,706**. Focused imports retain lazy family boundaries and core has no engine runtime. No additional latency or large-data benchmark is claimed.

The Pages build prerenders **29 physical routes**. Local static checks pass in Chromium, Firefox and WebKit, including initial conditional To value, February–March aggregation, two visibly selected table rows without multiple current rows, Reset/focus and reload reset, along with fonts, fragments, themes and mobile navigation. All 14 recorded source hashes and 44 image hashes match the reviewed files.

`npm run release:local` passes metadata/notices, strict declarations, the fresh documentation application and six installed client/SSR modes against byte-identical copies of one candidate. The [rc.3 record](data/local-release-0.1.0-rc.3.json) identifies **72,768 bytes, 44 files**, SHA-256 `1e8d0af8be0181cf460c1859b9f0b21b9184336715ae4bc7a8bd076801e75f6c`. Every consumer stage verifies that digest; original MIT and upstream/dependency notice bytes pass inspection. Retained rc.0, rc.1 and rc.2 tarball checksums are checked unchanged. No version is repacked in place.

Documentation links/anchors, whitespace and capture hashes are checked before committing. Live delivery is recorded after publication.

## Remaining scope

Graphical range brushing/dragging, linked zoom/hover, shared legends and bidirectional selection remain later NG20 work. Native ranges do not claim a new large-data or multi-chart performance envelope. Human F09/R06/G2/G3/G4 remain deferred/pending. The package stays private; no registry publication occurs, and rc.0–rc.2 artifacts and evidence remain preserved.

## Live delivery

Feature/evidence commit `a85c80efea57dc019abed690c505eb8a73445af9` is pushed to main. The [live linked demo](https://phalla-doll.github.io/ng-echarts/linked/) is served from static commit `195ff7801fd7ae4dca5690b96c6b2244e31b23d5`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43404190342) succeeds. The preview marker identifies that clean feature source with `includesWorkingTree: false`.

Live checks pass in Chromium, Firefox and WebKit across all 29 prerendered routes, including native range initialization, February–March totals, multiple Selected table rows without multiple current rows, Reset/focus and reload reset, lazy fonts/assets, themes, fragments and mobile navigation. The separate workspace CI workflow runs independently; these results identify the executed local and live checks. The verified rc.3 tarball/checksum is retained alongside rc.0–rc.2 in the shared workspace's ignored `dist/releases/`. No npm publication or human gate closure is claimed.
