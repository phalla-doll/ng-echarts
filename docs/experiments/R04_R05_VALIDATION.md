# Bar lifecycle and hydration validation

Recorded 12 November 2026 on macOS 27.2.1, arm64. Chart: bar. Tasks: NG05–NG07. Requirements: F02, F04–F10. Gate: G1. R04 and R05 pass for the workspace bar scenarios below. R06 automated checks pass; its human listening review remains pending. G1 is resolved through the packed-runtime evidence; G2 remains pending for R06.

## Reproduction and environment

Use the Node/npm versions in [R01](R01_TOOLCHAIN.md), then run:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run check
```

The complete check passed: production library/client/server builds, strict compilation, 33 Vitest tests across seven files, packed declaration/invalid-key checks, SSR response checks, and **43 passing browser scenarios** (15 Chromium, 14 Firefox, 14 WebKit), with the CDP heap-snapshot test skipped for Firefox and WebKit. Tests use the production server, default reduced motion, and the pinned monthly fixture. The follow-up `/comparison` scenarios verify actual painted abbreviated/full ticks, unchanged full tooltip/table labels, formatter-error disposal/recovery, and control/plot containment at 320/768/1440 px in both themes. Hosted CI is configured for all three engines; these development changes have been validated locally.

## R05 SSR and hydration

The playground now uses real routed pages. `/validation` renders a primary chart, a chart initially loading, a chart with a zero-width hidden host, and an `@defer (hydrate on interaction)` chart. `/away` contains no charts. The deferred child is a separate standalone component so it can be loaded independently.

For each engine, the tests verified:

1. The server response contains titles, loading UI, and the deferred chart's real markup, with no canvas.
2. The primary chart hydrates to one canvas; loading, hidden, and dehydrated charts initially have none.
3. Revealing the hidden host and finishing loading each creates one canvas.
4. Clicking the server-rendered deferred table button triggers hydration and replays its event, yielding one canvas and the expanded table.
5. Navigating away removes all canvases and returns managed-resource counters to zero; navigating back initializes the primary chart once.
6. Series/theme-revision updates and changed motion preferences preserve a working single instance. The original playground scenarios also verify data/state recovery and light/dark updates.

No blanket hydration bypass was added. Page exceptions, console errors, and Angular hydration diagnostics are collected. Expected browser network errors are allowed only in the deliberate renderer-import failure test. The tested hydration paths passed without application/hydration errors or stability warnings. This is workspace evidence; R08 still requires the same class of checks from an independently installed package.

## R04 lifecycle and resource evidence

Real-browser tests now exercise initially hidden mounting, responsive resizing, removed/restored series, identifier-based legend visibility, failed renderer imports with retry, and an import resolving after destruction. A controller unit test additionally injects an update failure and checks disposal plus explicit recovery rather than resize-driven retries.

Before application code loads, the audit instruments native ResizeObserver targets, reduced-motion listeners, and animation-frame scheduling. It retains counts rather than a global collection of chart/DOM references. Every destroy iteration asserts zero observed targets, active observers, motion listeners, scheduled frames, and canvases in the document.

| Engine | Real mount/destroy cycles | Evidence |
| --- | --- | --- |
| Chromium | 100 | [Native resource and post-GC counters](data/lifecycle-chromium.json) |
| Firefox | 10 | [Run metadata](data/lifecycle-firefox.json) |
| WebKit | 10 | [Run metadata](data/lifecycle-webkit.json) |

Chromium also records document/node/listener counts and heap usage after garbage collection at cycles 1, 10, 50, and 100. A separate `/retention` fixture and [post-GC heap review](data/retention-review.json) now test 100 additional mount/destroy cycles with a unique flattened row ID per mount and a constant display label. The constant label avoids confusing font-text caches with retained chart input.

At cycles 10 and 100, only the latest ID held by the parent fixture survives; every obsolete ID is collected. The DOM stays at one document, 113 nodes, and 41 listeners, and closure counts do not grow. Snapshot growth is dominated by V8 `code` nodes, rather than retained data/model identities; exact counts and bytes are preserved in the raw summary. Generic object growth is 61 objects / 1,372 bytes. The report preserves node-type counts and top object growth, rather than hiding the increase in total heap usage. This finite review supports disposal of the tested chart-owned graphs and resources; it is not a promise that all future inputs or runtime caches consume constant memory.

The `/updates` fixture supplies immutable row/series reorders, duplicate display labels, renamed series/categories, added/removed rows and series, zero/negative/missing values, invalid-data recovery, and original-row events. Browser tests verify table order, retained visibility by ID, new/returned series visibility, and current event values. Reordering exposed lost native focus when keyed DOM moved. `ChartFocusKeeper` now restores the same connected control, falls back to the table toggle/status after removal, and yields to external focus or pointer intent. Document listeners are removed on destruction. All three engines exercise these cases. A regression test also checks that removing a valid series discards its hidden ID while the row data is invalid, so reintroducing it starts visible. R04 passes for this bar boundary and input matrix.

## R06 accessibility contribution

Each engine verifies named legend/table controls, readable numeric action labels, keyboard movement between values, and a visible focus outline. Native accessibility snapshots are saved for [Chromium](data/accessibility-chromium.yml), [Firefox](data/accessibility-firefox.yml), and [WebKit](data/accessibility-webkit.yml). The table remains complete when all plot series are hidden.

The observed macOS WebKit configuration uses Option-Tab to move between clickable controls; the test uses that shortcut on macOS and ordinary Tab elsewhere. See [Apple's Safari keyboard guide](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac). Pointer checks scroll the canvas into view and click the painted bar interior, avoiding viewport/edge-coordinate assumptions.

The renderer-boundary integration test now inspects `options.animation`: initial Reduce Motion disables it, preference changes update it without creating another renderer, and explicit consumer disablement continues to win. Native browser tests still exercise real preference changes. Focus repair is checked through reorders, renames, removals, error transitions, and external keyboard focus; macOS WebKit's pointer-click focus policy is not mistaken for a component failure.

Accessibility-tree assertions are not a screen-reader listening session. The [manual checklist](R06_MANUAL_REVIEW.md) is the remaining R06 evidence. A review server is available on port 4310 during the current development session, leaving port 4200 free. No full R06 or accessibility-compliance claim follows from the automated results.

## Remaining work

The [R03 bar baseline](R03_VISUAL_REVIEW.md), [R07 Canvas choice and measurements](R07_RENDERER_COST.md), and [R08 packed client/SSR consumers](R08_PACKED_RUNTIME.md) are recorded. G1 passes for the tested bar boundary. The four-family acceptance matrix remains open. The original G2-before-expansion sequence was superseded by the user's 12 November 2026 [R06 deferral](R06_MANUAL_REVIEW.md#development-sequencing-decision): development continues while human listening and G2 remain pending for release acceptance. The measurements above remain the historical baseline.
