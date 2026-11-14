# Chart presentation refinement

The November 2026 visual review covered all nine implemented chart families and the linked-chart composition. This refinement preserves the existing typography, theme palette, data contracts and native accessibility approach while addressing the review’s production-readiness findings. It is source work after private rc.10; existing candidate archives, notices and human F09/R06/G2/G3/G4 gates remain unchanged. Nothing is deployed or published by this work.

## Resulting behavior

| Area | Refinement |
| --- | --- |
| Shared states | Internal `ChartStage` preserves the allocated plot area for loading, empty and error messages. Unavailable controls retain space but are inert/hidden and native buttons are disabled. Stale tables are removed; retry and focus recovery remain available. |
| Legends | Remove repetitive visible status words while retaining pressed state and screen-reader status text. Hidden controls keep dashed borders and faded swatches. All-hidden Cartesian/radar plots explain how to restore a series. |
| Tooltips | Shared escaped title/label/value rows, tabular numeric alignment, consistent padding/radius/shadow and bounded wrapping. Calendar/Sankey `valueLabel` names the measure without changing raw values or table actions. |
| Bars | Gradients retain 30% of their original alpha at the base. Three-pixel corners round exposed stack ends only, separately for positive and negative values; hiding a series updates the exposed cap. |
| Lines | Series alternate solid/circle and dashed/diamond cues. Endpoint symbols are not clipped at the grid edge. Gaps remain honest. |
| Areas | Gradient fills run from 22% to 4% alpha; solid fills use 16%. Independent/missing/same-sign stack semantics remain intact. |
| Pie/donut | Native category legends show raw values and visible-total percentages. Optional `showTotal` adds a formatted donut center for `innerRadius >= 0.4`; zero/hidden slices never create placeholder sectors. Labels use short leader lines near the ring. |
| Composed | The mean uses a thicker dashed stroke and diamond markers over bars. Both measures retain the shared numeric axis. |
| Radar | A common-scale note, or direction to dimension-specific table scales, gives visible context. Larger dimension labels and aligned tooltip pairs improve reading. |
| Radial progress | Slightly slimmer track; percentage and raw value/goal remain visible. Native progress semantics remain unchanged. |
| Calendar | Numeric interval upper bounds and a stronger missing-data legend cue clarify the scale. The year/quarter geometry remains stable during unavailable states. |
| Sankey | Four browser-resolved palette slots cycle by stage depth. Labels include the larger incoming/outgoing total, matching node height. A narrow-container scroll hint accompanies the keyboard-scrollable flow. Arrow/Home/End scrolling works across engines, and tooltips stay within the visible scrollport and clear on scroll/resize. |
| Linked charts | Overview and detail share a row at container widths of at least 740 px and stack below that. The detail donut shows the visible total; period ownership and independent legends are unchanged. |

`showTotal` defaults to false. Its visible sum is validated with the value formatter so custom-format failures remain recoverable. Percentage text follows the explicit locale; percentages and totals use the current visible-category denominator. Full raw values remain in native legends, tooltips and table actions even when a long center total is visually ellipsized.

## Visual comparisons

Each sheet compares desktop dark/light and 390 px dark/light examples for every variant. The capture matrix also records 320 px cards. `npm run capture:premium -- <running-demo-base-url> <output-directory>` reproduces the ready-state matrix with reduced motion in Chromium and rejects browser errors, page overflow and stale canvas sizing. Comparison sheets are visual evidence, not pixel-parity assertions. The [capture receipt](data/premium-visual-refinement.json) records browser/toolchain details, source/image digests, matrix coverage and state measurements.

| Family | Before | After |
| --- | --- | --- |
| Bars | [Before](captures/premium-refinement/before/bar.jpg) | [After](captures/premium-refinement/after/bar.jpg) |
| Lines | [Before](captures/premium-refinement/before/line.jpg) | [After](captures/premium-refinement/after/line.jpg) |
| Areas | [Before](captures/premium-refinement/before/area.jpg) | [After](captures/premium-refinement/after/area.jpg) |
| Pie/donut | [Before](captures/premium-refinement/before/pie.jpg) | [After](captures/premium-refinement/after/pie.jpg) |
| Composed | [Before](captures/premium-refinement/before/composed.jpg) | [After](captures/premium-refinement/after/composed.jpg) |
| Radar | [Before](captures/premium-refinement/before/radar.jpg) | [After](captures/premium-refinement/after/radar.jpg) |
| Radial | [Before](captures/premium-refinement/before/radial.jpg) | [After](captures/premium-refinement/after/radial.jpg) |
| Calendar | [Before](captures/premium-refinement/before/calendar.jpg) | [After](captures/premium-refinement/after/calendar.jpg) |
| Sankey | [Before](captures/premium-refinement/before/sankey.jpg) | [After](captures/premium-refinement/after/sankey.jpg) |
| Linked | [Before](captures/premium-refinement/before/linked.jpg) | [After](captures/premium-refinement/after/linked.jpg) |

