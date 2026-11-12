# Documentation and tool-page alignment

Reviewed 12 November 2026. Baseline: `b5f5801`. The user approved the neutral bar gallery and requested the same aesthetic across the rest of the site, referencing [EvilCharts documentation](https://evilcharts.com/docs/echarts/), which resolves to its [Components index](https://evilcharts.com/docs/echarts/components).

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

## Measurement boundaries

The comparison chart retains its own explicit theme control, data, CSS tokens, 16 px system typography, and review host widths. Its explanatory copy now makes the independent reference theme clear. The benchmark chart retains a fixed 768 px host and its reference theme; an outer scrolling region keeps narrow pages usable without shrinking that host. These fixture settings are separate from the site's theme. The public chart-library API, renderer, models, and packaged styles are unchanged.

## Verification and evidence

The 30 targeted gallery, workbench, formatting, and new site-page scenarios passed across Chromium, Firefox, and WebKit. They cover copy success/denial, truthful availability, navigation between documentation pages, shared theme persistence, theme changes before deferred hydration, keyboard navigation, and 320/768/1440 px widths in both themes.

The full check also compiles the actual quick-start component alongside all eight gallery examples against an independently installed production tarball, using strict templates and `skipLibCheck: false`. Production builds, strict compilation, 48 unit/integration tests, the nine copied component examples, SSR checks, and 73 browser scenarios passed (25 Chromium, 24 Firefox, 24 WebKit; two CDP-only skips). The complete `npm run check` passed, including isolated client/SSR production builds and runtime checks in all three engines, with no component-style budget warnings. After final reference-header styling, all 15 comparison/site-page scenarios passed again. The linked library remains 178,402 gzip / 152,619 Brotli bytes within unchanged 200,000/175,000 budgets. A separate `npm run benchmark:bar` rerun passed after the responsive measurement wrapper: normal Angular 200×3 mount/update p95 is **17.40/17.50 ms**, within the existing 200 ms target. Stress 2000×3 mount/update p95 is **39.80/69.10 ms**. See the [R07 method and limits](R07_RENDERER_COST.md) and [raw samples](data/bar-benchmark.json).

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
