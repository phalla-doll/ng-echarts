# GitHub Pages preview

The demo is published from the root of the dedicated `gh-pages` branch at **https://phalla-doll.github.io/ng-echarts/**. The branch contains compiled static assets, fonts and notices. Deployment publishes the current working-tree demo snapshot without committing or pushing the source branch.

## Build and verify

Use Node from `.nvmrc` and npm 11.19.1, with workspace dependencies installed through `npm ci`:

```sh
npm run build:pages
npm run check:pages
```

The `production,pages` build prerenders all 29 routes with base `/ng-echarts/`, retaining hydration metadata and lazy chart modules. Each route has a physical `index.html`, so direct links and refreshes work on static hosting. Router links/fragments preserve the repository prefix. The preparation step prefixes external font URLs in styles, inlined critical CSS and generated font preloads, and adds `.nojekyll`. The ordinary SSR build and measurement font paths remain available.

The checker serves the artifact under the real project prefix with no SPA fallback. Chromium, Firefox and WebKit verify direct routes, refreshes, the four MVP galleries, composed gallery and linked-chart flow, lazy assets/fonts, same-page fragments, skip-link focus, theme changes and mobile navigation.

## Publish an update

Authenticate GitHub CLI as a user with repository/Pages permissions, then run:

```sh
gh auth status
npm run deploy:pages
```

This builds and checks the demo before pushing a normal commit to `gh-pages`. Git history is preserved; the helper never force-pushes. Initial publication configures the Pages source to `gh-pages` at `/`; later deployments retain that setup. It refuses to replace a different existing Pages source. Credentials use normal Git/GitHub CLI authentication and are not written into the artifact.

Wait for GitHub's Pages deployment to finish, then verify the live site:

```sh
gh run list --workflow 'pages-build-deployment' --limit 3
node tools/check-pages.mjs https://phalla-doll.github.io/ng-echarts/
```

`preview-build.json` identifies the source base commit, build time and whether the snapshot includes working-tree changes. Source changes still need their own review/commit; pushing source alone does not refresh this manual preview. A different repository name requires changing the Pages `baseHref` and deployment target in the local configuration/helpers.

This publishes the experimental demo, not the library package. Deferred human interpretation, artifact licensing/release acceptance and registry publication remain separate.

## Initial deployment

Published 13 November 2026 from the current working-tree demo snapshot. Static commit: `9930a004ddf0f06f093d8e73d5a59127437a977c`. GitHub's [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43355274308) completed successfully; Pages reports `built`.

Verification passes locally and against the public URL in Chromium, Firefox and WebKit, including deep links/reloads, all galleries, lazy assets/fonts, fragments/focus, themes and mobile navigation. Related normal-SSR regression checks pass 30 browser scenarios and all 119 unit/integration tests, plus production build, strict compilation, formatting and `git diff --check`. The deployment bundle includes the adapted upstream MIT notice, generated third-party licenses and existing public font notices.

The subsequent source handoff passes the complete `npm run check`: 119 unit/integration tests, 145 browser scenarios plus two expected CDP-only skips, isolated declaration/documentation/client/SSR consumers, server markup and all seven bundle scenarios. The source review also resolves 576 local documentation links/anchors. CI now runs the static build/check after this regression, with a 25-minute job budget for the expanded lifecycle/consumer checks. The pie visibility test uses stable button locators and waits for each state update, removing the filtered-locator race observed in the previous `main` CI run.

## Visual refinement deployment

The [four-family visual audit](experiments/VISUAL_AUDIT.md) is live from source commit `cba873043f3cb27f88512bc202a465818ecd73bc`, with no working-tree changes in the published snapshot. Static commit: `8c8e410c5c1767d7fcb6e60827d1f90aa80c63af`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43360520301) succeeds and Pages reports `built`.

The full workspace regression passes 119 unit/integration tests and 160 browser scenarios plus two expected skips, installed consumers, SSR and seven bundle scenarios. All 24 static routes build, and local/live Pages checks pass in Chromium, Firefox and WebKit. The [live visual record](experiments/data/visual-audit-live.json) adds 32 family/theme/width combinations, 70 captures and 16 real-pointer tooltip-containment checks with no browser/HTTP errors. `preview-build.json` confirms the published source commit. The manual preview workflow remains unchanged.

## Comparison page alignment deployment

