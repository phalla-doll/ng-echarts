# Compatibility and limits

Recorded 14 November 2026. The package is an experimental public prerelease. This table describes the tested build, not a guarantee for every version admitted by a dependency range. [Research findings](RESEARCH_FINDINGS.md#angular-22-toolchain) own upstream compatibility research; the current library manifest owns its peer contract.

## Exact tested toolchain

| Dependency | Tested version | Declared contract / role |
| --- | --- | --- |
| Angular common/core | 22.2.6 | Library peers `^22.2.6` |
| Angular CLI, compiler/compiler-cli, build, platform-browser/server, router, SSR | 22.2.6 | Workspace and isolated applications; no support claim for another Angular major |
| TypeScript | 6.0.3 | Strict TypeScript/templates and dependency declarations with `skipLibCheck: false` |
| ECharts | 6.1.0 | Required library peer `^6.1.0`; modular Canvas renderer |
| RxJS | 7.8.2 | Angular/application dependency; not bundled into measured library bytes |
| tslib | 2.8.1 | Library dependency `^2.3.0` |
| Node.js | 24.22.2 | `.nvmrc`; workspace engine `>=24.15.0 <25` |
| npm | 11.19.1 | `packageManager`; workspace engine `>=11 <12` |
| ng-packagr | 22.2.0 | Production Angular package builder |
| Playwright | 1.65.0 | Browser verification runner |

Angular and ECharts peer ranges are wider than the exact tested versions. Keep the Angular runtime/compiler/CLI packages aligned when reproducing the fixture. Package imports require no React, ReactDOM, wrapper library, global engine registration, or library-specific provider.

## Runtime and browsers

| Engine | Recorded version | Verified paths |
| --- | --- | --- |
| Chromium | 158.0.8127.18 | Client rendering, SSR/hydration, updates, input/pointer/keyboard actions, theme, layout and cleanup |
| Firefox | 159.0 | Same component/installed-consumer paths; CDP heap retention checks are Chromium-only |
| WebKit | 27.2 | Same component/installed-consumer paths; CDP heap retention checks are Chromium-only |

These are headless Playwright engines on the recorded reference environment, not an additional mobile-device or browser-version matrix. [Packed runtime evidence](experiments/data/packed-runtime.json) records both client and SSR modes. The historical [NG14](experiments/NG14_CROSS_FAMILY_ACCEPTANCE.md) supplies the original four-family reconciliation and 100 mount/destroy cycles per engine. The completed [presentation regression](experiments/data/premium-visual-refinement.json) records 257 unit tests and 353 passing browser scenarios with four expected skips; the later WebKit fix has 30 separately recorded targeted scenarios. These dated scopes are not added together as a new complete-suite result. Human screen-reader interpretation remains deferred; automated checks do not close F09 or the release gates.

SSR supplies native Angular titles, descriptions, controls and fallback plot surfaces. Canvas rendering begins in the browser after hydration/stability and nonzero dimensions. Multiple and deferred instances are tested. Server-generated plot images, image export, and blanket hydration bypasses are outside the implementation.

## Data and measured envelope

| Family | Starting measured envelope | Separate stress fixture | Family-specific limits |
| --- | --- | --- | --- |
| Bar | 200 categories × 3 series | 2,000 × 3 | Category/linear axes; grouped/stacked; vertical/horizontal; rounded solid/gradient bars |
| Line | 200 categories × 3 series | 2,000 × 3 | Straight/smooth segments, optional points, missing-value gaps; no line-stack input |
| Area | 200 categories × 3 series | 2,000 × 3 | Independent gradient/solid fills and same-sign stacks; gaps stay missing |
| Composed (post-MVP) | 200 categories × 3 series | 2,000 × 3 | Vertical unstacked bar/line/bar; one comparable-unit scale; optional points/smoothing |
| Pie/donut | 12 categories × 1 measure | 100 × 1 | Nonnegative values; zero totals empty; inner-radius ratio 0–0.9; outside labels may truncate or hide collisions |

The [actual Angular benchmark](experiments/data/ng14-benchmark.json) uses an Apple M2 Pro, 32 GiB RAM, Darwin 27.2.0, Chromium 158.0.8127.18, production builds, DPR 1, a visible 768 px host/320 px plot, collapsed tables and disabled animation. Each operation has one warm-up and 30 samples. All normal mount/update p95 values are below the 200 ms target; legend, resize, cold loading, table creation and stress costs are reported separately. These observations establish a starting envelope on that machine, not hard API row limits or portable latency guarantees. Alternate variants, crowded labels, expanded tables and consumer formatter work have separate costs.

The [composed benchmark](experiments/data/ng17-composed-benchmark.json) uses the same method and records 17.7/17.4 ms normal mount/update p95 for a bar/line/bar fixture. Its first implementation and separate stress/interaction/table costs are recorded in [NG17](experiments/NG17_COMPOSED_CHART.md).

Cartesian/pie benchmark fixtures validate finite numeric observations and stable identifiers. Nullish values are missing; zero is numeric. Focused radar, radial, calendar and Sankey contracts have their own explicit bounds: see the family guides. Sankey rejects null weights and caps nodes/links at 24/60; calendar requires one year and explicit maximum; radial progress validates 0..max; radar uses 3–12 scaled dimensions and 1–4 comparisons. Cartesian negatives are valid. Pie/donut rejects negative values and overflowing totals. Keep server/client data and formatting deterministic. Use immutable references for updates; retain table actions for values without a clickable painted segment.

## Packaging and excluded behavior

All focused entries ship in one tarball. Each family lazily loads its renderer; `/core` contains no engine runtime. Area and line deliberately share ECharts' Line engine. Root imports preserve class identity but may include the combined registrations; prefer focused imports. [Measured module boundaries](experiments/public-rc18/package-boundaries.json) include all emitted lazy chunks while excluding Angular/RxJS peers. Byte caps remain 200,000 gzip / 175,000 Brotli per family, 10,000/9,000 for core, 219,500/187,500 for root, and 203,000/175,000 for root-frame.

Sankey/calendar charts, broader linked zoom/hover, streaming/time/logarithmic axes, advanced patterns/glow/decorative animation, raw ECharts options and custom tooltip templates are outside the MVP. The first post-MVP composed increment is documented in its [API](COMPOSED_CHART_API.md) and [measurement report](experiments/NG17_COMPOSED_CHART.md); it does not add dual axes or stacking. The selected visual baselines have documented Angular differences; full upstream pixel/API parity is not promised. Individual [bar](BAR_CHART_API.md), [line](LINE_CHART_API.md), [area](AREA_CHART_API.md), and [pie/donut](PIE_CHART_API.md) guides list their specific exclusions.

G1 technical feasibility passes for bar. NG14 automated family acceptance is recorded; human interpretation keeps NG14/G2/G3 pending. The public `0.1.0-rc.18` candidate uses MIT for original library code and preserves third-party notices; the [NG16 review](experiments/NG16_LOCAL_RELEASE.md) preserves rc.0 evidence and [NG17](experiments/NG17_COMPOSED_CHART.md) records rc.1. G4 remains pending for human release evidence. The user selected `@mantha911/ng-echarts` and requested proceeding with an experimental prerelease while skipping the human listening session; human gates remain pending. This documentation does not mark those gates complete.


The [NG20 linked example](LINKED_CHARTS.md) originally used the exact rc.1 artifact. Its controlled bar selection-feedback extension requires rc.2 and is recorded in the [feedback review](experiments/LINKED_SELECTION_FEEDBACK.md). Its [verification report](experiments/NG20_LINKED_CHARTS.md) covers the application-owned selection flow in the pinned three-browser CSR/SSR environments. It adds no engine/dependency or broader platform support claim; the 12-month/two-device demonstration does not establish a new multi-chart performance envelope.

The [native month-range extension](experiments/NG20_MONTH_RANGE.md) requires rc.3 for plural row feedback. It retains the same Angular/ECharts ranges, dependency graph and lazy renderer boundaries. The range contract uses supplied row order rather than locale/date parsing; no graphical brush/touch-drag or additional platform support is claimed. Earlier rc.2 feedback evidence remains versioned separately.

The [graphical-range increment](experiments/GRAPHICAL_RANGE_SELECTION.md) requires rc.4. It uses the same pinned Canvas renderer and public coordinate/containment APIs with a browser-owned Pointer Events surface. It adds no engine registration or peer dependency. Both orientations and existing stack/fill combinations retain supplied category order. Native From/To remains the keyboard equivalent. Real touch swiping/vertical-scroll evidence is Chromium CDP only; Firefox/WebKit cover real mouse drags and native controls, without a broader device-support claim.

The focused [NG18 radar](RADAR_CHART_API.md) entry is an experimental post-MVP extension in rc.5. It does not add radial progress or change the compatibility root. Its bounds and current evidence are separate from the four-family performance envelope above.

The focused [radial progress entry](RADIAL_PROGRESS_API.md) is an experimental rc.6 extension for bounded task completion. It uses the existing Pie engine without tooltip registration; native scalar progress replaces data-table/point-selection behavior. General meters, multiring gauges and public release acceptance remain separate.

The focused [calendar entry](CALENDAR_HEATMAP_API.md) is an experimental rc.8 extension with a strict date-only single-year contract and explicit maximum. Zero/missing separation, native monthly data and responsive year/quarter layout are separate from the four-family performance envelope. Arbitrary windows and calendar-label localization remain deferred; the following increment records Sankey.

The focused [Sankey entry](SANKEY_CHART_API.md), introduced in rc.9 with loading isolation in rc.10, is an experimental extension for horizontal directed acyclic flows, bounded to 24 nodes and 60 links. Native node totals and recorded-zero links preserve exact data semantics. Circular/vertical/drag variants and human interpretation remain pending.

rc.10 uses independently lazy per-chart ECharts entries. Focused/core and demo route limits stay unchanged; the five-family compatibility root permits 215,000 gzip / 184,000 Brotli bytes because separately compressed chunks cost more in aggregate. See the [measured tradeoff](experiments/NG19_SANKEY_CHART.md#lazy-engine-loading-correction).

The presentation refinement included since private rc.11 measures 217,597 gzip / 185,843 Brotli bytes for the combined root, an increase of 3,479 / 2,635 bytes over rc.10. Its source allowance is 218,000 / 186,000. The frame-only compatibility import remains free of reachable engine code; its emitted orphan chunks measure 201,395 gzip / 173,611 Brotli bytes, with a 201,500 / 175,000 source allowance. Focused family, core and route limits remain unchanged. The added state shell, quantitative pie legends and shared tooltip presentation remain engine-free until the existing family renderers load. Preserved rc.10 and earlier artifacts keep their original bytes and evidence.

Private rc.11 packages the completed presentation refinement and preserved per-chart loading. rc.10 and earlier archives remain unchanged; see [candidate verification](RELEASE_CHECKLIST.md).

The private rc.12 successor corrects documentation only. Its runtime/declarations remain byte-identical to rc.11; existing artifact records remain immutable. [The public demo checkpoint](GITHUB_PAGES.md#rc11-sankey-presentation-and-webkit-deployment) separately records source 23182ab, all-file integrity, three live engines and the WebKit concept-font correction.


Private rc.13 adds the [bounded one-way month preview](experiments/NG20_MONTH_PREVIEWS.md). This is an opt-in bar output and application-owned derived context; it does not introduce shared zoom or bidirectional selection. Existing limits and pending human release gates remain unchanged.

The caps introduced with rc.13, retained for public rc.18, are 219,500 gzip / 187,500 Brotli for root and 203,000 / 175,000 for emitted root-frame chunks. The [measured delta](experiments/NG20_MONTH_PREVIEWS.md#package-cost) preserves focused/core limits and the engine-free reachable frame.

Final rc.15 evidence separates the 362-pass pre-correction browser baseline from 46 final linked/range/preview passes and 260 fresh unit tests. All six exact installed client/SSR modes pass and exercise keyboard preview/commit. See [the scoped verification](experiments/NG20_MONTH_PREVIEWS.md#verification).

The preserved [combined rc.16 checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) passes 266 unit tests, the full 380-case three-browser regression with four expected skips, all twelve package budgets and six exact installed client/SSR modes. It combines month previews with dimension-aware rendering and the deferred-navigation corrections; earlier receipts remain historical.


NG22 first public prerelease: [`@mantha911/ng-echarts@0.1.0-rc.18`](experiments/NG22_PUBLIC_PRERELEASE.md#completed-publication) is published and verified from the registry in strict/docs/client/SSR consumers across all three engines. The [registry receipt](experiments/public-rc18/registry-verification.json) preserves actual tags (`next` plus npm’s initial `latest` alias). Human F09/R06/G2/G3/G4 remain pending under the user’s explicit deferral; no stable API acceptance is claimed.
