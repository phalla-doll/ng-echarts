// Generated from docs/BAR_ZOOM_PROTOTYPE.md by npm run bar-zoom:source.
import { Component, computed, input, signal } from '@angular/core';
import { BarChart, type ChartSeries, type ChartTheme } from '@mantha911/ng-echarts/bar';
import { CategoryRange, type CategoryRangeSelection } from '@mantha911/ng-echarts/interaction';

interface Day {
  readonly id: string;
  readonly label: string;
  readonly shipments: number | null;
}

interface WindowBounds {
  readonly from: number;
  readonly to: number;
}

const days: readonly Day[] = [
  { id: 'nov-09', label: 'Nov 9', shipments: 48 },
  { id: 'nov-10', label: 'Nov 10', shipments: 62 },
  { id: 'nov-11', label: 'Nov 11', shipments: 0 },
  { id: 'nov-12', label: 'Nov 12', shipments: 37 },
  { id: 'nov-13', label: 'Nov 13', shipments: null },
  { id: 'nov-14', label: 'Nov 14', shipments: 71 },
  { id: 'nov-15', label: 'Nov 15', shipments: 23 },
  { id: 'nov-16', label: 'Nov 16', shipments: 55 },
];

const fullWindow = { from: 0, to: days.length - 1 };

@Component({
  selector: 'app-bar-zoom-example',
  imports: [BarChart, CategoryRange],
  host: { '(keydown.escape)': 'armed.set(false)' },
  template: `
    <section aria-labelledby="bar-zoom-heading">
      <h1 id="bar-zoom-heading">Shipment window</h1>
      <fieldset>
        <legend>Visible days</legend>
        <div class="bounds">
          <label>
            <span>From</span>
            <select #from (change)="setFrom(from.selectedIndex)">
              @for (day of days; track day.id; let index = $index) {
                <option [value]="day.id" [selected]="index === window().from">
                  {{ day.label }}
                </option>
              }
            </select>
          </label>
          <label>
            <span>To</span>
            <select #to (change)="setTo(to.selectedIndex)">
              @for (day of days; track day.id; let index = $index) {
                <option [value]="day.id" [selected]="index === window().to">{{ day.label }}</option>
              }
            </select>
          </label>
        </div>
        <div class="actions">
          <button type="button" [attr.aria-disabled]="count() === 1" (click)="zoom('in')">
            Zoom in
          </button>
          <button
            type="button"
            [attr.aria-disabled]="count() === days.length"
            (click)="zoom('out')"
          >
            Zoom out
          </button>
          <button type="button" [attr.aria-disabled]="window().from === 0" (click)="pan(-1)">
            Pan earlier
          </button>
          <button
            type="button"
            [attr.aria-disabled]="window().to === fullWindow.to"
            (click)="pan(1)"
          >
            Pan later
          </button>
          <button type="button" (click)="commit(fullWindow)">Reset window</button>
        </div>
      </fieldset>
      <p class="window-status" role="status">
        {{ count() }} of {{ days.length }} days visible, {{ visible()[0].label }} to
        {{ visible()[count() - 1].label }}.
      </p>
      <div class="range-control">
        <button
          #arm
          type="button"
          [attr.aria-pressed]="armed()"
          [attr.aria-disabled]="!canDrag()"
          (click)="toggleRange(arm)"
        >
          Chart range
        </button>
        <span>Turn on Chart range, then drag across the bars. Press Escape to cancel.</span>
      </div>
      <nec-bar-chart
        title="Daily shipments"
        description="Recorded shipments in the visible window."
        [data]="visible()"
        [theme]="theme()"
        [series]="series"
        rowIdKey="id"
        categoryKey="label"
        [height]="240"
        [necCategoryRange]="visibleIds()"
        [rangeEnabled]="armed()"
        [rangeContext]="window()"
        (categoryRangeSelect)="selectRange($event, arm)"
        (categoryRangeCancel)="armed.set(false)"
      />
    </section>
  `,
  styles: `
    :host {
      display: block;
      color: var(--site-text, #172d38);
      font:
        1rem/1.5 system-ui,
        sans-serif;
    }
    section {
      max-inline-size: 50rem;
      margin-inline: auto;
      padding: 1rem;
    }
    h1 {
      margin-block: 0 0.8rem;
      font-size: clamp(1.75rem, 5vw, 2.5rem);
    }
    fieldset {
      min-inline-size: 0;
      margin: 0;
      padding: 0.75rem;
      border: 1px solid var(--site-border, #738b96);
      border-radius: 0.4rem;
    }
    legend {
      padding-inline: 0.3rem;
      font-weight: 650;
    }
    .bounds,
    .actions,
    .range-control {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 0.75rem;
      align-items: center;
    }
    .actions {
      margin-block-start: 0.75rem;
    }
    label {
      display: grid;
      gap: 0.25rem;
    }
    button,
    select {
      font: inherit;
      padding: 0.35rem 0.55rem;
      border: 1px solid var(--site-border, #738b96);
      border-radius: 0.25rem;
      background: var(--site-surface, #fff);
      color: inherit;
    }
    button[aria-pressed='true'] {
      color: #fff;
      background: #13526a;
    }
    button[aria-disabled='true'] {
      color: var(--site-muted, #526570);
      background: var(--site-hover, #edf3f5);
    }
    :is(button, select):focus-visible {
      outline: 2px solid var(--site-focus, #116e8a);
      outline-offset: 2px;
    }
    .window-status {
      font-weight: 650;
    }
    .range-control {
      margin-block-end: 0.65rem;
    }
    /* A hidden tooltip can retain its desktop offset after resize. */
    nec-bar-chart {
      display: block;
      overflow-x: clip;
      overflow-clip-margin: 4px;
    }
  `,
})
export class App {
  readonly theme = input<ChartTheme>('light');
  protected readonly days = days;
  protected readonly fullWindow = fullWindow;
  protected readonly series: readonly ChartSeries<Day>[] = [
    { id: 'shipments', key: 'shipments', label: 'Shipments' },
  ];
  protected readonly window = signal<WindowBounds>(fullWindow);
  protected readonly armed = signal(false);
  protected readonly visible = computed(() => {
    const { from, to } = this.window();
    return days.slice(from, to + 1);
  });
  protected readonly count = computed(() => this.visible().length);
  protected readonly visibleIds = computed(() => this.visible().map((day) => day.id));
  protected readonly canDrag = computed(
    () => this.count() > 1 && this.visible().some((day) => day.shipments !== null),
  );

