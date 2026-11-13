# NG17 composed Cartesian charts

Started 13 November 2026 after the user authorized the suggested next task. This first post-MVP increment combines vertical, unstacked bars and lines on shared category/value axes. The APIs remain experimental; the user’s deferred human interpretation and G2/G3/G4 release gates remain pending.

## Implemented contract

The focused `/composed` entry and compatible root exports provide `ComposedChart<T>`, `ComposedSeries<T>`, `ComposedBarSeries<T>` and `ComposedLineSeries<T>`. Every descriptor requires a bar/line kind and the existing typed numeric key, ID and label. Lines accept boolean smoothing/point settings. Invalid kinds and incompatible settings fail typed compilation and enter the runtime configuration-error state. The [complete API example](../COMPOSED_CHART_API.md) is compiled against the installed tarball, together with both themes of the actual copyable gallery source.

The shared Cartesian base receives a default-compatible series type parameter. Data validation, raw row identity, formatting, native legends/tables, stable visibility/focus, state precedence, theme refreshes, motion and plot lifecycle remain shared. The pure composed builder keeps category centers fixed when bars are hidden and layers lines above bars. Replacement options remove obsolete settings on kind changes. The lazy adapter registers only Bar/Line/Grid/Tooltip/Canvas; existing focused entry points retain their boundaries.

The `/composed` gallery uses the existing neutral shell, unique original icon, preview/code/copy controls and responsive themes. The attributed monthly Desktop fixture supplies visits; a new local trailing three-observation mean supplies the line. Early months use available observations. The summary shows total visits (7,170) and the latest mean (535.3), rather than summing means. The library renders supplied values and does not calculate trends. [Provenance](../UPSTREAM_PROVENANCE.md#ng17-composed-extension) records reuse and original code boundaries.

`/composed-validation` isolates engineering controls, including data/series reorder, kind changes, line points, palette revision, states, hidden hosts, repeated mounting and deferred hydration. `/composed-benchmark` measures the actual Angular component with a bar/line/bar fixture. Dual scales, horizontal/stacked/area composition, raw option overrides and custom tooltip templates remain outside this increment.

## Verification

The focused 27-scenario run passes across Chromium, Firefox and WebKit. It covers actual painted bar/whole-line clicks, raw signed/zero values, missing cells, stable table focus, hidden IDs through kind changes, palette refreshes, narrow/hidden hosts, error/loading/empty recovery, renderer failure/retry, delayed-import destruction, deferred hydration and route cleanup. Each engine completes 100 mount/destroy cycles with zero remaining native observers, frames, motion listeners and tracked focus listeners. Reduced-motion boundary tests cover initial and changed preferences and explicit animation disablement.

`npm run check` passes: formatting, library/playground production builds, strict TypeScript/templates, 132 unit/integration tests (128 library + 4 playground), strict installed declarations and actual guide/gallery examples, fresh documentation application, SSR, 190 browser scenarios plus two expected CDP-only skips, installed client/SSR consumers and all eight bundle scenarios. The additional Pages build prerenders 27 physical routes and passes direct-route/reload/font/theme/navigation checks in all three engines.

[Bundle evidence](data/package-boundaries.json) retains the existing caps. The focused composed entry totals **190,337 gzip / 161,664 Brotli bytes**, including lazy chunks with Angular/RxJS peers external. Only Bar/Line engine families contribute; no engine module is eager. Existing focused families retain their measured totals and exclude the composed component. Root totals are **207,212 / 174,834 bytes**, within the unchanged 210,000/175,000 caps.

`npm run benchmark:composed` passes against the rebuilt production playground, run separately from regression workloads. The benchmark host’s existing empty-preview selector was extended to recognize the composed component before measuring. [Raw timing evidence](data/ng17-composed-benchmark.json) records the machine/browser, one warm-up and 30 samples per operation, separate cold/table costs and all observations.

| Categories × 3 series | Mount p95 | Update p95 | Legend p95 | Resize p95 |
| --- | --- | --- | --- | --- |
| 200 × 3 | 17.7 ms | 17.4 ms | 18.1 ms | 34.3 ms |
| 2000 × 3 | 35.8 ms | 63.8 ms | 53.8 ms | 61.1 ms |

The normal mount/update results meet the 200 ms target. Stress, interaction and resize timings remain observations rather than portable guarantees. The benchmark’s table work is measured separately from plot paint.

## Visual review

`npm run capture:composed` reproduces [16 captures and their source hashes](captures/composed/manifest.json): dark/light themes at 1440, 768, 390 and 320 px, full narrow pages, bounded shared tooltips and focused imports. The review confirms the established sidebar, typography, card spacing, theme controls, axes, native legends and import presentation. There is no horizontal page overflow; both series and full labels remain available through the tooltip/native controls. The existing official ECharts/four-family comparison remains in the [visual audit](VISUAL_AUDIT.md); this new composition is local product design rather than a claim of a copied upstream mixed-chart variant.

Representative captures: [desktop dark](captures/composed/composed-dark-1440.png), [mobile light](captures/composed/composed-light-320-full.png), [mobile shared tooltip](captures/composed/composed-dark-320-tooltip.png).

## Artifact and remaining work

The new API advances the private local candidate to `0.1.0-rc.1`. `release:local` writes version-specific evidence, preserving the [NG16 rc.0 record](data/ng16-local-release.json) and earlier local artifact. `npm run release:local` passes for **ng-echarts-chart-library-0.1.0-rc.1.tgz**, **68,876 bytes**, **44 files**, SHA-256 `2009034295ffaa07955e0ec2a6370689b2d8922e6e06a527dc97c8beeeaaaacb`. Metadata, exported targets and notice hashes match; strict declarations, the fresh guide application and client/SSR consumers install byte-identical copies. The [version-specific record](data/local-release-0.1.0-rc.1.json) embeds those exact consumer reports. The retained rc.0 tarball still matches its original SHA-256 `313e3c2d7a3593d9e7710e140a5f2dfda9e580c5a52f52b8f3aff77cdc7228b0`.

Original code remains MIT licensed; no dependency range or upstream notice bytes change. The [release checklist](../RELEASE_CHECKLIST.md) describes distribution checks and the remaining human/public-release decisions. No registry publication is part of this increment.
