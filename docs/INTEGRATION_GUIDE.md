# Integrate Angular charts

Follow [installation](INSTALLATION.md) first. Every component is standalone. Prefer focused imports; `/core` supplies shared public types and `ChartFrame` without ECharts runtime. Root imports remain compatible; `ɵ` exports and deep source paths are unsupported implementation APIs.

## API index

| Component / selector | Focused entry | API |
| --- | --- | --- |
| `BarChart<T>` / `nec-bar-chart` | `@ng-echarts/chart-library/bar` | [Bar](BAR_CHART_API.md) |
| `LineChart<T>` / `nec-line-chart` | `@ng-echarts/chart-library/line` | [Line](LINE_CHART_API.md) |
| `AreaChart<T>` / `nec-area-chart` | `@ng-echarts/chart-library/area` | [Area](AREA_CHART_API.md) |
| `PieChart<T>` / `nec-pie-chart` | `@ng-echarts/chart-library/pie` | [Pie/donut](PIE_CHART_API.md) |
| `ChartFrame` / `nec-chart-frame` | `@ng-echarts/chart-library/core` | Required `title`, optional `description`, projected content |

## Complete four-chart application

Copy this entire block into `src/app/app.ts` in the generated application. Its exported `App` and `app-root` selector match the CLI bootstrap. It requires no global renderer setup or library-specific providers. Tables remain enabled for keyboard selection.

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library/bar';
import { LineChart } from '@ng-echarts/chart-library/line';
import { AreaChart } from '@ng-echarts/chart-library/area';
import { PieChart } from '@ng-echarts/chart-library/pie';
import type {
  ChartMeasure,
  ChartSeries,
  ChartTheme,
  PointSelection,
} from '@ng-echarts/chart-library/core';

interface Visit {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}

