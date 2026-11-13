# Angular chart library

Experimental standalone Angular 22 components using Apache ECharts. The local identity `@ng-echarts/chart-library` is private and has not been published. Local candidate: `0.1.0-rc.4`. Original library code is MIT licensed; preserve `LICENSE`, `THIRD_PARTY_NOTICES.md`, and the `third-party/` notices. Public naming and human release acceptance remain open.

## Installation

In the source checkout, use Node 24.22.2 and npm 11.19.1, then run `npm ci` and `npm run pack:lib`. Install the resulting file into a separate Angular application:

```sh
npm install /absolute/path/to/ng-echarts-chart-library-0.1.0-rc.4.tgz echarts@6.1.0
```

Retain the tarball at the lockfile's recorded path, or store it in the consumer's `vendor/` directory. Commit the lockfile and use `npm ci` for repeat installs. Repack and reinstall to consume source changes.

No global ECharts registration, library stylesheet, Angular provider or React runtime is required. The package supplies scoped styles and a lazy Canvas renderer. Give its containing card a nonzero width. Plot height defaults to 320 px, with native controls adding to total height.

## First chart

This complete `App` can replace `src/app/app.ts` in the CLI's standalone application; keep the generated bootstrap and app configuration. Explicitly set `strict: true`, `strictTemplates: true` and `skipLibCheck: false` in the corresponding TypeScript/Angular compiler options.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library/bar';

interface Visit {
  readonly id: string;
  readonly month: string;
  readonly desktop: number;
  readonly mobile: number | null;
}

