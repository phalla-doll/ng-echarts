# Demo hover and press refinement

Requested 13 November 2026 after the shared focus refinement. The audit covers the existing neutral gallery, linked example, documentation, workbench and comparison controls.

## Findings and changes

The [before audit](captures/hover-refinement/before/manifest.json) records 150 desktop hover cases in three browsers and both themes. Nine interactive control types lacked visible feedback: the theme button, current navigation row, footer link, linked disclosure/copy action, table value, settings switch/reset and selected comparison button. Other controls used unrelated border colors or square fills. Hover rules were unconditional, so they could also persist on touch devices.

`site-hover.css` now owns role-specific feedback. Existing page-level hover rules are removed, and the comparison control selector is lowered with `:where` so its selected style can participate in the shared policy. The Inter typography and control geometry remain stable during interaction.

| Role | Feedback |
| --- | --- |
| Outlined buttons, copy actions, selects and table values | Soft surface fill, primary text and a restrained border change |
| Icon/ghost actions | Rounded inset-radius fill; the theme button drops its old side separators |
| Tabs and current navigation | A stronger surface response while preserving the tab underline/current state |
| Text actions and links | Underline or stronger ink without a large filled box |
| Linked disclosure | Soft rounded header fill; native open/closed behavior retained |
| Clickable component cards | Border/surface feedback; static chart cards retain ordinary presentation |
| Hidden series | Muted text, dashed border and 35% swatch opacity throughout the demo, including linked/workbench charts; hover preserves those cues |
| Disabled controls | Muted presentation and blocked cursor; no enabled hover response. Native/ARIA-disabled coverage uses temporary audit probes, not new product controls. |

New light/dark tokens are hover `#efefef` / `#191919`, press `#e5e5e5` / `#262626`, and hover border `#b8b8b8` / `#505050`. Fine pointers receive hover styling. Coarse pointers receive transient press feedback, with no persistent hover fill. Color/border transitions last 120 ms only with ordinary motion preferences; reduced motion remains immediate. Forced-colors hover uses system Highlight/HighlightText in the element's color-scheme context. The isolated reference comparison derives its interaction tokens from its own palette.

## Evidence

The [after manifest](captures/hover-refinement/after/manifest.json) records **176 interaction checks**, 12 source hashes and 14 images at 2× density. Chromium, Firefox and WebKit cover both themes, plus 320 px Month-field captures. All 150 sampled enabled controls show feedback; six static-card samples and six disabled probes remain unchanged on hover. Checks preserve dimensions, pressed/current attributes, hidden-series opacity and border style. Additional cases verify press versus hover, focus while hovered, ordinary/reduced-motion transitions, forced-color hover and Chromium/WebKit coarse-pointer tap/reset behavior with Month focus retained.

| View | Before | After |
| --- | --- | --- |
| Theme icon | [No feedback](captures/hover-refinement/before/header-theme-dark.png) | [Rounded response](captures/hover-refinement/after/header-theme-dark.png) |
| Copy icon | [Square fill](captures/hover-refinement/before/copy-icon-dark.png) | [Quiet rounded fill](captures/hover-refinement/after/copy-icon-dark.png) |
| Selected tab | [Original hover](captures/hover-refinement/before/view-selected-light.png) | [Persistent underline](captures/hover-refinement/after/view-selected-light.png) |
| Hidden legend | [Original cue](captures/hover-refinement/before/legend-hidden-dark.png) | [Preserved hidden state](captures/hover-refinement/after/legend-hidden-dark.png) |
| Disclosure | [No feedback](captures/hover-refinement/before/disclosure-light.png) | [Header feedback](captures/hover-refinement/after/disclosure-light.png) |
| Narrow Month | Desktop-only before matrix | [Dark](captures/hover-refinement/after/month-mobile-dark.png), [light](captures/hover-refinement/after/month-mobile-light.png) |

After a production playground build, reproduce the current audit with:

