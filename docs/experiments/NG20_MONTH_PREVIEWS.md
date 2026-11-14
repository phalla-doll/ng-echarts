# NG20 transient month previews and mobile tap follow-up

The user authorized the next work after reviewing current progress and the failed main CI run. This increment adds opt-in, one-way month previews to the linked visits example and extends the deferred human checklist to calendar and Sankey. It does not publish the library, deploy the demo or close human F09/R06/G2/G3/G4.

## Bounded contract

The preview-only checkpoint is rc.15; the [combined preview/performance checkpoint](COMBINED_PREVIEW_PERFORMANCE.md) tracks its successor rc.16. The initial rc.13 source added bar `previewEnabled` (false by default) and `pointPreview: PointPreview<T> | null`. A preview carries original row identity, raw numeric value, series ID, plot/table source and pointer/focus trigger. Zero has a native action; missing values do not. A preview never emits `pointSelect`, changes controlled selection or connects ECharts instances.

The application owns a separate transient signal and derives the companion data. Preview titles are explicit; Period, range bounds, source feedback, committed total and local legends remain independent. Native table focus is the keyboard equivalent. Only focus previews enter a polite live region. Pointer exit restores focused context or the committed period. Escape, input/state/visibility changes and range activation clear context; click/Enter/Space commits through existing selection. Touch compatibility hover is ignored.

DOM event delegation stays in the browser adapter, with four listeners per enabled chart rather than per value cell. Disposal and disabling remove the listeners. Only bar exposes the public opt-in/output; other Cartesian components keep their existing API. Renderer resize clears pointer context only when dimensions actually change, rather than during ordinary option updates.

## Mobile tap evidence and safeguard

