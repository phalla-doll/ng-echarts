# NG14 cross-family acceptance

Recorded 13 November 2026 against implementation baseline `8a110af` plus the NG14 working changes. Scope: bar, line, area, and pie/donut; requirements F01–F10; experiments R03–R08; task NG14; gate G3.

Status: automated acceptance passes for all four families. The human interpretation review remains deferred by the user. NG14, R06/G2, and G3 cannot be marked complete without that evidence; NG15 documentation and NG16 final-artifact acceptance remain separate.

## Acceptance work

The new [shared family contract tests](../../projects/chart-library/core/src/lib/family-acceptance.spec.ts) exercise each component independently: locale and custom text, raw zero events and original-row identity, missing values, error/loading/validation precedence, latest-data recovery, renamed hidden identities, and removal/reintroduction. Existing pure tests retain family-specific signed values, gaps, area stacks, radial validation, escaped tooltips, and motion coverage.

The [cross-family browser checks](../../tests/browser/family-acceptance.spec.ts) add explicit theme-revision refreshes to line, area, and pie validation pages. They verify both native swatches and painted blue pixels, hidden-to-visible recovery, canvas dimensions at 320/768/1440 px viewports, usable table controls, and an unchanged ECharts instance ID. Bar retains its equivalent lifecycle, palette, layout and interaction coverage. No library runtime or public input/output changed.

The line, area and pie state/lifecycle cases now run **100 mount/destroy cycles in every browser engine**, matching the bar target. Every destruction must leave zero canvases, tooltip content, active ResizeObservers/targets, motion listeners, animation frames, and chart focus listeners. Every remount must have one canvas; the new-family checks also require exactly two document focus listeners. Instrumentation retains counters, not chart/model/DOM references; listener identities are discarded when removed. Delayed/failed renderer imports and route teardown remain separate tested paths.

The installed-consumer checker now requires a TS2322 diagnostic at each family's deliberately invalid binding, including Cartesian numeric series keys, line/area booleans, and pie measure/radius inputs. A type error elsewhere in the combined invalid fixture cannot satisfy these checks.

The component/template boundary review covers the shared Cartesian directive/template, independent pie component/template, family configuration/builders and renderer adapters. Models, settings, formatting, legends, table rows and options remain deterministic `computed` derivations. Templates use native controls and keyed loops; browser font/color reads, import scheduling, observers and engine calls remain at browser boundaries. No React runtime is introduced. The measured update timer includes validation/options invalidation; expanded-table creation has separate samples. The new DOM instrumentation belongs to the existing playground measurement fixture and browser tests, not the package API.

## Requirement reconciliation

The matrix below identifies the checks used for each family. The verification run below passes these automated checks. F09's human result is explicitly pending for all families.

