# NG09 foundation and NG10 bar acceptance

Reviewed 12 November 2026 against baseline `9574592`. Status: pass for implementation and automated acceptance. Scope: the shared public contracts and current MVP bar implementation. Human R06 listening and G2 remain pending under the user's explicit deferral; no full accessibility or release acceptance is asserted.

## Foundation decision

NG09 implementation is complete for the bar-proven baseline: typed contracts, deterministic state/formatting policy, native controls, browser lifecycle isolation, and measured core/bar package entries. NG10 implements every bar behavior selected by the product specification. Development can proceed to NG11; family-wide validation remains NG14 work and cannot be inferred from bar results.

Core owns `ChartFrame` and public types. Bar owns its working transformations, formatting helpers, focus handling, and adapter. Do not extract generic runtime abstractions before another family demonstrates equivalent needs. Line development should preserve these contracts and move only demonstrated common logic into a deliberate shared boundary, while retaining the existing bar budget and tests.

## Requirement review

| Requirement | Current bar result | Evidence |
| --- | --- | --- |
| F01 typed data | Pass | Strict installed declarations/negative templates; `bar-model.spec.ts`; private exports blocked |
| F02 immutable updates | Pass | `updates.spec.ts`, `plot-controller.spec.ts`; retained/new series IDs and latest original-row events |
| F03 numeric/category text | Pass | Formatting/category unit tests, `value-formatting.spec.ts`, `comparison.spec.ts`; raw values and missing observations preserved |
| F04 resize/visibility | Pass | Comparison at 320/768/1440 host widths; hidden-host and resize lifecycle checks |
| F05 interaction events | Pass for automated scope | Painted-bar clicks, keyboard table actions, legend events, and combined bar-variant checks |
| F06 themes/tokens | Pass | Both themes, explicit palette revision, host typography, and cross-variant tests |
| F07 states/recovery | Pass | Error/loading/invalid/empty/ready precedence, no stale actions, import failure/retry and formatter recovery |
| F08 motion | Pass | Renderer-boundary animation assertions and actual preference-change browser checks |
| F09 interpretation | Automated checks pass; human review pending | Named native controls, focus repair, values, and missing labels tested; [R06](R06_MANUAL_REVIEW.md) remains deferred |
| F10 SSR/hydration | Pass | Multiple/deferred charts, event replay, late-import teardown, and isolated installed client/SSR consumers |

Referenced tests live in `projects/chart-library/bar/src/lib/` and `tests/browser/`. Historical R03–R08 reports retain their recorded conditions and results; current routine checks extend those baselines rather than rewriting past evidence.

## Bar-specific checklist

- Grouped and stacked series; vertical and horizontal category/value axes.
- Solid and gradient fills, rounded bars, correct value-axis gradient direction in both themes.
- Stable row/series IDs with duplicate category labels; positive, negative, zero, and missing values preserved across all eight option combinations.
- Plot/table actions retain the updated input values; single renderer instance remains usable while switching combinations.
- Table enabled by default, full dataset retained under legend filtering; gallery intentionally opts out with matching copied source.
- Four pinned upstream examples compared in the [R03 review](R03_VISUAL_REVIEW.md); documented geometry/typography/control differences remain intentional.
- Copyable Angular examples, real local installation, [bar API/defaults/limits](../BAR_CHART_API.md), provenance, and notices available.
- Warm performance evidence and supported envelope retained from [R07](R07_RENDERER_COST.md); focused bar/core and compatibility entries checked by the [package review](NG09_PACKAGE_BOUNDARIES.md).

This review adds sixteen pure option-contract cases (eight combinations × two themes) using mixed signed, zero, and missing observations, plus two three-engine browser scenarios exercising all combinations with updated values and pointer/keyboard actions. It changes no runtime chart logic or visual styling.

## Release status and next implementation

NG09/NG10 implementation completion does not close NG06/R06/G2 or NG14–NG16. The package remains private and experimental; final distribution licensing, publication identity, family-wide documentation, and remaining chart families stay open. The user's deferral permits implementation progress without pretending that a listening session occurred.

NG11 is next: typed multi-series lines, optional points, missing-value gaps, straight/smooth interpolation, a focused line entry, pinned upstream fixtures, gallery examples, and family-specific behavior/visual evidence. Preserve Inter/Google Sans Code, Heroicons, shared site spacing, light/dark themes, SSR/hydration, and existing bar isolation while adding it. Area follows the proven line foundation; pie/donut retains its separate single-measure category contract.

## Verification

The complete `npm run check` passed: formatting, production builds, strict Angular/TypeScript compilation, 68 unit/integration tests, installed declarations (including the actual bar API guide example and intentionally invalid templates), production SSR, 91 browser scenarios with two CDP-only skips, isolated client/SSR runtime checks in Chromium/Firefox/WebKit, and all four package-boundary scenarios. The six targeted combination scenarios also passed independently.

Focused sizes remain 178,668 gzip / 152,797 Brotli bytes for bar and 990/855 for core, within unchanged budgets. Rendering algorithms and lifecycle code did not change, so the existing R07 benchmark remains the performance baseline rather than recording an unnecessary new timing run. Prior baseline `9574592` had 52 unit/integration tests and 85 browser scenarios.
