# rc.28 legend and gallery integration

Date: 16 November 2026.

The local legend/gallery commits `86aa976` and `269d44a` diverged from the payload PR merged as `0cdd931`. The public demo marker confirmed `0cdd931`, which did not include `legendLayout`; refreshing the browser could not reveal the local changes. The user requested committing and pushing all work.

The combined source retains compact default chip legends, optional aligned lists, the live pie selector and matching source examples, and all eleven gallery table opt-outs with explicit table-enabled validation routes. It also retains the merged stable Cartesian declaration contracts and shared radar/composed scale-description styling. Two original legend design HTML previews are included under `output/`; existing ignored logo-generation artifacts remain outside tracked source.

Current source advances to `0.1.0-rc.28`. The historical [legend report](RC26_LEGEND_LAYOUTS.md) used rc.26 locally while the isolated payload branch separately prepared immutable rc.26/rc.27 candidates. Those archives and reports retain their identities; this integration does not rewrite them or publish npm. npm next remains rc.24/latest rc.18. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Verification

Combined production builds, strict TypeScript/templates and all 340 unit tests pass (322 library and 18 playground). The warm package and two independent cache-free roots match complete SHA-256 `f556a3d25e766a4c4fb2ec343ae0bad6d57d868a0d97fd393c27e206c485d396`; [reproduction evidence](data/reproducibility-0.1.0-rc.28-darwin.json) records the pinned toolchain. No immutable rc.28 release archive is prepared here.

Isolated declarations with `skipLibCheck: false`, the fresh documented installation in all three engines, the digest-verified npm rc.22 dashboard consumer and production SSR pass. All six independently installed CSR/SSR runtime modes pass after the correction below. All twelve module budgets pass: root is 221,792 gzip/189,578 Brotli bytes, leaving 208/422 bytes under unchanged caps; core is 9,531 gzip bytes. Engine membership and eager boundaries retain their existing checks.

The first workspace run reached the installed runtime consumer and failed because its Sankey action still targeted the gallery disclosure removed by the local follow-up. The corrected consumer first checks that galleries omit tables, then uses explicit validation routes for Sankey, calendar, radar, linked examples and the dashboard. The Pages checker mirrors gallery/validation SSR and interaction expectations. Native-table capture tools also target the explicit validation examples. The corrected runtime check and remaining bundle step both pass; no failed whole-workspace invocation is described as green.

Full 486-case browser regression is running. Earlier branch results do not count as combined-source passes. Current Chromium checks include the responsive chip/list test, all-eleven-gallery table audit and the retained radar/composed scale assertions. New [compact chip](rc28/visual/chips-dark-390.png) and [aligned list](rc28/visual/list-dark-390.png) screenshots preserve earlier captures. Formatting, documentation links/heading anchors and whitespace checks pass. No full CI result or new Pages deployment is claimed here.
