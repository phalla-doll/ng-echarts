# Chart possibilities gallery

The subsequent [visual refinement](CHART_POSSIBILITIES_REFINEMENT.md) records the user's requested spacing/UI polish and new screenshots; the original evidence below retains its initial scope.

The user approved the standalone HTML gallery and requested adding it to the demo. The `/chart-possibilities` route makes all twelve examples available under **Tools → Chart possibilities**, with the site's navigation, shared theme and an **Open standalone gallery** link.

## Scope and implementation

The original [HTML gallery](chart-style-gallery.html) is the single source for both versions. Angular copies that exact file to `concepts/chart-style-gallery.html` during normal and GitHub Pages builds. The site embeds the trusted local document after hydration; embedded mode removes its duplicate header/introduction and exchanges theme, content height and recommendation-anchor messages with its same-origin parent. Both sides validate message origin and source. The Angular wrapper registers its browser listener after rendering and removes it on destruction. Navigating away destroys the document and its charts.

The document embeds ECharts 6.1.0, Inter, deterministic illustrative data and the upstream licenses/notices. Its full engine remains inside the concept document, outside the Angular library and the existing chart renderer chunks. All twelve concepts retain filters, data tables, tooltips, scatter/bubble modes and theme support. The standalone version retains its own header, theme toggle and offline behavior.

The proposals are calendar heatmap, waterfall, scatter/bubble, bullet/target bars, dumbbell, Sankey, treemap, radial progress, radar, KPI sparklines, 100% stacked bars and ranked lollipop. Copy and navigation identify this as a concept gallery. It does not add library components, publish a package or close deferred human interpretation/release gates.

## Validation

Local validation passes on Node 24.22.2 and npm 11.19.1:

- Production library/playground builds and strict TypeScript/template compilation.
- All 173 unit/integration tests (163 library and 10 playground).
- All 18 targeted browser scenarios in Chromium, Firefox and WebKit: the three new concept-gallery scenarios and the three existing bar-gallery scenarios per engine. Checks include server output, hydration, filters and bubble mode, keyboard table access, theme synchronization, reloads, standalone offline interaction, navigation/teardown and 320/390/768/1440 px geometry in both themes.
- GitHub Pages build prerenders 30 routes. The expanded `check:pages` passes all three engines with `/chart-possibilities/` direct loads/reloads and the subpath-safe standalone document, alongside the existing galleries, linked charts, fonts and navigation checks.
- Visual review of desktop/mobile in both themes, with no browser errors. The [capture manifest](captures/chart-possibilities/manifest.json) records the source hash and screenshot dimensions.
- Repository formatting, `git diff --check` and 157 local links/anchors across the four initially affected documents pass. Additional delivery links were verified after recording deployment.

The first Firefox run exposed an embedded-font startup race during reload/navigation. Rendering now waits for Inter to finish loading, and the iframe source starts after parent hydration. The corrected three-engine run passes without console or page errors. The existing 4.07 kB bar stylesheet retains its pre-existing 4 kB warning; no budget is changed.

## Visual comparison

| Approved standalone | Integrated desktop | Integrated mobile |
| --- | --- | --- |
| [Dark, 1440 px](captures/chart-possibilities/standalone-dark-1440.png) | [Dark, 1440 px](captures/chart-possibilities/integrated-dark-1440.png) | [Dark, 390 px](captures/chart-possibilities/integrated-dark-390.png) |
| Same chart compositions | [Light, 1440 px](captures/chart-possibilities/integrated-light-1440.png) | [Light, 390 px](captures/chart-possibilities/integrated-light-390.png) |

## Deployment

The [live page](https://phalla-doll.github.io/ng-echarts/chart-possibilities/) is deployed in static commit `f115e3b5aa1b5bf8c76dde8d276bb7aa3ea81b61`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43408541801) succeeds; Pages reports `built`. The source marker records base commit `bee17763b4e434762a0d63975f751e65143f4c51` plus working-tree changes. Source changes remain uncommitted.

Live `check:pages` passes Chromium, Firefox and WebKit, including the new page and the existing gallery/linked/navigation checks. The standalone HTML fetched from the public URL matches the source byte for byte. The [live record](captures/chart-possibilities/live.json) retains the marker, deployment and SHA-256 identity.

## Final source checkpoint

At gallery checkpoint `fa21a04`, the formatted standalone document had SHA-256 `a7bb2fabadd7d0faabfb19a0aa24e98fc7d2b46a4db255ebf52f6fec015ab4dd`; its revision query is synchronized to `a7bb2fabadd7`. The embedded engine is byte-identical to the pinned installed ECharts 6.1.0 bundle. Earlier screenshots/manifests retain their historical source identities; current gallery browser checks and clean-commit deployment evidence are recorded in the [hardening report](PREVIEW_DEPLOYMENT_HARDENING.md). Original working-tree deployment statements above describe the earlier snapshots. The private rc.4 library artifact and deferred human release gates remain unchanged.
