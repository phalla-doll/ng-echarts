# Area-block visual alignment audit

Reviewed 12 November 2026 after the user reported that the playground did not match the expected visual direction. Baseline: `5fe594f`. This is a gap review, not a passing visual-parity result or an implementation of the missing charts.

## Reference and evidence

- [User-supplied reference](captures/area-reference/user-reference.png).
- [Live EvilCharts area blocks page](https://evilcharts.com/docs/echarts/area-chart/blocks), inspected in Chromium at a 1440×1000 viewport.
- [Live desktop capture](captures/area-reference/live-reference-desktop.png), including the documentation navigation and first block.
- [Current playground captures](PLAYGROUND_LAYOUT_REVIEW.md#visual-evidence) show the divergent workspace design.

The existing pinned upstream revision `4c2dd7c9bae780703244265c9a4b509d40c055ad` contains the latency and portfolio block sources under `src/registry/blocks/echarts/`. Their datasets, colors, and chart settings were inspected; no new fixture or React implementation has been copied into the Angular package during this audit.

## Findings

| Concern | Current Angular playground | Reference target |
| --- | --- | --- |
| Main experience | One configurable bar chart and a settings inspector | A scrolling gallery of named, composed chart blocks |
| Color | Blue-gray canvas, blue navigation accents, blue-tinted dark surfaces | Neutral near-black canvas, restrained monochrome chrome, series colors carrying emphasis |
| Typography | Instrument Sans and workspace metadata | Inter, a clear page heading, quiet subtitle, compact example headers |
| Example structure | Separate view control above a rounded chart frame | Section heading, compact code/preview header, inset chart surface, integration snippet below |
| Chart content | Desktop/Mobile grouped bars and native controls | Percentile summaries above gradient areas; portfolio summaries above stepped, dotted areas |
| Tools | Settings and lifecycle tools dominate the main page | Examples lead; technical checks remain separate |

Measured reference details: the page heading is 36 px/40 px at weight 600; block headings are 20 px/28 px at weight 500. At this desktop width, the central column is 672 px including 16 px side padding, and the first preview is 630×360 px. These are CSS dimensions, not pixels measured from the scaled user screenshot. Responsive behavior must be checked independently.

The current library exports `BarChart<T>` only. Area rendering, stepped curves, integrated metric summaries, and dotted area fills are missing functionality, not defects that can be fixed by recoloring the bar page. The earlier layout review verified its own workspace direction rather than this newly explicit reference; it cannot establish alignment with the user's expectation.

## Correction brief

1. Use a neutral gallery as the main documentation experience, with Angular-specific branding and real examples. Keep the settings workbench and validation fixtures on their own routes.
2. Match reference typography, surfaces, borders, spacing, compact example headers, and plot proportions before adding decorative variations. Include both themes and narrow-screen captures.
3. Treat complete blocks as compositions of summary content and reusable chart components. Preserve functional code/preview controls, keyboard actions, resizing, SSR/hydration, and reduced motion.
4. If area examples are selected for this correction, implement real typed Angular area rendering and inspect/adapt the pinned datasets with provenance. Establish family-specific correctness and visual evidence. The portfolio's dotted fill, stepped interpolation, and hover effects need explicit scope because advanced patterns were previously deferred.
5. Show working local Angular imports/examples. The package is private and unpublished; do not imply that the upstream `shadcn` command installs this Angular library or invent an available npm installer.

The user selected “Match the layout with existing bar charts first.” The [bar-gallery correction](BAR_GALLERY_VISUAL_REVIEW.md) records the resulting implementation and visual checks. Area examples remain later work. The human VoiceOver review remains deferred under the user's earlier direction and does not block this work.
