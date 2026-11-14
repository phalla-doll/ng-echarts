# Demo performance improvements

The [performance audit](DEMO_PERFORMANCE_AUDIT.md) identified a large, delayed Chart possibilities download, duplicate startup renders, eager offscreen work and gaps in demo performance budgets. This implementation addresses those findings in the playground and build tools. The independent radial-progress increment landed during the work; its functionality is retained. Library APIs, candidate artifacts and pending human release gates keep their existing scope.

## Concept delivery

`tools/concept-engine.ts` registers only the nine chart types, components, label layout and SVG renderer used by the concept gallery. `npm run concepts:generate` embeds that deterministic modular build in the standalone document and refreshes its revision. The full ECharts LICENSE/NOTICE and ZRender license remain in the generated engine banner, alongside existing document notices.

The self-contained document still supports offline interaction. Its web edition derives from the same source, references a content-hashed engine and reuses the site's Inter font URL. Document/style changes can therefore reuse the cached engine and font. Builds prepare these assets for both development and production and reject stale engine bytes or revisions. Pages validation compares all three outputs against their sources before sealing them.

The iframe source appears in SSR and prerendered HTML. The engine receives an early preload hint, so its download can overlap Angular startup. A source directive assigns the bundled iframe URL once and preserves its existing document during hydration; even rewriting an identical URL would otherwise reload it. A one-time source directive retains the server-started iframe navigation during hydration; Angular reapplies even static attributes, so binding or statically declaring `src` would restart it. Three-browser tests hold the Angular entry and require exactly one child document request and unchanged frame time origin across hydration. A validated parent/child handshake recovers when the frame finishes before the Angular listener exists. Readiness follows a rendered visible plot, independently of content-height notifications.

## Rendering and source views

The concept gallery observes plot intersections through the ancestor-frame viewport and renders nearby plots one per animation frame. This also supports cached wrappers that only implement the original theme/size bridge. Theme and size caches avoid unchanged option application. Deferred plots use the current theme when reached; filtering, bubble mode, native tables, resizing and embedded recommendation links retain their behavior. Standalone scrolling uses its own viewport, and print initializes the remaining visible cards.

Bar, line, area, composed and pie gallery chart views use Angular viewport hydration/deferral. Server markup, headings, legends and copy controls remain present. Later client navigation reserves plot/legend geometry until each plot is needed. Print also triggers hydration of the remaining plots. Full code views and highlighting are created when Code is opened, including playground, radar and radial views. Small fixed import statements use deterministic markup rather than loading the highlighter. The linked guide retains readable plain source in SSR and upgrades its syntax colors when its native details are opened; a failed optional highlighter leaves source readable and copyable.

`tools/prepare-demo.mjs` reads the emitted browser module graph. It warms only the selected route's renderer and static dependencies, with no engine hint on documentation routes. Static Pages HTML, the normal SSR server and subsequent Angular navigation share that generated map. These hints fetch modules without evaluating ECharts on the server or changing the library's lazy adapter.

## Regression checks

- `npm run test:demo-assets` verifies deterministic engine generation, notice retention, web/offline derivation and renderer dependency selection. Provenance tests reject tampered embedded documents and hashed engines.
- Browser scenarios cover progressive initialization, source-on-demand behavior, print, early iframe loading with held Angular scripts, late handshakes, legacy wrappers, duplicate-render and duplicate-navigation prevention, message-source validation, current themes, native tables, optional-highlighter failure and offline scrolling through every standalone chart.
- Existing gallery/capture checks visit each example before asserting that all plots exist. They continue to exercise every plot, while dedicated performance tests assert that offscreen plots stay deferred initially.
- `npm run check:demo-performance` checks the sealed Pages artifact, complete route payloads including iframe resources, individual concept asset budgets, initial plot counts and first-visible-chart readiness. Five routes, including the subsequent calendar increment, use three cold samples at 390 × 844, 4× CPU slowdown, 150 ms latency and 200,000 bytes/s download. The five-second timing limit provides CI headroom; byte and initialization-count checks provide deterministic guards. Remaining primary routes receive cold payload checks. Evidence goes to ignored `dist/demo-performance.json` without altering the sealed artifact or issuing a deployment receipt.

CI and the guarded Pages deployment command include the performance gate. The full workspace check includes the new asset/provenance tests; performance checks require a separate, current `build:pages` artifact because consumer/benchmark checks refresh source evidence.

## Hosting constraint

GitHub Pages retains its platform-controlled ten-minute cache policy. Hashed shared assets and smaller documents reduce the cost within that constraint. The normal SSR server uses immutable caching for hashed scripts/styles and a shorter lifetime for unversioned files. Changing the public host or adding a CDN is outside this implementation; no unsupported headers file or service-worker cache is introduced.

## Verification record

