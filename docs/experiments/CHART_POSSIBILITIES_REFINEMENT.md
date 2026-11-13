# Chart possibilities visual refinement

The user requested a cleaner, more refined UI and spacing after the concept gallery was added to the demo. This pass preserves the twelve datasets and examples while refining their presentation in both the integrated page and standalone document.

## Changes

- Condense the page introduction into one sentence, present the standalone action as a quiet text link, and keep the mobile title on one line at 320 px.
- Use consistent card gutters, 16 px headings with 24 px line height, 28 px metrics with 32 px line height, and a defined gap between the filter toolbar and collection.
- Wrap the five filters rather than clipping or requiring sideways scrolling. Selected filters use a subdued neutral fill; a thin separator defines the end of the toolbar.
- Remove card badges; the chart subtitles explain their purpose without implying an unexplained starting action. Empty metric rows in the radial and sparkline examples are removed.
- Align paired card footers, including at the narrow two-column tablet layout. The initial footer shows its purpose concisely; additional reading guidance appears when opening the sample data.
- Refine the data disclosure chevron, spacing and table headers. Increase chart labels to 11 px where space permits, shorten waterfall axis captions while retaining full labels in tooltips/tables, and remove the treemap's redundant root-total label.
- Match the radial and sparkline plot areas to the shared card rhythm and simplify the final recommendation section.
- Version the gallery asset URL so browsers that opened the initial page receive the refined document on their next visit.
- Reserve horizontal label space in the radar chart and recompute its radius when resized. All six labels remain inside the plot at 320 px; the final narrow-screen review caught and corrected clipping that document-width checks alone did not reveal.

## Visual evidence

| Layout | Before | Refined |
| --- | --- | --- |
| Desktop, dark | [1440 px](captures/chart-possibilities/integrated-dark-1440.png) | [1440 px](captures/chart-possibilities-refinement/dark-1440.png) |
| Desktop, light | [1440 px](captures/chart-possibilities/integrated-light-1440.png) | [1440 px](captures/chart-possibilities-refinement/light-1440.png) |
| Mobile, dark | [390 px](captures/chart-possibilities/integrated-dark-390.png) | [390 px](captures/chart-possibilities-refinement/dark-390.png) |
| Mobile, light | [390 px](captures/chart-possibilities/integrated-light-390.png) | [390 px](captures/chart-possibilities-refinement/light-390.png) |

The [capture manifest](captures/chart-possibilities-refinement/manifest.json) records all eight theme/width combinations at 320/390/768/1440 px, source identity and geometry. All five filters and six radar labels fit their containers at each size, neither document overflows horizontally, and all paired footer offsets are zero. Additional desktop captures review [treemap/radial](captures/chart-possibilities-refinement/treemap-dark-1440.png) and [radar/sparklines](captures/chart-possibilities-refinement/radar-light-1440.png). The [320 px radar capture](captures/chart-possibilities-refinement/radar-light-320.png) preserves the corrected label bounds. Visual inspection covers both themes and the narrow mobile layout, with no console or page errors.

## Validation

Production playground and 30-route static builds, strict TypeScript/template compilation and all nine concept-gallery browser scenarios pass in Chromium, Firefox and WebKit. The scenarios retain keyboard table access, filters, scatter/bubble mode, theme synchronization, SSR/hydration/reloads, standalone offline interaction and mobile navigation. Local Pages verification passes all three engines, including the versioned gallery asset under `/ng-echarts/`. Formatting, local evidence links and `git diff --check` pass. Historical 173-unit-test and 18-scenario evidence in the [initial integration](CHART_POSSIBILITIES.md) retains its original scope.

No Angular library API, package artifact or release gate changes. Source was uncommitted when this validation was recorded.

## Deployment

