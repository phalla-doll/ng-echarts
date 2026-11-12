# Documentation and tool-page alignment

Reviewed 12 November 2026. Baseline: `b5f5801`. The user approved the neutral bar gallery and requested the same aesthetic across the rest of the site, referencing [EvilCharts documentation](https://evilcharts.com/docs/echarts/), which resolves to its [Components index](https://evilcharts.com/docs/echarts/components).

The later [UI spacing review](UI_SPACING_REVIEW.md) records the current shared layout tokens, responsive alignment, and refined control/panel spacing. The original captures and measurements below describe their recorded baselines.

The [code presentation follow-up](CODE_PRESENTATION_REVIEW.md) adds Google Sans Code, syntax colors in both themes, and corrected text copy controls.

## Implemented pages and design

The shared shell now uses the approved Inter typography, near-black canvas (`#0a0a0a`), inset surfaces (`#111111`), restrained borders (`#222222`), white text (`#f5f5f5`), and muted text (`#a3a3a3`) on every route. The light palette uses white and neutral grays. Navigation, active links, the compact header, focus indicators, switches, toolbars, code panels, and chart frames share the same styling. The former blue workspace treatment has been removed.

There is one dark-by-default, session-only theme signal. The header control applies across the gallery, documentation, playground, and validation tools, and survives client-side navigation. A fresh document starts deterministically in dark mode; no browser-only storage read affects SSR. Utility and deferred charts receive the shared theme through normal inputs. Theme changes refresh the plot and native controls without remounting the chart.

| Route | Content |
| --- | --- |
| `/get-started` | Angular overview, a complete standalone bar example, supported behavior, and current project status |
| `/installation` | Locked toolchain, workspace setup on port 4310, local tarball consumption, and development commands |
| `/components` | Illustrated catalog with a working bar-chart link; line, area, and pie/donut clearly marked planned and noninteractive |
| `/playground` | Existing chart settings with neutral controls, frames, and source views |
| `/formatting`, `/updates`, `/validation`, `/retention`, `/away` | Existing fixtures in the shared documentation layout |
| `/comparison`, `/benchmark` | Shared navigation and chrome around deliberately separate measurement fixtures |

Documentation uses the gallery's 640 px reading column and optional page outline, with matching headings, code blocks, copy actions, and previous/next navigation. Small screens use a single content column and the existing keyboard-accessible navigation disclosure. Long source blocks scroll within their panel. Desktop navigation can scroll independently on short windows.

The catalog illustrations and documentation text are new code/content. They do not implement the planned chart families. Package guidance describes the actual private workspace/tarball workflow and does not imply a public npm package. The quick-start example reuses the first two rows of the previously attributed monthly fixture.

## Inter clarity follow-up

The user subsequently requested Inter with whole-pixel rendering. Site prose, controls, block labels, and metrics now use the existing local Inter face; code remains monospace. Font sizes, line heights, and explicit tracking use whole CSS pixels. Fractional line heights such as 18.7 px and 25.3 px have been replaced with explicit integer values. The unused Instrument Sans declaration and forced WebKit smoothing override were removed so browser-native text antialiasing applies. Font synthesis is disabled for site text.

The bar browser adapter now reads the inherited family, waits for its initial 12 px face alongside the lazy renderer import, and passes it to axis text and HTML tooltips. The library remains font-independent and packages no Inter asset. Font-request failure permits the fallback stack; existing generation/disposal checks prevent late initialization after navigation. See [FontFaceSet.load](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load) for the font-loading boundary.

Whole CSS pixel sizing does not force every glyph advance or curved outline onto physical pixel boundaries. Display density, browser zoom, font metrics, and native antialiasing still govern rasterization; see [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio). Responsive widths and user zoom remain available. Comparison/benchmark system typography is now scoped to the actual plot hosts, with Inter on their surrounding pages.

The [typography audit](captures/inter-typography/typography-audit.json) records all 12 routes at 390 and 1440 px widths, excluding code and explicit measurement plot hosts. Captures: [gallery dark](captures/inter-typography/gallery-dark.png), [light](captures/inter-typography/gallery-light.png), [2× density](captures/inter-typography/gallery-retina.png), [mobile](captures/inter-typography/gallery-mobile.png), [Components](captures/inter-typography/components-dark.png), and [playground](captures/inter-typography/playground-dark.png). The [manifest](captures/inter-typography/manifest.json) records capture conditions and hashes. Earlier captures below remain historical.

The complete `npm run check` passed: production library/client/server builds, strict compilation, 48 unit/integration tests, all nine copied examples, SSR, 79 browser scenarios (27 Chromium, 26 Firefox, 26 WebKit; two CDP-only skips), and isolated client/SSR consumers in all three engines. The linked package is 178,495 gzip / 152,713 Brotli bytes within unchanged budgets. Six new browser scenarios hold the font response until the renderer requests it, assert that no Canvas initializes early, then inspect actual Canvas text paints, tooltip typography, and native-density backing dimensions at 1× and 2× in every engine. The 24-route/viewport typography audit reports no issues.

The preceding commit's CI run also revealed a Firefox timing dependency in the deliberately held renderer-import test: waiting for page `load` could wait for the very request the test had withheld. That navigation now waits for `domcontentloaded`; the destruction and late-import assertions remain intact. The corrected case passed three repetitions in each browser.

## Heroicons follow-up

The user selected [Heroicons](https://heroicons.com/) for the demo. `SiteIcon` now renders a pinned subset of 15 official v2.2.0 outline icons through native Angular SVG paths. The 24×24 view box, 1.5 stroke, rounded caps/joins, and `currentColor` are preserved. Existing display dimensions and action labels remain; decorative icons are hidden from assistive technology and explicitly nonfocusable. See the [source mapping and MIT notice](../UPSTREAM_PROVENANCE.md#demo-site-icons-heroicons). The chart-library package and chart illustration artwork are unchanged.

Production browser/server builds, strict compilation, SSR checks, formatting, and all 48 unit/integration tests passed, along with all 24 existing gallery, playground-layout, and site-page scenarios across Chromium, Firefox, and WebKit. These exercise theme changes, copy/reset feedback, mobile navigation, keyboard use, responsive layout, and hydration. Visual inspection confirmed the icons in [dark](captures/heroicons/gallery-dark.png), [light](captures/heroicons/gallery-light.png), and [mobile navigation](captures/heroicons/mobile-navigation.png) views. The [capture manifest](captures/heroicons/manifest.json) records geometry, conditions, source/image hashes, and an attribute audit of all 37 rendered icon instances.

## Measurement boundaries

The comparison chart retains its own explicit theme control, data, CSS tokens, 16 px system typography, and review host widths. Its explanatory copy now makes the independent reference theme clear. The benchmark chart retains a fixed 768 px host and its reference theme; an outer scrolling region keeps narrow pages usable without shrinking that host. These fixture settings are separate from the site's theme. At the initial site-alignment baseline, the public chart-library API, renderer, models, and packaged styles were unchanged; the subsequent typography follow-up adds inherited Canvas/tooltip font resolution as described above.

## Initial site-alignment verification and evidence

The 30 targeted gallery, workbench, formatting, and new site-page scenarios passed across Chromium, Firefox, and WebKit. They cover copy success/denial, truthful availability, navigation between documentation pages, shared theme persistence, theme changes before deferred hydration, keyboard navigation, and 320/768/1440 px widths in both themes.

The full check also compiles the actual quick-start component alongside all eight gallery examples against an independently installed production tarball, using strict templates and `skipLibCheck: false`. Production builds, strict compilation, 48 unit/integration tests, the nine copied component examples, SSR checks, and 73 browser scenarios passed (25 Chromium, 24 Firefox, 24 WebKit; two CDP-only skips). The complete `npm run check` passed, including isolated client/SSR production builds and runtime checks in all three engines, with no component-style budget warnings. After final reference-header styling, all 15 comparison/site-page scenarios passed again. At that baseline, the linked library was 178,402 gzip / 152,619 Brotli bytes within unchanged 200,000/175,000 budgets. A separate `npm run benchmark:bar` rerun passed after the responsive measurement wrapper: normal Angular 200×3 mount/update p95 is **17.40/17.50 ms**, within the existing 200 ms target. Stress 2000×3 mount/update p95 is **39.80/69.10 ms**. See the [R07 method and limits](R07_RENDERER_COST.md) and [raw samples](data/bar-benchmark.json).

The [R06 human review](R06_MANUAL_REVIEW.md) remains deferred by the user and does not block development. This styling/documentation increment does not close NG09 package boundaries, additional chart-family acceptance, or release gates.

## Visual captures

The [manifest](captures/site-theme/manifest.json) records viewports, themes, browser, reduced motion, local font loading, image dimensions, and source/image hashes. Desktop captures use 1440×1000; mobile captures use 390×844 with full-page height where applicable. The development preview may eagerly load deferred dependencies under HMR; production hydration assertions are separate.

| View | Captures |
| --- | --- |
| Components | [Reference](captures/site-theme/reference-components.png), [dark](captures/site-theme/components-dark.png), [light](captures/site-theme/components-light.png), [mobile](captures/site-theme/components-mobile.png) |
| Setup docs | [Get Started](captures/site-theme/get-started-dark.png), [Installation](captures/site-theme/installation-dark.png), [mobile Installation](captures/site-theme/installation-mobile.png) |
| Playground | [Dark](captures/site-theme/playground-dark.png), [light](captures/site-theme/playground-light.png), [mobile](captures/site-theme/playground-mobile.png) |
| Tools | [Formatting](captures/site-theme/formatting-dark.png), [lifecycle](captures/site-theme/validation-dark.png), [updates](captures/site-theme/updates-dark.png), [retention](captures/site-theme/retention-dark.png), [cleanup](captures/site-theme/cleanup-dark.png) |
| Measurement and navigation | [Comparison](captures/site-theme/comparison-reference.png), [benchmark](captures/site-theme/benchmark-dark.png), [mobile menu](captures/site-theme/navigation-mobile.png) |
