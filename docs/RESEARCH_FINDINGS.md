# ng-echarts research findings

Checked 12 November 2026. Upstream reference: EvilCharts commit [`4c2dd7c9bae780703244265c9a4b509d40c055ad`](https://github.com/legions-developer/evilcharts/commit/4c2dd7c9bae780703244265c9a4b509d40c055ad), committed 29 October 2026. Pin this revision for initial comparisons; review later upstream changes separately.

## Framework compatibility

EvilCharts describes React and Next.js as its targets. Its manifest declares React 19.2.3, Recharts 3.8.0, ECharts `^6.1.0`, and TypeScript `^5`. Its bar implementation uses React hooks and `motion/react`. This establishes a framework migration rather than a direct Angular installation. See [S1, S2, and S4](SOURCES.md#upstream-sources).

The ECharts implementation path is the better starting hypothesis because chart options can potentially be retained while replacing the UI layer. Its components still contain React code; reuse must be assessed function by function. Feasibility and relative effort remain subject to the prototype.

## Angular 22 toolchain

The official compatibility table currently lists these ranges for Angular 22.x ([S6](SOURCES.md#platform-sources)):

| Dependency | Supported range |
| --- | --- |
| Node.js | `^22.22.3 || ^24.15.0 || ^26.0.0` |
| TypeScript | `>=6.0.0 <6.1.0` |
| RxJS | `^6.5.3 || ^7.4.0` |

Proposed development line: Node.js 24 within the supported range, Angular and CLI 22, TypeScript 6.0, and RxJS 7 within the supported range. Select exact available patches during environment setup and commit the lockfile. Angular, CLI, compiler, and library packaging tools must have mutually compatible versions.

Upstream TypeScript 5 settings are not an Angular 22 toolchain. ECharts types and any reused utilities must compile under the selected TypeScript 6.0 version before the port can claim compatibility.

## Upstream inventory

The pinned registry has 302 entries overall, including 125 examples whose names contain `echarts` and begin with `ex-`. Examples are not separate chart families. Counts were derived from the pinned [registry JSON](https://github.com/legions-developer/evilcharts/blob/4c2dd7c9bae780703244265c9a4b509d40c055ad/registry.json).

| Registry component | Port scope |
| --- | --- |
| `echarts-chart` | Shared configuration, colors, renderer selection; inspect utilities for reuse |
| `echarts-tooltip` | Rebuild integration and inspect formatting helpers |
| `echarts-legend` | Native Angular controls and selection state |
| `echarts-dot` | Inspect marker and gradient utilities |
| `echarts-brush` | Defer range selection until after MVP |
| `echarts-bar-chart` | Prototype and MVP |
| `echarts-line-chart` | MVP |
| `echarts-area-chart` | MVP |
| `echarts-pie-chart` | MVP, including donut configuration |
| `echarts-composed-chart` | Subsequent scope |
| `echarts-radar-chart` | Subsequent scope |
| `echarts-radial-chart` | Subsequent scope |
| `echarts-sankey-chart` | Subsequent scope |
| `echarts-heatmap-chart` | Subsequent scope |

## Reuse assessment

| Upstream concern | Proposed treatment | Validation needed |
| --- | --- | --- |
| ECharts option building | Extract deterministic transformations | Check dependencies on DOM state and React composition |
| Color and gradient calculations | Reuse suitable pure functions with attribution | Exercise CSS color conversion and TypeScript 6 types |
| CSS tokens and visual constants | Adapt to explicit Angular theme contract | Compare selected reference fixtures |
| React state and hooks | Rewrite with Angular state and lifecycle | Verify update batching and teardown |
| React children and context | Replace with typed inputs initially | Confirm ergonomics in a consumer app |
| React icons and overlay markup | Replace with Angular templates and consumer content | Check accessibility and independent styling |
| Motion-based animation | Replace with ECharts animation and CSS where suitable | Confirm motion preference handling and timing |
| Registry installation workflow | Design Angular packaging separately | Install a packed build in a fresh consumer |

ECharts documents modular imports and composed TypeScript option types, which support testing an adapter with chart-specific imports ([S9](SOURCES.md#platform-sources)). Its container guidance makes initial dimensions, resize handling, and disposal explicit integration concerns ([S10](SOURCES.md#platform-sources)).

## Source attribution

The pinned EvilCharts license is MIT and identifies copyright 2026 Gurbinder. Its notice and permission terms must accompany copied or substantially adapted portions ([S5](SOURCES.md#upstream-sources)). Keep a per-file provenance ledger when code reuse begins. The final dependency set also needs its own notices; upstream's license does not replace those obligations.

## Questions for experiments

1. Does the selected ECharts version compile cleanly with TypeScript 6.0 and Angular's build pipeline?
2. Does a small direct adapter offer enough lifecycle control, or would an existing Angular wrapper reduce maintenance? Make an initial choice for the prototype and confirm it after lifecycle, SSR, and packaging experiments. No wrapper compatibility is assumed.
3. Which renderer best preserves the selected designs at acceptable bundle and interaction cost?
4. How much of the option-building code can be reused without its React composition model?
5. Can stable server fallback markup hydrate without mismatches or double initialization, including multiple chart instances and a chart activated through deferred rendering?
6. Which tooltip and legend implementation provides the best accessibility and customization balance?
7. What data sizes and update rates meet measured performance targets?

Compatibility is currently a development target. No Angular implementation, runtime benchmark, or browser experiment has yet been completed.
