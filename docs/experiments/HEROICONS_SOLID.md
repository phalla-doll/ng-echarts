# Heroicons solid navigation review

The user selected Heroicons after reviewing Lucide and requested distinct icons throughout the validation section. The demo now uses Heroicons v2.2.0's 20 px solid set at 18 px in navigation. Area, composed, radar and radial progress use original filled chart glyphs on the same grid. Components has a grid symbol; Sankey has a branching share symbol. All eleven validation links have distinct geometry, with chart-family symbols matching their gallery links.

`SiteIcon` renders native Angular SVG paths, preserves upstream fill/clip rules, inherits `currentColor`, and retains decorative `aria-hidden` and nonfocusable treatment. Other controls retain their existing dimensions. No runtime dependency is added. The existing Heroicons MIT notice and earlier outline provenance remain intact; the [new manifest](data/heroicons-solid-provenance.json) records exact upstream SVG hashes and original geometry. See the [upstream ledger](../UPSTREAM_PROVENANCE.md#demo-site-icons-heroicons-solid).

## Validation

- Node 24.22.2 and npm 11.19.1.
- Library and production playground builds passed; the final solid-icon playground production build passed again after the icon change, including Angular's strict template compilation.
- All 21 existing scenarios in `site-pages.spec.ts`, `playground-layout.spec.ts`, and `code-examples.spec.ts` passed across Chromium, Firefox and WebKit. These cover responsive documentation, navigation and keyboard behavior, theme changes, copy/reset controls and hydration errors.
- The local browser audit found 36 rendered icon instances with no invalid decorative/focus/view-box/fill attributes; all 27 navigation icons measured 18 px. The eleven validation links had eleven distinct icon geometries. No horizontal overflow at 1440 px and no browser runtime errors were observed.
- Visual inspection checked desktop and mobile icons in both themes. [Capture metadata and hashes](captures/heroicons-solid/manifest.json) distinguish the original outline production baseline from the current local development preview.

## Final code review

No functional defects were found in the icon changes. The review compared all 26 official runtime glyphs against the pinned upstream SVGs, including path order and fill/clip rules; verified all four original glyphs against their recorded geometry; and rechecked the preserved notice, source and six screenshot hashes. All eleven validation links have distinct geometry. Typed required inputs, computed icon selection, index-tracked path updates, null attribute removal, theme inheritance and decorative focus behavior remain compatible with the existing consumers. Formatting, documentation links/heading anchors and `git diff --check` passed. The capture metadata now explicitly distinguishes reduced motion in current previews from the original baseline, where it was not configured.

## Comparison captures

| View | Capture |
| --- | --- |
| Original outline sidebar, light | [Before](captures/heroicons-solid/before-light.png) |
| Solid sidebar, light | [After](captures/heroicons-solid/after-light.png) |
| Solid sidebar, dark | [Dark](captures/heroicons-solid/after-dark.png) |
| Mobile navigation, light | [Mobile light](captures/heroicons-solid/mobile-light.png) |
| Mobile navigation, dark | [Mobile dark](captures/heroicons-solid/mobile-dark.png) |
| Distinct validation icons, dark | [Validation](captures/heroicons-solid/validation-dark.png) |

The local preview runs at `http://localhost:4387/linked`. The user authorized committing these icon changes and redeploying the demo through the guarded GitHub Pages workflow. Package publication, archived releases and human release gates remain unchanged. Pre-existing library and benchmark work remains separate and is excluded from this commit and deployment.
