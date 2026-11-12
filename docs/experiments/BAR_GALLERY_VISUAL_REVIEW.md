# Bar gallery visual correction

Reviewed 12 November 2026. The user selected the existing bar charts for the first correction after the [area-block reference audit](AREA_BLOCKS_VISUAL_AUDIT.md). This implements the gallery direction without introducing area rendering or changing the chart-library API.

This report records the gallery increment at `b5f5801`. The subsequent [site alignment](SITE_THEME_ALIGNMENT.md) extends its styling to all pages and replaces the independent gallery/workbench themes with one shared preference. Original captures and test counts below describe the earlier snapshot. A subsequent user-requested refinement removes the data-table toggle from all four gallery previews and their generated source through `[showDataTable]="false"`. Datasets remain in Code; library defaults, playground tables, and validation fixtures retain table actions. Gallery browser checks now verify the toggle is absent in SSR and hydrated output, while plot events, legends, copying, and reload remain usable. Updated [desktop](captures/gallery-table-removal/dark-desktop.png) and [mobile](captures/gallery-table-removal/dark-mobile.png) captures show the shorter preview; the [manifest](captures/gallery-table-removal/manifest.json) records source hashes and capture conditions. Verification for this refinement passed production builds, strict compilation, 52 unit/integration tests, packed declarations, SSR, 85 browser scenarios (two CDP-only skips), isolated client/SSR runtime consumers, and the linked-package size budget (178,558 gzip / 152,753 Brotli bytes).

## Design and result

The home route `/` now presents a neutral chart-block gallery. The original settings workspace remains at `/playground`; `/comparison`, `/formatting`, `/validation`, and the other engineering fixtures remain available separately.

The reference page's visual hierarchy guides the layout: Inter typography, near-black surfaces, restrained borders, named examples, compact Code/Preview headers, summary values, and an integration snippet below each preview. The palette uses canvas `#0a0a0a`, inset chrome `#111111`, border `#222222`, text `#f5f5f5`, and muted text `#a3a3a3`; green/rose/blue identify the existing data series. The light theme uses white surfaces and neutral gray borders.

At 1440×1000, the heading begins at approximately x=382/y=92, versus x=380/y=92 on the inspected reference, and the example width is 640 px. The page heading is 36 px/40 px and block headings are 20 px/28 px. On narrow screens, the page outline is removed and navigation becomes a keyboard-accessible disclosure. The gallery fits 320, 390, 768, and 1440 px viewport widths in both themes.

Four examples compose the existing attributed fixtures: Device Visits, Stacked Comparison, Gradient Fills, and Horizontal Comparison. Summary totals are calculated from the supplied rows, not invented metrics. Native legend toggles, table point actions, plot events, and state handling remain operational. Required native controls make the first preview taller than the reference area preview; these bar-specific differences are intentional. Gallery styles are scoped away from comparison/benchmark geometry and the library's packaged styles.

Code and Preview are native pressed buttons. Switching views keeps chart state; reload resets one example. Page/example copy actions handle unavailable clipboard access, and generated examples include their actual datasets, typed series, theme, layout, and fill options. The snippet panel shows a real local Angular import. The package remains private and unpublished.

Inter is locally hosted as a 47 KiB Latin variable WOFF2, downloaded from the [official Google Fonts distribution](https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap); its full [SIL Open Font License](../../projects/playground/public/fonts/INTER-OFL.txt) is included. Non-Latin text can use the system fallback. The earlier Instrument Sans assets remain for the historical workspace record. No new npm dependency is required.

## Captures

Final [capture manifest](captures/bar-gallery/manifest.json) records Chromium, viewport dimensions, reduced motion, device scale, local font loading, and source/image hashes.

| View | Captures |
| --- | --- |
| Desktop 1440×1000 | [Dark](captures/bar-gallery/dark-desktop.png), [light](captures/bar-gallery/light-desktop.png), [code](captures/bar-gallery/code-desktop.png) |
| Mobile 390×844 | [Dark](captures/bar-gallery/dark-mobile.png), [light](captures/bar-gallery/light-mobile.png), [navigation](captures/bar-gallery/mobile-navigation.png) |
| Additional widths | [320 px](captures/bar-gallery/dark-small-mobile.png), [900 px tablet](captures/bar-gallery/dark-tablet.png) |

Full-page captures extend vertically to include all four examples. The [original user reference](captures/area-reference/user-reference.png) and [live reference](captures/area-reference/live-reference-desktop.png) remain attached to the audit.

## Verification

Run `npm run check`. The packed declaration check additionally compiles the eight generated gallery components (four variants × two themes) against the installed production tarball with strict templates and `skipLibCheck: false`.

New three-engine browser scenarios cover server markup and four-instance hydration, code/preview state, copy success/failure, reset, themes, raw plot/table events, narrow layouts, mobile navigation, and resource cleanup between gallery, playground, and cleanup routes. Existing workbench tests now target `/playground`; skip/settings links use the correct route rather than resolving against the document base. The isolated client server serves WOFF2 with the correct MIME type. The production build, strict compilation, 48 unit/integration tests, packed declaration checks (including all eight generated examples), SSR, and 64 browser scenarios passed (22 Chromium, 21 Firefox, 21 WebKit; two CDP-only skips). The complete `npm run check` passed, including isolated production client/SSR builds and runtime checks in all three engines. The linked bar package remains 178,402 gzip / 152,619 Brotli bytes within unchanged 200,000/175,000 budgets; the library source is unchanged.

The existing bar renderer and comparison fixtures are unchanged. This correction does not claim area-chart parity, additional chart-family acceptance, or a completed human listening review. R06 remains deferred by the user; NG09 package boundaries and the remaining MVP families remain open.
