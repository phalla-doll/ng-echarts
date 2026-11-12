# NG13 native Angular pie and donut charts

Implementation and verification complete after baseline `b519f12`, recorded 12 November 2026. The one-measure API, category visibility, responsive donut ratio, labels, and shared browser lifecycle are implemented. Release acceptance and human R06/G2 remain open at the user's direction.

## Implementation

`PieChart<T>` owns its radial normalization/options/adapter and native template. It reuses proven pure validation/formatting, theme resolution, PlotController, focus retention, and ChartFrame from core, without inheriting Cartesian series inputs. `ChartMeasure<T>` supplies one stable measure; `CategoryVisibilityChange` supplies row identity. Zero totals are empty, negatives/nonfinite inputs/overflow totals are errors, nulls remain missing, and filtering never changes raw events or original palette slots. Duplicate display labels are allowed with unique row IDs. The [API guide](../PIE_CHART_API.md) describes every input and limit.

`/pie` has Browser Share, Browser Donut, and Category Labels examples in the existing gallery shell. `/pie-validation` covers formatting, state recovery, hidden hosts, immutable updates, category visibility, deferred hydration and destruction. `/pie-comparison` preserves neutral reference conditions. `/pie-benchmark` exercises the actual Angular component with 12/100 category fixtures.

The upstream MIT browser fixture is 275/200/187/173/90, totaling 925 visitors. New stable IDs and display labels adapt the original lowercase category keys. The five source colors are preserved in both themes. Angular implementation bodies are new; original React source stays isolated in the reference harness.

## Source and visual review

Pinned EvilCharts revision: `4c2dd7c9bae780703244265c9a4b509d40c055ad`.

