# NG09 shared value formatting

Recorded 12 November 2026. Chart: bar. Task: NG09, first increment. Requirements: F01, F03, F05, F07, F10. This increment implements the common numeric-text contract; NG09 remains in progress until shared state/package-boundary work is complete.

The results below describe the formatting increment at `5fe594f`. Later site and current regression evidence are recorded in the [bar-gallery review](BAR_GALLERY_VISUAL_REVIEW.md).

## Development sequencing

The user deferred the R06 human listening review and authorized continued development. The [review record](R06_MANUAL_REVIEW.md) and current plans reflect that decision. R06/G2 remain pending; they no longer block implementation and must be completed before G3/G4 release acceptance. Automated keyboard, table, focus, motion, and hydration checks continue.

## Implementation

The experimental public API adds `numberFormatOptions?: Intl.NumberFormatOptions`, `valueFormatter?: ValueFormatter`, and the exported `ValueFormatter = (value: number) => string`. Existing `locale="en-US"` behavior is preserved. Native formatting options support currency, percent, precision, and units through [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

The pure `createValueFormatting` helper centralizes numeric text for value axes, tooltips, table cells, and action labels. It validates locale/options before choosing the custom callback or native formatter. Custom labels for known observations are validated and cached; missing values bypass the callback, and signed zero is preserved. Theme and layout changes reuse the formatting state. Native table-row derivation remains deferred until expansion, while custom callbacks are preflighted against observed numbers to contain failures before rendering.

Custom formatters must be pure, synchronous, return text, and support generated finite ticks absent from the input dataset. Invalid observed labels or configuration show a generic error with existing application-error/loading precedence. Failures on additional axis ticks are sanitized and contained by the browser controller, which disposes the instance and permits input-driven recovery. Tooltip output is escaped, and point events retain original numbers.

The new `/formatting` validation page demonstrates locale, currency, custom text, missing values, invalid configuration, state precedence, and recovery. It uses the existing site shell and is linked from the validation navigation. A small stylesheet organization fix moves narrow-layout navigation styling to the shared site-control sheet, keeping the existing component-style budget intact.

[Currency example capture](captures/value-formatting.png): Chromium, 1440×1300 viewport, reduced motion, local fonts loaded, expanded native table. The live preview on port 4310 was checked with the actual browser renderer and no page errors.

## Verification

Run with Node from `.nvmrc`:

```sh
npm run check
npx playwright test tests/browser/value-formatting.spec.ts tests/browser/playground-layout.spec.ts
```

`npm run check` passed: production builds, strict compilation, 48 unit/integration tests across eight files, packed declaration and invalid-template checks, SSR, isolated client/SSR runtime consumers, and 55 browser scenarios (19 Chromium, 18 Firefox, 18 WebKit; two CDP-only skips). After the final site-style organization fix, the playground rebuilt without component-budget warnings and all 12 layout/formatting scenarios passed again. Coverage includes numeric formatting, callback caching, signed zero, missing observations, invalid runtime inputs, strict packed templates, actual painted axis labels, HTML escaping, raw plot/table events, SSR configuration errors, renderer disposal, and input-driven recovery in Chromium, Firefox, and WebKit.

A separate `npm run benchmark:bar` rerun also passed: normal Angular 200×3 p95 mount **17.70 ms**, update **17.60 ms**, within the existing 200 ms target. Stress 2000×3 mount/update were **46.70/66.80 ms**. These timings use default formatting; custom callback cost depends on application code. [Raw timings](data/bar-benchmark-ng09.json) and the [R07 report](R07_RENDERER_COST.md) retain the method and limits.

The linked package is **178,402 gzip / 152,619 Brotli bytes**, within unchanged 200,000/175,000 budgets. This adds 262/246 bytes over the previous measured package. See [size evidence](data/bar-bundle-size.json) and the [packed runtime result](data/packed-runtime.json).

## Remaining NG09 work

- Consolidate only state/validation responsibilities demonstrated by multiple chart implementations.
- Establish and measure per-chart package boundaries before adding renderer modules for line, area, and pie/donut.
- Continue family-specific visual, runtime, performance, and accessibility evidence; this bar increment does not complete the four-family acceptance matrix.
