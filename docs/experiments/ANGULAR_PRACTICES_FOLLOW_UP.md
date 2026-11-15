# Angular practices follow-up

Date: 15 November 2026. Scope: unreleased rc.19 source; the published rc.18 package and preserved candidate archives remain unchanged. Human F09/R06/G2/G3/G4 remain pending.

## Changes

The user requested implementing the findings from a review against Angular's official documentation:

1. Replace effect-driven state reconciliation with `linkedSignal` across chart families: renderer failures reset on relevant input changes, hidden legend identities survive invalid inputs and are pruned on valid removals, and stale Cartesian plot previews clear with their source context. Remaining Cartesian effects synchronize imperative preview bookkeeping and output events.
2. Declare explicit render phases. Controller updates use `write`; theme-color probing and focus-related operations use documented `mixedReadWrite` phases. Preserve browser-only initialization, application-stability guards, dimension-aware adapter scheduling, teardown and reduced-motion behavior.
3. Move 83 playground files into feature directories, colocating tests/templates/styles. Update lazy imports, cross-feature imports, route preload mappings, concept-asset validation, isolated consumer entry paths, capture tools and active documentation links. Public demo URLs remain unchanged. Historical capture manifests and release archives retain their original evidence.

The [architecture guide](../TECHNICAL_ARCHITECTURE.md#dependent-state-and-render-phases) describes the final boundaries and [feature layout](../TECHNICAL_ARCHITECTURE.md#playground-feature-organization).

## Regression coverage

- All nine chart families exercise renderer failure retention, explicit retry, unrelated caption changes and synchronous recovery on a relevant input change.
- Bar, line, area, composed and pie exercise legend preservation through invalid rows and identity removal/reintroduction while loading.
- Existing tests cover preview opt-in, focus retention, range-mode Escape, pagination, resizing, hydration, navigation and teardown.

## Validation

Using Node 24.22.2 and npm 11.19.1:

- `npm run check` passes: formatting, Pages provenance tests, demo-asset tests, production builds, strict compilation, unit tests, isolated consumers, SSR, package budgets and the complete browser suite.
- Unit tests: 281 library tests and 16 playground tests pass (297 total), including 14 new state regressions.
- Packed declarations and all documented/generated examples compile outside the workspace with `skipLibCheck: false`.
- The fresh integration-guide application builds, renders and hydrates in Chromium, Firefox and WebKit.
- Production SSR and six independently installed client/SSR browser modes pass. Current receipts: [documentation consumer](data/ng15-documentation-consumer.json) and [packed runtime](data/packed-runtime.json).
- All twelve package-budget scenarios pass with no eager engine modules; current [package boundaries](data/package-boundaries.json) record the measured sizes.
- Browser suite: 446 pass and four expected skips across Chromium, Firefox and WebKit. This working-tree run included concurrent theme-persistence changes and their browser tests; those edits are separate from the Angular-practices refactor. The skipped cases are horizontal touch drag in Firefox and WebKit, and Chromium-specific memory retention in those two browsers. Preview enablement, keyboard focus, range-mode Escape, resize/update coalescing, hydration, navigation and repeated teardown remain covered.
- `npm run build:pages` and `npm run check:pages` pass for 34 prerendered routes and 138 sealed files under `/ng-echarts/`, including reloads, lazy charts/fonts, anchors, focus, themes and mobile navigation in all three engines. This is a local-only dirty source snapshot; the normal clean/pushed-source and fresh-receipt deployment guards remain in force. Local build and verification receipts are in `dist/pages/browser/preview-build.json` and `dist/pages/pages-verification.json`.
- Relative module imports resolve, and all 49 static playground-source paths in tools/tests point to existing files. Active changed documentation file links and heading anchors resolve; `git diff --check` passes.

The documentation and runtime consumers independently packed the same local library bytes (SHA-256 `85fd51a061557f6a33255c77581add6d1868ca47f45334f182d178953f5d38ba`). This is source verification, not a prepared or published release candidate. No package publication, deployment or human release acceptance is part of this follow-up. No timing improvement is claimed by the render-phase refactor.

## Official references

- [Angular dependent state with linkedSignal](https://angular.dev/guide/signals/linked-signal)
- [Angular effects](https://angular.dev/guide/signals/effect)
- [Angular afterRenderEffect phases](https://angular.dev/api/core/afterRenderEffect)
- [Angular feature organization](https://angular.dev/style-guide#organize-your-project-by-feature-areas)
