# UI spacing and alignment review

Reviewed 12 November 2026 against `6b8a0a1`, following the user's request for a cleaner, more consistent interface. The approved EvilCharts-inspired neutral layout, Inter typography, and Heroicons remain the design direction.

## Findings and changes

At 1440 px, the playground title began at x=322 while the gallery, catalog, and formatting page began at x=382. At 1024 px, those pages used three different left edges. Mobile headings mixed 30/36 and 32/38 px type/line-height pairs. Copy controls, panel insets, toolbar spacing, and inspector sections also used separate dimensions.

Shared layout tokens in `site-controls.css` now govern page widths, gutters, top/bottom spacing, title size, header height, and panel radii. Gallery, documentation, playground, and utility pages use the same frame. The comparison header compensates for its fixture's existing 20 px inset while leaving the plot host in place.

| Element | Current rule |
| --- | --- |
| Page width | 1000 px maximum; 760 px at viewport widths ≤1250 px |
| Horizontal gutter | 48 px desktop, 32 px medium, 16 px at ≤600 px |
| Top / bottom padding | 48 / 80 px; 32 / 56 px at ≤600 px |
| Titles | 36/40 px desktop; 32/40 px at ≤600 px |
| Intro text | 14/24 px, 8 px below the title |
| Main section gaps | 48 px, reducing to 40 px on small screens |
| Panels | 8 px outer corners, 6 px inset corners, 4 px nested frame padding |
| Source blocks | 16 px padding; 40 px copy-tool rows |
| Compact actions | 32 px; navigation disclosure remains 40 px |

The gallery and docs share centered Copy Page controls and outline spacing. Chart-block titles, reload actions, preview controls, and integration snippets have consistent alignment. Catalog captions use equal padding and a 24 px grid gap. The sidebar uses consistent row gaps and 16 px default icons; the header theme action and navigation disclosure are vertically centered.

The playground's chart toolbar and settings heading share a baseline. Its inspector text aligns with the documentation outline. Settings move below the example at the same 1250 px breakpoint as the docs outline disappears. At 801–920 px, settings stack to keep controls readable while the desktop sidebar is present; a full-width tablet can retain the three-column panel. Code views, table toggles, state controls, and footer spacing follow the same panel rhythm.

## Measured alignment

The [before](captures/spacing-review/before-layout.json) and [after](captures/spacing-review/after-layout.json) records compare four representative routes:

| Viewport | Shared title origin after review |
| --- | --- |
| 1440 px | x=382, y=96 |
| 1024 px | x=278, y=96 |
| 390 px | x=16, y=88 |

Gallery and documentation Copy Page buttons now both measure 32 px high and center against the title. Responsive centering may naturally produce fractional container widths or positions; font sizes and line heights remain whole CSS pixels.

## Verification

Production client/server builds, strict TypeScript/templates, SSR checks, and all 48 unit/integration tests passed. The complete browser suite passed 79 scenarios across Chromium, Firefox, and WebKit (two CDP-only skips); after the final responsive adjustments, all 30 targeted gallery, playground, documentation, and comparison scenarios passed again. Formatting and documentation links/fences were checked.

The [responsive audit](captures/spacing-review/responsive-audit.json) records **288 observations**: all 12 routes at 320, 390, 768, 800, 801, 920, 921, 1024, 1250, 1251, 1440, and 1920 px in both themes. It found no page/panel overflow, title alignment or scale mismatch, menu-centering issue, or site typography issue. Code and explicit measurement plot hosts are excluded from the Inter check.

This increment changes demo presentation. Chart APIs, datasets, ECharts behavior, font assets, and official Heroicons geometry are unchanged. Comparison/benchmark plot typography and fixed measurement conditions stay isolated. The deferred human screen-reader review remains deferred and no release gate is reclassified.

## Visual evidence

The [capture manifest](captures/spacing-review/manifest.json) records viewport, theme, motion, browser, dimensions, and source/image hashes. All after captures use the production SSR build. Earlier captures remain historical.

- Gallery: [dark](captures/spacing-review/gallery-dark.png), [light](captures/spacing-review/gallery-light.png), [mobile](captures/spacing-review/gallery-mobile.png).
- Catalog: [before](captures/spacing-review/components-before.png), [after](captures/spacing-review/components-dark.png), [mobile](captures/spacing-review/components-mobile.png).
- Playground: [before](captures/spacing-review/playground-before.png), [dark](captures/spacing-review/playground-dark.png), [light](captures/spacing-review/playground-light.png), [tablet](captures/spacing-review/playground-tablet.png), [narrow sidebar layout](captures/spacing-review/playground-narrow.png), [mobile](captures/spacing-review/playground-mobile.png), [code](captures/spacing-review/playground-code.png).
- Docs and tools: [mobile docs before](captures/spacing-review/get-started-mobile-before.png), [mobile docs after](captures/spacing-review/get-started-mobile.png), [formatting](captures/spacing-review/formatting-dark.png), [comparison header](captures/spacing-review/comparison.png), [mobile navigation](captures/spacing-review/navigation-mobile.png).
