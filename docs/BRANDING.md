# Orbit e identity

Selected 13 November 2026 from the three logo concepts. The production mark is a flat vector interpretation of the selected blue “e” and detached chart segment.

## Assets

All served assets live in `projects/playground/public/`:

| Asset | Use |
| --- | --- |
| [`brand/orbit-e.svg`](../projects/playground/public/brand/orbit-e.svg) | Editable master, transparent 128 × 128 view box, ultramarine `#1439ed` |
| [`brand/orbit-e-light.svg`](../projects/playground/public/brand/orbit-e-light.svg) | Light blue `#9ba8ff` for the site's dark theme |
| [`favicon.svg`](../projects/playground/public/favicon.svg) | Vector browser icon on a white rounded tile |
| [`favicon.ico`](../projects/playground/public/favicon.ico) | 16, 32 and 48 px browser icons |
| [`favicon-32x32.png`](../projects/playground/public/favicon-32x32.png) | 32 px PNG browser icon |
| [`apple-touch-icon.png`](../projects/playground/public/apple-touch-icon.png) | Opaque square 180 px touch icon; the device supplies the corner mask |
| [`og-image.png`](../projects/playground/public/og-image.png) | 1200 × 630 Open Graph and Twitter preview |
| [`brand/og-image.svg`](../projects/playground/public/brand/og-image.svg) | Editable vector social-image layout |

The desktop sidebar and mobile header pair the mark with the existing Inter text wordmark. Theme changes select the appropriate SVG. The home links retain their accessible name; their logo images use empty alternative text to avoid repeating the link name.

The repository README opens with the same social cover using a repository-relative image path.

## Regenerate

Edit the master mark or the social-image layout in [`tools/generate-brand-assets.mjs`](../tools/generate-brand-assets.mjs), then run:

```sh
npm run brand:generate
```

The generator uses the workspace's Playwright Chromium and locally licensed Inter font. Install Chromium with `npx playwright install chromium` if needed. It derives the dark-theme variant, favicon SVG, PNG/ICO icons and social image from the same mark without a network font request. The social-image SVG is generated; update its layout in the generator rather than editing that output.

## Metadata and hosting

[`projects/playground/src/index.html`](../projects/playground/src/index.html) includes favicon/touch-icon links and Open Graph/Twitter large-image metadata. Served icon and header-image paths are relative to the document base, preserving both ordinary SSR hosting at `/` and GitHub Pages at `/ng-echarts/`. Social image URLs are absolute and point to the documented public demo: `https://phalla-doll.github.io/ng-echarts/og-image.png`.

After changing the public host or repository path, update `og:url`, `og:image` and `twitter:image` alongside the Pages configuration. Social crawlers receive these tags in the initial HTML without JavaScript. The image becomes available on the public demo after the normal [Pages deployment](GITHUB_PAGES.md#publish-an-update).

This identity update does not publish a library candidate or close any human release gate.

## Verification

Verified locally on 13 November 2026 with Node 24.22.2 and npm 11.19.1:

- Production library/playground build and strict TypeScript/template compilation pass.
- All 29 Pages routes prerender. Every initial HTML document contains social metadata and subpath-safe logo/favicon links with matching files in the artifact.
- `npm run check:pages` passes in Chromium, Firefox and WebKit.
- Existing gallery, site-page and playground-layout regression passes all 24 scenarios across those browsers.
- A targeted browser audit passes 18 engine/theme/width combinations at 320, 390 and 1440 px. Logos load, home links retain their accessible names, theme changes select the correct variant, and no horizontal overflow, hydration errors or failed local requests occur. Icon requests return HTTP 200; PNG dimensions and the ICO's 16/32/48 px entries are verified.

The build retains the existing `bar-block.css` 4 kB warning (74 bytes over the warning threshold); it completes successfully. No new library acceptance or release claim is made.

The [audit manifest](experiments/captures/orbit-e/manifest.json) records asset dimensions, browser cases, static-route count and source hashes. Reviewed comparison captures:

| View | Before | Orbit e |
| --- | --- | --- |
| Desktop, dark | [Previous mark](experiments/captures/orbit-e/before/dark-1440.png) | [New mark](experiments/captures/orbit-e/dark-1440.png) |
| Mobile, light | [Previous header](experiments/captures/orbit-e/before/light-390.png) | [New header](experiments/captures/orbit-e/light-390.png) |

These are local verification results. The public Pages demo still requires deployment of the updated source snapshot.

### Final review

The final asset review corrects the Apple touch icon to an opaque square, leaving corner masking to the device. A second generator run produces byte-identical files; the touch icon is verified as 180 × 180 RGB without an alpha channel. Previously audited UI sources, the master mark and the social image retain their original hashes. The manifest preserves the original audit hashes and records final generator/asset hashes separately. Formatting, documentation links/anchors and whitespace checks pass.

Both production playground and Pages artifacts are rebuilt after that correction. All eight served branding assets in both outputs match the source bytes, including the corrected touch icon.
