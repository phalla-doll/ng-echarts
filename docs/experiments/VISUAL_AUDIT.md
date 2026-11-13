# Four-family visual audit and refinement

Reviewed 13 November 2026 against source baseline `35ef328` and the refinement changes. Result: the gallery retains the approved neutral block composition, and the observed mobile readability defects are corrected. This is a presentation review of all four implemented families, with before/after evidence and live upstream observations.

## References and review method

Two references serve different purposes:

- Apache ECharts' official [bar](https://echarts.apache.org/examples/en/editor.html?c=bar-simple), [line](https://echarts.apache.org/examples/en/editor.html?c=line-simple), [area](https://echarts.apache.org/examples/en/editor.html?c=area-basic), and [donut](https://echarts.apache.org/examples/en/editor.html?c=pie-doughnut) examples establish renderer conventions: clear numeric axes, category labels, recognizable marks, and legible hover content.
- The original EvilCharts [bar](https://evilcharts.com/docs/echarts/bar-chart/blocks), [line](https://evilcharts.com/docs/echarts/line-chart/blocks), [area](https://evilcharts.com/docs/echarts/area-chart/blocks), and [pie](https://evilcharts.com/docs/echarts/pie-chart/blocks) pages establish the gallery design: Inter typography, a quiet page outline, compact Code/Preview headers, inset previews, summary content, and integration snippets. This is the visual direction approved in the earlier [reference audit](AREA_BLOCKS_VISUAL_AUDIT.md) and [gallery correction](BAR_GALLERY_VISUAL_REVIEW.md).

The dated [reference screenshots and URLs](captures/visual-audit/reference/manifest.json) record the live pages inspected in Chromium at 1440×1000. Current upstream blocks have different datasets and additional compositions, including latency percentiles, payout summaries, and center-label donuts. This review compares visual treatment and readability; exact matching-fixture comparisons remain in [R03](R03_VISUAL_REVIEW.md), [NG11](NG11_LINE_CHART.md), [NG12](NG12_AREA_CHART.md), and [NG13](NG13_PIE_CHART.md). It does not substitute different data for a pixel-parity claim.

The refinement plan keeps the established tokens: dark canvas `#0a0a0a`, chrome `#111111`, border `#222222`, text `#f5f5f5`, muted text `#a3a3a3`, with white and neutral grays in light mode. Inter remains the prose/plot font, Google Sans Code the code font, with 36 px desktop titles, 20 px block headings, and a 640 px desktop example column. Series colors carry the data emphasis. Changes concentrate on reading and operating the existing examples rather than adding decoration.

The [capture tool](../../tools/capture-visual-audit.mjs) checks 32 family/theme/viewport combinations: bar, line, area, and pie; dark/light; 320, 390, 768, and 1440 px wide. It waits for fonts, canvas dimensions, and the maximum initial engine animation before capturing. Full-page narrow captures include every gallery variant. Additional images show narrow horizontal axes, outside radial labels, import-panel keyboard focus, hidden legends, and real pointer tooltips at 320/1440 px. The [manifest](captures/visual-audit/after/manifest.json) records browser/Node versions, DPR 1, reduced motion, dimensions, source hashes, image hashes, and browser/HTTP errors. A [contact sheet](captures/visual-audit/contact-sheet.png) provides a compact overview; inspect original-size images for text quality.

## Findings and corrections

| Finding | Refinement | Evidence |
| --- | --- | --- |
| Horizontal numeric ticks crowd together at 320 px | Request fewer rounded value intervals for horizontal bars and enable value-label overlap suppression. Actual values, events, and formatters retain their contracts. ECharts still chooses the rounded domain. | [Before](captures/visual-audit/before/horizontal-dark-320.png), [after](captures/visual-audit/after/bar-dark-320-last.png) |
| Mobile plotting loses space to stacked insets | Reduce the gallery frame's side padding from 16 to 8 px on narrow screens. At 320 px, plot width grows from 244 to 260 px. Desktop geometry stays aligned with the reference. | [Before](captures/visual-audit/before/bar-dark-320.png), [after](captures/visual-audit/after/bar-dark-320.png), [measurements](captures/visual-audit/after/manifest.json) |
| Mobile import text shrinks to 10 px and clips behind horizontal scrolling | Keep 12 px/20 px code typography; wrap the short import on mobile. Add keyboard focus and a visible inset outline to import panels. Long complete examples retain their separate scrollable Code view. | [Focused import](captures/visual-audit/after/bar-light-320-code.png) |
| Legend and preview controls feel cramped on phones | Use 40 px legend/reload targets and a 44 px preview header; keep visible legend text at 12 px and state text at 11 px. Add restrained hover feedback. | [Mobile line](captures/visual-audit/after/line-dark-320.png), [mobile area](captures/visual-audit/after/area-light-390.png) |
| Hiding a series changes only a small status word | Add a dashed border and faded swatch to hidden legend items, while retaining the explicit Hidden text and native pressed state. | [Hidden series](captures/visual-audit/after/bar-dark-320-hidden.png) |
| Pie summary markers falsely associate totals/counts with Chrome/Safari colors | Remove the two decorative summary markers. Actual slice/category colors remain in the native legend and plot. | [Before](captures/visual-audit/before/pie-light-320.png), [after](captures/visual-audit/after/pie-light-320.png) |
| A single-series summary occupies half a two-column metric grid | Let the only metric use the full summary row. | [Horizontal summary](captures/visual-audit/after/bar-dark-320-last.png) |

Complete narrow galleries: [bar](captures/visual-audit/after/bar-light-320-full.png), [line](captures/visual-audit/after/line-dark-320-full.png), [area](captures/visual-audit/after/area-light-320-full.png), and [pie/donut](captures/visual-audit/after/pie-dark-320-full.png). These include every implemented gallery variant.

The only reusable-library rendering change is numeric-axis interval/overlap handling. Other refinements are scoped to the gallery. No public input/output, fixture dataset, tooltip formatter, or benchmark timing target changes.

## Visual assessment

| Area | Review result |
| --- | --- |
| Hierarchy and spacing | The page heading, subtitle, block headings, compact controls, summaries, plots, and code snippets form a consistent reading order. The desktop structure remains close to the approved EvilCharts direction. |
| Bar and line marks | Grouped/stacked/gradient/horizontal bars and straight/smooth/point-free/gapped lines remain recognizable. Sparse narrow-screen category ticks preserve full category names in hover content. |
| Area fills | Independent gradients, stacks, uniform fills, and explicit missing-observation gaps retain distinct shapes. Neutral grid lines support comparison without dominating the marks. |
| Pie/donut | Slices retain stable category colors; the outside-label example fits at 320 px. Category names remain available in the native legend and tooltip. |
| Both themes | Text, muted labels, borders, fills, and syntax colors are coherent against the corresponding neutral surfaces. Data colors agree between Cartesian summaries, legends, and painted plots. |
| Hover hierarchy | Real pointer tooltips render in every family/theme at both 320 and 1440 px; the capture tool checks that the complete tooltip box remains within the plot. Cartesian tooltips retain full month names and separate series values. |
| Mobile operation | No page overflow across the 32 combinations. Larger native controls, wrapped imports, visible keyboard focus, and explicit hidden feedback improve use without adding another control layer. |

Representative final captures:

| Family | Desktop | Mobile | Hover at 320 px |
| --- | --- | --- | --- |
| Bar | [Dark](captures/visual-audit/after/bar-dark-1440.png), [light](captures/visual-audit/after/bar-light-1440.png) | [Dark](captures/visual-audit/after/bar-dark-320.png), [light](captures/visual-audit/after/bar-light-390.png) | [Tooltip](captures/visual-audit/after/bar-dark-320-tooltip.png) |
| Line | [Dark](captures/visual-audit/after/line-dark-1440.png), [light](captures/visual-audit/after/line-light-1440.png) | [Dark](captures/visual-audit/after/line-dark-390.png), [light](captures/visual-audit/after/line-light-320.png) | [Tooltip](captures/visual-audit/after/line-light-320-tooltip.png) |
| Area | [Dark](captures/visual-audit/after/area-dark-1440.png), [light](captures/visual-audit/after/area-light-1440.png) | [Dark](captures/visual-audit/after/area-dark-320.png), [light](captures/visual-audit/after/area-light-390.png) | [Tooltip](captures/visual-audit/after/area-dark-320-tooltip.png) |
| Pie/donut | [Dark](captures/visual-audit/after/pie-dark-1440.png), [light](captures/visual-audit/after/pie-light-1440.png) | [Dark](captures/visual-audit/after/pie-dark-390.png), [light](captures/visual-audit/after/pie-light-320.png) | [Tooltip](captures/visual-audit/after/pie-light-320-tooltip.png) |

## Verification and reproduction

Use the pinned Node/npm toolchain, then:

```sh
npm run build
npm run capture:visual
npx playwright test tests/browser/visual-refinement.spec.ts
npm run check
npm run build:pages
npm run check:pages
```

The 15 new three-engine scenarios pass: actual painted numeric labels have at least 8 px separation at 320 px; every family's mobile legend works with keyboard input; hidden-state feedback, import focus/visibility, Code/Preview transitions, colors, and theme changes remain usable. The canvas check measures real painted text positions and widths, not private ECharts options. Chromium provides visual captures; Firefox and WebKit provide additional behavioral verification.

The full `npm run check` passes: formatting, production builds, strict compilation, 119 unit/integration tests, 160 browser scenarios (plus two expected CDP-only skips), isolated declarations/documentation/client/SSR consumers, and all seven bundle scenarios. The 70-image capture run records no console, page, or HTTP errors; 32 page-width checks and all 16 tooltip-containment checks pass. `npm run build:pages` prerenders all 24 routes, and `npm run check:pages` passes in Chromium, Firefox and WebKit. All 622 local documentation links/anchors resolve, capture/source hashes match, and `git diff --check` passes. Live verification is recorded with the deployment handoff.

This review leaves the existing release gates unchanged. Human screen-reader interpretation remains deferred, and registry/artifact release acceptance is separate from a visually reviewed demo.
