# rc.17 release follow-up

Reviewed 14 November 2026. Exact private-candidate automated verification passed. Human F09/R06/G2/G3/G4 remain pending. No npm publication.

## Scope and preservation

Private `0.1.0-rc.17` includes [application theme inheritance before hydration](THEME_HANDOFF.md), preserving light/dark defaults and partial inherited overrides across all nine families. The demo also includes the committed typography readability correction. The rc.16 archive and all earlier archives and historical evidence retain their identities.

The current release checklist, installation examples, packaged README/changelog and demo installation text identify rc.17. Historical rc.0–rc.16 reports retain their original version numbers and results.

## CI correction

The two preceding workspace runs reached the 25-minute job limit. Their partial logs also showed a Chromium touch-swipe failure and a WebKit concept-gallery timeout. Those interrupted runs are not complete acceptance evidence.

[The split CI run](https://github.com/phalla-doll/ng-echarts/actions/runs/43596126549) separates workspace/exact-package checks, sealed Pages/performance checks and one browser job per engine. The matrix retains all existing browser cases with one worker per engine and no retries; failure in one engine does not cancel the others. Failure/cancellation traces and exact candidate evidence are uploaded for inspection. Local `npm run check` still runs every workspace and browser stage.

## Rapid touch activation correction

The [Linux diagnostic before the correction](https://github.com/phalla-doll/ng-echarts/actions/runs/43597081425) failed all five repetitions. Its [captured event sequence](rc17/touch-before-events.json) shows a valid touch release on Select range without the compatibility click after a captured chart drag. The button now handles a primary touch release within its bounds, prevents the following touch-end compatibility click, and preserves native mouse/keyboard activation. Canceled pans and releases outside the button do not activate it. Canceling the following touch-end also handles WebKit's MouseEvent compatibility click, which has no pointerType. The copied standalone example and guide use the same behavior.

[Five focused Linux repetitions passed after the touch-release correction](https://github.com/phalla-doll/ng-echarts/actions/runs/43597424706). The final three-engine linked regression also verifies the WebKit deduplication and retains real horizontal dragging and orthogonal touch scrolling. These demo/example changes do not modify the prepared library tarball.

## Verification

Toolchain: Node 24.22.2 and npm 11.19.1.

- Workspace formatting, 20 Pages provenance tests, five demo-asset tests, production builds and strict compilation: passed.
- Unit/integration tests: 267 passed across 50 files (251 library and 16 playground tests).
- Strict installed declarations and invalid-consumer rejection, fresh documented install/build/hydration in three engines, SSR markup and six installed client/SSR runtime modes: passed.
- Twelve bundle scenarios: passed; focused/core/root/root-frame caps remain unchanged.
- Final linked/range/preview browser regression: 49 passed, two documented Chromium-CDP-only skips, across Chromium/Firefox/WebKit. The new real-touch button scenario runs in every engine.
- The complete final suite contains 420 browser cases. Its final outcome is recorded by the [workspace CI workflow](https://github.com/phalla-doll/ng-echarts/actions/workflows/ci.yml?query=branch%3Amain). Interrupted or superseded local attempts are not counted as a passing complete run.
- Chromium's real mobile touch range scenario: passed three consecutive focused local runs; the full Linux outcome remains separate.
- Exact local rc.17 candidate: metadata/notices, strict declarations/negative consumers, fresh documented installation and six client/SSR modes passed; [immutable candidate manifest](data/local-release-0.1.0-rc.17.json). The 155,614-byte, 68-file tarball has SHA-256 `137e46a6bfce1c6e3e9816cf43792734cfc9506372ffa7c97a2a3b56a1b7f7e8`. The same tarball was checked again against the linked touch follow-up; no replacement was packed.
- All 55 retained rc.0–rc.16 archives, checksum files and historical candidate manifests retained their digests.
- [Fresh bundle evidence](rc17/package-boundaries.json) covers all twelve import scenarios; earlier generic evidence files retain their historical bytes.
- The first split CI completed workspace/exact-candidate, sealed Pages/performance, Firefox and WebKit successfully; Chromium exposed the touch issue corrected above. The final workflow preserves the original required `check` name as an aggregate that fails if any workspace, Pages or browser job fails or is canceled. Successful individual jobs alone do not accept the full run.

## Accessibility review preparation

The [human result sheet](RC17_HUMAN_REVIEW.md) records environment, commit/artifact identity and five criteria for all nine chart families plus linked interaction. All human rows remain pending. Agent-browser accessibility-tree observations on the local production build confirm discoverable bar table row/column headers and named actions, scalar native progress, separate Sankey incoming/outgoing totals and recorded-zero actions, and named linked Period/preview controls. These are machine observations, not human interpretation or listening results:

- [Bar tree](rc17/bar-accessibility-tree.txt).
- [Radial progress tree](rc17/radial-accessibility-tree.txt).
- [Sankey tree](rc17/sankey-accessibility-tree.txt).
- [Linked tree](rc17/linked-accessibility-tree.txt).

## Public distribution

The [NG22 preparation](../PUBLICATION.md) records the proposed npm names, actual 404 registry lookups, failed npm authentication (401), an exact-tarball prerelease sequence and the trusted-publishing setup. No public name is selected or reserved; npm account/scope rights remain unverified. Public publication requires the selected identity, an accepted public artifact and the outstanding human evidence.
