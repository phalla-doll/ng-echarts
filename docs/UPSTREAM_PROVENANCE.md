# EvilCharts fixture and reuse ledger

Baseline: [`4c2dd7c9bae780703244265c9a4b509d40c055ad`](https://github.com/legions-developer/evilcharts/commit/4c2dd7c9bae780703244265c9a4b509d40c055ad). Recorded 12 November 2026 for NG02 and R03. Compare later revisions separately.

## Reference fixtures

| Registry name | Exact source path | Prototype use |
| --- | --- | --- |
| `ex-echarts-bar-chart` | [`src/registry/examples/echarts/ex-echarts-bar-chart.tsx`](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-echarts-bar-chart.tsx) | Primary fixture: twelve months, Desktop/Mobile values, green/rose palette |
| `ex-stacked-type-echarts-bar-chart` | [`src/registry/examples/echarts/ex-stacked-type-echarts-bar-chart.tsx`](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-stacked-type-echarts-bar-chart.tsx) | Stacking reference using the same data |
| `ex-horizontal-layout-echarts-bar-chart` | [`src/registry/examples/echarts/ex-horizontal-layout-echarts-bar-chart.tsx`](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-horizontal-layout-echarts-bar-chart.tsx) | Layout reference; six-row dataset and blue palette recorded in the horizontal fixture |
| `ex-gradient-variant-echarts-bar-chart` | [`src/registry/examples/echarts/ex-gradient-variant-echarts-bar-chart.tsx`](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-gradient-variant-echarts-bar-chart.tsx) | Gradient reference, same twelve-month dataset |

Use the primary dataset for prototype behavior tests. Stable month IDs were added for Angular events and updates. The primary upstream brush is excluded by the MVP scope. The reference tool downloads unmodified source into ignored `tools/reference/upstream/` and builds the primary React example in an isolated client harness; it does not build the full upstream website.

The [R03 review](experiments/R03_VISUAL_REVIEW.md) records upstream/Angular captures at 320, 768, and 1440 px **host** widths in both themes, with viewport, browser, DPR, fonts, motion, dimensions, and source hashes. The current 80-image gallery includes all four variants and narrow tooltips; R03 passes for the documented Angular baseline and intentional differences.

## Per-file provenance

Paths below are relative to the repository root. Full terms are preserved in [the upstream MIT notice](../projects/chart-library/third-party/evilcharts-LICENSE.txt), copyright 2026 Gurbinder.

| Local file | Upstream material | Treatment |
| --- | --- | --- |
| `projects/playground/src/app/fixtures/evilcharts-bar-fixture.ts` | Primary example's twelve rows and series labels | Adapted dataset; added stable IDs and readonly TypeScript types; source header retained |
| `projects/playground/src/app/fixtures/evilcharts-horizontal-fixture.ts` | Horizontal example's six Desktop values and blue light/dark palette | Adapted dataset; stable IDs, readonly types, and source notice added |
| `projects/chart-library/src/lib/bar-options.ts` | Primary example's light/dark Desktop and Mobile colors; gradient example's 20%/90% fade behavior | Adapted first two default colors and fade boundaries; transparent color conversion, option/tooltip builders, and additional colors are new |
| `projects/playground/src/app/comparison.css` | Four root/dark tokens from pinned `src/app/globals.css`: background, foreground, muted-foreground, border | Adapted as `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`; source header and MIT notice retained; fixture only, not library defaults |
| `projects/chart-library/third-party/evilcharts-LICENSE.txt` | Pinned `LICENSE` | Verbatim notice, included in the packed library by `ng-package.json` |
| `tools/reference/tokens.css` (generated, ignored) | Pinned `src/app/globals.css` root/dark variable blocks | Extracted by the preparation script for the isolated reference build; the downloaded source retains its MIT license |
| `docs/experiments/captures/bar-reference/upstream-*.png` | Rendered primary example and its real imported modules | Reference screenshots; source hashes and harness differences recorded in the capture manifest/review |
| `docs/experiments/captures/bar-variants/*-upstream-*.png` | Four selected unmodified examples and tooltips | Reference renders at three widths in both themes; exact source hashes and dimensions in the current manifest |
| `docs/experiments/captures/bar-alignment/upstream-*.png` | Same unmodified primary example, including tooltip views | Follow-up references alongside the Angular neutral-token fixture; source and comparison CSS hashes recorded |

The component templates, generic contracts, data validation, option transformations, lifecycle controller, CSS resolution, and tests are new Angular implementation. No upstream React implementation or helper bodies have been copied into them.

The later [gallery correction](experiments/BAR_GALLERY_VISUAL_REVIEW.md) composes only the existing monthly/horizontal fixtures in `bar-blocks.ts`; it does not add upstream datasets or copy block/component implementations. `gallery-shell.css`, `gallery.*`, and `bar-block.*` are new Angular presentation code informed by the user's area-block screenshot and live-page inspection. The local Inter font has its own bundled SIL Open Font License.

## Reuse classification

All paths in this table are under the pinned `src/registry/` tree.

| Inspected source and concern | Decision |
| --- | --- |
| `charts/echarts-bar-chart.tsx`: child collection, context, hooks, layout/axis/series builders | Rewrite around typed inputs and pure builders; retain conceptual category/value axis swap and explicit series identities |
| `ui/echarts-chart.tsx`: `resolveColors`, `normalizeColor`, `flattenColor`, CSS generation | Rewrite the browser boundary to read explicit theme/revision tokens and normalize CSS colors; do not copy application-specific config composition |
| `ui/echarts-tooltip.tsx`: HTML escaping, rows, shell and position helpers | Implement a small escaped text tooltip; defer configurable overlay variants |
| `ui/echarts-legend.tsx`: React overlay and indicator styles | Replace with native Angular buttons, retained identifier state, and visible labels |
| `ui/echarts-dot.tsx`: gradient sampling and marker variants | Defer advanced marker/pattern helpers; initial gradient uses a simple ECharts linear fill |
| Bar module's brush integration and Motion animations | Defer brush; use ECharts animation gated by browser motion preference |

Before adapting another helper or fixture, add its exact source, local destination, and treatment here, preserve required notices, and check its dependencies. This ledger does not select a distribution license for original project code.
