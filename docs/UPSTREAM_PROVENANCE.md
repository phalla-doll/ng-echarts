# Upstream provenance and reuse ledger

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
| `docs/BAR_CHART_API.md` | Primary fixture's January Desktop/Mobile values | Small integration example; stable ID and Angular implementation are new; zero/missing second row demonstrates the local data contract |
| `projects/playground/src/app/fixtures/evilcharts-horizontal-fixture.ts` | Horizontal example's six Desktop values and blue light/dark palette | Adapted dataset; stable IDs, readonly types, and source notice added |
| `projects/chart-library/core/src/lib/cartesian-options.ts` and `projects/chart-library/bar/src/lib/bar-options.ts` | Primary example's light/dark Desktop and Mobile colors; gradient example's 20%/90% fade behavior | Adapted first two default colors and fade boundaries; transparent color conversion, option/tooltip builders, and additional colors are new |
| `projects/playground/src/app/comparison.css` | Four root/dark tokens from pinned `src/app/globals.css`: background, foreground, muted-foreground, border | Adapted as `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`; source header and MIT notice retained; fixture only, not library defaults |
| `projects/chart-library/third-party/evilcharts-LICENSE.txt` | Pinned `LICENSE` | Verbatim notice, included in the packed library by `ng-package.json` |
| `tools/reference/tokens.css` (generated, ignored) | Pinned `src/app/globals.css` root/dark variable blocks | Extracted by the preparation script for the isolated reference build; the downloaded source retains its MIT license |
| `docs/experiments/captures/bar-reference/upstream-*.png` | Rendered primary example and its real imported modules | Reference screenshots; source hashes and harness differences recorded in the capture manifest/review |
| `docs/experiments/captures/bar-variants/*-upstream-*.png` | Four selected unmodified examples and tooltips | Reference renders at three widths in both themes; exact source hashes and dimensions in the current manifest |
| `docs/experiments/captures/bar-alignment/upstream-*.png` | Same unmodified primary example, including tooltip views | Follow-up references alongside the Angular neutral-token fixture; source and comparison CSS hashes recorded |

The component templates, generic contracts, data validation, option transformations, lifecycle controller, CSS resolution, and tests are new Angular implementation. No upstream React implementation or helper bodies have been copied into them.

The later [gallery correction](experiments/BAR_GALLERY_VISUAL_REVIEW.md) composes only the existing monthly/horizontal fixtures in `bar-blocks.ts`; it does not add upstream datasets or copy block/component implementations. `gallery-shell.css`, `gallery.*`, and `bar-block.*` are new Angular presentation code informed by the user's area-block screenshot and live-page inspection. The local Inter font has its own bundled SIL Open Font License.

## Demo-site icons: Heroicons

