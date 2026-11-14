# NG19 Sankey first increment

The user requested the next development increment after calendar rc.8. Sankey is the next unimplemented NG19 family in the backlog. This increment implements a focused `/sankey` entry and matching visitor-journey demo. [The API](../SANKEY_CHART_API.md) owns the bounded contract. Public publication and human F09/R06/G2/G3/G4 remain pending.

## Contract and parity checklist

- Original typed node/link contracts, independent stable IDs and preserved original objects in discriminated events.
- Directed acyclic topology, including zero edges; reject duplicate IDs/pairs, dangling references, self-links, invalid weights, overflow and unsupported numeric range before ECharts receives data.
- Positive ribbons encode relative weights; separate incoming/outgoing totals make imbalances explicit without a double-counted graph total.
- Empty, zero-only and isolated-node states; zero/isolated observations have native actions without fabricated visible weights.
- Full labels/raw values in escaped tooltips and native tables, theme refresh, formatter errors and shared error/loading precedence.
- Initial SSR/no-JavaScript native disclosures, Enter/Space equivalence, focus preservation, update/reordering and explicit application selection ownership.
- Browser-only lazy Sankey/Tooltip/Canvas registration, hidden preview resize/recovery, reduced motion, failed imports/retry and 100 mount/dispose cycles per engine.
- Focused entry/root isolation, strict external consumers, actual copied light/dark source, negative template bindings and exact private candidate checks.
- Both themes at 320/390/768/1440 px, contained horizontal diagram scrolling, native tables and deployment-route/performance coverage.

## Design and source review

