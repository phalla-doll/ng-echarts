# Comparison page alignment

Reviewed 13 November 2026 after the user identified `/comparison` as inconsistent with the rest of the demo. Baseline: `c21fcae`. The earlier four-family audit reviewed the galleries; this correction covers the comparison pages and their shared shell.

## Problem and resulting behavior

The comparison route retained a historical full-width measurement layout: hidden desktop navigation, a white page inside the dark site, independent theme controls, system-font chart content, and a plot stretching across almost the entire viewport. An earlier header-only adjustment did not align the complete page.

Normal `/comparison` now uses the shared page width, gutters, Inter typography, neutral borders, native controls, and site-wide theme. The desktop sidebar stays visible, “Visual comparison” has the active navigation state, and the heading aligns with the gallery at 1440 px. Bar variants expose their selected state; display options occupy a separate row. The same shared correction applies to `/line-comparison`, `/area-comparison`, and `/pie-comparison`.

The top-bar theme button updates the page and chart together and retains the preference when navigating back to the gallery. The normal page has one theme control. Narrow layouts use the existing mobile navigation and 40 px variant/options controls. Chart data, rendering options, tooltips, accessible table actions, and formatter-error recovery retain their behavior. No library API or packaged runtime changes.

## Reference measurements

Append `?reference=1` to a comparison route for the isolated capture view. It retains the 20 px page inset, full-width measurement shell, system-font plot, pinned neutral theme tokens, 360 px plot height, and independent light/dark chart control. The chart still measures exactly 320/768/1440 px when its viewport is 40 px wider. This mode is intended for reproducible reference captures; ordinary navigation opens the consistent site page.

All four `tools/capture-*-reference.mjs` helpers now use that explicit query parameter. The reference [harness instructions](../../tools/reference/README.md) document it. Historical dated captures remain unchanged; new captures use the explicit mode. Benchmark routes retain their existing measurement layout.

## Visual evidence

The [capture manifest](captures/comparison-page/manifest.json) records 24 images, source/image hashes, Chromium/Node versions, DPR 1, reduced motion, and no browser/HTTP errors. Captures cover every family in light/dark desktop/mobile layouts, extra bar widths, before views, and isolated reference views.

| View | Before | After |
| --- | --- | --- |
| Desktop | [Old full-width page](captures/comparison-page/before-desktop.png) | [Dark](captures/comparison-page/comparison-dark-1440.png), [light](captures/comparison-page/comparison-light-1440.png) |
| Mobile | [Old mobile page](captures/comparison-page/before-mobile.png) | [320 px](captures/comparison-page/comparison-dark-320.png), [390 px](captures/comparison-page/comparison-light-390.png) |
| Other families | Shared the same historical layout | [Line](captures/comparison-page/line-comparison-dark-1440.png), [area](captures/comparison-page/area-comparison-light-1440.png), [pie/donut](captures/comparison-page/pie-comparison-dark-390.png) |
| Isolated capture view | Historical fixture conditions | [Light 320 px host](captures/comparison-page/reference-light-320.png), [dark 1440 px host](captures/comparison-page/reference-dark-1440.png) |

## Verification

Production library/playground builds, strict TypeScript/templates, and all 119 unit/integration tests pass. The targeted comparison, gallery, documentation/theme, and workbench/navigation regression passes 42 scenarios in Chromium, Firefox, and WebKit. The comparison scenarios verify normal-page heading alignment, visible/active navigation, inherited Inter, selected variants, shared page/chart colors, theme persistence, and no overflow at 320/390/768/1440 px. Existing reference-width, full-label/tooltip/table, and formatter recovery checks use `?reference=1`.

The final comparison rerun additionally checks the isolated reference view for every family in every engine: full-width shell, historical font, independent light/dark chart controls, and stable site theme. The final 18 comparison scenarios pass. All 24 Pages routes prerender, static checks pass in all three engines, production SSR returns library markup/hydration metadata, and formatting/whitespace checks pass. The [public comparison page](https://phalla-doll.github.io/ng-echarts/comparison/) is deployed from clean source commit `6cffc35`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43364862604) succeeds. [Live evidence](data/comparison-page-live.json) verifies all four normal/reference comparison routes in Chromium, Firefox and WebKit, plus 22 live captures without browser/HTTP errors. Live general Pages route/font/navigation checks also pass in all three engines.

Reproduce with the pinned toolchain:

```sh
npm run build
npm run typecheck
npm test
npx playwright test tests/browser/comparison.spec.ts tests/browser/site-pages.spec.ts tests/browser/playground-layout.spec.ts tests/browser/gallery.spec.ts
npm run build:pages
npm run check:pages
```