| Requirement | Bar | Line | Area | Pie/donut |
| --- | --- | --- | --- | --- |
| F01 typed data | Strict packed templates, invalid keys, runtime numeric/identity cases | Strict packed templates, invalid numeric key, curve/model cases | Strict packed templates, invalid numeric key, curve/model cases | Strict packed templates, invalid measure/radius, duplicate IDs/labels, negative/nonfinite/overflow/zero rules |
| F02 immutable updates | Added/removed rows/series, reordering, renamed labels, hidden IDs, batched controller updates, focus | Family update/reorder browser case plus shared removal/reintroduction and controller cases | Family update/reorder browser case plus shared removal/reintroduction and controller cases | Category update/reorder/focus browser case, category removal/reintroduction, original rows |
| F03 formatting | Locale/options/custom numeric text, tick formatter, full tooltip/table labels | Shared numeric contract plus line tooltip/options/table cases | Shared numeric contract plus area tooltip/options/table cases | Shared numeric contract plus radial tooltip/table cases; axis checks inapplicable |
| F04 responsive layout | Both-theme reference captures, hidden recovery, card resizing | Both-theme reference captures, hidden recovery, live canvas dimensions | Both-theme reference captures, hidden recovery, live canvas dimensions | Both-theme reference captures and outside-label review, hidden recovery, live canvas dimensions |
| F05 interaction | Real bar clicks, equivalent keyboard actions, raw signed/zero values and series events | Painted-path clicks with/without markers, keyboard actions, series events | Filled-region/outline clicks, raw signed stack values, keyboard actions, series events | Sector clicks, zero/hidden table actions, category events with stable row IDs |
| F06 themes | Light/dark captures, mounted theme/palette refresh | Light/dark captures, theme revision updates swatch and actual pixels | Light/dark captures, theme revision updates swatch and actual pixels | Light/dark captures, theme revision updates swatch and actual pixels |
| F07 states | Precedence/recovery, invalid/empty/zero, all-hidden table controls | Precedence/recovery and missing/zero cases inherited through the Cartesian base, actual family browser recovery | Precedence/recovery and signed/gap cases inherited through the Cartesian base, actual family browser recovery | Precedence/recovery, zero-total empty, negative/nonfinite errors, all-hidden positive-slice recovery |
| F08 motion | Renderer-boundary initial/changed media preference and explicit disable tests | Family renderer-boundary motion tests | Family renderer-boundary motion tests | Family renderer-boundary motion tests |
| F09 interpretation | Automated names/table/keyboard/focus checks; **human pending** | Automated names/table/keyboard/focus checks; **human pending** | Automated names/table/keyboard/focus checks; **human pending** | Automated names/table/keyboard/focus checks; **human pending** |
| F10 SSR/hydration | Production fallback, multiple/deferred charts, navigation and packed CSR/SSR | Production gallery/behavior SSR, deferred replay, navigation and packed CSR/SSR | Production gallery/behavior SSR, deferred replay, navigation and packed CSR/SSR | Production gallery/behavior SSR, deferred replay, navigation and packed CSR/SSR |

Sources: [bar acceptance](NG09_NG10_ACCEPTANCE.md), [line](NG11_LINE_CHART.md), [area](NG12_AREA_CHART.md), [pie/donut](NG13_PIE_CHART.md), [installed-consumer checker](../../tools/check-consumer.mjs), [runtime checker](../../tools/check-runtime-consumer.mjs), family `*-chart.spec.ts` browser files, and colocated family model/options/motion tests. The existing [visual](R03_VISUAL_REVIEW.md), [lifecycle](R04_R05_VALIDATION.md), and family reports retain their dated captures and accepted visual differences. Chart rendering and galleries did not change in this acceptance increment, so those visual baselines remain applicable.

## Actual Angular performance

Run `npm run build` followed by `npm run benchmark:acceptance`, with no concurrent build, benchmark or test run. [Raw samples](data/ng14-benchmark.json) record Node 24.22.2, Apple M2 Pro (10 logical CPUs, 32 GiB), Darwin 27.2.0, Chromium 158.0.8127.18, production SSR, DPR 1, disabled animation, reduced motion, a 768 px host and 320 px plot height. The profile uses grouped solid vertical bars; straight lines with points; stacked gradient areas; and a 0.6-ratio donut without outside labels.

Each operation has one warm-up and 30 samples; p95 is the 29th sorted sample. Mount/update timers include Angular validation, option building and lifecycle scheduling, ending on ECharts `finished` for the expected row count/value. Legend timings start before the native first legend button click and end only when the rendered first series/category and `aria-pressed` state match. Resize timings start before changing the host CSS width between 768 and 640 px and end when ECharts finishes with a matching plot width, including ResizeObserver/frame coordination. Initial observer delivery settles before these samples.

| Normal fixture | Mount p95 | Update p95 | Legend p95 | Resize p95 |
| --- | ---: | ---: | ---: | ---: |
| Bar, 200 × 3 | 17.0 ms | 17.0 ms | 17.5 ms | 33.5 ms |
| Line, 200 × 3 | 17.0 ms | 16.9 ms | 17.2 ms | 33.9 ms |
| Area, 200 × 3 | 17.3 ms | 17.0 ms | 17.5 ms | 34.0 ms |
| Donut, 12 × 1 | 17.6 ms | 17.5 ms | 17.5 ms | 34.0 ms |