The [matched comparison data](data/demo-performance-comparison.json) records three fresh browser contexts per route, with the mobile settings above, reduced motion and the same gzip server. Times are medians for the first chart plus two animation frames after DOMContentLoaded; documentation uses DOMContentLoaded plus two frames. Payloads are compressed response bodies, including iframe resources and counting cached shared resources once. These are controlled lab measurements, not field Core Web Vitals.

| Route | Before | After | Change | Cold payload before → after |
| --- | ---: | ---: | ---: | ---: |
| Chart possibilities | 4.47 s | 2.73 s | 39% faster | 608 → 434 kB |
| Bar gallery | 3.60 s | 3.22 s | 11% faster | 447 → 431 kB |
| Linked charts | 3.60 s | 2.70 s | 25% faster | 441 → 429 kB |
| Installation | 1.58 s | 1.58 s | Unchanged | 225 → 225 kB |

Chart possibilities initializes one nearby plot instead of all fourteen on this viewport; the bar gallery initializes one instead of four. Remaining plots render as they approach the viewport. The standalone concept document is 870,401 bytes instead of 1,273,377 bytes, while the derived embedded document is 89,335 bytes and shares its 716,439-byte engine. Its cold page payload falls 28.5%. Baseline evidence identifies commit `e7bd5b4`; the implementation comparison identifies the dirty snapshot based on `9db4566`, which also includes the independently added radial progress demo. Both artifact hashes are retained in the data.

Settled captures are byte-identical before and after for the sampled [calendar before](captures/demo-performance/before-chart-possibilities-390.png)/[after](captures/demo-performance/after-chart-possibilities-390.png) and [bar before](captures/demo-performance/before-bar-390.png)/[after](captures/demo-performance/after-bar-390.png) at 390 px. Interaction, theme, resizing and all later plots are additionally exercised by browser scenarios.

Validation passed in stages: production library/playground builds and strict compilation; 215 unit tests; 20 Pages provenance tests and three demo asset tests; strict packed declarations, documentation consumers and SSR; the full three-browser suite (278 passed, four expected skips); subsequent focused three-browser runs for the final iframe/source-view changes; all six independently installed client/SSR runtime modes; and ten bundle-budget scenarios. The combined workspace check initially stopped at a runtime fixture that assumed eager rendering; that fixture was updated to visit each plot, and runtime/bundle checks were rerun successfully. The sealed Pages performance gate also passed across all fourteen primary routes, with no browser errors, one concept navigation and the expected initial plot counts. Its timing medians vary between runs, so the matched comparison above is the before/after result.

These measurements were collected before publication. The guarded deployment workflow rechecks committed, pushed source and sealed output before publishing the preview. Public cache policy remains the hosting constraint described above; library publication and human release gates remain separate.

A separate [enforced verification](data/demo-performance-verification.json) of clean committed performance snapshot `ab58f5e` passed all fourteen route payload budgets, concept asset budgets and initial plot/navigation counts. Its mobile medians were 3.27 s (bar), 2.75 s (linked), 2.77 s (possibilities) and 1.61 s (installation), below the 5 s guard. The compatibility document measures 22,047 gzip bytes; the committed performance checkpoint allows 25,000 bytes for this asset. A complete workspace run passed 215 unit tests and 281 browser scenarios with four expected skips, followed by 27 concept/performance and 30 linked/code browser scenarios plus the final three-browser frame-origin checks. The later [calendar increment](NG19_CALENDAR_HEATMAP.md) records its own API/artifact checks and uses the same guarded delivery pipeline.

## WebKit embedded-font readiness follow-up

The rc.11 public deployment exposed a WebKit-only stall in the embedded concept gallery. The document and Inter face were loaded, its engine and intersection callbacks were available, and no requests or console errors failed; nevertheless, `document.fonts.ready` remained pending and the first plot never started. A direct `document.fonts.load('12px Inter')` resolved with the loaded face in the same document. The gallery now waits for that actual plotting font rather than the whole FontFaceSet readiness promise, with fallback-font rendering if loading rejects. Viewport deferral and the existing theme/height bridge remain intact.

The static verifier waits for the concept document's DOM and then asserts real card/plot readiness rather than waiting on every iframe's window-load state. The generated embedded/offline editions and wrapper revision stay tied to the source hash; engine and notice bytes are preserved. This is demo-only work and does not replace or repack the verified rc.11 library artifact.

Thirty targeted concept/performance scenarios pass across Chromium, Firefox and WebKit, including a deterministic regression that leaves only the embedded document's `document.fonts.ready` promise unresolved while the native font loader operates. It requires all fourteen plotted examples, filtering and parent ready-state recovery. Existing tests retain progressive rendering, cached-wrapper behavior, late hydration, theme/size synchronization and offline consumption. The clean-commit deployment workflow repeats sealed static checks and unchanged route performance guards; public integrity and browser checks verify the published source separately.

## Navigation and animation follow-up

The user reported delays when changing demo pages and entrance animations that snapped into place. A normal-motion trace of the deployed `aa394e5` demo identified an unchanged-size resize shortly after Pie initialization that ended its active animation. The shared controller resized unconditionally on both option updates and observer frames. Calendar/Radar additionally rebuilt the previous options in their resize adapters before applying the new snapshot.