[Main CI run 43568696475](https://github.com/phalla-doll/ng-echarts/actions/runs/43568696475) recorded 355 browser passes, four expected skips and one Chromium mobile touch failure. The first horizontal range committed successfully; a second completed native tap did not arm the button. The retained trace confirms activation failure but does not establish its browser-internal cause. Eight unchanged local repetitions passed before editing, so a deterministic local reproduction was not obtained.

The range button now uses `touch-action: manipulation` to make rapid tap activation explicit while retaining panning and pinch zoom. Its regression checks that policy, commits three consecutive forward/reverse ranges with immediate re-arming, and then checks real vertical touch scrolling and unchanged committed bounds. No sleeps, retries, skipped assertion or reduced expectation is added. A future pushed CI run must confirm the Linux-runner outcome; local results alone do not turn the old run green.

## Package cost

The rc.13 compatibility root measured **218,831 gzip / 186,834 Brotli bytes**, up **1,234 / 991** from rc.11/rc.12 (217,597 / 185,843). Its previous near-full allowance of 218,000 / 186,000 therefore becomes **219,500 / 187,500**. Emitted root-frame orphan chunks measure **202,369 / 174,483**, up **974 / 872**; their allowance becomes **203,000 / 175,000**. The reachable frame remains engine-free. All twelve [package scenarios](data/package-boundaries.json) pass; focused 200,000 / 175,000, core 10,000 / 9,000 and demo route limits remain unchanged. No chart family or engine dependency is added by preview support. Earlier measurements and archives retain their original caps/results.

The pointer channel retains only the latest hit and deduplicates identical row/series/context signals. It reconciles a hit after Angular propagates the enabling input, so immediate entry does not require another move. Model, formatting, layout/theme, visibility and table changes invalidate old snapshots; explicit point/range commits clear the retained hit. Unit checks cover obsolete-context invalidation and listener cleanup; the real-pointer browser test enters immediately after enabling, before requiring another move.

## Visual review

The [capture manifest](captures/linked-preview/manifest.json) records the rc.13 presentation checkpoint source/image digests, viewports and observed state. Compare the settled [deployed baseline](captures/linked-preview/before-desktop.png) at source aa394e5 with the [desktop preview](captures/linked-preview/dark-desktop-preview.png), both at 1440 × 1100. The [dark 390 px layout](captures/linked-preview/dark-mobile-enabled.png) and [light 390 px keyboard preview](captures/linked-preview/light-mobile-keyboard.png) retain the existing typography, palette and chart hierarchy. At [320 px](captures/linked-preview/light-320-keyboard.png), the checkbox/hint wrap cleanly, table values remain readable, the February action has visible keyboard focus, and neither page nor table overflows. Escape restores the committed All months context. The later rc.14/rc.15 fixes change focus/listener timing and retain the captured geometry and copy. This visual QA does not supply the deferred screen-reader listening result.

## Corrected keyboard candidate

The first full browser regression passed 362 scenarios with four expected skips. A new installed-runtime assertion then exposed focus arriving before the opt-in input installed delegated listeners. The prepared **rc.13** archive (153,908 bytes; SHA-256 `225069ff3ce578e5f8326a3e9c2b2d8d292a82c4fd0c70d2140155ab4eff5aba`) is preserved with [failed runtime status](data/local-release-0.1.0-rc.13.json); metadata/notice inspection is not presented as completed consumer acceptance.

**rc.14** corrects attachment by reading the current native table focus and emitting its original row/value after opt-in becomes active. It does not move focus or require another Tab. Unit coverage includes a value focused before attachment; installed client/SSR checks explicitly enable previews and immediately focus a value before committing with Enter. Corrected exact-candidate checks are recorded separately below.

rc.14 passed its exact declarations/docs/six-mode client/SSR checks. The later stronger range-mode Escape assertion exposed preview reappearance in Firefox/WebKit (44 passes, two failures and two expected skips). Its [artifact record](data/local-release-0.1.0-rc.14.json) remains unchanged and describes the checks actually run. **rc.15** retains opt-in listeners while range mode suppresses events, so exiting range mode does not replay the focused value. The corrected behavior is covered by the same assertion in every engine.

## Verification

Verified preview-only rc.15 source on 14 November 2026; [the scoped receipt](data/ng20-month-previews.json) records source digests and actual results.

- Production library/playground builds, strict TypeScript/templates, **260 unit/integration tests**, SSR markup and all **twelve package scenarios** pass.
- Final linked/preview/range suites pass **46 scenarios with two expected CDP-only skips** across Chromium, Firefox and WebKit. This includes immediate hover/focus opt-in, range-mode Escape, raw/zero values, stale model clearing, committed filters, independent legends, responsive themes and lifecycle cleanup.
- The earlier full browser baseline passed **362 scenarios with four expected skips** before the final focus corrections. Its following installed-runtime stage caught the rc.13 issue. That baseline and final targeted run are distinct scopes; they are not added together or described as a completed final-source `npm run check`.
- Exact **rc.15** metadata/notices, strict declarations and negative bindings, copied guide source, fresh locked installation and all **six installed client/SSR modes** pass. Every runtime mode explicitly checks a keyboard preview followed by Enter selection. The **154,538-byte, 68-file** archive has SHA-256 `c0f85b98b1c61223a16f5287c2125c63305d6e69cde3a784c7083aa9dfd4d91f`; [its immutable manifest](data/local-release-0.1.0-rc.15.json) binds every stage to that same file.
- All retained rc.0–rc.14 archives match their recorded digests. The rc.13 failed implementation record and rc.14 passing artifact checks retain their original scopes. Human F09/R06/G2/G3/G4 and registry publication remain pending.

Final rc.15 costs are **218,893 gzip / 186,940 Brotli** for root and **202,412 / 174,547** for emitted root-frame chunks; core is **7,903 / 6,961** with no engine modules. The root-frame reachable import remains engine-free. The bounded caps above remain unchanged.

The preview-only static attempt was invalidated when concurrent performance edits changed source during verification; no stale receipt was promoted. The [combined rc.16 checkpoint](COMBINED_PREVIEW_PERFORMANCE.md) owns the fresh final static and navigation checks. The rc.15 artifact/evidence above remain unchanged.