@Component({
  selector: 'app-root',
  imports: [BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<nec-bar-chart
    title="Monthly visits" description="Desktop and mobile visits by month."
    [data]="rows" rowIdKey="id" categoryKey="month" [series]="series"
  />`,
})
export class App {
  protected readonly rows: readonly Visit[] = [
    { id: 'jan', month: 'January', desktop: 342, mobile: 184 },
    { id: 'feb', month: 'February', desktop: 0, mobile: null },
  ];
  protected readonly series: readonly ChartSeries<Visit>[] = [
    { id: 'desktop', key: 'desktop', label: 'Desktop' },
    { id: 'mobile', key: 'mobile', label: 'Mobile' },
  ];
}
```

The installed-declaration check compiles this exact packaged example, each API guide, copied gallery variants, and the complete four-chart integration example.

## Components and contracts

| Component | Focused import | Behavior |
| --- | --- | --- |
| `BarChart<T>` | `@ng-echarts/chart-library/bar` | Grouped/stacked, vertical/horizontal, solid/gradient |
| `LineChart<T>` | `@ng-echarts/chart-library/line` | Straight/smooth, optional points, missing-value gaps |
| `AreaChart<T>` | `@ng-echarts/chart-library/area` | Independent gradient/solid fills, same-sign stacks |
| `PieChart<T>` | `@ng-echarts/chart-library/pie` | One measure across categories; innerRadius 0 for pie, 0.6 for donut; optional outside labels |
| `ComposedChart<T>` | `@ng-echarts/chart-library/composed` | Vertical unstacked bars and lines on one shared scale; typed per-series kind |
| `ChartFrame` and shared types | `@ng-echarts/chart-library/core` | Presentation shell with required title, optional description and projected content; no engine runtime |

All charts require `title`, immutable `data`, `rowIdKey`, `categoryKey`, and either Cartesian `series: readonly ChartSeries<T>[]` (composed uses `ComposedSeries<T>[]`) or one pie `measure: ChartMeasure<T>`. Measures have `id`, numeric `key` and `label`; Cartesian series also accept `color`. IDs must be unique nonempty strings; labels may repeat. Numeric keys exclude text, `any`, `unknown` and exclusively nullish fields.

Replace row, series and configuration references to update them. Visibility follows stable IDs; new IDs start visible and removed IDs are discarded. Null/undefined stay missing, zero stays numeric, and Cartesian negatives are valid. Pie rejects negative/nonfinite values and overflowing totals; zero totals are empty. Line/area gaps never become zero. Area events return raw observations rather than stack totals.

`pointSelect` emits the original row, `rowId`, `seriesId`, raw `value`, and `source: 'plot' | 'table'`. Pie uses the measure ID as `seriesId`. Cartesian `legendChange` emits `{ seriesId, visible }`; pie emits `{ rowId, visible }`. Filtering keeps the complete table.

## Numeric formatting

Locale defaults to explicit `en-US`. Supply immutable `Intl.NumberFormatOptions` through `numberFormatOptions`, or a pure synchronous `ValueFormatter = (value: number) => string` through `valueFormatter`. Custom text appears on numeric axes, tooltips, tables and action names. Handle generated finite axis ticks as well as supplied observations. Missing values bypass callbacks; events keep raw numbers and tooltip text is escaped. Pie has no axes. Cartesian `categoryTickFormatter` changes axis text only.

Keep initial data, locale, options and formatter behavior deterministic on server and client. Invalid formatting enters the configuration-error state and recovers with valid replacement inputs.

## States, themes and accessibility

Common optional inputs include `description`, `height` (320), `theme` (`light`), `themeRevision` (0), `locale` (`en-US`), `numberFormatOptions`, `valueFormatter`, `showDataTable` (true), `loading` (false), `error` (null), and `animation` (true). Family guides specify additional settings. State precedence is application error, loading, validation/configuration/renderer error, empty, then ready. Nonready states remove stale plot actions. Renderer failures also offer Retry chart.

Use meaningful titles/descriptions. Tables are initially collapsed and supply complete values and keyboard point actions. Keep them enabled or provide equivalent actions. Gallery previews disable them at the user's request; Code tabs do not replace keyboard controls. Native legends expose pressed states and retain focus. Human screen-reader interpretation remains deferred to release acceptance.

CSS tokens are `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and numbered `--nec-series-N` colors. Explicit Cartesian series colors take precedence. Change `theme` or increment `themeRevision` after CSS/font changes. Load a replacement font before requesting the refresh. Fonts are inherited; no font assets or Inter dependency ship in the package. Reduced motion overrides decorative animation.

SSR emits native Angular headings, controls and fallback surfaces. Keep the application's hydration configuration. The browser adapter starts the plot after stability, dimensions and fonts are ready; hidden hosts recover when shown. Angular destruction removes observers/listeners, pending frames and the renderer. No consumer initialization or hydration bypass is needed.

## Compatibility and limits

Tested: Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, RxJS 7.8.2, Node 24.22.2, npm 11.19.1; Chromium 158.0.8127.18, Firefox 159.0, WebKit 27.2. Manifest peers are Angular common/core `^22.2.6` and ECharts `^6.1.0`; tslib is a dependency `^2.3.0`. Exact tests do not establish every allowed version combination or another Angular major.

The starting measured envelope is 200 categories × three Cartesian series or 12 radial categories on the recorded M2 Pro machine. Stress fixtures use 2,000 Cartesian or 100 radial categories; these are observations, not hard limits or portable latency guarantees. Outside labels may shorten/hide collisions; expanded tables have separate costs.

Focused imports keep unrelated engines out. Line and area intentionally share ECharts' Line engine. Root imports preserve class identity but include combined registrations. Deep paths and core `ɵ` exports are unsupported implementation APIs. Size checks count all lazy chunks, excluding Angular/RxJS peers: gzip/Brotli caps are 200,000/175,000 bytes per family, 10,000/9,000 for core, 212,000/178,000 for root, and 200,000/175,000 for root-frame.

Raw ECharts options, custom tooltip templates, time/logarithmic axes, server plot images/export, brushes, advanced decoration and additional chart families are outside the MVP. APIs remain experimental. Automated acceptance passes; human interpretation and final artifact/release gates remain pending.

## Composed charts

The post-MVP `ComposedChart` and `ComposedSeries<T>` exports in `/composed` combine vertical bars and lines on one category/value scale. Every descriptor adds `kind: 'bar' | 'line'` to the shared series fields; lines accept `smooth` and `showPoints`. Supply comparable units. The renderer uses supplied trend values; the demo computes its trailing mean separately. Dual axes, stacking and area composition are outside this first increment.

## Controlled bar selection

`BarChart.selectedRowId` (rc.2+) accepts a stable row ID or `null`. Bind application selection to retain the chosen category's colors, fade the other bars, show a quiet category band and mark the native table row as current with a “Selected” label. Zero/missing values and hidden series retain the band; null/unknown IDs restore normal presentation. The input never emits a point event or mutates itself. The application owns removal/reset semantics. See the [linked-chart guide](https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINKED_CHARTS.md) for a complete signal-based example.

## Repository guides

The checkout contains complete [installation](https://github.com/phalla-doll/ng-echarts/blob/main/docs/INSTALLATION.md), [integration](https://github.com/phalla-doll/ng-echarts/blob/main/docs/INTEGRATION_GUIDE.md), and [compatibility](https://github.com/phalla-doll/ng-echarts/blob/main/docs/COMPATIBILITY.md) guides, plus [bar](https://github.com/phalla-doll/ng-echarts/blob/main/docs/BAR_CHART_API.md), [line](https://github.com/phalla-doll/ng-echarts/blob/main/docs/LINE_CHART_API.md), [area](https://github.com/phalla-doll/ng-echarts/blob/main/docs/AREA_CHART_API.md) and [pie/donut](https://github.com/phalla-doll/ng-echarts/blob/main/docs/PIE_CHART_API.md) and [composed](https://github.com/phalla-doll/ng-echarts/blob/main/docs/COMPOSED_CHART_API.md) references. In the source workspace, run `npm run build:lib`, `npm run check:consumer` and `npm run check:docs` to reproduce documentation checks; these scripts are not commands inside the installed package.

## License

Original library code is [MIT licensed](LICENSE). Adapted EvilCharts material and external dependencies retain their own notices; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). This private local candidate does not complete the deferred human screen-reader review or public release gates.

`BarChart.selectedRowIds` (rc.3+) accepts `readonly string[] | null`. A non-null array overrides `selectedRowId`; `[]` clears feedback. Known IDs are deduplicated, and unknown/empty IDs are ignored. Multiple categories retain their palette and bands, with “Selected” labels on their native table rows; `aria-current` is used only for one effective row. The application defines range membership and reconciliation. The linked guide demonstrates inclusive From/To controls and optional graphical selection.

`BarChart.rangeSelection` (rc.4+, default false) enables a pointer range surface in the ready plot. A drag of at least four CSS pixels snaps to inclusive categories and emits one `rangeSelect: BarRangeSelection<T>` on release: `{ fromRowId, toRowId, rowIds, rows, source: 'plot' }`. `rows` retains original row references, and IDs follow supplied order for either layout. Feedback still belongs to `selectedRowIds`; the output never changes it. Pair the pointer mode with native keyboard range controls, as the complete linked example does. Drafts cancel on Escape, resize/options updates, pointer interruption, blur, scrolling and teardown; stale data snapshots cannot commit. The demo exits the mode after commit or Escape and retains normal touch scrolling along the value direction. This is one contiguous category range; zoom, disjoint selections and linked hover remain outside it.