  protected commit(bounds: WindowBounds): void {
    this.armed.set(false);
    this.window.set(bounds);
  }

  protected setFrom(from: number): void {
    this.commit({ from, to: Math.max(from, this.window().to) });
  }

  protected setTo(to: number): void {
    this.commit({ from: Math.min(this.window().from, to), to });
  }

  protected zoom(direction: 'in' | 'out'): void {
    const count = this.count();
    const nextCount = direction === 'in' ? Math.ceil(count / 2) : Math.min(days.length, count * 2);
    if (nextCount === count) return;
    const center = this.window().from + (count - 1) / 2;
    this.move(Math.floor(center - (nextCount - 1) / 2), nextCount);
  }

  protected pan(direction: -1 | 1): void {
    const count = this.count();
    const start = this.window().from + direction * count;
    const lastStart = days.length - count;
    if (this.window().from === (direction < 0 ? 0 : lastStart)) return;
    this.move(start, count);
  }

  protected toggleRange(button: HTMLButtonElement): void {
    if (!this.canDrag()) return;
    this.armed.update((armed) => !armed);
    button.focus({ preventScroll: true });
  }

  protected selectRange(selection: CategoryRangeSelection, button: HTMLButtonElement): void {
    const { from } = this.window();
    const ids = this.visibleIds();
    this.commit({ from: from + ids.indexOf(selection.from), to: from + ids.indexOf(selection.to) });
    button.focus({ preventScroll: true });
  }

  private move(start: number, count: number): void {
    const from = Math.max(0, Math.min(days.length - count, start));
    this.commit({ from, to: from + count - 1 });
  }
}
