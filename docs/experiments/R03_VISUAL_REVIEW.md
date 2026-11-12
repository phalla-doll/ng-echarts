# R03 bar visual comparison

Status: pass for the agreed bar prototype, with the intentional differences below. Recorded 12 November 2026. Tasks: NG02, NG04. Requirements: F03, F04, F06, F09. Gate: G2. Other chart families still require their own visual baseline.

## References and reproduction

The isolated [reference harness](../../tools/reference/README.md) renders four **unmodified** examples and their real bar/UI imports at revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. The [provenance ledger](../UPSTREAM_PROVENANCE.md) records exact source paths, fixtures, colors, and notices. React remains confined to the reference tool's development dependencies.

Run `npm run reference:prepare`, `npm run build`, and `npm run capture:bar`. The [current gallery](captures/bar-variants/index.html) contains all **80 images**: both implementations, four variants, three host widths, two themes, plus January tooltips at 320 and 768 px. The [manifest](captures/bar-variants/manifest.json) records original example/module/theme hashes, browser, host/canvas rectangles, fonts, DPR, and comparison stylesheet hash. All images were reviewed through ten comparison sheets, with the narrow tooltip details inspected separately.

| Variant | Fixture | Representative reference / Angular |
| --- | --- | --- |
| Grouped | Twelve months, Desktop/Mobile, green/rose | [Reference](captures/bar-variants/grouped-upstream-light-768.png) / [Angular](captures/bar-variants/grouped-angular-light-768.png) |
| Stacked | Same twelve-month values and series order | [Reference](captures/bar-variants/stacked-upstream-dark-768.png) / [Angular](captures/bar-variants/stacked-angular-dark-768.png) |
| Horizontal | Six months, Desktop only: 186, 305, 237, 173, 209, 214; blue palette | [Reference](captures/bar-variants/horizontal-upstream-light-320.png) / [Angular](captures/bar-variants/horizontal-angular-light-320.png) |
| Gradient | Primary twelve-month values; solid color through 20%, clear by 90% | [Reference](captures/bar-variants/gradient-upstream-dark-768.png) / [Angular](captures/bar-variants/gradient-angular-dark-768.png) |
| Narrow tooltip | Full January title, marker, series labels and aligned values | [Reference](captures/bar-variants/grouped-upstream-light-320-tooltip.png) / [Angular](captures/bar-variants/grouped-angular-light-320-tooltip.png) |

Chromium 158.0.8127.18 uses DPR 1, reduced motion, a 1000 px viewport height, and viewport width equal to host width plus 40 px. Host widths are exactly 320, 768, and 1440 px. Original captures are not scaled; gallery thumbnails fit their columns and link to the originals. The reference host is 360 px high including its legend/brush. Angular reserves 360 px for its plot, adding its heading, summary, native controls, and card padding. Geometry is recorded rather than concealed through image scaling.

The harness uses system DOM fonts instead of the full upstream Next.js font setup. Canvas typography can differ; this is a pinned example comparison, not a build of the upstream website. The [initial default-theme capture](captures/bar-reference/manifest.json) and [first neutral-theme increment](captures/bar-alignment/manifest.json) remain historical evidence.

## Reviewed checklist and decisions

| Concern | Result and disposition |
| --- | --- |
| Data, ordering, layout | Selected fixtures preserve values, supplied order, category roles, grouping, and stacks. The horizontal fixture uses its own upstream dataset rather than substituting primary values. |
| Theme and palette | `/comparison` maps upstream background, foreground, muted-foreground, and border tokens to `--nec-background`, `--nec-text`, `--nec-muted`, and `--nec-border`. Series palettes match the selected example in each theme. Library defaults remain an independent consumer theme. |
| Category text | Optional pure `categoryTickFormatter(category, index): string` abbreviates only axis labels. Full category text and stable row IDs remain in tooltips, table headings, and events. Original indices, duplicate labels, empty ticks, invalid callback containment, and recovery are checked. |
| Typography and axes | Retain explicit 12 px ticks and the numeric value axis for interpretation. Upstream uses 10 px category ticks and omits value labels in these examples. Platform system typography and stronger direct-token grid lines are accepted prototype choices. |
| Plot and card spacing | Keep plot insets 12/16/12/8 px and ECharts 6 outer-bounds label containment. The Angular heading/summary and native controls occupy separate space. This produces different plot proportions and bar widths from the upstream overlay layout. |
| Bar geometry and fills | Keep rounded 2 px corners, the renderer's grouped spacing and 48 px width cap, and contiguous stacked values without synthetic separator strokes. These small geometry differences preserve interpretation. Gradient alpha now holds through 20% and fades to clear by 90%, allowing the grid to remain visible underneath. |
| Tooltip hierarchy | A 12 px escaped text tooltip now has a full category title, series-color markers, aligned tabular values, 6/10 px padding, and rounded surface. Tooltip bounds remain inside the plot at 320 and 768 px in both themes. Default pointer-relative placement and shadow are accepted differences from upstream. |
| Native controls | Legend buttons retain visible names/state and keyboard operation; the complete table remains available even with every series hidden. Buttons wrap without horizontal clipping at 320 px. |
| Brush | Present in the primary upstream example and excluded from Angular by MVP scope. No brush was added to imitate the reference geometry. |

These choices establish an Angular bar baseline; they do not promise pixel identity or whole-library acceptance. The numeric quality/performance criteria are unchanged.

## Template and behavior review

State, category ticks, options, legend items, and table rows are derived in TypeScript. Full table formatting waits for expansion. Templates contain simple guards, stable `@for` identities, and named actions. Browser measurement, focus repair, renderer imports, and instance calls remain outside computed builders.

Browser checks cover the four variants at all review widths/themes and inspect full table values. Separate tests verify actual Canvas tick text, unchanged full tooltip/table labels, generic formatter-error disposal/recovery, keyboard focus through reorders/removals, and typed packed-consumer inputs. See [lifecycle evidence](R04_R05_VALIDATION.md), [renderer measurements](R07_RENDERER_COST.md), and [packed consumption](R08_PACKED_RUNTIME.md). R03 passing does not close G2 while the [R06 listening review](R06_MANUAL_REVIEW.md) remains pending.