- [Original pie example](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-echarts-pie-chart.tsx).
- [Original donut example](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-donut-echarts-pie-chart.tsx).
- [Actual original implementation](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/charts/echarts-pie-chart.tsx).
- Apache ECharts [pie guidance](https://echarts.apache.org/handbook/en/how-to/chart-types/pie/basic-pie/) and [donut guidance](https://echarts.apache.org/handbook/en/how-to/chart-types/pie/doughnut/) inform the explicit zero-total and inner/outer radius policy.

`npm run reference:prepare`, `npm run build`, and `npm run capture:pie` produced [32 captures](captures/pie-variants/index.html): 24 paired images (two variants × three host widths, 320/768/1440 px × both themes × both implementations), four gallery views at 390/1440 px, and four labeled-block views at those widths. The [manifest](captures/pie-variants/manifest.json) records pinned source hashes, current Angular source hashes, browser/DPR, reduced motion, rectangles, fonts and image hashes. Every one of the twelve reference pairs was reviewed in two contact sheets; desktop/mobile gallery and label views were inspected separately. Sector direction, order, proportions, browser counts and theme palettes match the selected reference intent.

The narrow review initially found cropped outside labels. Labeled charts now reserve a 60% outer radius, align labels within the canvas edges, and suppress overlap; the 390 px dark labeled capture was reviewed after correction. The default 80% radius is retained when labels are off. Label behavior is intentional rather than a promise to display every category around a crowded plot; native controls and the table retain complete text.

Accepted differences are solid colors rather than upstream subtle gradients, a responsive 0.6 donut ratio rather than fixed 60 px, native controls below the plot, no persistent exploded/dimmed selection, and the shared Angular heading/summary. Angular reserves a 360 px comparison plot plus a native heading/summary and controls, whereas the upstream 360 px host includes its overlay legend. Capture card heights and plot proportions therefore differ; this is an accepted Angular baseline, not pixel identity. Outside labels are a local composition rather than a claim of complete upstream variant parity.

Representative pairs: [original pie](captures/pie-variants/default-upstream-dark-768.png)/[Angular pie](captures/pie-variants/default-angular-dark-768.png), [original donut](captures/pie-variants/donut-upstream-light-768.png)/[Angular donut](captures/pie-variants/donut-angular-light-768.png). [Desktop](captures/pie-variants/gallery-dark-1440.png), [mobile](captures/pie-variants/gallery-light-390.png), and [narrow labels](captures/pie-variants/labels-dark-390.png) retain the established gallery aesthetic.

## Performance and packaging

Focused pie retains the existing 200,000 gzip / 175,000 Brotli byte limit; core retains 10,000/9,000. The cumulative root now exports four chart families and registers three distinct engines (Bar/Line/Pie). Its gzip limit is explicitly revised from 200,000 to **210,000** bytes for the added Pie engine; its 175,000 Brotli limit stays unchanged. This change applies only to the combined root, not focused family imports or root-frame. The module audit distinguishes coordinate registration from ECharts Tooltip's mandatory shared axis-pointer code: `cartesianAxisHelper.js` and axis-pointer/view infrastructure remain counted, while Grid/Cartesian coordinate implementations and unrelated chart engines are excluded. Actual Angular donut timings use a visible fixed 768×320 plot, DPR 1, ratio 0.6, labels off, reduced motion/animation disabled, one warm-up and 30 samples per operation. The p95 is the 29th sorted sample. Timers include input validation/options/lifecycle scheduling and end on ECharts `finished` for the expected first value and row count; input generation is outside the timer. [Raw measurements](data/pie-benchmark.json) include the recorded Apple M2 Pro/Chromium environment, cold navigation-to-first-canvas time and separate complete-table costs.

| Categories | Mount p95 | Update p95 | Interpretation |
| --- | ---: | ---: | --- |
| 12 | 16.9 ms | 16.9 ms | Pass, ≤200 ms normal target |
| 100 | 17.3 ms | 17.1 ms | Stress observation |

The measured starting envelope is 12 categories on this reference machine. The 100-category run is a stress observation, not a hard API limit or a portable latency guarantee. These timings apply to the donut/labels-off profile, not to crowded outside-label layouts. Existing bar/line/area timing evidence is retained.

| Import | gzip bytes | Brotli bytes |
| --- | ---: | ---: |
| `bar` | 178,867 | 152,997 |
| `line` | 181,612 | 155,309 |
| `area` | 182,093 | 155,822 |
| `pie` | 157,716 | 135,275 |
| `core` | 5,663 | 4,984 |
| `root` | 204,717 | 173,696 |
| `root-frame` | 193,588 | 164,887 |

All seven scenarios pass their recorded caps. Every engine remains lazy; core has zero engine modules and focused pie retains only the Pie family. The [pie size result](data/pie-bundle-size.json) and [module matrix](data/package-boundaries.json) preserve contributing modules and static/lazy reachability.

## End-to-end story

The story is `/pie` → typed browser fixture → Angular normalization/options → lazy Canvas rendering → native category controls and original-row selection events. There is no API, database, credential or external service in this flow. The local server uses port 4310, leaving 4200 untouched.

| Boundary | Evidence |
| --- | --- |
| Server → page | Production SSR contains the gallery and stable controls without a canvas |
| Page → hydration | Three charts mount; state and cleanup tests check one renderer per mounted chart and deferred interaction hydration |
| Data → rendering | 925 original visitors, palette slots, sector direction and responsive radii appear in reviewed captures |
| Interaction → data | Real sector clicks and keyboard actions emit raw values/row IDs; hidden, zero and missing observations follow the documented rules |
| Gallery → integration | Actual copied examples and the API fence compile against the isolated tarball with strict templates and `skipLibCheck: false` |

## Verification and next step

Regression stages pass formatting, production builds, strict TypeScript/templates, **107 unit/integration tests**, installed-artifact declaration checks (including invalid measure/radius templates and the actual API/gallery sources), production SSR, **136 browser scenarios** with two CDP-only skips outside Chromium, and all six installed-package CSR/SSR modes across Chromium/Firefox/WebKit. The full `npm run check` completed through runtime verification; its final bundle assertion was refined to distinguish shared Tooltip axis-pointer code from Grid/Cartesian coordinate implementations, then `npm run check:bundle` passed all seven scenarios. No focused-entry size cap was raised.

The fifteen pie-specific browser scenarios include pixel checks of pie center/donut hole, actual sector clicks, raw zero table actions, missing values, category events, immutable update/reorder focus, retained hidden IDs, formatter options, all-hidden recovery, negative/zero/error/empty/loading recovery, deferred interaction hydration, failed/late imports and ten repeated mount/destroy cycles with observer/motion/frame cleanup. Unit cases additionally cover duplicate labels/IDs, solid palette filtering, all-missing and overflow totals, three radii with both label modes, escaped tooltips and changed reduced-motion preferences.

`npm run capture:pie` passes with 32 captures and source/image hashes verified; `npm run benchmark:pie` passes the normal target. The agent-browser review at port 4310 confirms the local gallery, syntax-highlighted/copyable code, theme switching, mobile menu and navigation to pie validation. Documentation links/anchors and `git diff --check` are verified before committing. NG13 completion does not close NG14 cross-family acceptance, NG15 integration/documentation review, human R06/G2, or G3/G4 release acceptance. NG14 is next.


## Documentation alignment review

The follow-up review against implementation `1ddc39c` covers the related documentation below. It updates current guidance while retaining dated experiment results as historical evidence; no NG14 or release gate is marked complete.

| Documentation | Coverage |
| --- | --- |
| [Root guide](../../README.md) and [packaged README](../../projects/chart-library/README.md) | Four-family imports/routes, API/evidence navigation, numeric rules, provisional status, and current bundle caps |
| [Product specification](../PRODUCT_SPEC.md) and [architecture](../TECHNICAL_ARCHITECTURE.md) | One-measure pie contract, event identities, radius/label policy, state rules, exported types, and focused packaging |
| [API guide](../PIE_CHART_API.md) | All inputs/defaults, raw point/category events, keyboard alternative, missing/zero/negative rules, exclusions, and compiled integration example |
| [Research findings](../RESEARCH_FINDINGS.md), [R&D plan](../RND_PLAN.md), and [sources](../SOURCES.md) | Recorded four-family compatibility, exact tested versions versus peer ranges, primary pie/donut references, and deferred evidence |
| [Implementation plan](../IMPLEMENTATION_PLAN.md), [backlog](../BACKLOG.md), and [acceptance matrix](../ACCEPTANCE_MATRIX.md#implemented-family-evidence) | NG13 implementation completion, NG14 next, per-family evidence, and explicit remaining lifecycle/measurement/human criteria |
| [Site documentation content](../../projects/playground/src/app/documentation-content.ts) | Current focused imports, Cartesian versus radial data contracts, pie labels/empty rules, and category versus series legend events |
| [Consumer guide](../../tools/consumer-fixtures/README.md) and [reference harness](../../tools/reference/README.md) | All focused entries, copied/API examples, installed CSR/SSR checks, and reproducible family captures |

Review validation: all 18 declared pie inputs and both outputs are covered in the API guide; 249 local documentation links/anchors resolve. The production playground build, all nine documentation-page scenarios across Chromium/Firefox/WebKit, Prettier checks, and `git diff --check` pass. This documentation-only review retains the prior 107-test/136-browser implementation evidence without claiming a new full regression run.