The [comparison alignment](experiments/COMPARISON_PAGE_ALIGNMENT.md) is deployed from clean source commit `6cffc35`. Static commit: `83aad71d1592250c5d3a53d90233012e9c879d44`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43364862604) succeeds. Normal comparison routes now share the site's navigation, page frame, typography and theme. Capture helpers use explicit `?reference=1` views to retain their measurement conditions.

[Live verification](experiments/data/comparison-page-live.json) passes for all four comparison families in both normal and reference modes across Chromium, Firefox and WebKit, with 22 additional live captures and no browser/HTTP errors. Local validation passes builds, strict compilation, 119 unit/integration tests, 42 targeted browser scenarios, the final 18 comparison scenarios, SSR, all 24 static routes and three-engine Pages checks. Historical full-regression counts above retain their original scope/date.

## Navigation icon deployment

The [navigation icon correction](experiments/VISUAL_AUDIT.md#navigation-icon-correction) is live from clean source commit `3f39bee`. Static commit: `412a63d916ed68f601824228f5386b74d0ceab52`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43366032389) succeeds. Build/strict compilation, nine gallery/navigation browser scenarios, all 24 static routes and local/live Pages checks pass in Chromium, Firefox and WebKit. Four additional live desktop/mobile icon captures have no page errors.

## Local-candidate documentation deployment

The demo now documents the private `0.1.0-rc.0` candidate and MIT license for original library code, alongside preserved third-party notices. Source commit: `6297f85`; static commit: `45e809b5d3dc018b505540b0d1fb3faeff853d6f`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43368528003) succeeds. The live installation page returns HTTP 200 with the new tarball filename/MIT statement, and local/live Pages checks pass in all three engines. This deploys documentation; the verified candidate remains local under `dist/releases/`, with [artifact evidence](experiments/NG16_LOCAL_RELEASE.md) and the [release checklist](RELEASE_CHECKLIST.md).

## NG17 composed preview update

