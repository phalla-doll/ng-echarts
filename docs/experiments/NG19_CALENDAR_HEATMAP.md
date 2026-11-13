# NG19 calendar heatmap first increment

The user authorized calendar heatmaps after the demo-performance checkpoint. This bounded first increment adds the focused `/calendar` entry, `CalendarHeatmap<T>` and a site-aligned `/calendar` demo. The [API contract](../CALENDAR_HEATMAP_API.md) owns inputs, dates, missing values, scale and events. Sankey and broader calendar capabilities remain subsequent work.

## Contract and visual plan

A single explicit Gregorian year and maximum prevent silent timezone shifts, duplicate aggregation and changing color domains. Dates supply identity; null/omitted days remain missing, and real zeroes stay recorded/selectable. Native monthly tables provide exact values before hydration and equivalent keyboard actions.

The demo keeps Inter, the site's black/white surfaces (`#090909`, `#111111`, `#ffffff`), muted text (`#a3a3a3`, `#737373`) and emerald series colors (`#10b981`, `#047857`). Existing card radii, Code/Preview controls, 1 px demo focus indicators and hover states remain in use. The heatmap carries the visual emphasis. Content is left aligned: heading and short introduction, one activity card, compact year field, calendar, restrained scale and native daily-data disclosure, then optional data-state controls. The year strip becomes four quarter rows when the plot is narrower than 560 px.

The first screenshot review found the selector/selection text too close to the card edge and the initial breakpoint too wide for the established 640 px gallery column. Padding and the 560 px breakpoint were refined before the captures. No site-wide layout change was required.

## Acceptance checklist

- Strict padded date-only input; leap/century rules, duplicate/out-of-year/timestamp rejection.
- Explicit finite maximum; null/omitted/zero semantics; invalid data never clamped.
- Fixed four-interval scale, theme token refresh, escaped raw-value tooltips.
- One year strip or four inclusive disjoint quarters; resize/hidden previews.
- Native initial-HTML tables, keyboard/pointer raw events and original rows.
- Shared error/loading/empty precedence, formatting containment, retry and focus preservation.
- Dynamic reduced motion and 100 mount/dispose cycles in all three browsers.
- Strict isolated declarations and actual copied source; focused export/engine boundaries.
- Exact private candidate CSR/SSR consumers in all three engines, with earlier archives preserved.

## Verification record

`npm run check` passes: formatting, 20 Pages provenance tests, three demo-asset tests, production builds, strict TypeScript/templates, **235 unit tests** (222 library / 13 playground), strict isolated declarations and copied sources, documented installation/SSR, **308 browser scenarios with four expected skips**, all six installed client/SSR modes, and all eleven package-boundary/bundle budgets. The browser scenarios include 100 mount/dispose cycles per engine, real plot/table values, both themes at 320/390/768/1440 px, native no-JavaScript tables, DST/UTC+14 identity, skipped-date fallback/recovery, invalid/empty/loading/error states, source copying and failed-import focus recovery.

The final [capture manifest](captures/calendar/manifest.json) records eight theme/width screenshots and hashes for eleven source files. It also records the Pacific/Apia 2011 table fallback. Additional data/zero/empty/error captures exercise the 320 px layout. The [initial draft](captures/calendar/draft-390.png) and [refined dark](captures/calendar/dark-390.png)/[light](captures/calendar/light-390.png) views show the padding and layout refinement. No page overflow or browser errors occurred.

The focused calendar import measures **170,214 gzip / 145,540 Brotli bytes**, below the existing 200,000 / 175,000 focused-entry limits. It retains only Heatmap/helper chart modules, no eager ECharts modules, and no other library family entries. Core and compatibility-root budgets/engines remain unchanged.

Exact private candidate **0.1.0-rc.8** passes metadata/notices, strict declarations, fresh documented installation and all six installed CSR/SSR consumer modes. Its 63-file archive is **118,394 bytes**, SHA-256 `589b7273d26a4cbd112067b5a492205122db8ebe4835cac2801ae881da133371`; [the immutable candidate record](data/local-release-0.1.0-rc.8.json) contains the actual evidence. The earlier [rc.7 record](data/local-release-0.1.0-rc.7.json) and 117,476-byte archive (`8c72dafd5e36067f518a5aae164c4283ff83863b61194df5ee3dfd850e0b8115`) remain preserved, along with rc.0–rc.6. The package remains private. Human F09/R06/G2/G3/G4 remain pending.

Local Pages checks pass in all three engines: **33 prerendered routes and 127 sealed files**, including direct calendar reloads, native leap-day markup and zero-value actions. The [enforced performance record](data/calendar-demo-performance.json) passes all fifteen route payload budgets and five throttled mobile medians. Calendar measures **398,849 compressed bytes and 2.54 s** to its first visible plot (median of three cold 390 × 844 samples, 4× CPU, 150 ms latency, 200,000 bytes/s download), below its 445,000-byte / 5 s guards.

Adding the calendar changes shared demo chunk allocation: the bar route measures 444,852 compressed bytes against its unchanged 445,000-byte guard, with a 3.35 s first-visible median. The package's isolated focused-family budgets remain unchanged. These are local controlled measurements; the deployment command repeats sealed-source/output checks and the performance gate for the final clean, pushed commit. Publication does not close human release gates.

## Historical timezone correction

The installed ECharts 6.1.0 `parseDate` uses local date construction, as does Calendar. A `TZ=Pacific/Apia` probe confirmed that `2011-12-30` becomes December 31, while the pure library normalizer retains December 30. The [IANA source](https://github.com/eggert/tz/blob/main/australasia) records the skipped day. The browser now checks the complete year before drawing and falls back to exact native monthly tables with a status explanation when any date is unavailable locally. Table actions retain date/value/original-row identity; a supported year restores the canvas. rc.7 is preserved rather than repacked; rc.8 contains this correction and the completed packaged component index.
