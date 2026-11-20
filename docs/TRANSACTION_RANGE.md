# Filter transactions with a bar chart

Each bar shows the total for one business day. The chart keeps all five days visible so users can select a new range directly. The native From and To fields and the chart gesture update the same inclusive bounds. The table lists individual transactions, including the zero-dollar adjustment.

In an Angular 22 standalone app, install the verified release with `npm install @mantha911/ng-echarts@0.1.0-rc.33 echarts@6.1.0`. Replace `src/app/app.ts` with this example and retain the generated bootstrap and hydration configuration. See [Installation](INSTALLATION.md) for strict TypeScript and SSR settings.

```ts
import { Component, computed, signal } from '@angular/core';
import { BarChart, type ChartSeries } from '@mantha911/ng-echarts/bar';
import { CategoryRange, type CategoryRangeSelection } from '@mantha911/ng-echarts/interaction';

const days = [
  { id: 'mon', label: 'Mon, Nov 16' },
  { id: 'tue', label: 'Tue, Nov 17' },
  { id: 'wed', label: 'Wed, Nov 18' },
  { id: 'thu', label: 'Thu, Nov 19' },
  { id: 'fri', label: 'Fri, Nov 20' },
] as const;

type DayId = (typeof days)[number]['id'];
type DayTotal = (typeof days)[number] & { total: number };

const transactions = [
  { id: 'T101', day: 'mon', description: 'Store order', amount: 82 },
  { id: 'T102', day: 'tue', description: 'Online order', amount: 124 },
  { id: 'T103', day: 'tue', description: 'Fee adjustment', amount: 0 },
  { id: 'T104', day: 'thu', description: 'Wholesale order', amount: 210 },
  { id: 'T105', day: 'fri', description: 'Store order', amount: 36 },
] as const satisfies readonly { id: string; day: DayId; description: string; amount: number }[];

const fullRange = { from: 0, to: days.length - 1 };

@Component({
  selector: 'app-root',
  imports: [BarChart, CategoryRange],
  host: { '(keydown.escape)': 'armed.set(false)' },
  template: `
    <main>
      <h1>Transaction activity</h1>
      <p>
        Choose From and To, or turn on Chart range and drag across the bars. Escape cancels a drag.
      </p>
      <div class="controls">
        <label
          >From
          <select #from (change)="setFrom(from.selectedIndex)">
            @for (day of days; track day.id; let index = $index) {
              <option [value]="day.id" [selected]="index === range().from">{{ day.label }}</option>
            }
          </select></label
        >
        <label
          >To
          <select #to (change)="setTo(to.selectedIndex)">
            @for (day of days; track day.id; let index = $index) {
              <option [value]="day.id" [selected]="index === range().to">{{ day.label }}</option>
            }
          </select></label
        >
        <button #arm type="button" [attr.aria-pressed]="armed()" (click)="toggleRange(arm)">
          Chart range
        </button>
        <button type="button" (click)="commit(fullRange)">Reset range</button>
      </div>
      <nec-bar-chart
        title="Daily transaction totals"
        description="Total US dollars for each business day."
        [data]="totals"
        [series]="series"
        rowIdKey="id"
        categoryKey="label"
        [height]="220"
        [showDataTable]="false"
        [necCategoryRange]="ids"
        [rangeEnabled]="armed()"
        [rangeContext]="range()"
        (categoryRangeSelect)="selectRange($event, arm)"
        (categoryRangeCancel)="armed.set(false)"
      />
      <p role="status">
        {{ filtered().length }} transactions from {{ days[range().from].label }} through
        {{ days[range().to].label }}.
      </p>
      <table>
        <caption>
          Transactions in selected range
        </caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Description</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          @for (transaction of filtered(); track transaction.id) {
            <tr>
              <td>{{ labels.get(transaction.day) }}</td>
              <td>{{ transaction.description }}</td>
              <td>{{ currency.format(transaction.amount) }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3">No transactions in this range.</td>
            </tr>
          }
        </tbody>
      </table>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #172b39;
      font:
        1rem/1.5 system-ui,
        sans-serif;
    }
    main {
      max-width: 52rem;
      margin: auto;
      padding: 1rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.75rem, 5vw, 2.5rem);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: end;
      margin-block: 1rem;
    }
    label {
      display: grid;
      gap: 0.25rem;
    }
    select,
    button {
      font: inherit;
      padding: 0.4rem 0.55rem;
      border: 1px solid #657d8e;
      border-radius: 0.3rem;
      background: #fff;
      color: inherit;
    }
    button[aria-pressed='true'] {
      background: #174d65;
      color: #fff;
    }
    :is(select, button):focus-visible {
      outline: 2px solid #16718f;
      outline-offset: 2px;
    }
    /* A hidden chart tooltip can keep its desktop offset after a resize. */
    nec-bar-chart {
      display: block;
      overflow-x: clip;
      overflow-clip-margin: 4px;
    }
    table {
      inline-size: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    caption {
      text-align: left;
      font-weight: 700;
    }
    th,
    td {
      border-block-end: 1px solid #b8cbd4;
      padding: 0.5rem 0.35rem;
    }
    thead {
      background: #eef5f8;
    }
    tr > :nth-child(3) {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class App {
  protected readonly days: readonly (typeof days)[number][] = days;
  protected readonly fullRange = fullRange;
  protected readonly ids: readonly string[] = days.map((day) => day.id);
  protected readonly labels = new Map(days.map((day) => [day.id, day.label]));
  protected readonly currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  protected readonly totals: readonly DayTotal[] = days.map((day) => ({
    ...day,
    total: transactions.reduce(
      (sum, transaction) => sum + (transaction.day === day.id ? transaction.amount : 0),
      0,
    ),
  }));
  protected readonly series: readonly ChartSeries<DayTotal>[] = [
    { id: 'total', key: 'total', label: 'Total' },
  ];
  protected readonly range = signal(fullRange);
  protected readonly armed = signal(false);
  protected readonly filtered = computed(() => {
    const { from, to } = this.range();
    const included = new Set(this.ids.slice(from, to + 1));
    return transactions.filter((transaction) => included.has(transaction.day));
  });

  protected commit(bounds: typeof fullRange): void {
    this.armed.set(false);
    this.range.set(bounds);
  }

  protected setFrom(from: number): void {
    this.commit({ from, to: Math.max(from, this.range().to) });
  }

  protected setTo(to: number): void {
    this.commit({ from: Math.min(this.range().from, to), to });
  }

  protected toggleRange(button: HTMLButtonElement): void {
    this.armed.update((armed) => !armed);
    button.focus({ preventScroll: true });
  }

  protected selectRange(selection: CategoryRangeSelection, button: HTMLButtonElement): void {
    this.commit({ from: this.ids.indexOf(selection.from), to: this.ids.indexOf(selection.to) });
    button.focus({ preventScroll: true });
  }
}
```

Run `npm run check:transactions` from the repository to verify this exact source in a fresh, installed SSR consumer. Run `npm run check:bundle` to compare the bar and opt-in interaction imports using the existing measurement method. See the [interaction contract](INTERACTION_API.md) for gesture behavior and cancellation.

The package bundle check measured 186,893 gzip / 159,494 Brotli bytes for `/bar` alone and 192,284 gzip / 166,330 Brotli bytes with `/interaction`. The added 5,391 gzip / 6,836 Brotli bytes fit the existing opt-in allowance of 6,000 / 8,000. Both builds contain the same 232 engine modules, with none loaded eagerly.