Retain the existing Inter type, black/white surfaces (#090909, #111111, #ffffff), muted labels (#a3a3a3, #737373), emerald palette (#10b981, #047857), card radii, Code/Preview and disclosure controls. Left-aligned title and one flow card keep the diagram dominant. The illustrative visitor graph distinguishes arrivals, processing stages and outcomes. It does not copy the concept gallery dataset or claim pixel parity with it. Node labels truncate to preserve column spacing; the full text remains available through tooltips and tables. Narrow layouts scroll the diagram independently of the page.

The first narrow browser check exposed a grid item minimum-content width that expanded the page. The Sankey gallery section now permits shrinking; the diagram retains its deliberate minimum width inside the scroll region. Settled desktop/mobile screenshots are reviewed separately from initial animation frames.

The [Apache options reference](https://github.com/apache/echarts-doc/blob/master/en/option/series/sankey.md) describes acyclic flow, ordering with zero layout iterations and draggable nodes. Installed ECharts 6.1.0 `lib/chart/sankey/{sankeyLayout,SankeySeries,SankeyView}.js` confirms max(incoming,outgoing) node sizing, node/edge payloads and Canvas rendering. This component disables dragging and implements its own native semantic surface, validation, fixtures, option construction and tooltip text; no upstream source/example body is copied. Existing peer dependency and notice bytes remain unchanged.

## Verification record

Workspace validation passes: formatting, 20 Pages provenance tests, four demo-asset tests, production library/playground builds, strict TypeScript/templates, **254 unit tests** (241 library / 13 playground), strict installed declarations and actual copied light/dark examples, per-binding invalid node/link template assertions, fresh documented installation/SSR, **326 browser scenarios with four expected skips**, all six installed client/SSR modes, and all twelve package-boundary/bundle budgets.

The combined `npm run check` reached installed runtime verification after its complete browser suite passed. Its initial new fixture step interrupted an in-flight Angular calendar navigation with a full-page load, producing an opaque console error. Diagnostics now retain the URL, source location and available error arguments. The fixture navigates to Sankey, waits for the plot, then reloads the settled route before asserting CSR/SSR markup. The corrected `check:runtime` and remaining `check:bundle` stages pass independently; no product behavior or console assertion was weakened. Earlier workspace stages required no code changes or repeat runs.

Sankey checks cover real node/ribbon clicks and keyboard actions, original typed identity, raw and recorded-zero values, doubled/reordered links, error/loading/empty/zero recovery, hidden preview recovery, initial no-JavaScript tables and failed-import retry with focus recovery. Each browser completes 100 mount/dispose cycles and navigation with zero remaining chart observers, motion/focus listeners or animation frames. The motion boundary unit check covers initial/changed reduced-motion preference and explicit animation disabling without recreating the renderer.

The [capture manifest](captures/sankey/manifest.json) contains eight theme/width views at 320/390/768/1440 px, plus narrow native zero-action/zero-only/empty/error evidence in both themes. Eleven source hashes identify the component/model/options/browser/renderer and demo files. The [dark desktop](captures/sankey/dark-1440.png), [dark mobile](captures/sankey/dark-390.png) and [light native data](captures/sankey/light-320-data.png) views were inspected. No page overflow or browser errors occurred. Diagram scrolling stays within its named region; native tables retain their complete values.

The focused entry measures **166,977 gzip / 142,727 Brotli bytes**, under unchanged 200,000 / 175,000 limits. [Package boundaries](data/package-boundaries.json) retain only Sankey/helper chart modules and Canvas, with no eager engine, Cartesian/Grid/SVG renderer, unrelated family entry, React or demo dependencies. At rc.9, core and compatibility-root budgets and engine families remained unchanged; the rc.10 aggregate compression tradeoff is recorded below. Exact private-candidate verification is recorded separately below.

## Exact private candidate

**0.1.0-rc.9** passes metadata/notices, strict installed declarations (including the actual copied light/dark examples and invalid node/link bindings), the fresh documented installation and all six installed client/SSR modes. Every stage uses the same **131,955-byte, 68-file** archive, SHA-256 `fd2a6212db99e30112f844cad12b1485836a0a7cd2820724784557b318baa4f4`. [The immutable candidate record](data/local-release-0.1.0-rc.9.json) contains the actual consumer evidence and pending human/G4 statuses. Retained rc.0–rc.8 archives were independently hashed against their prior records; all remain unchanged.

## Static preview verification

The guarded local pipeline is `npm run build:pages`, `npm run check:pages` and `npm run check:demo-performance`. It adds `/sankey/` to the prerendered routes, checks initial node/link and zero-value markup, direct reloads and native selection in all three engines, and adds the route to the existing 445,000-byte / 5 s controlled mobile guards. Existing route, focused-entry and core limits are unchanged; the compatibility-root aggregate allowance is recorded below.

After tracked source/evidence updates, this pipeline creates its sealed build inventory and three-browser receipt in ignored `dist/pages/browser/preview-build.json` and `dist/pages/pages-verification.json`, and detailed route samples in ignored `dist/demo-performance.json`. These final local files record their actual results and source identity. No source or output is changed between those checks. Publication still requires a clean, pushed commit and the guarded deployment command; that initial phase performed local verification only; the subsequent public deployment is recorded below.

## Lazy engine loading correction

The first rc.9 Pages build passed static browser checks but failed the unchanged bar payload guard: 455,315 compressed bytes versus 445,000. Its multi-family bundle grouped Sankey classes/layout with other ECharts chart-barrel exports in a shared chunk. Isolated package budgets did not expose this application-level coupling.

rc.9 remains unchanged. The subsequent rc.10 uses ECharts 6.1.0's explicitly exported `echarts/lib/chart/{bar,line,pie,radar,heatmap,sankey}` entries inside the existing lazy renderer modules. Those public entries call the same ECharts installers; shared Grid/Tooltip/Canvas registration and every component/options/event/lifecycle contract remain unchanged. Changing only Sankey left the other barrel importers coupled, so the correction applies consistently across all nine renderer modules. No direct unexported installer or custom type shim is used.

`prepare-demo.mjs` now inspects contributing inputs across each renderer's reachable preload graph and rejects unrelated chart families before sealing a demo build. A regression fixture verifies rejection of Sankey code in a bar renderer graph and ignores zero-byte tree-shaken inputs. The standalone package budgets still verify focused import graphs, eager-engine exclusion, notices and compatibility-root scope separately.

Independent chunks reduce cold route payloads but compress less effectively in aggregate. The compatibility root measures 214,118 gzip / 183,208 Brotli bytes versus rc.9's 210,030 / 177,133; raw size increases from 659,237 to 662,309 bytes. The root still contains the same bar/line/pie engine families and excludes focused radar/radial/calendar/Sankey entries. Record a bounded 215,000 / 184,000 aggregate allowance, replacing 212,000 / 178,000. The frame-only root scenario has zero reachable engine modules but measures all emitted orphan chunks: 200,118 gzip / 172,486 Brotli bytes versus rc.9’s 196,032 / 166,471. Its emitted-orphan allowance becomes 201,000 / 175,000 (formerly 200,000 / 175,000); the reachable frame import stays engine-free. Focused 200,000 / 175,000, core 10,000 / 9,000 and all route byte/readiness limits remain unchanged. This is a measured delivery tradeoff, not reduced functional/engine isolation acceptance or a closed human gate.

The final source is rebuilt and checked after this correction; exact rc.10 evidence and static receipts record the final results. The rc.9 verification above remains historical and is not replaced or repacked.

## Combined presentation verification and rc.11

The user requested combined verification after the visual-review task finished. Its [full-check receipt](data/premium-visual-refinement.json) records 257 passing unit tests, 353 passing browser scenarios with four expected skips, 20 provenance/four demo-asset tests, strict/declaration/docs/SSR/runtime checks, all twelve bundle scenarios and 138 reviewed visual states. Before preparing rc.11, all 264 `afterSources` hashes in that receipt were compared with the working tree and matched. Candidate metadata/documentation updates follow that source checkpoint; the implementation is retained.

The [presentation report](PREMIUM_CHART_REFINEMENT.md) owns its additional tooltip/state/legend/scale/scroll behavior and aggregate budget delta. The compatibility-root allowance is now 218,000 gzip / 186,000 Brotli bytes and the emitted-orphan root-frame allowance 201,500 / 175,000; focused/core and demo-route limits remain unchanged. rc.9 and rc.10 above remain preserved historical snapshots.

Exact **rc.11** passes metadata/notices, strict installed declarations, the fresh documented application and all six installed client/SSR modes. Its **146,600-byte, 68-file** archive has SHA-256 `9258a75f04b398694cab2da94ba14026b38751af56d5a45bc9bb453036c19faa`; [the immutable record](data/local-release-0.1.0-rc.11.json) preserves every consumer's exact-artifact result and pending human/G4 statuses. All retained rc.0–rc.10 archive digests match their prior records.

After packaging, the source hashes from the completed visual review were checked again: 263 of 264 still match exactly; the only changed source file is `projects/chart-library/package.json`, whose version advances from rc.10 to rc.11. The original/current package manifests were compared and differ only in that version field. The public implementation therefore matches the completed 257-unit/353-browser regression; exact rc.11 consumers additionally verify the new archive.

The [Sankey capture manifest](captures/sankey/manifest.json) is refreshed against the combined source: eight ready theme/width images and eight narrow native-zero/zero/empty/error images, eleven matching source digests and no browser errors or page overflow. The refreshed dark desktop and light 320 px native-data images were inspected. The visual review's 138-state comparison remains preserved separately.

Final static validation runs after these tracked evidence updates. Its actual sealed source/output identities, three-browser results and route performance samples remain in the local files named above. That local verification phase performed no deployment or registry publication; the later demo deployment is recorded below.

## Remaining limits

At most 24 nodes and 60 directed pairs. Horizontal DAGs only; no circular/negative/null flows, parallel-edge aggregation, drag layout, link filtering, vertical variants or custom tooltip templates. Node order is supplied order within layout columns; replacement topology may reposition nodes. Human interpretation and G2/G3/G4 remain pending. The library is private. The subsequent demo deployment is recorded below; the library package remains private and unpublished.


## Public demo and documentation follow-up

The [14 November deployment checkpoint](../GITHUB_PAGES.md#rc11-sankey-presentation-and-webkit-deployment) records source `23182ab` and static commit `78cee756`: 34 routes, 138 sealed files, all-file public integrity, all three live browser engines, 16 local route budgets and six mobile medians. The demo-only font-readiness fix has 30 targeted scenarios and is separate from the 353-browser full regression. The [record](data/rc11-pages-deployment.json) preserves actual source/output identities; no older record is restamped.

Private rc.12 corrects the packaged README and documentation status/indices without changing rc.11 implementation or public declarations. Its exact candidate result is recorded in the [release checklist](../RELEASE_CHECKLIST.md). All earlier candidate archives and human release gates retain their original status.
