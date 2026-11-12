# NG11 native Angular line charts

Recorded 12 November 2026, following baseline `cd2dcb0`. Status: pass for implementation and automated acceptance; the full regression results are recorded below. Scope: multi-series category/value lines, straight/smooth interpolation, optional points, missing-value gaps, and the established Angular controls/lifecycle. Area, pie/donut, advanced strokes/brushes, full MVP acceptance, and deferred human listening remain open.

## Implementation and shared ownership

`LineChart<T>` is exported from `@ng-echarts/chart-library/line`, with a compatibility reexport at the package root. It inherits the typed Cartesian data, formatting, states, native legend/table, motion, focus, and browser lifecycle policies now demonstrated by two families. Only line options and its lazy Line/Grid/Tooltip/Canvas loader belong to `/line`. Bar retains its own options and loader and imports no line implementation.

Shared policy moved into `core/src/lib/`: pure normalization/formatting, escaped tooltip/axes/theme building, generic opaque-option controller, browser resources, and an internal Angular base directive. The component templates and styles share the same native control markup. Bar's old private helper paths remain thin compatibility bridges for its tests and benchmark. `ɵ`-prefixed core exports support package implementation and are explicitly unsupported consumer APIs. Core has no ECharts/ZRender runtime dependency. The actual public `ChartFrame`/type contracts and existing bar inputs/events retain compatibility; strict packed-consumer tests check inherited Angular metadata and generic inference.