All normal mount/update results pass the existing ≤200 ms p95 target. Legend/resize values are observations without a new pass threshold. This measures native legend interaction; it does not establish pointer-tooltip latency. Existing real pointer-selection tests verify correctness separately.

| Stress fixture | Mount p95 | Update p95 | Legend p95 | Resize p95 |
| --- | ---: | ---: | ---: | ---: |
| Bar, 2,000 × 3 | 39.5 ms | 63.6 ms | 57.6 ms | 57.5 ms |
| Line, 2,000 × 3 | 17.6 ms | 27.0 ms | 26.2 ms | 38.7 ms |
| Area, 2,000 × 3 | 17.3 ms | 43.5 ms | 39.2 ms | 66.1 ms |
| Donut, 100 × 1 | 17.2 ms | 16.8 ms | 17.0 ms | 34.3 ms |

The supported starting performance envelope remains 200 categories/three Cartesian series or 12 radial categories under the recorded conditions. Stress results do not expand this recommendation, impose a hard API limit, or promise portable latency. Crowded outside labels, alternate visual variants, and consumer formatters can have different costs.

Fresh-context cold navigation-to-first-canvas observations and complete expanded-table costs are recorded separately in the raw report. Cold observations include automation handoff, bootstrap/hydration and lazy loading; they measure first canvas creation rather than full paint. Table timings use the native toggle through Angular `afterNextRender`, require every numeric cell, and retain one warm-up plus three samples. Neither is substituted for warm chart completion.

## End-to-end verification

Story: server-rendered gallery/validation markup → typed Angular inputs → validation/options → lazy Canvas plot → native legend/table or pointer events → immutable updates → route and component teardown. There is no API, database, credential, or external service in this flow. Production SSR and packed CSR/SSR consumers verify the server/browser boundary without disabling hydration.

`npm run check` passes formatting, production library/playground builds, strict Angular/TypeScript compilation, **119 unit/integration tests**, isolated declarations and compiled API/gallery examples, production SSR, **145 browser scenarios** plus two CDP-only skips, all six installed-package client/SSR modes, and seven package-boundary scenarios. A separate `npm run check:consumer` rerun passes the stronger per-binding diagnostics added during the regression. The touched browser tests and audit helper additionally compile with standalone strict TypeScript targeting ES2023.

The final enhanced lifecycle rerun passes **12 cases / 1,200 mount/destroy cycles** with no skips: 100 per family in each engine. [Durable lifecycle results](data/ng14-lifecycle.json) preserve per-case status, duration, asserted disposal/listener outcomes and Chromium bar CDP samples. The command recorded there reruns only the four lifecycle cases across all three projects; this follow-up verifies the listener and detached-instance assertions added during the full regression. Every destruction clears the old plot’s ECharts instance marker before the test releases its detached element handle. All resource/listener assertions pass. NG14 automated work is complete; NG14/G3 remain pending solely for the deferred human interpretation review. Package isolation keeps all existing byte caps. Current [module/size evidence](data/package-boundaries.json) includes every emitted lazy chunk and excludes Angular/RxJS peers:

| Import | gzip bytes | Brotli bytes |
| --- | ---: | ---: |
| Bar | 179,510 | 152,997 |
| Line | 182,277 | 155,309 |
| Area | 182,762 | 155,822 |
| Pie | 158,356 | 135,275 |
| Core | 5,672 | 4,984 |
| Root | 205,376 | 173,696 |
| Root-frame | 194,228 | 164,887 |

Every scenario passes its existing gzip/Brotli cap; core has no engine runtime, focused entries exclude unrelated chart engines, and every engine remains lazy. [Packed-runtime evidence](data/packed-runtime.json) records Chromium 158.0.8127.18, Firefox 159.0, and WebKit 27.2 in both consumption modes. The human [R06 checklist](R06_MANUAL_REVIEW.md) remains required before G3/G4, with corresponding interpretation coverage across all four families. The public API remains experimental until acceptance closes.

Final documentation validation resolves 512 local links/heading anchors; `git diff --check` passes. README, specification, architecture, plans, backlog and acceptance matrix distinguish automated completion from pending human/release acceptance.