Loading-state comparisons: [radial before](captures/premium-refinement/before/radial-error-390.png), [radial after](captures/premium-refinement/after/radial-error-390.png), [calendar before](captures/premium-refinement/before/calendar-loading-390.png), [calendar after](captures/premium-refinement/after/calendar-loading-390.png). At 390 px, the radial card now retains 310 px in ready/loading/error, calendar retains 876 px, and Sankey retains about 542 px. Their previous unavailable states collapsed to 114, 232 and about 176 px respectively.

Mobile flow details: [bounded tooltip](captures/premium-refinement/after/sankey-tooltip-edge-320.png), [scrolled final stages](captures/premium-refinement/after/sankey-scrolled-320.png), [all-hidden recovery](captures/premium-refinement/after/bar-all-hidden-320.png).

## Validation

The final `PLAYWRIGHT_PORT=4189 npm run check` passed using Node 24.22.2 and npm 11.19.1: formatting, 20 provenance tests, four demo-asset tests, production builds, strict compilation, 257 unit tests, isolated declaration/documentation consumers, SSR, 353 browser scenarios across Chromium/Firefox/WebKit, independently installed client/SSR runtime consumers and all bundle budgets. Four browser scenarios are expected skips because heap snapshots and real touch-swipe transport use Chromium CDP; their native interaction and cleanup coverage still runs in all engines. The final visual matrix covers 138 chart/width/theme states with zero browser errors or page overflow.

The new `premium-polish.spec.ts` scenarios cover stable geometry in both themes at 320/1440 px, unavailable controls, visible pie denominators and keyboard recovery, actual Sankey palette pixels, horizontal keyboard scrolling and the linked desktop/mobile layout. The mobile flow test also measures tooltip bounds at both ends of the scrollport in both themes; keyboard Arrow/Home/End and clearing on scroll are exercised in all engines. Focus recovery skips retained inert/disabled controls and targets the error message when a row disappears. Existing tests retain raw events, formatter containment, complete native values, import retry, deferred hydration, motion, focus and resource cleanup acceptance.

The area pixel probe now searches a bounded neighborhood for the nearest painted dashed segment instead of assuming every sample column is painted. Its signed stack order, fill-hit events and missing-gap assertions remain intact. The bar point probe now uses a connected painted interior with a two-channel-value tolerance for WebKit gradient dithering; its former median could land on a fractional hit-area boundary at a square stack join. Pointer/table raw-value equivalence remains required for every bar combination.

## Package cost

The combined compatibility-root measurement grows from rc.10’s 214,118 gzip / 183,208 Brotli bytes to 217,597 / 185,843: an increase of 3,479 / 2,635 bytes for the shared state shell, tooltip presentation and quantitative legends. Its explicit source budget is 218,000 / 186,000. The frame-only root retains zero reachable engine modules; its emitted orphan chunks grow from 200,118 / 172,486 to 201,395 / 173,611, with an allowance of 201,500 / 175,000. Focused family, core and demo route limits remain unchanged. Engine-family isolation assertions remain enforced.

## Review limits

Screenshots and automated checks do not replace human screen-reader interpretation or final release acceptance. The library remains private and experimental; existing archived candidates are not restamped or replaced. The visual review’s temporary blank plots were traced to a local server retaining a previous build manifest while output changed; restarting against matching assets restored a fresh mobile load. They are not recorded as a component defect.

## Combined candidate follow-up

The user subsequently requested verification of the combined Sankey/presentation source. All 264 recorded source digests matched before rc.11 metadata updates; afterwards only the library package version differs, and exact rc.11 declarations, fresh documented installation and six installed client/SSR modes pass. [Combined evidence](NG19_SANKEY_CHART.md#combined-presentation-verification-and-rc11) and the [rc.11 manifest](data/local-release-0.1.0-rc.11.json) preserve those results. The original rc.10 and earlier archives remain unchanged; human release gates stay pending.