The controller now records the dimensions used at initialization, ignores unchanged-size observer deliveries, and applies same-size option changes without resizing. A real resize receives pending-update context so Calendar/Radar skip the stale intermediate options when a new snapshot follows. Pure resizes still rebuild their responsive layouts without animation. Dimensions are cleared on disposal and remeasured after asynchronous loading. A pending import is shared across observer/input frames; an early return can no longer clear another render's loading flag. Public chart inputs/outputs, reduced-motion handling, focus and preview/range semantics remain intact.

The gallery previously placed Bar, Line, Area and Composed in one deferred block, so the first bar example waited for all four component imports. Family selection now happens outside four independent deferred blocks. The shared placeholder, viewport/print triggers and server-rendered chart metadata remain. Build-derived preload graphs also include the selected family component and destination route's static dependencies, excluding dynamic imports. Sidebar hover/focus warms that destination once; navigation-start warming remains available. The sidebar owns the intent listeners and removes them on teardown.

`tests/browser/demo-navigation.spec.ts` checks fresh-family request independence, pointer/keyboard intent warming, and actual Pie canvas progression through repeated unchanged-size observer callbacks. The animation scenario fails against an isolated starting production build (two distinct frames) and passes with the correction. Controller and renderer unit checks cover update/resize coalescing, responsive Calendar/Radar rebuilding, late dimensions, disposal/recovery and repeated observer frames while an import is pending.

`check:demo-performance` retains the original cold-mobile readiness and payload guards and adds desktop router journeys with normal motion: 1440×900 CSS pixels, DPR 1, 4× CPU slowdown, 150 ms latency and 200,000 bytes/s download. Three fresh contexts measure first visits to Line, Pie, Calendar and Sankey followed by revisits to Bar, Line, Pie and Calendar. A new canvas plus two animation frames defines readiness; animation completion is separately tested by the canvas-progression regression. Median limits are 1.5 seconds for the first navigation and 750 ms for revisits. These are controlled regression guards, not field Web Vitals or a promise about every user's network.

The corrections are unreleased source work. Existing private candidate archives, including rc.15 SHA-256 `c0f85b98b1c61223a16f5287c2125c63305d6e69cde3a784c7083aa9dfd4d91f`, remain unchanged. No package publication, demo deployment or human release-gate closure is implied.

### Matched measurements and validation

The [measurement record](data/demo-navigation-performance.json) compares an isolated pre-fix source snapshot (HEAD plus the starting tracked working-tree patch, retaining the existing month-preview work) with the corrected production build. Both SSR outputs use the same gzip proxy and normal-motion desktop conditions above. Before/after runs alternate, with three fresh samples per build. These results are separate from the earlier public-site audit and the historical mobile tables above.

| Scenario | Before median | After median |
| --- | ---: | ---: |
| Cold bar chart readiness | 3,282 ms | 2,715 ms |
| First Line navigation | 310 ms | 332 ms |
| First Pie navigation | 477 ms | 329 ms |
| First Calendar navigation | 391 ms | 390 ms |
| First Sankey navigation | 362 ms | 346 ms |
| Bar revisit | 113 ms | 115 ms |
| Line revisit | 111 ms | 110 ms |
| Pie revisit | 93 ms | 94 ms |
| Calendar revisit | 94 ms | 111 ms |

Cold bar readiness improves 17.3%; Pie first navigation improves 31.1%. The bar page falls from 433,713 to 424,275 compressed response-body bytes and from 33 to 27 requests. Line first navigation is 22 ms slower in this sequence: the old bar page had already fetched its component, whereas the corrected bar page keeps that component deferred until Line is chosen. Calendar and revisit timings are broadly unchanged; no across-the-board speedup is claimed.

Settled bar/Pie comparison captures preserve geometry and chart pixels at 390 and 1440 px. Desktop captures are byte-identical; each mobile pair differs only in five card-border pixels by one color-channel level. Inspect the [bar before](captures/demo-navigation/before-bar-390.png)/[after](captures/demo-navigation/after-bar-390.png) and [Pie before](captures/demo-navigation/before-pie-390.png)/[after](captures/demo-navigation/after-pie-390.png); the JSON record contains all four pairs, image hashes and pixel comparisons. All pairs were visually checked.

Validation passes in stages: production library/playground builds, strict compilation, 266 unit tests, 380 three-browser scenarios with four existing skips (three workers), five demo-asset tests, 20 Pages provenance tests, strict packed declarations, a fresh documentation consumer, SSR, independently installed client/SSR consumers in all three engines, and all 12 package-budget scenarios. The exact animation regression fails against the isolated baseline and passes in Chromium, Firefox and WebKit. Static Pages/subpath and normal-motion navigation gate results are recorded separately in ignored build receipts; no publication is performed by this follow-up.
