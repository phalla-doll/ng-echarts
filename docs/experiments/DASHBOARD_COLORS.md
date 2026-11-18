# Visits dashboard color refinement — 18 November 2026

The dashboard forced slate surfaces and blue borders inside the demo's neutral dark theme. Its grid children also added an outline around the library's own chart frame, producing doubled corners.

The application now uses charcoal surfaces (`#111`), neutral borders (`#292929`), and gray supporting text. Light mode uses white surfaces with the same neutral hierarchy. Teal desktop values, blue mobile values and a dashed gold mean distinguish the series without the previous bright pink/green pairing. Each chart has one frame outline. The introductory copy is muted to match the surrounding documentation.

The refinement applies to the live dashboard source and the published-rc.22-compatible native example. Both displayed standalone sources were regenerated. Independent dashboard/site themes still work. Library implementation, package metadata, immutable artifacts and release gates are unchanged.

## Visual review

- [Before: dark desktop](dashboard-colors/captures/before-dark-1440.png)
- [After: dark desktop](dashboard-colors/captures/after-dark-1440.png)
- [After: light desktop](dashboard-colors/captures/after-light-1440.png)
- [After: dark mobile](dashboard-colors/captures/after-dark-390.png)
- [After: light mobile](dashboard-colors/captures/after-light-390.png)
- [After: dark areas](dashboard-colors/captures/after-dark-area-1440.png)

[Capture provenance and hashes](dashboard-colors/captures/manifest.json) distinguish the deployed baseline from the local production build. Desktop and mobile screenshots were inspected for surface consistency, chart readability, legend wrapping and clipping.

## Verification

Node 24.22.2 and npm 11.19.1 were used.

- Production playground build, strict compilation and repository formatting pass.
- [42 dashboard cases](dashboard-colors/browser-final.txt) pass across Chromium, Firefox and WebKit. They include neutral panel/card surfaces, a single chart outline, independent themes, field contrast of at least 4.5:1, responsive widths from 320 to 1440 px, native keyboard controls and graphical range interaction.
- [33 additional cases](dashboard-colors/pixel-regression.txt) pass across the same engines for bar/composed hits, formatting, linked selection, previews and tooltips. The shared pixel probe now reads the rendered legend color rather than hard-coding green. The [initial run](dashboard-colors/browser-initial.txt) passed 36 cases and failed the three old-color probes; those failures are retained.
- Fresh standalone consumers compile, server-render and hydrate in all three engines: [digest-verified published rc.22 native example](dashboard-colors/native-consumer.json) and [exact rc.33 graphical example](dashboard-colors/interaction-consumer.json).
- The preserved rc.33 archive still has SHA-256 `5d0230b8b9fccdab7d3b32e846ca5bfb1780a9cb1094f2f21b006ebc4bf33735`. No library source or archived package bytes changed.

This record covers local implementation and verification. No new publication or Pages deployment is claimed. npm `next` remains rc.32, `latest` remains rc.18, and deployed source remains `4fe085b6ce3eae9b0bb5c334520dd53fa9e7bec4`. Human F09/R06/G2/G3/G4 remain deferred/pending.
