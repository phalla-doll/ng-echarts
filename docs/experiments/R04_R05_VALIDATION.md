# Bar lifecycle and hydration validation

Recorded 12 November 2026 on macOS 27.2.1, arm64. Chart: bar. Tasks: NG05–NG07. Requirements: F02, F04–F10. Gate: G1. R05 passes for the workspace bar scenarios below; R04 and R06 remain partial. G1/G2 remain pending.

## Reproduction and environment

Use the Node/npm versions in [R01](R01_TOOLCHAIN.md), then run:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run check
```

The complete check passed: production library/client/server builds, strict compilation, 31 Vitest tests across six files, packed declaration/invalid-key checks, SSR response checks, and **36 browser scenarios** (twelve each in Chromium 158.0.8127.18, Firefox 159.0, and WebKit 27.2). Tests use the production server, default reduced motion, and the pinned monthly fixture. The follow-up `/comparison` scenarios verify actual painted abbreviated/full ticks, unchanged full tooltip/table labels, formatter-error disposal/recovery, and control/plot containment at 320/768/1440 px in both themes. Hosted CI is configured for all three engines; these development changes have been validated locally.

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

Chromium also records document/node/listener counts and heap usage after garbage collection at cycles 1, 10, 50, and 100. Post-warm-up DOM/listener counts are stable in this run; heap usage rises. These are diagnostic observations, not an established memory budget or proof that every retained JavaScript object is expected. R04 remains pending for retained-object attribution and the broader add/remove/reorder/rename input matrix. The instrumentation does not replace that review.

## R06 accessibility contribution

Each engine verifies named legend/table controls, readable numeric action labels, keyboard movement between values, and a visible focus outline. Native accessibility snapshots are saved for [Chromium](data/accessibility-chromium.yml), [Firefox](data/accessibility-firefox.yml), and [WebKit](data/accessibility-webkit.yml). The table remains complete when all plot series are hidden.

The observed macOS WebKit configuration uses Option-Tab to move between clickable controls; the test uses that shortcut on macOS and ordinary Tab elsewhere. See [Apple's Safari keyboard guide](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac). Pointer checks scroll the canvas into view and click the painted bar interior, avoiding viewport/edge-coordinate assumptions.

Accessibility-tree assertions are not a screen-reader listening session. Manual screen-reader review, further focus scenarios, and assertions that inspect changed-motion rendering behavior remain open. No full R06 or accessibility-compliance claim follows from these tests.

## Remaining work

Resolve the [R03 visual differences](R03_VISUAL_REVIEW.md), finish the R04 input matrix and heap attribution, complete R06, compare/render benchmark Canvas and SVG in R07, and run full packed client/SSR consumers in R08. NG04–NG07 remain in progress until their complete task criteria and dependencies are satisfied; a passed R05 does not close the gates or the four-family acceptance matrix.
