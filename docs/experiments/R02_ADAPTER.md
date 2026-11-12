# R02 initial Angular integration choice

Status: initial choice recorded; final experiment remains pending. Date: 12 November 2026. Chart: bar. Tasks: NG03, NG04. Requirements: F02, F04, F05, F07, F10. Gate: G1.

## Comparison

Use a small direct ECharts adapter for the bar prototype. The installed engine is 6.1.0. Register only `BarChart`, `GridComponent`, `TooltipComponent`, and `CanvasRenderer` through [modular imports](https://echarts.apache.org/handbook/en/basics/import/), loaded in a separate browser chunk.

Exactly one wrapper was assessed: [`ngx-echarts` 22.0.0](https://www.npmjs.com/package/ngx-echarts/v/22.0.0), from [xieziyu/ngx-echarts](https://github.com/xieziyu/ngx-echarts). Registry metadata checked with `npm view ngx-echarts version peerDependencies time.modified --json` reports Angular core `>=22.0.0`, ECharts `>=5.0.0`, and a package modification date of 11 June 2026. Its published module implements initialization, resize observation, updates, and disposal, so it qualifies for consideration.

The inspected published directive uses `window.ResizeObserver` in `ngOnInit` and schedules initialization from `ngAfterViewInit`. A consumer would still need a deliberate SSR/browser boundary and evidence for our asynchronous cancellation and DOM-ownership rules. This source review is not a claim that the wrapper is incompatible with Angular 22 or cannot be used with SSR. No wrapper runtime trial was performed or dependency added.

The direct prototype keeps the relevant decisions local: wait for application stability before browser work, delay initialization until dimensions are nonzero, cancel late imports, hide stale graphics during state transitions, and retain Angular ownership of accessible controls. It also lets lifecycle tests replace the renderer loader without loading ECharts in unit tests.

## Implemented boundaries

- `bar-model.ts`: validation and state precedence.
- `bar-options.ts`: pure typed option construction and escaped tooltip text.
- `plot-controller.ts`: batching, dimensions, lazy loading, retry, resize, and teardown.
- `bar-renderer.ts`: ECharts module registration, instance updates, events, and disposal.
- `bar-browser.ts`: browser scheduling, resize observation, theme resolution, and loader injection.
- `bar-chart.ts`: Angular signals, inputs/outputs, controls, and browser coordination.

The provisional package contract makes ECharts `^6.1.0` a peer; the tested version is exactly 6.1.0. `notMerge: true` replaces options so removed series do not survive updates; Angular retains legend state independently. Canvas is the initial renderer, not the R07 decision.

## Confirmation criteria

The [current validation report](R04_R05_VALIDATION.md) records passing R05 workspace bar paths in all three engines, including multiple/deferred hydration and navigation. R04's full input/retention review and R08's packed client/SSR runtime consumers remain necessary before confirming this choice. Reopen the comparison if a concrete failure makes the direct adapter unsuitable; the current evidence does not pass G1.
