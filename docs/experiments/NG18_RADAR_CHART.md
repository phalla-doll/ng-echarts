# NG18 radar first increment

The user approved finishing the lollipop refinement and then building radar as a reusable Angular component. This increment adds a focused `/radar` entry and a site-aligned `/radar` demo. Radial progress remains subsequent scope. Original code is MIT licensed; no external implementation was copied. Apache ECharts remains a peer with its existing notices.

## Design and parity checklist

Use the existing Inter typography and neutral site palette: dark background `#0a0a0a`, surface `#111111`, border `#262626`, primary text `#fafafa`, muted text `#a3a3a3`; light mode inherits the paired site tokens. Layout uses the established left-aligned page heading, compact Code/Preview header and inset chart surface. The six-spoke capability profile is the visual focus; controls/table remain quiet. Plot labels reserve bounded gutters and full labels remain in the native table.

Before implementation, the contract selected explicit per-row maxima (never automatic), stable dimension/comparison IDs, supplied order, nonnegative bounded observations and omission of incomplete polygons. Reuse the engine-free shared chart behavior, with one focused lazy Radar/Canvas adapter. The compatibility root remains unchanged, avoiding a new engine cost for existing imports. See the [API](../RADAR_CHART_API.md).

| Requirement | First-increment criterion |
| --- | --- |
| F01 | Typed max/measure keys; runtime IDs, dimension/comparison counts, finite positive maxima and bounded values |
| F02 | Immutable scores/order/scales, stable legend visibility, missing/recovery and one renderer |
| F03 | Shared value/max formatting, escaped tooltip text, raw numeric events |
| F04 | Resize a mounted Canvas, bounded labels at 320/390/768/1440 px and no page overflow |
| F05 | Actual vertex click and keyboard table action emit equivalent identities; ambiguous polygon regions emit nothing |
| F06 | Both site themes and CSS palette tokens refresh mounted plots |
| F07 | Error/loading/invalid/empty/ready precedence and recovery |
| F08 | Shared reduced-motion listener and explicit animation policy |
| F09 | Native legend, scale/value table, missing notice, focus and non-color outline cues; human interpretation pending |
| F10 | Server fallback without Canvas, hydration, installed consumers and teardown |

The pinned ECharts 6.1.0 radar source and typings were inspected (`lib/chart/radar/RadarView.js`, `lib/coord/radar/Radar.js`). Its indicator values correspond by position. Our stable identities remain outside mutable engine indices. Pointer selection uses bounded public event offsets and our own explicit geometry, with no private `__dimIdx` dependency. [Official radar-series documentation](https://apache.googlesource.com/echarts-doc/+/6781a9ec0dd15e68808e4452ea2e83f24f26f299/en/option/series/radar.md) and the [upstream missing-data issue](https://github.com/apache/echarts/issues/20811) informed the data policy; neither substitutes for pinned-version tests.

## Validation

Verified on Node 24.22.2 / npm 11.19.1:

- Full `npm run check` passes: 19 source/artifact integrity tests, strict builds/templates/declarations, fresh documented consumer, SSR, 251 browser scenarios and four expected transport-specific skips, six isolated client/SSR modes and all nine package-budget scenarios. The full run had 191 Angular unit tests; the added renderer-boundary motion check and final rerun pass 192 (181 library + 11 playground).
- After the final missing-data legend wording, explicit counterclockwise geometry and catalog refinements, production builds, all 192 unit tests and 21 focused radar/site-page scenarios pass across Chromium, Firefox and WebKit. The 100-cycle test checks disposed instances, zero observers/observed targets/motion listeners/animation frames/focus listeners and absent tooltips after every destroy. Actual pointer and keyboard actions agree on stable IDs and raw values.
- Eight responsive theme/width captures pass at 320/390/768/1440 px with no page overflow or browser errors. See [dark desktop](captures/radar/dark-1440.png), [light desktop](captures/radar/light-1440.png), [dark mobile](captures/radar/dark-320.png), [light mobile](captures/radar/light-320.png), and the [mobile scale/value table](captures/radar/light-320-table.png). The [capture manifest](captures/radar/manifest.json) identifies the source hashes. Visual review increased the narrow plot radius and disabled resize-only geometry animation to keep markers attached while resizing. `npm run capture:radar` reproduces these captures after a production build.
- The final private rc.5 candidate is 90,468 bytes with 51 files, SHA-256 `014d36dfc88eb9efbc2a302b61ab0f80cbaf2fa99e1b8fd9ca1576bc60d3a60b`. The [candidate manifest](data/local-release-0.1.0-rc.5.json) records metadata, notices, contents and the same bytes passing strict declarations, the guide application and all six installed client/SSR browser modes. The exact radar guide is compiled; nonnumeric max keys and invalid fill types are rejected. Installed consumers exercise radar table selection, missing-data feedback, navigation and the existing family suite. Private radar implementation paths remain blocked.
- Focused radar measures 163,961 gzip / 140,316 Brotli bytes against the unchanged 200,000 / 175,000 family caps, with 209 engine modules and none eager. Existing root measures 210,031 / 177,172; core remains engine-free at 5,758 / 5,052. The [package-boundary report](data/package-boundaries.json) confirms no unrelated chart families, SVG renderer or React runtime in the radar entry. Existing root/focused/core budgets are unchanged.
- The rc.4 archive remains byte-identical: `fba7223700cbcd849cd9b3015cf1152e625c8652a7305d8ba85ffd0208b92df0`. Earlier versioned manifests and archives are preserved. The existing bar stylesheet warning (74 bytes above its 4 KB warning budget) remains unchanged.

The lollipop refinement was committed as `0b55e3c` and uploaded through the guarded preview workflow before radar work began. Concurrent gallery refinements remain separate commits. The radar preview uses the same clean-source, sealed-output and three-browser receipt guards; [build identity](https://phalla-doll.github.io/ng-echarts/preview-build.json) and [browser receipt](https://phalla-doll.github.io/ng-echarts/preview-verification.json) identify the current public deployment. Public gallery startup exceeded the former 15-second assertion window during cold-network checks, so public assertions allow 60 seconds while local checks retain 15 seconds. This changes verification tolerance, not chart behavior or a loading-performance claim.

Human F09/R06/G2/G3/G4 and public naming/registry publication remain pending. The [manual review](R06_MANUAL_REVIEW.md#experimental-radar-follow-up) now includes radar scale/missing-data interpretation; no automated result closes that human review. No public npm publication occurred.
