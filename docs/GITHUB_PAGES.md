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