@Component({
  selector: 'app-root',
  imports: [BarChart, LineChart, AreaChart, PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Angular chart example</h1>
    <button type="button" (click)="update()">Update values</button>
    <button type="button" (click)="toggleTheme()" [attr.aria-pressed]="theme() === 'dark'">
      Dark theme
    </button>
    <p class="selection" role="status">{{ selection() }}</p>
    <div class="charts">
      <nec-bar-chart
        title="Monthly visits" description="Desktop and mobile visits by month."
        [data]="rows()" rowIdKey="id" categoryKey="month" [series]="series"
        [theme]="theme()" [height]="240" (pointSelect)="select($event)"
      />
      <nec-line-chart
        title="Visit trends" description="Missing observations remain gaps."
        [data]="rows()" rowIdKey="id" categoryKey="month" [series]="series"
        [theme]="theme()" [height]="240" (pointSelect)="select($event)"
      />
      <nec-area-chart
        title="Stacked visits" description="Desktop and mobile totals with independent fills."
        [data]="rows()" rowIdKey="id" categoryKey="month" [series]="series"
        [stacked]="true" [theme]="theme()" [height]="240" (pointSelect)="select($event)"
      />
      <nec-pie-chart
        title="Desktop share" description="Desktop visits across months."
        [data]="rows()" rowIdKey="id" categoryKey="month" [measure]="measure"
        [innerRadius]="0.6" [theme]="theme()" [height]="240" (pointSelect)="select($event)"
      />
    </div>
  `,
  styles: `
    :host { display: block; max-width: 72rem; margin: auto; padding: 16px; font-family: system-ui, sans-serif; }
    .charts { display: grid; gap: 24px; margin-top: 24px; }
    .charts > * { min-width: 0; }
    @media (min-width: 900px) { .charts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class App {
  protected readonly rows = signal<readonly Visit[]>([
    { id: 'jan', month: 'January', desktop: 342, mobile: 184 },
    { id: 'feb', month: 'February', desktop: 0, mobile: 87 },
    { id: 'mar', month: 'March', desktop: 155, mobile: null },
  ]);
  protected readonly series: readonly ChartSeries<Visit>[] = [
    { id: 'desktop', key: 'desktop', label: 'Desktop' },
    { id: 'mobile', key: 'mobile', label: 'Mobile' },
  ];
  protected readonly measure: ChartMeasure<Visit> = {
    id: 'desktop', key: 'desktop', label: 'Desktop',
  };
  protected readonly theme = signal<ChartTheme>('light');
  protected readonly selection = signal('No point selected');

  protected update(): void {
    this.rows.update((rows) => rows.map((row) => ({
      ...row, desktop: row.desktop === null ? null : row.desktop + 10,
    })));
  }
  protected toggleTheme(): void {
    this.theme.update((theme) => theme === 'light' ? 'dark' : 'light');
  }
  protected select(event: PointSelection<Visit>): void {
    this.selection.set(`${event.rowId}/${event.seriesId}/${event.value}/${event.source}`);
  }
}
```

The declaration check compiles this exact block against the installed tarball; the documentation-consumer check bootstraps it in a new CLI-generated SSR application. Individual API guides have smaller component examples.

## Shared types and events

| Type | Contract |
| --- | --- |
| `StringKey<T>` | String-valued row fields used for identity and category text |
| `NumericKey<T>` | Numeric fields, including nullable/optional numeric fields; excludes text, `any`, `unknown`, and exclusively nullish fields |
| `ChartSeries<T>` | Cartesian measure with unique `id`, numeric `key`, `label`, optional CSS `color` |
| `ChartMeasure<T>` | One pie/donut measure with `id`, numeric `key`, `label` |
| `PointSelection<T>` | Original `row`, `rowId`, `seriesId`, raw numeric `value`, and `source: 'plot' \| 'table'`; pie uses its measure ID in `seriesId` |
| `LegendVisibilityChange` | Cartesian `{ seriesId, visible }` |
| `CategoryVisibilityChange` | Pie/donut `{ rowId, visible }` |
| `ChartTheme`, `BarLayout` | `'light' \| 'dark'` and `'vertical' \| 'horizontal'`; layout applies only to bar |
| `ValueFormatter` | Pure synchronous `(value: number) => string`; called for observations and generated numeric axis ticks |
| `CategoryTickFormatter` | Pure synchronous `(category: string, index: number) => string`; Cartesian axis text only |

All types are available from `/core`; family entries reexport applicable types. `BarLayout` is reexported by `/bar`; `ChartMeasure` and `CategoryVisibilityChange` by `/pie`. A point action does not add persistent plot-selection state. Handle legend outputs with the family-specific payload above.

## Updates, formatting and state

Use unique, nonempty row IDs and Cartesian series IDs. Duplicate display labels are allowed. Replace arrays, changed row objects, series definitions and configuration objects; in-place mutation is not observed. Preserve IDs when renaming or reordering so focus and visibility can follow them. New IDs start visible; removed IDs are discarded. Legends filter the plot while the table retains all supplied values.

Null/undefined observations remain missing. Zero is numeric; Cartesian negatives are supported. Pie/donut rejects negatives, nonfinite values and overflowing totals; all-zero/all-missing data is empty. Missing line/area observations remain gaps in every interpolation/stack mode. Area events carry raw observations, not stack totals.

The default numeric locale is explicit `en-US`. Use the same locale, immutable `Intl.NumberFormatOptions` and pure formatter on server and client. Custom text appears on numeric axes, tooltips, table cells and action names; generated ticks may contain values absent from the dataset. Missing values bypass callbacks, and emitted values stay numeric. Tooltip text is escaped. Pie has no axes. Category-tick formatting never changes full tooltip/table categories or event identity.

State precedence is application error → loading → data/configuration/renderer error → empty → ready. Loading/error/empty states remove stale plot actions. Valid replacement inputs recover the latest data; renderer failures also offer Retry chart. All-hidden Cartesian series keep recovery controls; hiding every positive pie category keeps controls with no placeholder slices.

## SSR, appearance and accessibility

Keep the generated SSR/hydration configuration. Do not initialize ECharts or touch the plot surface in consumer code. Server output contains Angular headings, descriptions, state messages and controls; the browser starts a lazy Canvas plot after stability, dimensions and fonts are ready. Initially hidden cards recover when shown. The library disposes its observer, focus/motion listeners and renderer when Angular destroys the component.

Provide a meaningful `title` and `description`. Keep the default `showDataTable: true` for complete values and keyboard point actions, or provide an equivalent interface. Native legends expose visibility and retain focus through keyed updates. Missing cells say Missing and have no action. Gallery previews deliberately disable tables; their Code tabs do not replace keyboard controls. Human screen-reader interpretation remains deferred to release acceptance.

`theme` is explicit; the library does not infer an application theme. CSS tokens are `--nec-background`, `--nec-text`, `--nec-muted`, `--nec-border`, `--nec-focus`, and numbered `--nec-series-N` colors. Explicit Cartesian series colors take precedence. After changing CSS or a loaded host font, increment `themeRevision` to reread them. Fonts are inherited; Inter is a playground choice, not a package dependency. Reduced-motion preference overrides decorative animation even when `animation` is true.

See [compatibility and limits](COMPATIBILITY.md) for exact versions, measured data envelopes, browser coverage, exclusions and pending release work.


## Link an overview and detail

Use a stable row ID from `pointSelect` as application state and derive another chart’s rows with `computed`. The [linked-chart guide](LINKED_CHARTS.md) provides a complete standalone bar/pie example with keyboard table actions, a native month selector, an all-month reset and stable-ID reconciliation after data changes. The library components and their independent legend states remain unchanged.