The [Apache ECharts line guide](https://echarts.apache.org/handbook/en/how-to/chart-types/line/basic-line/#empty-data) documents its explicit empty-data convention. Line options preserve supplied category order and stable IDs, keep `connectNulls: false`, and render missing observations as `'-'`. Numeric zero/negative values stay numeric. Markers default on, smooth interpolation defaults off. Paint uses 2 px strokes and 6 px bordered markers. Whole-line clicks select the nearest category on that visible series, including when persistent markers are disabled; missing observations never emit. The table remains the keyboard alternative, including for a lone observation with no visible marker/segment.

## Gallery and documentation

`/line` shares the approved bar gallery chrome, spacing, themes, Inter, Google Sans Code, syntax colors, Heroicons, and copy/preview/reset behavior. Four working examples demonstrate Device Trends, Smooth Trends, Minimal Lines, and Missing Observations. Tables are omitted in gallery previews and copied source, matching the user's bar-gallery preference; default library/table behavior remains enabled.

The component catalog marks bars and lines Available, while area and pie/donut stay Planned. `/line-validation` exercises updates, gaps, zero/negative/missing values, currency formatting, state/error recovery, native controls, resizing, mount/destruction, and deferred hydration. `/line-comparison` preserves independent reference conditions; `/line-benchmark` is a fixed-width engineering fixture. The [line API guide](../LINE_CHART_API.md) and all eight generated line examples are compiled from their actual source against the installed tarball.

## Pinned-source visual review

Baseline remains `4c2dd7c9bae780703244265c9a4b509d40c055ad` of EvilCharts. The isolated reference harness renders these unmodified examples and their actual imports:

| Angular example | Upstream path under `src/registry/examples/echarts/` | Disposition |
| --- | --- | --- |
| Device Trends | [ex-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-echarts-line-chart.tsx) | Same monthly values/palette and straight interpolation; native Angular controls; brush excluded |
| Smooth Trends | [ex-monotoney-curve-type-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-monotoney-curve-type-echarts-line-chart.tsx) | Upstream maps this curve name to ECharts smooth mode; Angular exposes a boolean, not a named monotone guarantee |
| Minimal Lines | [ex-solid-stroke-echarts-line-chart.tsx](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/src/registry/examples/echarts/ex-solid-stroke-echarts-line-chart.tsx) | Straight lines without persistent dots; hover/nearest-category behavior uses the Angular adapter |
| Missing Observations | Primary monthly fixture with desktop May/mobile August set to null | New validation composition; not represented as an upstream example |

Run `npm run reference:prepare`, `npm run build`, and `npm run capture:line`. The [comparison gallery](captures/line-variants/index.html) contains 36 original-width captures: three variants × three host widths (320/768/1440) × both themes × both implementations. Four additional gallery screenshots cover dark/light at 390/1440 px. The [manifest](captures/line-variants/manifest.json) records exact source hashes, browser/DPR, reduced motion, host/canvas rectangles, fonts, and image hashes. All 18 reference pairs (36 images) were inspected through three review sheets; desktop/mobile gallery captures were inspected separately.

Representative [upstream straight](captures/line-variants/straight-upstream-dark-768.png)/[Angular straight](captures/line-variants/straight-angular-dark-768.png), [upstream smooth](captures/line-variants/smooth-upstream-light-768.png)/[Angular smooth](captures/line-variants/smooth-angular-light-768.png), and [minimal](captures/line-variants/minimal-angular-dark-320.png) captures preserve values, series order, curve/fill intent, and palette. The [desktop gallery](captures/line-variants/gallery-dark-1440.png) and [mobile gallery](captures/line-variants/gallery-dark-390.png) retain the approved aesthetic.

Accepted differences follow the existing bar baseline: visible 12 px value/category ticks, stronger neutral grid, 2 px strokes instead of upstream's 0.8 px default, 6 px bordered markers, native controls below the plot, and a separate heading/summary. Upstream's 360 px host includes overlays/brush; Angular reserves 360 px for the plot plus native UI, so total card height and plot proportions differ. Reference system-font overrides and Angular host typography are recorded. These are reviewed Angular baselines, not pixel-identity or whole-upstream-library claims. No React implementation bodies enter the Angular package.

## Performance and package boundaries

Both benchmarks use the production app, fixed visible 768×320 plot, disabled animation/reduced motion, one warm-up and 30 samples; p95 is the 29th sorted observation. Actual Angular timing begins before creation/input replacement and ends on the ECharts `finished` event matching updated first value and row count. Data generation is outside the Angular timer. Line points are enabled; cold navigation-to-first-canvas and expanded-table samples are separate. See [raw line timings](data/line-benchmark.json) and [bar rerun](data/bar-benchmark.json).

| Family | 200×3 mount/update p95 | 2000×3 mount/update p95 |
| --- | --- | --- |
| Line | 17.4 / 17.4 ms | 17.3 / 28.7 ms |
| Bar after shared-policy extraction | 17.4 / 17.4 ms | 42.9 / 71.1 ms |

Both normal fixtures pass the existing ≤200 ms target on the recorded M2 Pro reference machine. Up to 200 categories/three series is the measured starting envelope; stress timings are observations, not a portable limit or latency guarantee. This line increment retains Canvas and does not repeat the initial renderer-selection research as a new SVG support promise.

The standalone bar Canvas/SVG harness now aliases core to its real pure-policy source bridge, preserving its original no-Angular-UI measurement scope. Actual component timings and installed-package checks still use compiled production entries, so the bridge does not substitute for real Angular evidence.

Initial linked measurements are 178,867 gzip/152,989 Brotli bytes for bar, 181,020/154,815 for line, 5,663/4,976 for core, and 190,862/162,343 for the combined root. Bar/line/root budgets remain 200,000/175,000; core remains 10,000/9,000. Core grows because it now owns shared controls/lifecycle, while still excluding engine bytes. Focused bar excludes Line/SVG; focused line excludes Bar/SVG; both keep engine code lazy. The root compatibility import intentionally includes both families, and frame-only root imports may emit unreachable renderer files. [Module evidence](data/package-boundaries.json), [bar size](data/bar-bundle-size.json), and [line size](data/line-bundle-size.json) record current measurements without silently raising budgets.

## Verification and acceptance

Targeted unit, strict declaration, and three-engine line scenarios pass. Browser checks inspect painted gap columns rather than only option flags, select real painted paths with markers on/off, preserve table/legend/formatting behavior and raw values after updates, replay deferred hydration, and verify teardown. Dedicated tests cover failed/late line-loader imports; renderer-boundary integration checks actual motion options. Installed client/SSR consumers exercise both families and compare root/focused class identities while blocking private imports.

The complete `npm run check` passed: formatting, production library/site builds, strict compilation, 75 unit/integration tests, installed declarations and intentionally invalid templates, production SSR, 106 browser scenarios with two CDP-only skips, installed client/SSR runtime checks in Chromium/Firefox/WebKit, and all five package-boundary scenarios. All benchmark targets and the 40-image capture run passed independently. The final documentation-page rebuild and targeted site-page scenarios also passed after copy alignment. NG11 implementation completion does not close human R06/G2, remaining families, or G3/G4. NG12 area charts are next after this verified line foundation, with gradients/stacks and their own evidence.
