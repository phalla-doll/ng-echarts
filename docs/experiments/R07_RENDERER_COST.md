# R07 bar renderer and cost

Status: pass for the bar prototype on the reference machine. Recorded 12 November 2026; rerun after the site-wide theme and responsive measurement-wrapper update. Task: NG08. Requirements: F02, F04, F08. Gate: G2.

## Method and reproduction

Run `npm run build`, `npm run benchmark:bar`, and `npm run check:bundle` with Node from `.nvmrc`. Performance measurements are separate from routine CI to avoid treating a shared runner as the reference machine; the measured package size budget is checked in `npm run check`.

[Raw samples](data/bar-benchmark.json) record an Apple M2 Pro (10 logical CPUs, 32 GiB RAM), arm64, Darwin 27.2.0, Chromium 158.0.8127.18, Node 24.22.2, production builds, DPR 1, a visible 768 px chart host, 320 px plot height, reduced motion, disabled animation, and a collapsed table. Do not run another benchmark/build concurrently. These are local headless-browser results, not guarantees for every device.

The actual Angular fixture mounts `BarChart<T>` through `ViewContainerRef` or supplies a new immutable data reference to a mounted component. Rows contain three deterministic numeric series. Timing begins before component creation/input change and therefore before validation, computed options, stability coordination, theme reads, and frame scheduling. The end signal is ECharts `finished`, subscribed through the public `registerPostInit` hook before the library's first update. The observer checks the expected first value and row count so an initialization/resize event cannot finish the wrong sample. Instrumentation exists only in the playground benchmark route, not the package API.

Each operation has one warm-up, followed by exactly 30 samples; p95 is the 29th sorted sample. Update measurements additionally mount the fixture before their update warm-up. Data generation is outside the Angular timer because it represents caller input. The normal fixture is 200 categories × 3 series; the stress fixture is 2,000 × 3.

Separate production Canvas and SVG harness bundles use the same pure library validation/options and their respective modular renderers. Their direct timings include deterministic row generation; they compare renderer cost and do not substitute for the Angular result. A public `finished` listener is installed before `setOption`. Module loading is excluded from warm timings.

## Actual Angular component

| Fixture | Operation | p95 | Result |
| --- | --- | --- | --- |
| 200 × 3 | mount | 17.40 ms | Pass (≤200 ms) |
| 200 × 3 | update | 17.50 ms | Pass (≤200 ms) |
| 2000 × 3 | mount | 39.80 ms | Stress observation |
| 2000 × 3 | update | 69.10 ms | Stress observation |

The normal Angular mount and update satisfy the proposed 200 ms p95 target. The initial supported performance envelope is **up to 200 categories and three series** under these recorded conditions. The 2,000-category fixture is stress evidence, not a portable latency promise or a hard input limit. The API continues to validate finite values independently of this recommendation.

## Canvas/SVG comparison

| Renderer | Fixture | Operation | p95 |
| --- | --- | --- | --- |
| canvas | 200 × 3 | mount | 6.60 ms |
| canvas | 200 × 3 | update | 5.70 ms |
| canvas | 2000 × 3 | mount | 41.70 ms |
| canvas | 2000 × 3 | update | 42.00 ms |
| svg | 200 × 3 | mount | 9.10 ms |
| svg | 200 × 3 | update | 6.60 ms |
| svg | 2000 × 3 | mount | 56.40 ms |
| svg | 2000 × 3 | update | 49.00 ms |

Retain **Canvas** for the bar adapter: the latest rerun has lower measured mount/update p95 in both fixtures and a smaller measured module payload. These local observations do not establish a portable renderer ranking. SVG remains a valid engine option for future research, rather than being declared incompatible. The [Canvas light](captures/renderer-canvas-light.png), [SVG light](captures/renderer-svg-light.png), [Canvas dark](captures/renderer-canvas-dark.png), and [SVG dark](captures/renderer-svg-dark.png) captures were reviewed; geometry and palette agree for the comparison fixture, with expected rasterization differences.

## Loading, table, resize, and interaction

The raw report records cold navigation-to-harness readiness for each direct renderer and a fresh Angular navigation-to-first-canvas observation, with individual JavaScript resource timings. The Angular cold observation includes app bootstrap/hydration and module loading; it is deliberately separate from the warm target.

Resize and tooltip dispatch timings are reported separately for both renderers and both fixture sizes. They are individual synchronous operation observations, not a 30-run interaction p95. Expanded-table creation is measured on the actual Angular component after one warm-up, with three samples at each size. All 600 normal or 6,000 stress numeric cells must exist before the sample is accepted. Those costs are not hidden inside the collapsed-table target. Table and cold-loading observations carry no newly invented numeric pass threshold.

## Linked package budget

[Size evidence](data/bar-bundle-size.json) links the **production Angular package** with the Angular linker, bundles/minifies/splits its public entry, keeps Angular/RxJS peers external, and sums independently compressed JavaScript chunks. It includes the bar component, native controls, adapter, and modular Canvas engine; it excludes Angular/RxJS framework bytes and source maps. This differs from the direct benchmark bundles, which include a harness but no Angular component.

Observed linked package size: **178,402 gzip bytes / 152,619 Brotli bytes**. Adopt prototype budgets of **200,000 gzip bytes / 175,000 Brotli bytes**, providing measured headroom. `npm run check:bundle` fails above either threshold. Do not silently raise the budget when adding chart families; establish per-chart entry-point measurements in NG09 and repeat the consumer build. No React runtime is included.

R07 passes for the current bar choice and envelope. Repeat affected measurements after meaningful renderer, option-building, lifecycle, or table changes. Other chart families need their own results before G3; this result does not complete the pending R06 human listening review or G2.

The original [NG09 formatting report](NG09_SHARED_FORMATTING.md) keeps its [archived raw samples](data/bar-benchmark-ng09.json). The latest [site alignment](SITE_THEME_ALIGNMENT.md) rerun measures normal Angular p95 of **17.40 ms mount / 17.50 ms update**, with the fixed 768 px reference host retained inside the responsive wrapper. Custom callback execution cost depends on consumer code; benchmark timings use default numeric formatting.
