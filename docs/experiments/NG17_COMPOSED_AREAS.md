# NG17 composed areas

Date: 15 November 2026. The user authorized publishing the verified rc.21 archive, then implementing area/line composition. rc.22 adds the new contract while preserving rc.21 and all earlier archives. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Contract and implementation

`ComposedAreaSeries<T>` adds the area discriminator, optional smooth/showPoints booleans, gradient (default true) and named same-sign area stacks. Ordinary lines reject stack/fill settings; bars reject fill/curve settings. Stack names are nonempty unpadded strings. Bar and area stacks have separate internal namespaces, so matching public names cannot silently mix geometries. Areas sit behind bars/lines; all retain stable category centers and raw row/series identities.

Missing observations remain missing in their own series, zero remains observed, and other observed series stay available. A partial observed stack is not an invented complete total. Tables/tooltips/actions retain raw values; whole-area clicks use the existing nearest-observed-category decoder. Replacement options remove obsolete area/stack presentation when kind changes.

Area fill construction now lives in a pure internal core helper reused by standalone area and composed charts. Existing solid/gradient alpha behavior is preserved. No renderer, engine registration or dependency is added. The existing shared Line engine paints areas. This is original project code using the documented [ECharts areaStyle contract](https://echarts.apache.org/en/option.html#series-line.areaStyle); fixture/palette attribution and notice bytes remain intact.

## Verification

The full local workspace check passes: strict compilation, 326 library/playground unit tests, 19 publication guard tests, 20 Pages provenance tests, five asset tests, isolated declaration/documentation consumers, SSR, six client/SSR runtime modes and all 12 unchanged bundle budgets. New browser cases exercise real filled-interior clicks, raw signed/zero/missing observations, fill/kind replacement, legend/focus recovery and both area galleries at four widths in both themes. An initial invalid-fill fixture removed the hidden Mobile descriptor and correctly pruned its legend identity; the fixture now keeps IDs while invalidating the fill so recovery tests the intended case. Failed/pre-correction runs are excluded from passing evidence.

The composed suite passes 27 cases across Chromium, Firefox and WebKit. A subsequent strengthened case also passes in all three: clicking the upper stacked area emits raw `a/mobile/40/plot`, never cumulative 140. Its first Firefox attempt measured a canvas outside the viewport after a control scroll; explicitly scrolling before measurement corrected the test fixture. Failed attempts are excluded.

[Area benchmark](data/ng17-area-composed-benchmark.json): 200 categories × three series gives p95 mount 17.0 ms and update 16.8 ms, meeting the existing <=200 ms target on the recorded M2 Pro. The 2,000-category stress observations are mount 17.5 ms and update 32.9 ms; these are measurements, not portable guarantees. [Responsive captures](captures/composed-areas/manifest.json) record 16 images across four widths and both themes, with bounded tooltips and no browser/HTTP errors. The 320 px full-page light view and desktop dark view were inspected; controls, legends and labels fit.

rc.22 was prepared once after finalizing packaged content: `mantha911-ng-echarts-0.1.0-rc.22.tgz`, 163,966 bytes, SHA-256 `d1e9d2afdb720293ead15274b8302363b4dab86f14bf2d9c637f992b0e2f0a87`. Exact packaged consumers, full CI regression, sealed static verification and publication are pending until their actual results are recorded. Earlier archives/checksums must remain unchanged.

## Publication and automation

The [rc.21 registry receipt](public-rc21/registry-verification.json) records the preceding exact-artifact publication and fresh registry consumers independently. Area composition is not in that immutable archive. The manual trusted-publishing workflow requires a reviewed version/hash, a successful full CI run for the exact main commit and that run's verified release artifact. Registration and first OIDC execution must be recorded before claiming trusted publishing is active.