The [Composed Blocks page](https://phalla-doll.github.io/ng-echarts/composed/) adds the shared-axis visits/trend demo and rc.1 installation guidance. All 27 routes are prerendered, including composed validation and benchmark fixtures. Source commit: `d5b8c49`; static commit: `9db1e7ddc36bf031d6fa22e3b354f2faf29f93ea`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43378390284) succeeds and `preview-build.json` identifies that clean source snapshot. Local/live Pages checks pass in all three engines. [NG17 evidence](experiments/NG17_COMPOSED_CHART.md) records the API, captures, timings, exact private rc.1 candidate and remaining human release gates.

## NG20 linked preview update

The [Linked Charts page](https://phalla-doll.github.io/ng-echarts/linked/) connects monthly visits to device share with plot/table/select actions, reset and a copyable integration example. The build prerenders 29 routes, including `/linked-validation`. Source commit: `ff4f555`; static commit: `b06fd5bb20c2ec780198606ae2c36d4047a0e6ec`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43380959584) succeeds and the preview marker identifies that clean source. Local/live checks pass in all three engines, including the new selection/detail/reload flow. [NG20 evidence](experiments/NG20_LINKED_CHARTS.md) preserves the targeted checks, screenshots, exact installed rc.1 consumer snapshot and deferred scope/human gates.

## Linked UI refinement preview

The [linked demo](https://phalla-doll.github.io/ng-echarts/linked/) now uses the compact Month filter, contextual Reset, concise totals and refined chart cards. The [before/after review](experiments/LINKED_UI_REFINEMENT.md) records visual and keyboard evidence. Source commit: `13d4e75`; static commit: `c948b4b1b4eea8f87fcd32ca274f48ece60ae353`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43382936023) succeeds; the preview marker identifies that clean source. Local/live checks pass in all three engines. This updates playground presentation; the private rc.1 library remains unchanged.

## Linked selection feedback delivery

The [linked demo](https://phalla-doll.github.io/ng-echarts/linked/) now reflects the selected month with full-color bars, a quiet category band, contextual description and a current native-table row. Reset clears feedback and returns focus to Month. Source commit: `330b618001771943383c07968a749d50d46c881a`; static commit: `daae8a1d1e518ae11ecd1cb8eeebb49d7a4fd9ce`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43386885216) succeeds and `preview-build.json` identifies that clean source. All 29 routes are prerendered; local/live checks pass in Chromium, Firefox and WebKit, including selected table state, reset/focus, reloads and mobile navigation. The [feedback review](experiments/LINKED_SELECTION_FEEDBACK.md) records before/after captures, full regression, exact private rc.2 evidence and the bounded combined-root Brotli allowance. Earlier release artifacts remain preserved; human release gates remain pending.

## Shared focus refinement delivery

The demo now uses a thin neutral focus outline across navigation, forms, buttons, chart-native controls and keyboard scroll regions, with inset indicators inside scrollable panels and system-color emphasis in forced-colors mode. Source commit: `642510295be7cdd97a7fefcc3f1f545c6bb6a89d`; static commit: `12a580dffff425fb6778d61ddd44eb4e5f5c1474`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43389471080) succeeds, and the preview marker identifies that clean source. Local/live Pages checks pass in all three engines, together with 162 live focus cases. The [review](experiments/FOCUS_REFINEMENT.md) preserves the reported ring, after captures, control coverage, immutable rc.2 checksum and the earlier WebKit sampler correction. Subsequent harness/delivery documentation changes do not alter the deployed styles.

## Hover and press refinement delivery

The [demo](https://phalla-doll.github.io/ng-echarts/) now uses role-specific hover/press feedback for buttons, icons, navigation, links, selectors and chart-native controls. Selected tabs, current navigation and hidden-series cues persist; coarse pointers avoid sticky hover. Source commit: `67dc83e87c6fc348c1ee3f052c50ba045b4dda18`; static commit: `5cae0054ebac6fb6909fdeb6ecedfa6cdc72b5d4`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43395464823) succeeds, and the marker identifies that clean source. All 29 routes are prerendered; local/live static checks pass in Chromium, Firefox and WebKit. The [hover review](experiments/HOVER_REFINEMENT.md) records 26 before/after captures, 78 targeted regression scenarios and 176 passing live interaction cases. The private rc.2 artifact and human release gates remain unchanged.

## Gallery tab spacing correction

The gallery Code/Preview controls now have equal widths, centered labels, compact gaps and vertically inset hover fills, with the selected indicator aligned to the header edge. Source commit: `3b5849de232878bd43b083443af6063cadcb7a1a`; static commit: `0d7ac355b932856b2630888782a0a79a29869ab2`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43398183808) succeeds and the marker identifies that clean source. All 29 routes are prerendered. Local/live static checks pass in all three engines, along with 120 gallery/theme/width geometry cases and 30 keyboard view-switch pairs. The [spacing review](experiments/HOVER_REFINEMENT.md#codepreview-tab-spacing-correction) preserves the user's report and reviewed desktop/mobile captures; the library artifact remains unchanged.

## Orbit e branding delivery

The demo now uses the selected Orbit e identity in its desktop/mobile headers, browser icons and Open Graph/Twitter previews. The repository README uses the same cover. Source commit: `d389fd48e50f9b4e69ce94dda1d23affb5b14df4`; static commit: `220415deeeab0f21095654cb06c0bedad5c4b3c0`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43401356607) succeeds and `preview-build.json` identifies that clean source snapshot.

All 29 routes are prerendered; local/live Pages checks pass in Chromium, Firefox and WebKit. All eight live brand assets match the source bytes. The [branding guide and evidence](BRANDING.md) include reproducible asset generation, 18 local and 18 live browser/theme/width cases, reviewed captures and the opaque Apple touch-icon correction. The 1200 × 630 social image is available at `https://phalla-doll.github.io/ng-echarts/og-image.png`. This demo deployment does not publish the library package or close human release gates.

## Native month-range preview

The [linked demo](https://phalla-doll.github.io/ng-echarts/linked/) now supports inclusive native From/To ranges, derived device-share totals and controlled multi-row bar/table feedback. Source commit: `a85c80efea57dc019abed690c505eb8a73445af9`; static commit: `195ff7801fd7ae4dca5690b96c6b2244e31b23d5`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43404190342) succeeds and the preview marker identifies that clean source. All 29 routes remain prerendered. Local/live checks pass in Chromium, Firefox and WebKit, including range initialization/totals/table feedback, Reset focus, reloads, fonts, themes and mobile navigation. The [range report](experiments/NG20_MONTH_RANGE.md) records visual comparisons, full regression, the exact private rc.3 artifact and remaining graphical-brush/human scope. Earlier artifacts and branding remain preserved.

## Navigation and catalog refinement delivery

The [demo](https://phalla-doll.github.io/ng-echarts/) now groups sidebar navigation into Documentation, Chart blocks, Tools, and Validation, with clearer hierarchy, spacing, active-page feedback, and an independently scrolling link area. The header uses a locally hosted, theme-aware GitHub SVG and theme toggle; the Angular version badge is removed. All five catalog illustrations share the green/rose palette.

Source commit: `e48a6a9d9d828b9b3304b9c8a077ce4fcb827757`; static commit: `bbbf500ea83221edeb69cd9ef24a3f624d681fcb`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43404894383) succeeds and `preview-build.json` identifies that clean source snapshot. All 29 routes remain prerendered; local/live Pages checks pass in Chromium, Firefox, and WebKit.

The [review](experiments/SIDEBAR_REFINEMENT.md) records responsive screenshots, source hashes, final code review, and regression evidence. The [live record](experiments/data/sidebar-refinement-live.json) confirms 18 browser/theme/layout or catalog cases, visible keyboard focus, navigation close/focus restoration, all five colored families, and byte-identical GitHub SVG/license assets, with no browser/HTTP errors. This deploys demo presentation and preserves private library artifacts and pending human release gates.

## Chart possibilities gallery

The subsequent [visual refinement](experiments/CHART_POSSIBILITIES_REFINEMENT.md) is deployed in static commit `7013ef14ca934713172cbf6db8895cc817f3771e`, with a [successful Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43418431739). It refines typography, spacing, filters, card alignment, table disclosures and narrow radar labels. Eight theme/width captures show no horizontal overflow, clipped filters or clipped radar labels; the published standalone source matches its reviewed hash. The original integration record below retains its initial scope.

The [Chart possibilities page](https://phalla-doll.github.io/ng-echarts/chart-possibilities/) presents twelve interactive proposals under **Tools → Chart possibilities**, following the shared site theme and responsive navigation. The approved [standalone gallery](https://phalla-doll.github.io/ng-echarts/concepts/chart-style-gallery.html) remains available separately and works offline when downloaded.

Static commit: `f115e3b5aa1b5bf8c76dde8d276bb7aa3ea81b61`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43408541801) succeeds and Pages reports `built`. The preview marker records source base `bee17763b4e434762a0d63975f751e65143f4c51` with working-tree changes; source changes remain uncommitted. The published HTML matches the reviewed standalone source byte for byte.

Local and live Pages checks pass in Chromium, Firefox and WebKit, including the new direct route, reloads, all twelve previews and the subpath-safe standalone link. The [integration record](experiments/CHART_POSSIBILITIES.md) includes 173 passing unit/integration tests, 18 passing targeted browser scenarios, strict compilation, 30 prerendered routes and desktop/mobile comparisons. The [live record](experiments/captures/chart-possibilities/live.json) preserves deployment identity and asset hash. These are demo concepts; private library artifacts and pending human release gates retain their scope.

## Graphical range selection preview

The [linked demo](https://phalla-doll.github.io/ng-echarts/linked/) now supports an explicit Select range mode with snapped pointer preview, release-only commit, synchronized native bounds and touch/keyboard equivalents. Committed feature source: `58e0fde5c9bb61a288100630044ba73ac64c9b12`; shared static commit: `03c0a8cdb8ab6154cf853b7a10a199e06a39b5e8`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43418949846) succeeds. The marker retains `includesWorkingTree: true` for the separate chart-possibility preview additions; the graphical range source itself is committed. The fresh shared artifact prerenders 30 routes and passes local/live checks in Chromium, Firefox and WebKit, including actual dragging, native/table feedback, focus, Reset/reload, fonts, fragments, themes and mobile navigation. The [graphical-range report](experiments/GRAPHICAL_RANGE_SELECTION.md) records visual comparisons, full/focused regression, exact rc.4 verification, the bounded root-size allowance and remaining human/scope limits.

## Treemap refinement deployment

The [chart possibilities gallery](https://phalla-doll.github.io/ng-echarts/chart-possibilities/) now uses tighter treemap dividers, muted family colors, a compact family key and complete labels at narrow widths; static starting badges are removed. Clean source commit: `30966733d11d4c289f5f6286feb28b6f87ae1f5d`; static commit: `937f504b69cbd0c95b649f33096609a8960a5dc5`. The [deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43424323023) succeeds and Pages reports `built`. The published document matches the source byte for byte. Full local/live Pages checks pass in Chromium, Firefox and WebKit, together with 24 focused live cases across all three browsers, both themes and four responsive widths. The [refinement record](experiments/CHART_POSSIBILITIES_REFINEMENT.md#treemap-refinement-deployment) preserves build identity, local verification and live evidence.