The [refined gallery](https://phalla-doll.github.io/ng-echarts/chart-possibilities/) is deployed in static commit `7013ef14ca934713172cbf6db8895cc817f3771e`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43418431739) succeeds and Pages reports `built`. The published standalone asset matches the reviewed source byte for byte; its revision query matches the source hash prefix `138b56e91084`. The [live record](captures/chart-possibilities-refinement/live.json) retains deployment identity, the working-tree source marker and the full asset hash.

Focused live checks pass in Chromium, Firefox and WebKit at 320 px, including all fourteen plot surfaces, all six radar labels, theme synchronization and filters. The first broad live checks exceeded their default five-second assertion window; a direct canonical-route check completed in 10.6 seconds without browser or HTTP errors. The shared local/live Pages verifier now permits fifteen seconds for network-dependent assertions while retaining the same content and behavior checks.

The broader live retry advanced through the gallery checks but timed out on the existing Installation documentation outline's “Bootstrap your chart” navigation. It is not recorded as a complete live regression pass. The focused gallery verification above passes all three engines; the full local static verification also passes all three engines.

## Badge removal follow-up

Removed the three static “Start here” badges after user feedback that their meaning was unclear. Removed unused badge metadata and styles, and refreshed the gallery asset revision. The deployment and screenshots above record the earlier version; this follow-up is local.

The [final checkpoint](CHART_POSSIBILITIES.md#final-source-checkpoint) preserves this visual work, synchronizes the formatted asset revision and includes it in committed-source deployment hardening. The working-tree status above is historical.

## Treemap refinement follow-up

The user requested another refinement of the treemap's gaps and presentation. The mosaic now aligns with the card text gutters, uses 6 px family dividers and 2 px product dividers, and moves family names to a compact color key. Muted emerald, teal, rose and slate shades adapt to the shared theme; product labels align to the upper left with a stronger revenue value. Narrow cards use a taller chart aspect ratio so small products retain their full names and values. The illustrative data, totals, tooltips and sample table are preserved.

Treemap animation is explicitly disabled at series level: its upstream default overrides the document's global animation setting and otherwise causes shifting tile positions during theme/resize updates.

Compare the earlier [dark desktop treemap](captures/chart-possibilities-refinement/treemap-dark-1440.png) with the refined [dark desktop](captures/treemap-refinement/dark-1440.png), [light desktop](captures/treemap-refinement/light-1440.png), [dark mobile](captures/treemap-refinement/dark-320.png) and [light mobile](captures/treemap-refinement/light-320.png). The [capture manifest](captures/treemap-refinement/manifest.json) records both themes at 320/390/768/1440 px. Every capture contains all eight full product names and revenue values, with labels inside the plot and no horizontal page overflow. Browser error collection is empty. The deployment record below identifies the published follow-up.

Follow-up validation passes on Node 24.22.3 and npm 11.19.1: production playground build, repository formatting, all nine concept-gallery browser scenarios across Chromium/Firefox/WebKit, 21 affected local documentation links/anchors, and `git diff --check`. The built gallery is byte-identical to its source, capture manifest hash and refreshed asset revision. Strict compilation passed earlier in this session; the subsequent source changes affect the gallery document and revision string. The existing bar stylesheet budget warning remains.

## Treemap refinement deployment

The [live gallery](https://phalla-doll.github.io/ng-echarts/chart-possibilities/) now includes the treemap refinement and removal of the static starting badges. Clean source commit: `30966733d11d4c289f5f6286feb28b6f87ae1f5d`; static commit: `937f504b69cbd0c95b649f33096609a8960a5dc5`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43424323023) succeeds, Pages reports `built`, and `preview-build.json` identifies the clean source without working-tree changes.

The published gallery matches the committed document byte for byte, with asset revision `c778d041a39e`. The [live record](captures/treemap-refinement/live.json) preserves that identity and 24 passing treemap cases across Chromium, Firefox and WebKit: both themes at 320/390/768/1440 px, all full product names and values, no starting badges, no horizontal overflow and no browser or HTTP errors. The 30-route static build and full local/live Pages verification pass in Chromium, Firefox and WebKit on Node 24.22.2 and npm 11.19.1, including existing gallery/linked-chart flows, fonts, fragments, focus, themes and mobile navigation. The existing bar stylesheet budget warning remains.

This publishes the demo presentation; private library artifacts and deferred human release gates retain their scope.

## Lollipop refinement follow-up

The user requested the same visual refinement for the ranked lollipop example. Channel names now align to the left gutter, while exact visit totals share a right-aligned column with explicit Channel/Visits headings. The subtitle identifies the illustrated traffic data. The chart uses 34 px row spacing, 7 px markers, thin stems and three subtle solid reference guides at 0/5k/10k. Totals use the primary text color and medium weight. Plot gutters match the card text at desktop and narrow widths. The ranking, values, scale, tooltips, filters and sample table are preserved.

Compare the [previous desktop view](captures/lollipop-refinement/before-dark-1440.png) with the refined [dark desktop](captures/lollipop-refinement/dark-1440.png), [light desktop](captures/lollipop-refinement/light-1440.png), [dark mobile](captures/lollipop-refinement/dark-320.png) and [light mobile](captures/lollipop-refinement/light-320.png). The [capture manifest](captures/lollipop-refinement/manifest.json) records both themes at 320/390/768/1440 px. All eight channel names and visit totals remain visible; name/value/marker row centers align within 0.5 px, column edges align, and no labels or page content overflow. Keyboard disclosure reveals all eight sample rows. A real pointer over the leading marker reveals Organic search / 8,420 visits, with the tooltip contained inside the plot. Browser error collection is empty.

The asset revision is refreshed for browsers that cached the previous gallery. This follow-up is local; the preceding deployment record retains its original source identity.

Lollipop follow-up validation passes on Node 24.22.2 and npm 11.19.1: production playground build, repository formatting, all nine concept-gallery browser scenarios in Chromium/Firefox/WebKit, 28 affected documentation links/anchors and `git diff --check`. The built gallery, capture source hash and asset revision match. The existing bar stylesheet budget warning remains.
