# Packaged documentation errata

Updated 16 November 2026. npm `next` selects `@mantha911/ng-echarts@0.1.0-rc.28`; `latest` retains rc.18. The rc.29 candidate is verified and unpublished; local rc.30 corrects the packaged availability wording and implements radar list legends. [Publication receipts](experiments/RC28_PUBLICATION.md) and [candidate/delivery evidence](experiments/RC29_LINKED_WINDOW.md) own those identities.

Published rc.28 and the sealed rc.29 archive contain readmes with historical availability wording. Their README/changelog, runtime, declarations and archive bytes remain immutable. This repository erratum and the current [installation guide](INSTALLATION.md) supersede those statements; no package upload or version change occurs in this documentation pass. Packaged corrections require a new candidate version.

## Feature availability

| Historical packaged wording | Current behavior / reference |
| --- | --- |
| Legend layouts are described as local rc.28 work absent from published rc.24 | Chips and aligned lists ship in published rc.28 for bar, line, area, composed and pie/donut. See [bar inputs](BAR_CHART_API.md#inputs), [composed inputs](COMPOSED_CHART_API.md) and [pie inputs](PIE_CHART_API.md). Radar has the limitation below. |
| Calendar/Sankey `showDataTable` opt-outs are described as local rc.28 work | Both inputs ship in published rc.28 and later, defaulting to `true`. Gallery routes set them false; explicit validation routes retain tables. See [calendar](CALENDAR_HEATMAP_API.md#optional-gallery-table-disclosure-since-rc28) and [Sankey](SANKEY_CHART_API.md#optional-gallery-table-disclosure-since-rc28). |
| Earlier release entries defer shared zoom/two-way selection | Those entries retain their historical scope. The current [composed dashboard](COMPOSED_DASHBOARD.md#shared-zoom-and-device-detail) implements an application-owned shared category window and month selection from either chart, using existing published rc.22 APIs. It does not add a general-purpose library zoom or graphical linking API. |

## Radar legend layout

The rc.28/rc.29 shared base exposes `legendLayout`, but those versions do not apply the list-layout class: radar renders chips for either input value. Packaged wording that groups radar with the implemented aligned-list families overstates its behavior. The [radar API](RADAR_CHART_API.md#inputs-and-states) records this limitation; local rc.30 completes the [radar template](../projects/chart-library/radar/src/lib/radar-chart.html) binding and label/note presentation, with [new evidence](experiments/RC30_RADAR_LEGENDS.md). Earlier archives remain unchanged.

Human F09/R06/G2/G3/G4 remain deferred/pending. These corrections do not broaden tested dependency ranges or declare a stable API.
