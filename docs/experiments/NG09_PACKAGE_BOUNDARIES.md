# NG09 package boundaries

Recorded 12 November 2026. This completes the package-boundary slice following [shared formatting](NG09_SHARED_FORMATTING.md). The follow-up [NG09/NG10 review](NG09_NG10_ACCEPTANCE.md) consolidates foundation and bar acceptance; this report does not close family-wide release acceptance or the deferred human review.

## Public imports and ownership

| Import | Public API | Runtime ownership |
| --- | --- | --- |
| `@ng-echarts/chart-library/core` | `ChartFrame`, shared contract types | Angular presentation; no chart engine |
| `@ng-echarts/chart-library/bar` | `BarChart<T>`, convenient shared type exports | Bar controls/builders, lazy modular ECharts Canvas adapter |
| `@ng-echarts/chart-library` | Existing components and types | Compatibility reexports of the same classes |

Use focused imports in new code. Source now lives under `projects/chart-library/core/src/` and `bar/src/`, with colocated tests. Root `src/public-api.ts` only reexports public secondary entries. Bar depends on core by package specifier; core never imports bar. Existing formatting/state/lifecycle helpers stay private to bar until another family demonstrates the need for shared runtime implementations. All entries ship in the same experimental private tarball; required peers and upstream notices are unchanged.

The design follows the official [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format#entrypoints-and-code-splitting) and [ng-packagr secondary-entry guidance](https://github.com/ng-packagr/ng-packagr/blob/main/docs/secondary-entrypoints.md). ng-packagr generates export mappings and declaration bundles. No public deep-source or FESM imports are provided.

## Measurements and enforced boundaries

`npm run check:bundle` resolves public imports against built package exports, links Angular declarations, bundles/minifies with splitting, and records only modules contributing output bytes. Angular/RxJS peers are external. Sizes sum independently compressed emitted JavaScript chunks; they are neither application totals nor network measurements.

| Consumer | gzip bytes | Brotli bytes | Engine behavior |
| --- | ---: | ---: | --- |
| Bar | 178,668 | 152,797 | 231 engine modules, all lazy; only bar chart family and Canvas |
| Core frame | 990 | 855 | No ECharts or ZRender modules |
| Full compatibility root | 178,675 | 152,811 | Same lazy engine boundary |
| Frame from compatibility root | 170,254 | 145,389 | Engine chunk emitted but unreachable from the consumer entry |

The last row exposes an esbuild splitting limitation in this harness: a treeshaken root reexport still produces an orphan renderer file. It is counted in emitted size even though the frame never imports it. Prefer `/core` to exclude those files entirely. This result is specific to the measured pipeline, not a promise that every bundler behaves identically.

Checks reject eager ECharts/ZRender code, unrelated chart families, SVG, and React/demo dependencies. ECharts core retains `custom/customSeriesRegister.js` as shared registry support; the custom chart implementation is excluded. Bar/root budgets remain 200,000 gzip / 175,000 Brotli bytes. Core gets a 10,000/9,000 budget. Required ECharts peers remain required even for a consumer whose bundle uses only core.

[Module and size evidence](data/package-boundaries.json) records contributing input paths, reachable versus emitted engine modules, orphan files, and budgets. [Bar budget evidence](data/bar-bundle-size.json) retains the focused bar result.

## Verification

The strict declaration fixture exercises focused imports, root compatibility, invalid generic/template inputs, and forbidden imports. The tarball check verifies exact export keys and shipped type/runtime targets with `skipLibCheck: false`.

Installed runtime checks import root/core/bar without a DOM, compare component identities, and reject private source/FESM paths. Both isolated client and SSR/hydration applications use focused entries and retain the existing three-engine update, interaction, theme, deferred-render, and cleanup checks. Unit-test discovery now spans the library's secondary folders.

The complete `npm run check` passed: formatting, production library/site builds, strict Angular/TypeScript compilation, 52 unit/integration tests, isolated packed declarations and negative templates, SSR, 85 browser scenarios (two CDP-only skips), installed client/SSR runtime checks in Chromium/Firefox/WebKit, and all four package-boundary scenarios. The existing bar rendering logic and visual behavior are unchanged. Benchmark timings were not rerun because this increment changes packaging rather than chart transformations or lifecycle behavior.
