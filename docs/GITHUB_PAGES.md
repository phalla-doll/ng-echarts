# GitHub Pages preview

The demo is published from the root of the dedicated `gh-pages` branch at **https://phalla-doll.github.io/ng-echarts/**. Source and deployment are separate commits. Publication requires a clean, pushed `main` source, an unchanged sealed artifact and successful local checks in all three browsers.

## Current deployment — bar zoom playground

[Bar zoom](https://phalla-doll.github.io/ng-echarts/bar-zoom/) runs the [standalone shipment example](BAR_ZOOM_PROTOTYPE.md). From and To, zoom, pan, reset, and graphical narrowing update one visible window. The disclosure copies the complete standalone Angular app. The library's native table shows the same window as the bars.

| Identity / check | Result |
| --- | --- |
| Clean pushed source | `87407c19c2e33786abde152b9eb9807a29a4e6c8` |
| Static commit | `f1369aeaf910274f460e8a713bddf840d315ef91` |
| Sealed SHA-256 | `5aed9f2ff0e2ddb7ed661fb485e184ab2adc4c9252847eaefb2890a9da33fa0c` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44710418641) |
| Local/public static checks | 41 routes and 153 sealed files pass in Chromium, Firefox, and WebKit. Public verification passed on retry after a connection reset. |
| Performance | All 18 route guards and normal-motion navigation checks pass. Bar zoom transfers about 387 kB under its 445,000-byte budget. |
| Standalone consumer | [Published rc.33 consumer](experiments/data/bar-zoom-playground-consumer.json) passes strict compilation, SSR, and all three browser flows. |
| Hosted browser setup | The [first CI run](https://github.com/phalla-doll/ng-echarts/actions/runs/44710073878) exposed a container user mismatch for Firefox. The [follow-up](https://github.com/phalla-doll/ng-echarts/actions/runs/44710529678) uses the matching Playwright image and runner home owner. |

<a id="current-deployment--rc33-release-documentation"></a>

## Earlier deployment — rc.33 release documentation

The [live installation guide](https://phalla-doll.github.io/ng-echarts/installation/) identifies public rc.33 on npm `next` and rc.18 on `latest`. Get Started records the completed human review and release gates. The live Visits dashboard identifies its graphical interaction entry as available in published rc.33.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `4c5ef97c17f5e44c98efa1e6e97d5612d66434a1` |
| Static commit | `4b724009e5d5d29bf7abff37f95f96249fe464c0` |
| Sealed SHA-256 | `584d4772c54c5d3b60f664792f0fe92b4cea20812515c8f1687f33d39e20b783` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44698128240) |
| Delivery-source CI | [Workspace checks](https://github.com/phalla-doll/ng-echarts/actions/runs/44697821872) |
| Local/public static checks | 40 routes and 148 sealed files pass in Chromium, Firefox and WebKit. The public verifier passed on retry after a connection reset. |
| Performance | All 17 route guards and normal-motion navigation checks pass. |

The same source documents a [standalone transaction range example](TRANSACTION_RANGE.md) verified against the published rc.33 archive in a fresh Angular consumer. See the [installed consumer results](experiments/data/transaction-range-consumer.json).

<a id="current-deployment--dashboard-colors"></a>

## Earlier deployment — dashboard color refinement

The [visits dashboard](https://phalla-doll.github.io/ng-echarts/linked-dashboard/) now matches the neutral site palette, with charcoal dark surfaces, gray supporting text and borders, softer teal/blue/gold series and one outline per chart. Its independent theme and both displayed standalone examples are preserved. The deployed source below predates [rc.33 npm publication](experiments/RC33_PUBLICATION.md). Its installation copy reflects the registry tags at deployment time.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `c597797e4a0ccf05087f6490de6183131e403f18` |
| Static commit | `7199379c4a1f4f5d68296a9132c0bf06512dec86` |
| Sealed SHA-256 | `7988f252791282c84fdc9f311d0a34f5819861e4e6984634c6d907e9371ea507` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44234543474) |
| Delivery-source CI | [All six jobs pass](https://github.com/phalla-doll/ng-echarts/actions/runs/44234286678): 358 unit tests, 611 browser passes/four expected skips, exact consumers and reproducibility |
| Local/public static checks | 40 routes/148 files; Chromium, Firefox and WebKit pass |
| Performance | All 17 unchanged guards and normal-motion navigation pass; dashboard initial transfer is 408,960 bytes under its unchanged 455,000-byte cap |
| Live colors | All 24 site-theme/dashboard-theme/width cases pass in three engines, including actual series paint and single frame outlines |

[Review and delivery evidence](experiments/DASHBOARD_COLORS.md#demo-delivery) retain source/static identities, exact public marker/receipt, live captures, performance and public checks. Receipt-only follow-ups preserve this deployed identity and every package archive.

<a id="current-deployment--shared-dashboard-window"></a>

## Earlier deployment — rc.33 graphical dashboard window

The [visits dashboard](https://phalla-doll.github.io/ng-echarts/linked-dashboard/) now accepts an armed contiguous month range from either overview or monthly device detail. Both update the existing application-owned window; From/To and native zoom/pan/reset remain equivalent. Both complete source viewers load on disclosure interaction. npm next is published rc.32/latest rc.18; the demo uses unpublished rc.33 source. Human gates remain deferred/pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `4fe085b6ce3eae9b0bb5c334520dd53fa9e7bec4` |
| Static commit | `fd7c4d80200817217ae98f9f4ae72d65f10fbbb3` |
| Sealed SHA-256 | `7ee8e19e9f30a833dd5330485d92d19a91347a1a6cf2adf14ba65eb450158361` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44228067225) |
| Delivery-source CI | [All six jobs pass](https://github.com/phalla-doll/ng-echarts/actions/runs/44227710359), after a browser-dependency-only Pages rerun; 358 unit tests, 611 browser passes/four expected skips, exact consumers and reproducibility |
| Local/public static checks | 40 routes/148 files; Chromium, Firefox and WebKit pass |
| Performance | All 17 unchanged guards and normal-motion navigation pass; dashboard initial transfer is 408,879 bytes under its unchanged 455,000-byte cap |
| Live graphical/source flows | Overview/detail range commit, pending-module Escape, native reset/focus and enhanced/native source panels pass all three engines |

[Delivery record](experiments/RC33_GRAPHICAL_LINKING.md), [deployment](experiments/rc33/deployed/deployment.json), [marker](experiments/rc33/deployed/preview-build.txt), [receipt](experiments/rc33/deployed/preview-verification.txt), [public checks](experiments/rc33/deployed/public-verification.txt), [performance](experiments/rc33/deployed/performance.json) and [live flows](experiments/rc33/deployed/live-controls.json) retain actual evidence. The guarded deployment rebuilds clean pushed source; it does not promote/restamp a dirty local artifact. Receipt-only follow-ups preserve this identity, every archive and all human-gate statuses.

<a id="current-deployment--rc32-payload-cleanup"></a>

## Earlier deployment — rc.32 payload cleanup

This earlier checkpoint delivers the lifecycle/color cleanup with original descriptor/theme validation preserved. The [cleanup delivery record](experiments/RC32_PAYLOAD_REVIEW.md#demo-delivery) owns its source/static identities; [subsequent rc.32 publication](experiments/RC32_PUBLICATION.md) has separate registry/consumer receipts. Human gates remain pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `db10dc5f2b55f4992badad6fbce0a8cb7b2206cc` |
| Static commit | `2657f71631b1d3fa3b5052e3286eab26d024bbc2` |
| Sealed SHA-256 | `3d0657280efdceeec53984ec75d9f33bf2b6c75535458aa864d082a088a3c07a` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44128686550) |
| Delivery-source CI | [All six jobs pass](https://github.com/phalla-doll/ng-echarts/actions/runs/44128193872): 356 unit tests, 587 browser passes/four expected skips, exact consumers and reproducibility |
| Local/public static checks | 40 routes/145 files; Chromium, Firefox and WebKit pass |
| Performance | All 17 unchanged route guards and normal-motion navigation pass |
| Live controls | Calendar/Sankey raw zero keyboard actions, node totals, radial stepping/full/reset and rc.32-local/rc.30-published installation copy pass |

[Deployment](experiments/rc32/deployed/deployment.json), [exact marker](experiments/rc32/deployed/preview-build.txt), [receipt](experiments/rc32/deployed/preview-verification.txt), [public verification](experiments/rc32/deployed/public-verification.txt), [performance](experiments/rc32/deployed/performance.json) and [live controls](experiments/rc32/deployed/live-controls.json) retain the actual identity. Receipt-only follow-ups preserve deployed source `db10dc5`; package publication and human gates remain separate.

<a id="current-deployment--consistent-control-styling"></a>

## Earlier deployment — consistent control styling

The [calendar Year field](https://phalla-doll.github.io/ng-echarts/calendar/) now uses one evenly padded surface. Radar/radial actions use aligned responsive rows, and linked/dashboard controls consistently follow the shared presentation. Native fields, keyboard focus, switches and reset actions remain usable. The [correction and delivery record](experiments/CONTROL_STYLE_FIX.md#deployment) owns comparison screenshots and actual receipts.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `0e40644f2835250a2c719f725c34c4b2e90897f4` |
| Static commit | `18091600dd8c37aa6adc5c52577b6d8707daae68` |
| Sealed SHA-256 | `bb8949c9d205c4c30074361ebc76082dc394c63ad1bb858481f52621c0522150` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44021783733) |
| Delivery-source CI | [All six jobs pass for `0e40644`](https://github.com/phalla-doll/ng-echarts/actions/runs/44021501148): 342 unit tests, 587 browser passes/four expected skips |
| Local/public static checks | 40 routes/145 sealed files; all three engines pass |
| Performance | All 17 unchanged route guards and normal-motion navigation pass |
| Live controls | Calendar field alignment, both themes, 390/1440 px layouts, keyboard stepping/reset, radial values, radar rows/switches, linked range/reset and dashboard zoom/reset pass in all three engines |

[Deployment](experiments/control-style-fix/deployed/deployment.json), [marker](experiments/control-style-fix/deployed/preview-build.txt), [local receipt](experiments/control-style-fix/deployed/preview-verification.txt), [public verification](experiments/control-style-fix/deployed/public-verification.txt) and [live controls](experiments/control-style-fix/deployed/live-controls.json) preserve the sealed identity. Receipt-only follow-ups retain deployed source `0e40644`. Published rc.30, earlier archives and pending human gates remain unchanged.

<a id="rc30-radar-delivery"></a>

<a id="current-deployment--rc30-radar-legends"></a>

## Earlier deployment — rc.30 radar legends

The [radar gallery](https://phalla-doll.github.io/ng-echarts/radar/) now offers inline chips and aligned lists, retaining comparison visibility, keyboard focus and chart instances. Missing comparisons keep explicit notes. The Code view mirrors the layout choice; gallery tables remain omitted and the [validation route](https://phalla-doll.github.io/ng-echarts/radar-validation/) retains raw table actions. The [installation page](https://phalla-doll.github.io/ng-echarts/installation/) names published rc.30 under next and rc.18 under latest. [Delivery evidence](experiments/RC30_RADAR_LEGENDS.md#demo-delivery) owns actual receipts.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `e09aa7f005fb9655e0c5f5a25723a364b2eab546` |
| Static commit | `3fe62780b8b8b9beeca6657662c6b7cce603333a` |
| Sealed SHA-256 | `3894c4c402546168a8b61906dc48588d1434d71e29b29faba3fe933345c6bbe0` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/44016246466) |
| Delivery-source CI | [All six jobs pass for `e09aa7f`](https://github.com/phalla-doll/ng-echarts/actions/runs/44015944947): 342 unit tests, 584 browser passes/four expected skips |
| Local/public static checks | 40 routes/145 sealed files; all three engines pass |
| Performance | All 17 unchanged route guards and normal-motion navigation pass |
| Live checks | Chip/list switching, keyboard focus, renderer identity, Code mirroring, 390 px layout, reset, missing notes, raw table actions and installation copy pass in all three engines |

[Deployment](experiments/rc30/deployed/deployment.json), [marker](experiments/rc30/deployed/preview-build.txt), [local receipt](experiments/rc30/deployed/preview-verification.txt), [public verification](experiments/rc30/deployed/public-verification.txt), [performance](experiments/rc30/deployed/performance.json) and [live controls](experiments/rc30/deployed/live-controls.json) preserve the sealed identity. The first ad hoc live probe left Code while its font was downloading; the corrected probe waits for highlighted code and the specific font before changing view, retaining the error assertions. No application or deployment change was required. Receipt-only commits retain deployed source `e09aa7f`; package archives and human gates remain unchanged.

<a id="current-deployment--customization-controls"></a>

## Earlier deployment — customization controls

The [playground customization panel](https://phalla-doll.github.io/ng-echarts/playground/#chart-settings), validation controls, gallery disclosures and linked examples now use inset frames, rounded control rows, inline form values and visible switches. Independent dashboard themes and forced-color selection remain readable. The [refinement and review record](experiments/CUSTOMIZATION_CONTROLS.md) preserves comparison screenshots and local browser evidence.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `8f961cf8399677abf555b0a58f64d33b2a40fbc7` |
| Static commit | `9d0fa64b1ef57cacd0ce73ac9427652e5723ceb2` |
| Sealed SHA-256 | `07b7965449d0576d03ee01ace5ba52229597faaa65b62b9409b73d75f5316cd8` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43902888292) |
| Verified source CI | [All six jobs pass for verification follow-up `b260397`](https://github.com/phalla-doll/ng-echarts/actions/runs/43904655587) |
| Local/public static checks | 40 routes/145 files; all three engines pass |
| Performance | All 17 unchanged route guards and normal-motion navigation pass |
| Live controls | Keyboard toggles/reset, 390 px layout, independent dashboard themes and forced-color selection pass in all three engines |

Full Linux verification records 342 unit tests, 575 browser passes/four expected skips, two WebKit horizontal probes, exact consumers, reproducibility and unchanged budgets. Its independent 169,791-byte rc.29 archive retains canonical SHA-256 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`. The [CI receipt](experiments/customization-controls/deployed/source-ci.json) and [verification summary](experiments/customization-controls/deployed/verification-summary.json) preserve the successful follow-up independently of the deployed UI source.

The [deployment receipt](experiments/customization-controls/deployed/deployment.json), [marker](experiments/customization-controls/deployed/preview-build.txt), [verification receipt](experiments/customization-controls/deployed/preview-verification.txt), [public verification](experiments/customization-controls/deployed/public-verification.txt), [performance](experiments/customization-controls/deployed/performance.json) and [live checks](experiments/customization-controls/deployed/live-controls.json) preserve this identity. The initial source CI exposed a timing race in the new theme test after the global theme changes. The verification-only follow-up waits for the rendered dashboard theme before operating its independent toggle; all 15 repeated local cases pass without changing assertions or timeouts. The initial Firefox job also finds an older pie hit test clicking below the viewport after the panel grows; scrolling its canvas before measurement preserves every assertion and passes all three local engines. The completed Linux follow-up is recorded above. Receipt/test-only commits retain deployed source `8f961cf`; npm tags, package archives and pending human gates remain unchanged.

<a id="current-deployment--documentation-reconciliation"></a>

## Earlier deployment — documentation reconciliation

The live installation/component documentation now names published rc.28, the rc.29 candidate and the radar chip-only limitation. The [documentation audit](experiments/RC29_DOCUMENTATION_AUDIT.md) records related guide coverage, strict consumers and preserved archives.

The [visits dashboard](https://phalla-doll.github.io/ng-echarts/linked-dashboard/) now shares one visible-month window between overview and device detail. Native From/To and zoom/pan/reset controls preserve stable IDs; either chart can commit a month. The complete standalone example still runs against published rc.22. npm next is rc.28/latest rc.18; rc.29 payload source is separately verified and unpublished. Human gates remain pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `d188d59f07d299424814b39024160651ba7e0a5d` |
| Static commit | `8e29fd8eeee03ba83d1dbacc72faa3d634a906a6` |
| Sealed SHA-256 | `5dac8b379fda6c2fc60ab780d4d63ca821b143d7562a3246e71c260b1c452801` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43831211803) |
| Source CI | [All six documentation-source jobs pass](https://github.com/phalla-doll/ng-echarts/actions/runs/43830706126) |
| Local/public static checks | 40 routes/145 files; all three engines pass |
| Regression | 342 unit tests, 488 browser passes/four expected skips; separate WebKit probe passes |
| Performance | All 17 route guards and normal-motion navigation pass |

The [continuation report](experiments/RC29_LINKED_WINDOW.md#completed-verification-and-delivery) preserves exact receipts, live controls and the public Firefox diagnostic. Its verification correction waits for charts before table-absence checks, avoiding navigation during unfinished imports; it retains every assertion and the same sealed deployment. The earlier functional dashboard delivery retains source `0e8f84b` in its report; the current [documentation deployment receipts](experiments/RC29_DOCUMENTATION_AUDIT.md#documentation-deployment) own source `d188d59`. Receipt-only commits preserve that new sealed identity.

<a id="current-deployment--validation-layout-refinement"></a>

## Earlier deployment — validation layout refinement

All eleven pages under Validation now use grouped controls, visible toggle states, consistent result and deferred-hydration sections, and responsive phone layouts. The [live area validation](https://phalla-doll.github.io/ng-echarts/area-validation/) includes the reviewed controls. npm tags and package archives are unchanged; human release gates remain pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `ab01535ddfeadc2a5ca0c73c147c33c6dde0913c` |
| Static commit | `8385b07d43475a2fefbcc0b9104893669f593883` |
| Sealed SHA-256 | `ca371773b0f59f958d65cd8f75931fc38bc50eb10b30811079f5d8d7cbfc9880` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43806930543) |
| Local and public checks | 40 routes, 145 byte-verified files; Chromium/Firefox/WebKit pass |
| Performance | All 17 route guards and normal-motion navigation pass |
| Validation regression | 148 browser passes/two expected heap skips; 110 responsive views pass |
| Live controls | Keyboard toggle, updated `a/desktop/110/table` action, retained focus and 390 px/two-column/44 px controls pass |

[Deployment](experiments/validation-layout/deployed/deployment.json), exact [marker](experiments/validation-layout/deployed/preview-build.txt), [receipt](experiments/validation-layout/deployed/preview-verification.txt), [public verification](experiments/validation-layout/deployed/public-verification.txt), [performance](experiments/validation-layout/deployed/performance.json) and [live controls](experiments/validation-layout/deployed/live-controls.json) preserve this identity. The initial public Firefox check reported four lazy-module loading errors after all file hashes and Chromium passed; each module URL returned HTTP 200 JavaScript, and the unchanged verifier then passed all three engines. The [initial failure](experiments/validation-layout/deployed/public-initial-firefox-failure.txt) remains recorded without suppressing errors.

The [initial source CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43806716429) passes workspace, Pages, Chromium and Firefox. WebKit exhausts the default 30-second deadline near the end of the existing combined area-gallery theme/width matrix. A verification-only follow-up splits the same width matrix into separate light/dark tests without raising timeouts or removing assertions. All six local browser/theme cases pass. [Fresh Linux CI 43807733564](https://github.com/phalla-doll/ng-echarts/actions/runs/43807733564) now passes all six jobs for `c192030`, resolving this verification follow-up. [Trace findings](experiments/validation-layout/deployed/ci-initial-webkit-timeout.json) and the [local rerun](experiments/validation-layout/deployed/theme-split-local.txt) retain the correction. Receipt and test-only commits preserve deployed source `ab01535`; no artifact is restamped.

<a id="current-deployment--chiplist-legends-and-gallery-previews"></a>

## Earlier deployment — chip/list legends and gallery previews

The [pie gallery](https://phalla-doll.github.io/ng-echarts/pie/#browser-share) now offers compact inline chips and aligned lists. All eleven gallery routes omit native table controls, while explicit validation routes retain keyboard table actions. npm next remains rc.24/latest rc.18; human release gates remain pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `9de7a843213eb9d382655e51aba1ca51c51060bd` |
| Static commit | `392e16f525e2f1eacc0c5389bea7d5f027d3aec0` |
| Sealed SHA-256 | `670f23c88f5091bbf1a5347dd3c841c2f7c99714195eead4da47c17875046ef9` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43804898460) |
| Source CI | [Old range assertions fail; corrections follow](https://github.com/phalla-doll/ng-echarts/actions/runs/43804672048) |
| Local static checks | 40 routes, 145 sealed files; Chromium/Firefox/WebKit pass |
| Performance | All 17 route guards and normal-motion navigation pass |
| Public checks | All 145 served files byte-verified; Chromium/Firefox/WebKit flows and live legend switching pass |

The [integration record](experiments/RC28_LEGEND_INTEGRATION.md) owns receipts, full public verification and actual regression results for this earlier deployment. Verification/receipt-only commits at that checkpoint preserved source `9de7a84`; the artifact was not restamped. The intermediate payload-only deployment served `0cdd931` as static `f817885`, without the concurrent local legend changes.

<a id="current-deployment--rc24-independent-value-axes"></a>

## Earlier deployment — rc.24 independent value axes

The [independent value-axis gallery](https://phalla-doll.github.io/ng-echarts/composed/#revenue-and-conversion), composed dashboard and horizontal examples are deployed and verified. npm `next` selects published rc.24 and `latest` retains rc.18. Human F09/R06/G2/G3/G4 remain deferred/pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `42b27aa63841184467d97b17fec63f8c2c4d6644` |
| Static commit | `4470047011dd1c96295964a58bd562ca662aa4bf` |
| Sealed SHA-256 | `3ef31eda4f6c23732b586595724f8e686a56514b7cdaec1634c02e17b3079459` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43789318430) |
| Source CI | [All jobs succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43789117814) |
| Local and public checks | 35 routes, 140 byte-verified files; Chromium/Firefox/WebKit pass |
| Performance | 17 route payload budgets, six controlled mobile medians and normal-motion navigation pass |
| Live independent axes | Revenue/Conversion native labels, keyboard `a/trend/0.12/table` and retained focus pass |

[Deployment receipt](experiments/rc24/deployed/deployment.json), exact [marker](experiments/rc24/deployed/preview-build.txt), exact [verification receipt](experiments/rc24/deployed/preview-verification.txt), [public log](experiments/rc24/deployed/public-verification.txt), [performance](experiments/rc24/deployed/performance.json) and [live keyboard action](experiments/rc24/deployed/live-axis-keyboard.json) preserve the delivery. The [rc.24 publication and correction report](experiments/RC24_PUBLICATION.md) separates package source `0593f34` from this deployed source and records the earlier failed status-copy CI. Receipt-only documentation commits preserve this deployed identity.

<a id="current-deployment--composed-dashboard-and-horizontal-charts"></a>

## Earlier deployment — composed dashboard and horizontal charts

The [composed linked dashboard](https://phalla-doll.github.io/ng-echarts/linked-dashboard/) and [horizontal regional composition](https://phalla-doll.github.io/ng-echarts/composed/#horizontal-visits-and-target) are deployed and verified. The dashboard example supports published rc.22; horizontal composed layout now ships in published rc.23. At that checkpoint npm `next` was rc.23 and `latest` rc.18; rc.24 independent axes were not in that build. Human F09/R06/G2/G3/G4 remain deferred/pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `8dd761922b8b9548a5c2bac67a40cc7f80b8075e` |
| Static commit | `787baedfc6390e44f239472513061eeb9b78a6d2` |
| Sealed SHA-256 | `2dc9d8aed95d1b7f07f592324aa26021ce8a76ce85c274b85299fbe00637403f` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43727674959) |
| Source CI | [All jobs succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43727454898) |
| Local and public checks | 35 routes, 140 byte-verified files; Chromium/Firefox/WebKit pass |
| Performance | 17 payload budgets, six controlled mobile medians and normal-motion navigation pass |
| Composed linked flow | Raw zero keyboard action, independent legends, bar/area switching, month replacement/reset focus, partial data and theme/width checks pass in all three engines |

[Deployment receipt](experiments/rc23/deployed/deployment.json), exact [marker](experiments/rc23/deployed/preview-build.txt), exact [verification receipt](experiments/rc23/deployed/preview-verification.txt), [public log](experiments/rc23/deployed/public-verification.txt) and [performance](experiments/rc23/deployed/performance.json) preserve this clean deployment. The [increment report](experiments/NG20_COMPOSED_DASHBOARD.md) separately records 330 local unit tests, 470 browser passes/four skips, exact rc.23 artifact consumers, horizontal benchmarks and preserved archives. Receipt-only documentation commits retain this deployed source identity; no artifact is restamped and npm publication remains separate.

<a id="current-deployment--composed-areas"></a>

## Earlier deployment — composed areas

The [live composed gallery](https://phalla-doll.github.io/ng-echarts/composed/) includes independent area+line and stacked-area+line examples alongside the bar examples. At that checkpoint, installation guidance identified published rc.22 and npm `next` was rc.22; `latest` retained rc.18. Human F09/R06/G2/G3/G4 remain deferred/pending.

| Identity / check | Verified result |
| --- | --- |
| Clean pushed source | `1cef86b909455af7d2a89ef04c348dde289bd700` |
| Static commit | `2a8e1832f4b40a24d826d4065ae9d2eb49941c89` |
| Sealed SHA-256 | `1a9d98d1467b2844dece86af57ffc3480b7229eb9fa23b5229c19eaa398e2e54` |
| Pages workflow | [Succeeded](https://github.com/phalla-doll/ng-echarts/actions/runs/43692133202) |
| Local and public checks | 34 routes, 138 byte-verified files; Chromium/Firefox/WebKit pass |
| Performance | 16 payload budgets, six controlled mobile medians and normal-motion navigation pass |
| Live area keyboard actions | Independent `d/visits/-60/table` and stacked `d/mobile/-20/table` in all three engines |

[Deployment receipt](experiments/rc22/deployed/deployment.json), [marker](experiments/rc22/deployed/preview-build.txt), [verification receipt](experiments/rc22/deployed/preview-verification.txt), [public log](experiments/rc22/deployed/public-verification.txt), [performance](experiments/rc22/deployed/performance.json) and [live actions](experiments/rc22/deployed/live-area-actions.json) preserve this delivery. The [area report](experiments/NG17_COMPOSED_AREAS.md) records package, source and registry evidence independently. Later receipt-only documentation commits retain this deployed source identity.

<a id="current-deployment--15-november-follow-up"></a>

## Earlier deployment — rc.21 source

Verified 15 November 2026 after the user authorized committing and redeploying the completed follow-ups. The [live composed gallery](https://phalla-doll.github.io/ng-echarts/composed/) now includes named stacked bars with an independent supplied line. At that checkpoint the demo used rc.21 source; npm `next` remained rc.19 and `latest` remained rc.18. This deployment does not publish another package or close human release gates.

| Identity / check | Verified result |
| --- | --- |
| Source commit | `a4e6cfdccbe32c264273d38ce27fc8fc3c14b7d8` |
| `gh-pages` commit | `ee9e493b8f309351c8524b7405c78682c46abf9a` |
| Sealed artifact SHA-256 | `20f63e6a7d0964202938d2bef724904ba35f40ad154a0483ecc3aae320edfc70` |
| Pages workflow | [Successful deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43687383219) |
| Clean local verification | 34 prerendered routes and 138 sealed files; Chromium/Firefox/WebKit passed |
| Performance guards | All 16 route payload budgets, six controlled mobile medians and normal-motion navigation checks passed |
| Public verification | Every sealed file hash and all three browser route/reload/font/theme/focus/mobile flows passed |
| Live stacked action | Keyboard activation returned `a/mobile/40/table`, preserving the raw segment value |

The [deployment receipt](experiments/rc21/deployed/deployment.json), exact [public build marker](experiments/rc21/deployed/preview-build.txt), exact [public verification receipt](experiments/rc21/deployed/preview-verification.txt), [public check log](experiments/rc21/deployed/public-verification.txt) and [performance record](experiments/rc21/deployed/performance.json) preserve this delivery. The deployment was rebuilt from clean pushed source through `npm run deploy:pages`; the earlier dirty review artifact was not promoted. Later documentation-only commits retain this deployed source identity.

## Earlier deployment — rc.19 source

The live build marker identifies clean source `fb6cb05e5c985bca7f2f06bddf6460795ab511a3`, including table pagination, Angular state/render-phase changes, Heroicons navigation and persistent demo theme selection. Its build completed on 15 November 2026 at 05:23:39 UTC with 138 sealed files and artifact SHA-256 `e6655e1b7cb957ec637405c744ef9f14d8857c260cdf2c2815331401a0ebd46d`. The published verification receipt records Chromium, Firefox and WebKit at 05:24:06 UTC. The [successful deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43681021701) used `gh-pages` commit `989786aa867b9beba18e05ba7b769730c6f55263`. A fresh `node tools/check-pages.mjs https://phalla-doll.github.io/ng-echarts/` rechecked every sealed file and all three engines on 15 November. This demo uses local rc.19 source; npm publication remains separate. The public rc.18 deployment below is preserved as historical evidence.

<a id="latest-verified-deployment--public-rc18"></a>

## Historical deployment — public rc.18

Verified 14 November 2026 after the npm release and final availability-copy corrections. The [demo](https://phalla-doll.github.io/ng-echarts/) uses the public package name in its installation examples and gallery links. The loading frame and rendered Canvas retain the same theme background.

| Identity / check | Verified result |
| --- | --- |
| Source commit | `49889c085b6b1a34b42b878af1c3dcae6ab4f01a` |
| `gh-pages` commit | `bba9a3a8c6027d21326ef7c86df0d624b92faa3f` |
| Sealed artifact SHA-256 | `f8850e877dd5115d88ead2c15e486139cd0d1dfe69b4200196f5fb55f2593b3d` |
| Pages workflow | [Successful deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43608362885) |
| Release-source CI | [All jobs passed](https://github.com/phalla-doll/ng-echarts/actions/runs/43607829796) |
| Public verification | All 138 sealed files and Chromium/Firefox/WebKit route, reload, lazy-chart/font, anchor, focus, theme and mobile scenarios passed |
| Targeted live verification | Registry install-command copying, public gallery links and matching pre-hydration/Canvas background passed |

The [npm publication record](PUBLICATION.md#first-publication-result) is separate from this demo deployment. It verifies the exact registry package and records npm’s initial `latest` alias alongside `next`; human listening remains deferred. Markdown-only follow-ups do not restamp the last deployed source, and source pushes do not automatically redeploy Pages. Earlier deployment sections below retain their original identities.

## rc.11 Sankey, presentation and WebKit deployment

Verified 14 November 2026: [live demo](https://phalla-doll.github.io/ng-echarts/), [Sankey](https://phalla-doll.github.io/ng-echarts/sankey/) and [Chart possibilities](https://phalla-doll.github.io/ng-echarts/chart-possibilities/). The combined implementation was committed as `cfe269cc6c0ed93cff48ad5a5a98e823a46dbdff`; the demo-only WebKit font fix is source commit `23182ab88bb1ee8f2cf8a5b7ccf51fcc5f6e2b3e`. Its static commit is `78cee7569919dfad20138e00f4f61b25078763aa`, and the [Pages workflow](https://github.com/phalla-doll/ng-echarts/actions/runs/43566878538) succeeded.

The clean build prerenders **34 routes** and seals **138 files**, artifact SHA-256 `4337e38f42eec51e0c54149a671076201fe7a96457b61ca20f61e5496cffaf00`. Public verification matched every inventoried file's size/hash and completed the route/reload/font/theme/focus/mobile flows in Chromium, Firefox and WebKit. All **16 local route payload budgets** and **six controlled mobile timing medians** passed. The [deployment checkpoint](experiments/data/rc11-pages-deployment.json) preserves the marker/receipt identities and measurements; later documentation-only commits do not restamp this deployed source.

The [WebKit follow-up](experiments/DEMO_PERFORMANCE_FIXES.md#webkit-embedded-font-readiness-follow-up) waits for the actual Inter font instead of an indefinitely pending embedded `document.fonts.ready`. Thirty targeted concept/performance scenarios passed across the three engines, including a simulated stalled whole-set font promise. Local/static and live verification cover the resulting gallery; this does not publish the private library package or close human release gates.

## Build and verify

Use Node from `.nvmrc` and npm 11.19.1 after `npm ci`:

```sh
npm run build:pages
npm run check:pages
npm run check:demo-performance
```

The build captures its commit/tree/source digest before compilation, extracts a clean commit into an isolated directory (or copies an exact dirty snapshot for local development), and uses the pinned installed dependencies. It checks inputs before/after compilation, prefixes Pages font URLs, preserves notices and `.nojekyll`, and seals every emitted file with SHA-256. Source changes during the build fail instead of being mislabeled. Internal relative source aliases remain within the snapshot; output symlinks are rejected.

The `production,pages` build prerenders **35 routes** with base `/ng-echarts/`, physical route HTML, hydration metadata and lazy modules. Chart possibilities retains the byte-identical standalone document for offline use and derives an embedded edition with a shared font and a hashed modular engine. Both editions and the engine are validated against their source before sealing; the URL revision must match the standalone source hash prefix. Native and graphical linked ranges and the focused radar/radial galleries remain covered.

Browser build statistics supply route-specific renderer/component preload hints for prerendered HTML, normal SSR and later client navigation. Documentation routes do not initially warm chart engines; sidebar hover/focus can warm the intended chart destination. `check:demo-performance` uses the same operation lock and verifies the sealed source/artifact before and after checking route bytes, controlled first-visible-chart readiness and normal-motion router journeys. The navigation guard records first visits and revisits separately; see the [navigation/animation follow-up](experiments/DEMO_PERFORMANCE_FIXES.md#navigation-and-animation-follow-up). It writes ignored evidence to `dist/demo-performance.json`; it does not issue a deployment verification receipt. CI and `deploy:pages` run this additional gate. See the [performance implementation record](experiments/DEMO_PERFORMANCE_FIXES.md).

After editing the standalone gallery or its engine entry, run `npm run concepts:generate` after formatting. `npm start` and normal/Pages builds prepare the derived assets automatically in ignored `tmp/concept-assets/`; builds reject stale engine bytes or revisions instead of rewriting captured source. GitHub Pages controls its own HTTP cache lifetime. Hashed engine assets can be reused independently of document/style revisions; this workflow does not change hosting providers or claim to override Pages headers.

Local verification serves the artifact without a SPA fallback and checks integrity before/after the Chromium, Firefox and WebKit flows. A successful run writes `dist/pages/pages-verification.json`, bound to the exact marker bytes. Failed or partial checks cannot authorize publication. Build/check/upload share an operation lock; dead-owner locks recover automatically. Build outputs and receipts remain ignored.

Dirty builds are supported for local review, but cannot be published or promoted after committing them. Any source commit/change—including documentation-only commits—or artifact change requires a fresh build/check. The wrapper creates:

- `dist/pages/browser/preview-build.json`: immutable build-time commit/tree/source hash, dirty flag, toolchain, timestamps and every asset's digest.
- `dist/pages/pages-verification.json`: local three-browser receipt bound to that marker.

## Publish an update

Commit and push the intended source before publishing:

```sh
git push origin main
npm run deploy:pages
```

The command first checks clean/pushed source, then builds and verifies it. The upload helper rechecks source, output, receipt and current remote `main`, verifies its temporary copy, and publishes both the original marker and `preview-verification.json`. It never replaces build identity with deployment time. Missing/legacy markers, stale or edited assets, incomplete receipts and an outdated/unpushed commit fail before any GitHub publication.

A normal commit updates `gh-pages` without force-pushing. Existing Pages settings remain `gh-pages` at `/`; a different source configuration is rejected. Git/GitHub CLI credentials retain their normal handling. Direct branch pushes and older helpers are outside this guarded workflow.

Wait for GitHub's deployment, then verify the public bytes and browser flows:

```sh
gh run list --branch gh-pages --limit 3
node tools/check-pages.mjs https://phalla-doll.github.io/ng-echarts/
```

Public checks require the expected source commit (current HEAD by default), a clean marker and its receipt, and verify every inventoried asset before browser checks. They do not issue a local publication receipt. For an audit of an earlier known deployment, pin that exact source explicitly:

```sh
PAGES_EXPECTED_COMMIT=<full-source-commit> node tools/check-pages.mjs https://phalla-doll.github.io/ng-echarts/
```

Inspect [build provenance](https://phalla-doll.github.io/ng-echarts/preview-build.json) and [verification receipt](https://phalla-doll.github.io/ng-echarts/preview-verification.json) for the current deployment. A later documentation-only commit does not rewrite an already published identity. CI seals/checks its clean checkout before the full suite refreshes tracked evidence files; pushes to `main` still do not automatically publish.

The [hardening report](experiments/PREVIEW_DEPLOYMENT_HARDENING.md) records the regression coverage and final checkpoint. This publishes the experimental demo, not the library package; human release gates remain pending.

## Historical deployment records

The entries below retain the versions, route counts, verification scopes and working-tree states recorded at their original checkpoints. Use the verified deployment above or the public marker for the current preview identity.

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

The deployed `/sankey/` route includes native flow tables, installed-consumer coverage and route performance guards. Source changes alone do not update the published preview; use the guarded clean/pushed deployment workflow for publication.

Combined rc.11 source includes the completed [presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md) and focused Sankey entry. The verified public checkpoint above includes the presentation changes, the 34-route build and its three-browser receipt. Its route payload/readiness guards remain unchanged.


## Local stacked-composition verification — 15 November

The rc.21 [stacked-composition report](experiments/NG17_STACKED_COMPOSED.md#sealed-pages-verification) records a fixed local clone after concurrent illustration/hover changes. Its 34 routes, 138 sealed files, all three browser flows, 16 payload budgets, six controlled mobile timing medians and normal-motion navigation checks pass. The [raw marker](experiments/rc21/pages-build.txt) and [raw receipt](experiments/rc21/pages-verification.txt) preserve exact bytes; [validation metadata](experiments/rc21/static-validation.json) identifies the tested dirty source and retained local artifact. This local review does not update the public deployment above. The normal deployment command must rebuild/check clean pushed source before any publication; rejected stale shared-workspace runs are excluded.
