# Calendar heatmap API

Experimental NG19 component, introduced in private `0.1.0-rc.8` and now included in public `0.1.0-rc.18`. Import `CalendarHeatmap` from `@mantha911/ng-echarts/calendar`. The compatibility root keeps its existing exports and engines. Original code is MIT licensed; the experimental npm prerelease is available under `next`.

## Example

```ts
import { Component } from '@angular/core';
import { CalendarHeatmap } from '@mantha911/ng-echarts/calendar';

interface ActivityDay { readonly date: string; readonly count: number | null; }

@Component({
  selector: 'app-daily-activity',
  imports: [CalendarHeatmap],
  template: `<nec-calendar-heatmap
    title="Daily contributions" valueLabel="Contributions"
    description="Illustrative activity in 2024. Missing days are distinct from zero."
    [data]="days"
    dateKey="date"
    valueKey="count"
    [year]="2024"
    [max]="40"
    theme="light"
  />`,
})
export class DailyActivity {
  readonly days: readonly ActivityDay[] = Array.from({ length: 366 }, (_, index) => ({
    date: new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
    count: index % 29 === 8 ? null : (index * 13 + Math.floor(index / 7) * 5) % 41,
  })).filter((_, index) => index % 19 !== 1);
}
```

## Inputs and events

| Input | Default | Meaning |
| --- | --- | --- |
| `title: string` | Required | Nonempty chart heading and accessible region name |
| `data: readonly T[]` | Required | Immutable daily observations; original rows are retained |
| `dateKey: StringKey<T>` | Required | Strict date-only `YYYY-MM-DD` field |
| `valueKey: NumericKey<T>` | Required | Finite numeric observation or explicit null |
| `year: number` | Required | Gregorian integer year, 100–9999, padded to four digits in dates |
| `max: number` | Required | Positive finite scale maximum; fixed across updates |
| `description: string` | `''` | Units, source and context |
| `valueLabel: string` | `'Value'` | Nonempty measure name in tooltips, for example `Contributions` |
| `theme: ChartTheme` | `'light'` | Light or dark fallback colors |
| `themeRevision: number` | `0` | Finite revision to refresh inherited theme tokens |
| `locale: string` | `'en-US'` | Numeric formatting locale; month/day labels and surrounding copy are English |
| `numberFormatOptions` | Undefined | Immutable `Intl.NumberFormatOptions` |
| `valueFormatter: ValueFormatter` | Undefined | Pure synchronous numeric text formatter |
| `loading: boolean` | `false` | Replaces stale plots/data with loading status |
| `error: string \| null` | `null` | Application error, with highest state precedence |
| `animation: boolean` | `true` | Plot motion; reduced motion overrides it |

`pointSelect: CalendarPointSelection<T>` emits `{ date, value, row, source }`, where `source` is `'plot'` or `'table'`. The date is the stable identity, `value` is the raw number, and `row` is the original object. A zero observation is selectable. Null and omitted days have no action. Updates never emit selection by themselves; application selection remains application-owned.

## Dates, missing values and scale

