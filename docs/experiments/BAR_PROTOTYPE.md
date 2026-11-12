# Initial bar prototype evidence

Status: partial implementation evidence; R03–R08 and G1/G2 remain pending. Executed 12 November 2026. Tasks: NG02 complete, NG03 initial choice recorded, NG04–NG07 in progress. Chart: bar only. Requirements exercised: F01–F10; none is closed across the MVP.

## Implemented behavior

The playground renders the pinned twelve-month Desktop/Mobile fixture. The experimental `BarChart<T>` accepts immutable data and typed keys/series; supports grouped/stacked bars, both layouts, solid/gradient fills, explicit themes, locale formatting, loading/error/empty states, and point/legend outputs. Missing observations remain missing; Cartesian zero and negative values remain valid. Plot and table activation use stable row/series IDs.

Native legend buttons retain focus and visibility by ID. The table is collapsed initially, exposes every row regardless of legend filtering, identifies missing values, and offers keyboard point actions. Browser work respects the initial and changed reduced-motion preference. Theme colors are refreshed through explicit theme/revision inputs; CSS is read outside deterministic computations.

The controller batches updates, waits for nonzero dimensions, observes resize, replaces renderer options, invalidates late imports, and disposes the instance. Renderer failures show a generic error and permit retry or recovery on changed inputs. SSR emits accessible surrounding markup; the renderer starts in the browser after an Angular render callback and application stability.

## Automated results

Toolchain: the versions in [R01](R01_TOOLCHAIN.md), plus Playwright 1.65.0. Local browser: Chromium 158.0.8127.18, headless, DPR 1. Tests use a production server build and `prefers-reduced-motion: reduce`.

| Check | Observed result |
| --- | --- |
| Library and browser/server builds | Pass |
| Strict Angular/TypeScript compilation | Pass with `skipLibCheck: false` |
| Unit/integration tests | 21 passing tests across five files: data semantics, state precedence, escaped tooltips, Angular controls, presentation shell, and controller lifecycle |
| Packed declaration consumer | Pass for valid templates and event inference; text, unknown, and nullish numeric-key errors rejected; invalid category and measure keys tested in Angular templates |
| Production SSR response | HTTP 200 with chart title/table control and hydration metadata; no server-rendered canvas |
| Chromium browser scenarios | Four pass: pointer/keyboard event equivalence; state precedence and current-data recovery; all-hidden legend focus/table behavior; themes/layouts, hidden/resized surface, and three remounts |
| Controller teardown simulation | 100 mocked cycles pass disposal, observer-disconnect, and pending-frame assertions; this is not a browser memory/leak audit |

Reproduce with Node 24.22.2 and npm 11.19.1:

```sh
npm ci
npx playwright install chromium
npm run check
```

Browser tests collect page exceptions, console errors, and Angular hydration diagnostics. The single-chart Chromium path currently passes without them. Production output places the Canvas adapter in a lazy chunk; this is not the complete R07 module-exclusion or size-budget assessment.

## Visual progress

These captures were inspected at a 1100 × 1050 viewport, DPR 1, system font, reduced motion, and a 1024 px outer chart host. The light table is collapsed; the dark table is expanded. Neither substitutes for upstream comparison at the required host widths.

- [Light prototype](captures/bar-prototype-light.png)
- [Dark prototype with data table](captures/bar-prototype-dark.png)

## Remaining research

- R03: render the pinned upstream examples, capture all required widths/themes, review differences, and finish parity/template-boundary evidence.
- R04: expand real browser checks for initially hidden mounting, removed series, failed imports and updates, and 100-cycle resource cleanup.
- R05: multiple/deferred instances and navigation, including combinations that delay stability.
- R06: screen-reader review, accessibility tree, changed-motion assertions, and full focus scenarios.
- R07: SVG comparison, required benchmark fixtures/raw samples, cold-load/table costs, measured data envelope, and numeric bundle budget.
- R08: full packed client and SSR build/runtime consumers outside the workspace; the current fixture compiles declarations and templates only.

The public API remains experimental. Custom value formatters and final formatting configuration are not implemented yet; locale number formatting is shared across axes, tooltip, and table. No line, area, or pie/donut implementation has started.