```sh
npm run build:playground
node tools/capture-hover-refinement.mjs after
```

The before capture is preserved from the pre-refinement UI at source base `666f85a`; running `before` now would record the current UI rather than reconstructing that historical snapshot.

The existing linked/gallery/visual-refinement/site/navigation/code/comparison suite passes **78 scenarios** across all three engines. Production build and strict templates pass. The Pages build prerenders **29 routes** and local static verification passes in all three engines. Formatting, 842 local documentation links/anchors, whitespace, 12 final source hashes and all 26 before/after image hashes pass. The rc.2 tarball remains SHA-256 `c41489c8880e41c62f11121599c9cecb1acfa2c5ab6c3b06ee2abf4d95b2d7fd`.

This is demo presentation work; the private rc.2 package, public API and chart-renderer behavior are unchanged. Human F09/R06/G2/G3/G4 remain pending. Live delivery and final checks are recorded after deployment.

## Live delivery

Source commit `67dc83e87c6fc348c1ee3f052c50ba045b4dda18` is pushed to main. The [live demo](https://phalla-doll.github.io/ng-echarts/linked/) is served from static commit `5cae0054ebac6fb6909fdeb6ecedfa6cdc72b5d4`; the [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43395464823) succeeds. The marker identifies the clean source (`includesWorkingTree: false`). Live Pages checks pass in Chromium, Firefox and WebKit. [The live interaction audit](data/hover-live.json) passes all 176 cases, including preserved selection/visibility, disabled probes, keyboard focus while hovered, motion preferences, system-color hover and coarse-pointer tap/reset behavior. It records no overflow, geometry/state changes or browser/HTTP errors. Final source/image hashes, documentation links/anchors and whitespace pass before committing this delivery record.

Reproduce live verification without another image set:

```sh
HOVER_CAPTURE_IMAGES=0 node tools/capture-hover-refinement.mjs after https://phalla-doll.github.io/ng-echarts/ /tmp/ng-echarts-hover-live
```

Workspace CI for the new source runs independently; the local/live outcomes above are executed results, not a claim that the new remote run has finished.

## Code/Preview tab spacing correction

The follow-up [reported spacing](captures/gallery-tabs/before/reported-spacing.png) exposed a gap in the original hover audit: it checked geometry stability during hover, but not sibling tab proportions or vertical insets. The old tabs stretched through the header, had content-dependent widths and used a large gap. Their new fill made that uneven layout visible.

Gallery tabs now have equal **64 px widths**, centered labels and a **4 px gap**. Buttons are 32 px high in a 40 px desktop header and 40 px high in a 48 px narrow header, providing a 4 px inset above and below the hover shape. A separate 1 px indicator stays at the header edge, inset 8 px within the selected tab. Shared gallery CSS no longer supplies conflicting tab sizes/gaps; workbench tabs retain their separate layout. The compact width also preserves the complete “Device Visits” label at 320 px.

The [geometry manifest](captures/gallery-tabs/manifest.json) records **120** route/theme/width/browser cases across all five galleries, both themes, 1440/768/390/320 px and Chromium/Firefox/WebKit. It verifies equal widths/heights, centered labels, 4 px gaps/insets, the active indicator position and no page overflow. All **30 keyboard Code→Preview pairs** retain selection/focus and the matching code/preview panel. Source hashes identify the three changed stylesheets. Reviewed captures: [desktop dark](captures/gallery-tabs/tabs-dark-1440.png), [narrow dark](captures/gallery-tabs/tabs-dark-320.png), [narrow light](captures/gallery-tabs/tabs-light-320.png).

The final layout passes all 30 existing gallery/visual-refinement/code scenarios across the three engines. The 29-route Pages build and local static checks pass in Chromium, Firefox and WebKit. This remains demo-only presentation work. The previous hover capture matrices remain historical snapshots; the new geometry record supplements them. Live delivery is recorded below after deployment.
