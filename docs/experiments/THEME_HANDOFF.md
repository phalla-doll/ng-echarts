# Initial chart theme handoff

Reviewed 14 November 2026 with Node 24.22.2 and npm 11.19.1.

## Reproduction and correction

The reported composed example showed a blue-gray plot and legend area while JavaScript was loading. Holding all client scripts reproduced the mismatch: the server-rendered frame used `rgb(24, 32, 44)` (`#18202c`) instead of the gallery's `rgb(10, 10, 10)` (`#0a0a0a`). The regression test failed on this exact difference before the correction.

Every chart template bound resolved/default colors directly to public `--nec-*` properties on `nec-chart-frame`. Those inline values shadowed inherited application tokens until browser measurement ran after hydration. The shared frame now receives private default properties. CSS resolves the caller's public tokens at the frame host, then supplies scoped colors on the inner section for projected controls and state messages. Resolving the aliases at the host avoids a self-referential custom-property cycle. This applies to all nine chart families and retains light/dark defaults when a caller supplies no colors.

Canvas and tooltip normalization remain at the browser boundary. Inherited CSS colors retain their authored color space, so comparison assertions normalize actual color pixels instead of relying on RGB serialization. CSS-only palette changes still require `themeRevision` to refresh the renderer's measured colors.

## Visual evidence

- [Reported loading state](theme-handoff/reported-loading.png): the user's original screenshot, at its original viewport/scale.
- [Corrected pre-hydration state](theme-handoff/fixed-before-hydration.png): Chromium, default Playwright desktop viewport (1280 × 720), all client scripts held, no Canvas initialized.
- [Corrected rendered state](theme-handoff/fixed-after-hydration.png): the same composed card after hydration, with reduced motion and the dark theme restored after exercising light mode.

The corrected captures show the same `#0a0a0a` surface before and after chart initialization. The screenshots are cropped to the card; the reported screenshot uses a different viewport/scale. Screenshot capture is restricted to Chromium because Firefox/WebKit's element-stability wait stalls while the document's module scripts are deliberately held. All engines run the computed-color and Canvas-pixel assertions.

## Validation

- `npm run build`, `npm run typecheck`, and `npm test`: passed; 266 unit tests across 50 files.
- `npm run check:consumer`: passed isolated packed declarations with `skipLibCheck: false` and invalid-consumer rejection.
- `npm run check:docs`: passed documented install/build/render/hydration in Chromium, Firefox and WebKit; [fresh report](theme-handoff/documentation-consumer.json).
- `npm run check:ssr`: passed production markup and hydration metadata checks.
- `npm run check:bundle`: all focused entries, core, root and root-frame budgets passed; [fresh report](theme-handoff/package-boundaries.json). Earlier reports retain their recorded bytes.
- `PLAYWRIGHT_PORT=4187 npx playwright test tests/browser/theme-handoff.spec.ts tests/browser/family-acceptance.spec.ts tests/browser/composed-chart.spec.ts tests/browser/comparison.spec.ts tests/browser/gallery.spec.ts`: 87 passed across Chromium, Firefox and WebKit. Includes 33 new cases for all nine families with scripts held, matching Canvas/frame colors in both themes, and no-JavaScript defaults/partial overrides. Existing cases cover responsive comparison/gallery layouts, theme changes, loading/error recovery, hidden plots, deferred hydration, import failures and teardown.
- The 12 shared-layout comparison cases passed again after strengthening the reference dark-theme assertion to compare rendered pixels as well as the initial white surface.
- `npm run format:check`, `git diff --check`, and local link/heading checks for the three changed documentation files: passed (91 local links/anchors).

This is a local source correction. Existing private candidate archives and human release gates remain unchanged; no package publication or Pages deployment was performed.
