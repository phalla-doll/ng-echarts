# Playground layout review

Reviewed 12 November 2026. Scope: the Angular playground interface, with the existing bar library and research gates preserved.

## Findings and direction

The previous page placed navigation, chart settings, and lifecycle actions in flat rows. On narrow screens, wrapping controls pushed the chart below the first viewport and made the active page difficult to identify.

The revised layout makes the working chart the focal point. A desktop navigation rail separates examples from validation tools, while a quiet settings column groups appearance, sample data, and state controls. On tablet, settings move below the chart in three columns; on phones, they form one column with links between the example and settings. Mobile navigation uses a disclosure with active-page feedback and Escape handling.

The design uses locally hosted Instrument Sans for interface typography, original SVG icons, and a small palette: white `#ffffff`, canvas `#f7f9fc`, ink `#202a3b`, muted `#65748a`, blue `#315bea`, and divider `#e2e8f1`. Dark surfaces follow the existing chart theme. The chart's green/rose series remain its strongest visual element. No external font requests or new runtime dependencies are required.

## Implemented behavior

- Preview and Angular code views preserve the mounted chart. The template fragment reflects theme, layout, stack, and gradient settings; applications supply the bound data, series, formatter, and handler. Copy feedback handles unavailable clipboard access.
- Reset controls restores the fixture and chart states while retaining the chosen interface theme. Theme state lasts for the current application session.
- Skip navigation, visible focus, native pressed buttons, and a keyboard-accessible mobile menu support navigation. Mobile settings links move focus to their target.
- Validation, input-update, and cleanup pages share the site shell. Comparison and benchmark routes retain full-width fixtures and the original 16 px system typography to preserve measurement conditions.
- Site styling is scoped to the playground. The library API, chart implementation, package dependencies, and existing component-style budgets are unchanged.

The local font includes its complete [SIL Open Font License](../../projects/playground/public/fonts/OFL.txt). Its source is the [official Google Fonts Instrument Sans directory](https://github.com/google/fonts/tree/main/ofl/instrumentsans).

## Visual evidence

Captures use the local development server, Chromium, reduced motion, and loaded local fonts. Desktop is 1440×1000, tablet 900×1000, phone 390×844, and small phone 320×844; full-page captures extend vertically where needed.

| View | Before | After |
| --- | --- | --- |
| Desktop | [Original](captures/playground-layout/before-desktop.png) | [Light](captures/playground-layout/after-desktop.png), [dark](captures/playground-layout/after-dark-desktop.png) |
| Phone | [Original](captures/playground-layout/before-mobile.png) | [Light](captures/playground-layout/after-mobile.png), [dark](captures/playground-layout/after-dark-mobile.png) |
| Additional views | — | [Tablet](captures/playground-layout/after-tablet.png), [320 px phone](captures/playground-layout/after-small-mobile.png), [navigation](captures/playground-layout/mobile-navigation.png), [Angular code](captures/playground-layout/after-code.png) |

The review checked chart prominence, spacing, control grouping, typography, menu placement, dark surfaces, and clipping. The initial muted switch indicator was strengthened to exceed 3:1 contrast against its track. Muted body text exceeds 4.5:1 on the light canvas; automated scenarios confirm no page-level horizontal overflow at 320, 768, and 1440 px.

## Verification and limits

`npm run check` passed: production builds, strict compilation, 33 unit/integration tests, isolated declarations and client/SSR consumers, SSR checks, package-size budgets, and 49 browser scenarios across Chromium, Firefox, and WebKit. Two Chromium-only diagnostics are skipped in the other engines. After the final mobile anchor and style adjustments, the playground was rebuilt and all 12 layout/comparison scenarios passed again.

The new scenarios cover skip links, menu keyboard behavior and route closing, mobile settings navigation, code/preview synchronization, successful and denied clipboard feedback, reset, theme, resize, and browser/hydration errors. The isolated runtime fixture now serves the local font with the correct MIME type.

The [R04/R05 report](R04_R05_VALIDATION.md) remains the historical lifecycle/resource baseline at `f96a0a9`; its raw node counts have not been relabeled as measurements of this new shell. The [R03 comparison evidence](R03_VISUAL_REVIEW.md) remains the chart visual baseline. This interface review does not complete the [R06 human listening review](R06_MANUAL_REVIEW.md); G2 remains pending.
