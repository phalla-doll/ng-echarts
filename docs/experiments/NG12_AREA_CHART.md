# NG12 native Angular area charts

Recorded 12 November 2026 after baseline `e230553`. Implementation and full regression checks are complete. Scope: multiple area series, gradient/solid fills, same-sign stacking, straight/smooth curves, optional points, gaps, and shared Angular controls/lifecycle. Pie/donut and full release acceptance remain open.

## Implementation and boundaries

`AreaChart<T>` is exported from `@ng-echarts/chart-library/area`, with a compatibility reexport at the root. It uses the same native Cartesian controls and typed/state/formatting/motion/lifecycle contract as bar and line. Area owns its options, boolean inputs, lazy loader, and renderer adapter. It imports no bar or line component entry.

Area and line demonstrate a common curve policy: the pure curve-option builder and event-to-stable-point decoder now live in core behind unsupported `ɵ` exports. Core still loads no ECharts/ZRender runtime. Family adapters register/init/dispose the engine independently. ECharts implements area through Line series plus `areaStyle`, so both `/line` and `/area` intentionally use the line engine; package checks distinguish engine modules from Angular component entry isolation. See the official [area guide](https://echarts.apache.org/handbook/en/how-to/chart-types/line/area-line/) and [stacking guide](https://echarts.apache.org/handbook/en/how-to/chart-types/line/stacked-line/).

Each area owns a fresh fill object and original palette slot. `gradient=true` fades each color from 10% alpha at the top of its bounding box to transparent at the bottom; `false` uses uniform 10% alpha. Factors multiply existing color alpha. `stacked=true` groups visible series with explicit `stackStrategy: 'samesign'`, keeping positive and negative sums separate. Data stays raw; neither tooltip/table values nor `pointSelect` emit stack totals. Missing data remains `'-'` with `connectNulls: false` under all combinations, and missing stacked observations contribute no segment.

Clicks on markers, outlines, and filled regions resolve stable row/series identity and the nearest category on the hit series; gaps never emit. The table is the complete keyboard alternative, including zero/negative/missing data and observations without a visible segment. Overlap follows the renderer's hit order rather than inventing a series chooser. Defaults are unstacked gradients, straight curves, and no persistent markers.

## Gallery and integration

`/area` follows the approved bar/line gallery with Inter, Google Sans Code, syntax colors, Heroicons, shared spacing, both themes, and copy/preview/reset controls. Four examples show Gradient Areas, Stacked Areas, Solid Areas, and Missing Observations. The gallery omits table controls in preview and copied source, matching the user's preference; the component table defaults on.

The pinned area dataset differs from bars/lines: January Mobile is **245**, not 184. `evilcharts-area-fixture.ts` preserves all twelve source observations with new stable IDs and readonly typing. Totals are calculated from actual supplied observations. The gap composition sets selected values to null as new local validation content, not an upstream fixture. The component catalog marks bar, line, and area Available; pie/donut stays Planned.

`/area-validation` exercises signed stacks, actual fill gaps, raw point/table events, formatting, visibility/update identity, states, hidden hosts, teardown, and deferred hydration. `/area-comparison` preserves independent neutral reference tokens and a fixed plot height. `/area-benchmark` uses the existing actual-Angular benchmark protocol with stacked gradients and markers off. The [API guide](../AREA_CHART_API.md), its actual code example, and all eight generated area examples are compiled against the installed artifact with strict templates and `skipLibCheck: false`.

## Pinned-source visual review

Source revision remains `4c2dd7c9bae780703244265c9a4b509d40c055ad` of EvilCharts. The isolated harness uses these unmodified examples and their actual `echarts-area-chart.tsx` implementation:

| Angular variant | Exact upstream example | Comparison |
| --- | --- | --- |
| Independent gradients | [ex-default-type-echarts-area-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-default-type-echarts-area-chart.tsx) | Unstacked area series, same data and palette |
| Stacked gradients | [ex-stacked-type-echarts-area-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-stacked-type-echarts-area-chart.tsx) | Same ordered series and cumulative positive geometry |
| Solid fills | [ex-solid-area-variant-echarts-area-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-solid-area-variant-echarts-area-chart.tsx) | Stacked uniform translucent fills |

Run `npm run reference:prepare`, `npm run build`, and `npm run capture:area`. The [comparison gallery](captures/area-variants/index.html) includes 36 original-width images: three variants × three host widths (320/768/1440) × both themes × both implementations. Four gallery captures cover 390/1440 px in both themes. The [manifest](captures/area-variants/manifest.json) records original-source hashes, current Angular-source hashes, browser/DPR, reduced motion, host/canvas rectangles, font families, and image hashes. All 18 reference pairs were reviewed through three sheets; desktop/mobile galleries were inspected separately.

Representative [upstream default](captures/area-variants/default-upstream-dark-768.png)/[Angular default](captures/area-variants/default-angular-dark-768.png), [upstream stack](captures/area-variants/stacked-upstream-light-768.png)/[Angular stack](captures/area-variants/stacked-angular-light-768.png), and [solid fills](captures/area-variants/solid-angular-dark-320.png) preserve the selected data, series order, stacking, and color/fill intent. [Desktop](captures/area-variants/gallery-dark-1440.png) and [mobile](captures/area-variants/gallery-dark-390.png) gallery captures retain the approved aesthetic.

Accepted differences follow the existing Angular baseline: readable 12 px category/value ticks, continuous 2 px outlines rather than the selected upstream defaults' thin dashed outlines, explicit maximum 10% fill alpha, native controls below the plot, and a separate heading/summary. Upstream selection opacity can further temper its fill; Angular emits selection without persisting that visual selection state. Angular reserves 360 px for the comparison plot plus native UI; upstream uses a 360 px total host, so proportions/card heights differ. Font conditions are recorded. Brush, patterns, dotted/hatched fills, normalized stacks, and decorative strokes are outside this implementation. This is a reviewed Angular baseline, not pixel identity or a port of the latency/portfolio blocks.

## Performance and package results

Actual Angular AreaChart uses a visible fixed 768×320 plot, disabled animation/reduced motion, stacked gradients, and markers off. Each operation has one warm-up and 30 samples; p95 is the 29th sorted observation. Timers include input validation, option derivation, and lifecycle scheduling, ending on the ECharts `finished` event for the expected updated first value and row count. Data generation is outside the timer. Cold navigation-to-first-canvas and expanded-table samples are recorded separately in the [raw results](data/area-benchmark.json).

| Fixture | Mount p95 | Update p95 | Result |
| --- | ---: | ---: | --- |
| 200 categories × three series | 17.2 ms | 17.4 ms | Pass, ≤200 ms target |
| 2,000 categories × three series | 17.3 ms | 44.6 ms | Stress observation |

The measured starting envelope is up to 200 categories and three series on the recorded M2 Pro reference machine. Stress observations are not a hard API limit or a portable latency promise. Existing bar/line algorithms remain unchanged; their recorded benchmarks are retained rather than overwritten by this area run.

Focused area measures **182,093 gzip / 155,822 Brotli bytes**; line **181,612/155,309**; bar **178,867/152,997**; core **5,663/4,984**; combined root **193,019/163,951**. All remain within unchanged 200,000/175,000 family/root budgets and 10,000/9,000 core budgets. Core has zero engine modules; every family keeps the engine lazy. Area includes Line/Grid/Tooltip/Canvas and excludes Bar/SVG and other Angular component entries. [Area size](data/area-bundle-size.json) and [six-scenario module evidence](data/package-boundaries.json) record the results without silently raising a threshold.

## Verification and acceptance

The targeted run passes 97 unit/integration tests and fifteen three-engine area scenarios. Pure cases cover all sixteen curve/points/stack/fill combinations with signed, zero, and missing observations, independent fill objects, palette filtering, and alpha multiplication. Shared event tests cover line/area paths, zero/negative values, gaps, malformed events, and disposed options. Browser tests inspect pixels to verify positive Mobile stacks above Desktop, negative Mobile stacks below Desktop, their order reverses when unstacked, and the missing Desktop category has no painted fill in straight/smooth modes. Filled-region clicks and keyboard actions emit raw observations; updates preserve IDs, focus, and hidden-series state. Failed/late area imports, generic errors/retry, deferred hydration, and resource cleanup are covered.

`npm run check` passed formatting, production builds, strict compilation, all 97 unit/integration tests, installed-package declaration checks, SSR checks, 121 browser scenarios (two CDP-only scenarios skipped outside Chromium), all six installed-package client/SSR browser modes, and all six bundle-boundary scenarios. A final targeted run passed all fifteen area scenarios across Chromium, Firefox, and WebKit, including filled-region clicks returning raw positive and negative stacked observations rather than cumulative totals.

NG12 implementation completion does not close human R06/G2, full-MVP acceptance, licensing/publication, or G3/G4. NG13 pie/donut is next, with its separate single-measure category contract, zero-total empty state, and negative-value validation.