Dates must be real Gregorian dates within the explicit year. Leap days follow the 4/100/400 rule. Timestamps, offsets, nonpadded dates, out-of-year dates and duplicate dates produce validation errors; the library neither shifts timezones nor sums duplicates. The pure normalizer enumerates date strings without timestamp arithmetic. ECharts uses local `Date` arithmetic. Before drawing, the browser checks that every Gregorian date exists locally. If a historical timezone transition skips a whole date (for example, Pacific/Apia on 2011-12-30), it omits the plot and explains why; all exact native dates/values and table actions remain available. Changing to a locally supported year restores the plot. See the [IANA timezone source](https://github.com/eggert/tz/blob/main/australasia). No observation is shifted into a different day.

Null and omitted dates both mean **No data** and leave an outlined calendar cell. Recorded zero has a distinct solid neutral fill. All-zero data is ready; an empty array or all-missing values produces **No calendar observations available**. Undefined, nonnumeric, infinite, negative and above-maximum values are errors, rather than silent zeroes or clamped colors. Negative zero is canonical zero.

The scale always runs from 0 to the explicit maximum. Four positive intervals are `(0, max/4]`, `(max/4, max/2]`, `(max/2, 3max/4]` and `(3max/4, max]`. The renderer normalizes values internally to avoid overflowing extreme finite scales; tooltips, tables and events retain raw numbers. Keep the same maximum when comparing years. There is no automatic domain, aggregation, timezone conversion or color-based filtering.

## Layout and accessibility

The calendar uses Monday-first weeks. A plot at least 560 px wide shows one year strip; narrower plots show four quarter rows. The plot reserves 152 px or 566 px respectively through a container query, and the browser adapter uses the same width threshold. Quarter ranges are inclusive and disjoint. No year-wide horizontal scrolling is required. Leave a nonzero containing width; 320 px page layouts are verified in the demo. Very small containers below the demonstrated widths are outside the fit evidence.

A named chart region and native disclosures contain all 365/366 dates, grouped into monthly tables **in initial server HTML**. “Explore daily data” and the month summaries work without JavaScript. Recorded values are ordinary keyboard buttons after hydration, with the same raw event as a plot click; missing dates read “No data”. The decorative canvas is hidden from assistive technology. Color is complemented by exact dates/values and textual scale bounds. No artificial grid keyboard model or hundreds of canvas tab stops are added.

Tooltip content is escaped and confined to the chart. Numeric locale/options/formatter apply to tooltips, tables and scale text; event values remain numeric. Supply concise formatter text and the same deterministic configuration on server and client. A failing or invalid formatter produces a contained error. Native month/table controls inherit the demo's existing hover and focus policy; standalone library defaults remain visible.

Shared CSS tokens are `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border` and `--nec-series-1`. The border color also represents recorded zero; the four positive colors blend the first series color over the background. Keep zero/background/series colors distinct when overriding tokens. Change theme or themeRevision to refresh mounted tokens. Resize rebuilds the layout without replacing the renderer; hidden charts wait for measurable space. Reduced motion is observed dynamically.

Application error takes precedence over loading, validation/format/renderer error, empty and ready states. Nonready states dispose the plot and remove stale tables. A failed import offers **Retry calendar**; input changes also recover. Shared focus preservation moves a removed focused value to the native table disclosure when possible and keeps focus on external controls. The engine remains browser-only and lazy; the focused adapter registers Heatmap, Calendar, piecewise VisualMap, Tooltip and Canvas.

## Verification and limits

The [NG19 implementation record](experiments/NG19_CALENDAR_HEATMAP.md) records measured checks and candidate evidence. Multi-year ranges, arbitrary windows, localization of calendar labels, custom bins, missing-day plot actions, canvas keyboard navigation and brushing remain deferred. The later [Sankey component](SANKEY_CHART_API.md) has its own focused contract. Calendar is included in the [published experimental rc.18](PUBLICATION.md#first-publication-result); human F09/R06/G2/G3/G4 remain pending under the user’s explicit deferral. Calendar evidence does not expand the four-family MVP acceptance claim.

Implementation follows the [ECharts calendar contract](https://github.com/apache/echarts-doc/blob/master/en/option/component/calendar.md) and checks the installed [6.1.0 calendar implementation](https://github.com/apache/echarts/blob/6.1.0/src/coord/calendar/Calendar.ts); upstream options are used through the peer dependency, with no copied upstream implementation.

## Visual presentation

`valueLabel: string` names the measure in aligned tooltips; it defaults to `Value` and must be nonempty text. The gallery uses `Contributions`. Loading, empty and error states preserve the plot area and retain inert control space.

The numeric color key displays the upper bound of each of four equal positive intervals. Missing days use the background with an outline; the legend adds a hatch cue to distinguish missing from recorded zero. The year/quarter stage height follows the host container even while the renderer is unavailable.
