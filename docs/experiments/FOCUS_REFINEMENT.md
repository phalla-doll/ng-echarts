# Demo-wide focus refinement

Requested 13 November 2026 after the user reported the [heavy Month focus ring](captures/focus-refinement/before/reported-focus.png) and asked to apply the correction throughout the demo.

## Result

One `site-focus.css` policy now covers links, buttons, native form fields, disclosure summaries and keyboard scroll regions throughout the site. The ordinary indicator is a **1 px neutral gray outline (`#737373`) with a 2 px offset**, replacing bright 2–3 px rings and inconsistent 3–4 px gaps. Code panes, data-table regions and measurement scroll containers use an inset 2 px offset so enclosing cards cannot clip the ring. Native control border radii are preserved.

Duplicate focus rules are removed from gallery, linked controls, linked source, source snippets and comparison styling. The scoped chart-table rule also overrides the component library's independent default within the demo; navigation, gallery controls, documentation, workbench and chart-native actions now share one policy. Programmatic `tabindex="-1"` page/settings targets keep their existing behavior, including Skip to content, without an outline around the whole page. Focus-visible follows the browser's keyboard/pointer heuristic. Forced-colors mode uses a 2 px system `Highlight` outline, including nested table regions.

This is demo presentation work. The private rc.2 package and its API are unchanged; human F09/R06/G2/G3/G4 remain pending.

## Visual and browser evidence

The [capture manifest](captures/focus-refinement/manifest.json) records Chromium, Firefox and WebKit versions, nine source hashes, 162 focus checks and 16 images at 2× density. Both themes and 1440/320 px are included. The audit verifies the computed ring after entering keyboard modality and focusing real controls across all five chart galleries, linked charts, documentation, workbench, ordinary/reference comparisons and mobile navigation. Native details/Enter and Skip to content are exercised, and current table-action focus is verified. All three engines also emulate forced colors and verify the Month/table-region override. No page overflow, browser or HTTP errors are recorded.

Reviewed examples:

| Control | Dark | Light |
| --- | --- | --- |
| Month | [Desktop](captures/focus-refinement/month-dark-1440.png) | [Desktop](captures/focus-refinement/month-light-1440.png) |
| Mobile Month | [Narrow](captures/focus-refinement/month-dark-320.png) | [Narrow](captures/focus-refinement/month-light-320.png) |
| Chart legend | [Narrow](captures/focus-refinement/legend-dark-320.png) | [Narrow](captures/focus-refinement/legend-light-320.png) |
| Table action | [Narrow](captures/focus-refinement/table-dark-320.png) | [Narrow](captures/focus-refinement/table-light-320.png) |
| Inset code | [Narrow](captures/focus-refinement/code-dark-320.png) | [Narrow](captures/focus-refinement/code-light-320.png) |

Reproduce after a production playground build:

```sh
npm run build:playground
node tools/capture-focus-refinement.mjs
```

The existing three-engine linked/gallery/visual-refinement/site/navigation/code/comparison regression passes **78 scenarios**. It covers keyboard legends and code stops, table selection/reset focus, mobile navigation, theme changes, copy fallback, hydrated source snippets and linked state updates. The production build compiles the changed templates/styles. Library code is unchanged, so this round makes no new library unit, bundle or performance claim.

During this round, the previous feature's [GitHub run](https://github.com/phalla-doll/ng-echarts/actions/runs/43386867839) completed with one WebKit failure in the exact-palette bar counter (204 scenarios passed, two expected skips). ECharts' default hover emphasis lifts RGB channels by 10%; the original counter accepted only the resting color. The sampler now permits a maximum 24-value RGB difference while still requiring opaque pixels and rejecting faded context bars. The linking scenario checks the selected group both with the pointer over it and after moving away. All 15 linked scenarios pass locally across the three engines after this harness correction; remote CI remains a separate result.

The Pages build prerenders 29 routes, and local static verification passes in Chromium, Firefox and WebKit. Formatting, local documentation links/anchors, whitespace and capture hashes are checked before committing. The retained rc.2 tarball remains SHA-256 `c41489c8880e41c62f11121599c9cecb1acfa2c5ab6c3b06ee2abf4d95b2d7fd`. Live delivery is recorded after deployment.