The demo uses [Heroicons](https://heroicons.com/) **v2.2.0**, pinned to [`0435d4ca364a608cc75e2f8683d374e55abbae26`](https://github.com/tailwindlabs/heroicons/tree/0435d4ca364a608cc75e2f8683d374e55abbae26). Only the selected `optimized/24/outline/*.svg` paths are embedded in `projects/playground/src/app/site-icon.ts`. Paths are copied verbatim; shared SVG attributes retain the upstream 24×24 view box, 1.5 stroke, rounded caps/joins, and `currentColor`. Multiple paths render through Angular's native template control flow.

The existing local aliases, icon dimensions, accessible button/link labels, and decorative `aria-hidden` treatment are preserved; SVGs are explicitly nonfocusable. There is no React/Vue wrapper, icon font, runtime CDN, or extra package dependency. This is demo presentation code outside the chart-library package. The catalog chart illustrations remain original SVG artwork.

The complete [MIT notice](../projects/playground/public/third-party/heroicons-LICENSE.txt), copyright Tailwind Labs, Inc., ships with the demo's public assets. The [provenance manifest](experiments/data/heroicons-provenance.json) records each exact upstream filename and SHA-256 hash, plus the license hash.

| Local alias | Heroicons outline name |
| --- | --- |
| `chart` | `chart-bar` |
| `compare` | `view-columns` |
| `update` | `arrow-path` |
| `layers` | `square-3-stack-3d` |
| `leave` | `arrow-right-start-on-rectangle` |
| `code` | `code-bracket` |
| `sun` | `sun` |
| `moon` | `moon` |
| `menu` | `bars-3` |
| `close` | `x-mark` |
| `chevron` | `chevron-right` |
| `copy` | `document-duplicate` |
| `check` | `check` |
| `arrow` | `arrow-up-right` |
| `book` | `book-open` |

## Demo code presentation dependencies

Google Sans Code is locally hosted from the official [Google Fonts distribution](https://fonts.google.com/specimen/Google+Sans+Code), maintained in [googlefonts/googlesans-code](https://github.com/googlefonts/googlesans-code). The original Latin WOFF2 asset is unchanged; [download provenance](experiments/data/google-sans-code.json) records the exact versioned asset URL and hashes. The [full SIL Open Font License](../projects/playground/public/fonts/GOOGLE-SANS-CODE-OFL.txt), copyright 2025 The Google Sans Code Project Authors, ships beside it. The original font name is retained.

The demo depends on [highlight.js 11.12.0](https://github.com/highlightjs/highlight.js) under BSD-3-Clause, using only its core, TypeScript, XML, and Bash modules. The [complete license](../projects/playground/public/third-party/highlightjs-LICENSE.txt), copyright 2006 Ivan Sagalaev, ships with public assets. `highlight-code.ts` and `syntax-highlighting.css` are local integration and theme code. No upstream theme stylesheet is copied. Neither dependency is added to the chart-library package.

## Reuse classification

The [site-wide alignment](experiments/SITE_THEME_ALIGNMENT.md) adds original documentation, SVG catalog illustrations, and shared neutral styling informed by the live documentation layout. `documentation-content.ts` reuses the January/February figures from the already attributed monthly fixture in its quick-start example. No additional upstream chart implementation or dataset is copied. The new setup commands describe this repository's Angular workspace rather than the upstream registry CLI.

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

## NG11 line references and shared policy

The pinned line examples are [ex-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-echarts-line-chart.tsx), [ex-solid-stroke-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-solid-stroke-echarts-line-chart.tsx), and [ex-monotoney-curve-type-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-monotoney-curve-type-echarts-line-chart.tsx), with their actual `src/registry/charts/echarts-line-chart.tsx` imports. The [NG11 report](experiments/NG11_LINE_CHART.md) and [capture manifest](experiments/captures/line-variants/manifest.json) record hashes and reviewed differences. Their monthly data and first two palette colors equal the already attributed Desktop/Mobile fixtures; `line-blocks.ts` reuses those values rather than introducing an unattributed dataset. Its missing-observation composition sets selected values to null as new local validation content. `LINE_CHART_API.md` and `line-validation.ts` use new synthetic observations.

No React component/helper bodies were copied into line or core. The line renderer, nearest-category event adapter, options, shared base directive, and demo integration are new Angular code. Existing Angular normalization/formatting/controller/browser logic moved from bar to core after reuse was demonstrated; the adapted palette notice remains in `cartesian-options.ts`. Shared `comparison.css` still maps the pinned neutral tokens. Unmodified upstream line screenshots and source hashes are included under `captures/line-variants/`, with the same preserved upstream MIT notice. React remains confined to the isolated reference tool.

## NG12 area references and shared curves

Area uses pinned `src/registry/examples/echarts/ex-default-type-echarts-area-chart.tsx`, `ex-stacked-type-echarts-area-chart.tsx`, and `ex-solid-area-variant-echarts-area-chart.tsx`, plus their actual `src/registry/charts/echarts-area-chart.tsx` imports, at revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. Exact source links and reviewed differences are in the [NG12 report](experiments/NG12_AREA_CHART.md); [capture hashes](experiments/captures/area-variants/manifest.json) include the unmodified references.

`projects/playground/src/app/fixtures/evilcharts-area-fixture.ts` adapts the twelve area observations with stable IDs and readonly types. Its Mobile values differ from bar/line; January is 245 rather than 184. Labels/palette equal the already attributed chart configuration. `area-blocks.ts` adds a null-gap composition as new local validation content; `AREA_CHART_API.md` and `area-validation.ts` use synthetic observations. The area builder adopts the reference's 10% vertical/solid fill intent, implemented with new parsing that multiplies existing alpha. No React builder/helper bodies were copied.

Existing Angular line curve options and point-event decoding moved to core after area demonstrated reuse. Area owns its own lazy registration and adapter; the shared point decoder additionally accepts filled-area events and ignores disposed options. All new Angular/gallery code is local implementation. Original reference renders live in `captures/area-variants/`, retaining the existing upstream MIT notice and isolated React development harness.
