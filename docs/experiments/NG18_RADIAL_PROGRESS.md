# NG18 radial progress

User-approved next increment after radar: a typed scalar progress component and a polished demo, with zero/full/loading/error behavior, native progress semantics, themes, motion, documentation and package/browser verification. This is bounded task/goal completion; battery/utilization meters and multiring/range gauges are separate scope.

## Contract and design before implementation

`RadialProgress` from the focused `/radial` entry accepts required `title` and `value: number | null`, `max` (100), description, height (240), theme/revision, locale/numeric formatting, loading/error and animation. A finite maximum must be positive; a supplied finite value must be within 0..max. Null is empty, zero is ready, and there is no silent clamping. Application error precedes loading, validation/renderer errors, empty and ready.

Use a normalized two-part Pie ring with existing ECharts/Canvas registration. Geometry uses unit weights to avoid overflowing finite large raw values. A native HTML progress element exposes the raw value and maximum before hydration; the decorative Canvas and duplicate center labels are hidden from assistive technology. The ring is noninteractive: no tooltip, point events or synthetic keyboard action is introduced. Existing root imports keep their current engines; a new private rc.6 preserves earlier candidates.

The site palette stays neutral: background `#0a0a0a`, surface `#111111`, border `#222222`, foreground `#f5f5f5`, muted `#a3a3a3` and the existing emerald series color, with inherited light tokens. Inter supplies all text, with a 28/36 percentage and 12/20 raw-value caption. Reuse the compact Code/Preview header, existing page gutters and thin focus/hover treatments. The visible ring and its exact value label carry the content; no unrelated decoration is added.

Layout: left-aligned heading, one full-width goal example, then a quiet state sandbox; at mobile width the ring and labels stay centered inside the same card. This follows the established brief rather than introducing a new page style.

```text
Radial Progress
Progress toward a defined goal.

Monthly visit goal
[reset] Scores                       Code | Preview
          ( 68% )
        6,800 of 10,000

Try value and states
```

The design review keeps a single ring and a readable denominator. It avoids presenting a general measurement as task progress. [HTML progress standard](https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element) and [WAI meter guidance](https://www.w3.org/WAI/ARIA/apg/patterns/meter/) distinguish progress from a gauge; the data policy rejects values the native element would otherwise clamp.

## Verification

Verified on Node 24.22.2 / npm 11.19.1:

- Full `npm run check` passes: 19 Pages integrity tests, strict builds/templates/declarations, documented fresh app, SSR, 266 passing browser scenarios and four expected transport-specific skips, six isolated client/SSR modes and all ten package-budget scenarios. That run included 213 Angular tests. The final rounding/focus additions pass 215 tests (204 library + 11 playground).
- Final browser follow-ups pass 24 radial/catalog scenarios and 21 radial/existing-focus scenarios across Chromium, Firefox and WebKit. They verify actual zero/full arc pixels, native raw value/max and names, keyboard updates, rejection without clamping, missing/loading/error precedence, responsive themes, reloads, hidden previews, failed imports and keyboard Retry recovery. Tiny/near-complete values preserve the distinction from true zero/full completion.
- Each engine completes 100 primary mount/destroy cycles: old renderer instance attributes clear, observer/target/motion/frame counts return to the retained secondary widget baseline after every destroy, and all resources/focus listeners return to zero on navigation. The ring has no synthetic keyboard action. The shared focus helper now falls back to the named frame when a removed Retry control has no remaining legend/table control to focus; external focus remains owned by its caller.
- Eight theme/width captures at 320/390/768/1440 px pass label bounds, native values and document-overflow checks, with no browser errors. Visual review covers [dark mobile](captures/radial/dark-320.png), [light mobile](captures/radial/light-320.png), [dark desktop](captures/radial/dark-1440.png) and [light desktop](captures/radial/light-1440.png). Additional captures show [zero](captures/radial/dark-320-zero.png), [completion](captures/radial/dark-320-complete.png) and [missing data](captures/radial/dark-320-empty.png). The [capture manifest](captures/radial/manifest.json) records source/image hashes. `npm run capture:radial` reproduces these after a production build.
- The final private rc.6 artifact is 99,133 bytes, 56 files, SHA-256 `2e4219f1bf7083a21f2bb9e9cb8386b7ab042bec55b675c0e45ec219c751ebbb`. Its [manifest](data/local-release-0.1.0-rc.6.json) identifies identical bytes passing metadata/notices inspection, strict installed declarations, the fresh documentation application and six client/SSR browser modes. Both themes of both copied examples compile, and the API guide must match the displayed example. Invalid scalar value/maximum types fail strict templates. Installed runtime checks reload `/radial` directly, require native progress in SSR HTML before hydration, and exercise completion/missing states in every engine.
- Focused radial measures 130,861 gzip / 112,275 Brotli bytes against unchanged 200,000 / 175,000 caps, with 163 engine modules and none eager. Core remains engine-free at 5,763 / 5,063; the root is 210,034 / 177,161 within its existing 212,000 / 178,000 caps. The [boundary report](data/package-boundaries.json) verifies focused Pie/Canvas registration without unrelated chart families, SVG or React. Existing root exports remain unchanged.
- Preserved rc.5 SHA-256: `014d36dfc88eb9efbc2a302b61ab0f80cbaf2fa99e1b8fd9ca1576bc60d3a60b`; rc.4: `fba7223700cbcd849cd9b3015cf1152e625c8652a7305d8ba85ffd0208b92df0`. Earlier candidate archives and versioned evidence remain unchanged.

## CI and preview

The previous radar CI failure was isolated to the existing Chromium touch-range re-arm scenario. The strengthened teardown protocol and retained failure traces are recorded in the [touch verification](TOUCH_REARM_VERIFICATION.md). Its follow-up [CI run](https://github.com/phalla-doll/ng-echarts/actions/runs/43442679687) passes on source `e43bb9a`; no chart behavior or candidate archive changed in that test-only correction.

The demo adds `/radial` to navigation/catalog and 32 prerendered routes. The guarded Pages verifier checks direct native SSR markup, hydration/reloads, value/max attributes and completion interaction alongside all existing routes. Publication uses clean pushed source, sealed output and the exact three-browser receipt. The live [build marker](https://phalla-doll.github.io/ng-echarts/preview-build.json) and [browser receipt](https://phalla-doll.github.io/ng-echarts/preview-verification.json) identify the currently published source.

Human interpretation and F09/R06/G2/G3/G4 remain deferred; the [manual review](R06_MANUAL_REVIEW.md#experimental-radial-progress-follow-up) now includes this scalar component. A typed/native widget and automated tests do not close human interpretation. No public registry publication occurred.
