# Demo performance improvements

The [performance audit](DEMO_PERFORMANCE_AUDIT.md) identified a large, delayed Chart possibilities download, duplicate startup renders, eager offscreen work and gaps in demo performance budgets. This implementation addresses those findings in the playground and build tools. The independent radial-progress increment landed during the work; its functionality is retained. Library APIs, candidate artifacts and pending human release gates keep their existing scope.

## Concept delivery

`tools/concept-engine.ts` registers only the nine chart types, components, label layout and SVG renderer used by the concept gallery. `npm run concepts:generate` embeds that deterministic modular build in the standalone document and refreshes its revision. The full ECharts LICENSE/NOTICE and ZRender license remain in the generated engine banner, alongside existing document notices.

The self-contained document still supports offline interaction. Its web edition derives from the same source, references a content-hashed engine and reuses the site's Inter font URL. Document/style changes can therefore reuse the cached engine and font. Builds prepare these assets for both development and production and reject stale engine bytes or revisions. Pages validation compares all three outputs against their sources before sealing them.

The iframe source appears in SSR and prerendered HTML. The engine receives an early preload hint, so its download can overlap Angular startup. A one-time source directive retains the server-started iframe navigation during hydration; Angular reapplies even static attributes, so binding or statically declaring `src` would restart it. Three-browser tests hold the Angular entry and require exactly one child document request across hydration. A validated parent/child handshake recovers when the frame finishes before the Angular listener exists. Readiness follows a rendered visible plot, independently of content-height notifications.

## Rendering and source views

The concept gallery observes plot intersections through the ancestor-frame viewport and renders nearby plots one per animation frame. This also supports cached wrappers that only implement the original theme/size bridge. Theme and size caches avoid unchanged option application. Deferred plots use the current theme when reached; filtering, bubble mode, native tables, resizing and embedded recommendation links retain their behavior. Standalone scrolling uses its own viewport, and print initializes the remaining visible cards.

Bar, line, area, composed and pie gallery chart views use Angular viewport hydration/deferral. Server markup, headings, legends and copy controls remain present. Later client navigation reserves plot/legend geometry until each plot is needed. Print also triggers hydration of the remaining plots. Full code views and highlighting are created when Code is opened, including playground, radar and radial views. Small fixed import statements use deterministic markup rather than loading the highlighter. The linked guide retains readable plain source in SSR and upgrades its syntax colors when its native details are opened; a failed optional highlighter leaves source readable and copyable.

`tools/prepare-demo.mjs` reads the emitted browser module graph. It warms only the selected route's renderer and static dependencies, with no engine hint on documentation routes. Static Pages HTML, the normal SSR server and subsequent Angular navigation share that generated map. These hints fetch modules without evaluating ECharts on the server or changing the library's lazy adapter.

## Regression checks

- `npm run test:demo-assets` verifies deterministic engine generation, notice retention, web/offline derivation and renderer dependency selection. Provenance tests reject tampered embedded documents and hashed engines.
- Browser scenarios cover progressive initialization, source-on-demand behavior, print, early iframe loading with held Angular scripts, late handshakes, legacy wrappers, duplicate-render prevention, message-source validation, current themes, native tables, optional-highlighter failure and offline scrolling through every standalone chart.
- Existing gallery/capture checks visit each example before asserting that all plots exist. They continue to exercise every plot, while dedicated performance tests assert that offscreen plots stay deferred initially.
- `npm run check:demo-performance` checks the sealed Pages artifact, complete route payloads including iframe resources, individual concept asset budgets, initial plot counts and first-visible-chart readiness. Four routes use three cold samples at 390 × 844, 4× CPU slowdown, 150 ms latency and 200,000 bytes/s download. The five-second timing limit provides CI headroom; byte and initialization-count checks provide deterministic guards. Remaining primary routes receive cold payload checks. Evidence goes to ignored `dist/demo-performance.json` without altering the sealed artifact or issuing a deployment receipt.

CI and the guarded Pages deployment command include the performance gate. The full workspace check includes the new asset/provenance tests; performance checks require a separate, current `build:pages` artifact because consumer/benchmark checks refresh source evidence.

## Hosting constraint

GitHub Pages retains its platform-controlled ten-minute cache policy. Hashed shared assets and smaller documents reduce the cost within that constraint. The normal SSR server uses immutable caching for hashed scripts/styles and a shorter lifetime for unversioned files. Changing the public host or adding a CDN is outside this implementation; no unsupported headers file or service-worker cache is introduced.

## Verification record

Final measurements and validation are recorded after the implementation checks complete. This working-tree implementation has not been published to GitHub Pages.
