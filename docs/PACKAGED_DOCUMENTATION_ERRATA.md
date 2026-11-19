# Packaged documentation errata

Updated 19 November 2026. npm `next` selects [published rc.33](experiments/RC33_PUBLICATION.md) and `latest` retains rc.18. Packaged wording records the versions available when each archive was prepared.

Published rc.28 and the sealed rc.29 archive contain readmes with historical availability wording. Their README/changelog, runtime, declarations and archive bytes remain immutable. This repository erratum and the current [installation guide](INSTALLATION.md) supersede those statements; those original documentation-only corrections did not upload or change a package version. The new rc.30 package carries the corrections in a separately verified immutable archive.

## Feature availability

| Historical packaged wording | Current behavior / reference |
| --- | --- |
| Legend layouts are described as local rc.28 work absent from published rc.24 | Chips and aligned lists ship in published rc.28 for bar, line, area, composed and pie/donut. See [bar inputs](BAR_CHART_API.md#inputs), [composed inputs](COMPOSED_CHART_API.md) and [pie inputs](PIE_CHART_API.md). Radar has the limitation below. |
| Calendar/Sankey `showDataTable` opt-outs are described as local rc.28 work | Both inputs ship in published rc.28 and later, defaulting to `true`. Gallery routes set them false; explicit validation routes retain tables. See [calendar](CALENDAR_HEATMAP_API.md#optional-gallery-table-disclosure-since-rc28) and [Sankey](SANKEY_CHART_API.md#optional-gallery-table-disclosure-since-rc28). |
| Earlier release entries defer shared zoom/two-way selection | Those entries retain their historical scope. The current [composed dashboard](COMPOSED_DASHBOARD.md#shared-zoom-and-device-detail) implements an application-owned shared category window and month selection from either chart, using existing published rc.22 APIs. It does not add a general-purpose library zoom or graphical linking API. |

## Radar legend layout

The rc.28/rc.29 shared base exposes `legendLayout`, but those versions do not apply the list-layout class: radar renders chips for either input value. Packaged wording that groups radar with the implemented aligned-list families overstates its behavior. The [radar API](RADAR_CHART_API.md#inputs-and-states) records this limitation; published rc.30 completes the [radar template](../projects/chart-library/radar/src/lib/radar-chart.html) binding and label/note presentation, with [new evidence](experiments/RC30_RADAR_LEGENDS.md). Earlier archives remain unchanged.

See the [human review result](experiments/RC20_HUMAN_REVIEW.md). These corrections do not broaden tested dependency ranges or declare a stable API.

## rc.32 preparation wording

The frozen rc.32 packaged README calls rc.32 a local candidate and names rc.30 as published. Those statements describe artifact preparation before the subsequent [rc.32 upload and verification](experiments/RC32_PUBLICATION.md). At rc.32 publication, npm next selected rc.32 and latest remained rc.18. The archive, README and changelog remain immutable. Optional graphical dashboard ranges first ship in published rc.33.

## rc.33 preparation wording

The rc.33 archive names rc.32 as the published release and describes human interpretation as unreviewed. Those statements reflect candidate preparation. See the [current installation guide](INSTALLATION.md) for available versions and the [human review record](experiments/RC20_HUMAN_REVIEW.md) for the subsequent pass.
