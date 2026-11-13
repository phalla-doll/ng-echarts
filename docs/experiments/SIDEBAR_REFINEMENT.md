# Navigation and catalog refinement

Reviewed 13 November 2026. The navigation previously used similarly weighted headings and links in one scrolling sidebar, with chart examples and tools sharing a group.

The sidebar now separates Documentation, Chart blocks, Tools, and Validation into labeled sections and native lists. Stronger headings, indented guide lines, 28 px section gaps, and a contrasting active-page marker establish hierarchy. A 248 px desktop rail gives labels more room; its surface uses the existing neutral theme tokens and Inter typography.

The brand and footer remain visible while navigation scrolls independently. Mobile navigation retains Escape/focus restoration and closes after routing, with 44 px minimum rows, two columns above 380 px, and one column at narrower widths. All destinations remain available. Sidebar styles live in `root-navigation.css`, separately from the page shell.

## Header and catalog follow-up

The header now contains a GitHub icon link and theme toggle. The redundant Angular version badge is removed. The GitHub link uses locally hosted, theme-specific SVGL assets with a pinned [source and license manifest](data/svgl-github-provenance.json), an accessible name, focus/hover/press feedback, and a 32 px target that remains visible at 320 px.

The catalog previously mixed green/rose chart marks with gray line, area, and pie illustrations. All five available families now use the existing theme-aware green/rose palette. Neutral axes and grid lines stay quiet; the illustrations retain their geometry and availability labels.

## Verification

- Production playground build and strict TypeScript/template compilation passed using Node 24.22.2 and npm 11.19.1. The build retains the existing 74-byte `bar-block.css` warning; both sidebar/shell styles remain below their component warning budgets.
- The full browser regression suite passed 205 scenarios across Chromium, Firefox, and WebKit; two Chromium-only retention checks were skipped in the other engines. After the final header/catalog tweaks, all nine documentation/catalog browser scenarios and all ten playground unit tests passed again. The library's 146 unit tests passed during the full check.
- Isolated strict declarations, the documented fresh application, production SSR, isolated client/SSR runtime consumers, and all eight package-boundary/size scenarios passed. The standard check reached its browser stage but port 4173 was occupied, so the complete browser suite ran with a temporary config on port 4184 and the remaining runtime/budget commands were run separately. Historical exact-candidate release evidence was preserved.
- The [responsive audit](captures/sidebar-refinement/responsive-audit.json) passed 16 observations: 320, 390, 768, 800, 801, 920, 1024, and 1440 px in both themes. Page, navigation, and link widths fit; the footer stays visible and the last validation destination remains reachable. The GitHub asset loads in both themes, retains its destination and visible keyboard focus, and responds to hover/press. No browser errors were recorded.
- The final Pages artifact passed direct routes, reloads, fonts/assets, hydration, anchors, focus, themes, and mobile navigation in all three engines.
- Changed source formatting and `git diff --check` passed.

## Final code review

All 22 navigation links preserve their destinations, labels, order, and routing bindings. Review covered scoped styling, semantic groups/lists, active-page state, scroll/focus behavior, asset paths and notices, theme selection, and responsive layouts. One hover/press selector specificity issue in the new GitHub control was found and fixed; rendered hover, press, and keyboard focus were then verified in both themes. No unresolved findings remain in this increment.

## Visual evidence

The [capture manifest](captures/sidebar-refinement/manifest.json) records source and screenshot hashes. Production Pages screenshots use Chromium, reduced motion, and loaded local fonts. Desktop viewports are 1000 px high; mobile viewports are 844 px high. Catalog captures extend to the full page.

| Width | Dark | Light |
| --- | --- | --- |
| 1440 px | [Desktop](captures/sidebar-refinement/dark-1440.png) | [Desktop](captures/sidebar-refinement/light-1440.png) |
| 801 px | [Narrow desktop](captures/sidebar-refinement/dark-801.png) | [Narrow desktop](captures/sidebar-refinement/light-801.png) |
| 390 px | [Mobile menu](captures/sidebar-refinement/dark-390.png) | [Mobile menu](captures/sidebar-refinement/light-390.png) |
| 320 px | [Single-column menu](captures/sidebar-refinement/dark-320.png) | [Single-column menu](captures/sidebar-refinement/light-320.png) |

Header details: [dark desktop](captures/sidebar-refinement/header-dark-1440.png), [light desktop](captures/sidebar-refinement/header-light-1440.png), [dark mobile](captures/sidebar-refinement/header-dark-320.png), [light mobile](captures/sidebar-refinement/header-light-320.png).

Catalog palette: [dark](captures/sidebar-refinement/catalog-dark.png), [light](captures/sidebar-refinement/catalog-light.png).

This increment changes demo navigation and catalog presentation. Human release gates remain pending.
