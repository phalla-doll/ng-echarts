import { ChangeDetectionStrategy, Component, input, linkedSignal, signal } from '@angular/core';
import type { ChartTheme } from '@mantha911/ng-echarts/core';
import { ComposedDashboard, type DashboardMonth } from './composed-dashboard';

const sample: readonly DashboardMonth[] = [
  { id: 'jan', month: 'January', desktop: 120, mobile: 80 },
  { id: 'feb', month: 'February', desktop: 200, mobile: 0 },
  { id: 'mar', month: 'March', desktop: null, mobile: 40 },
  { id: 'apr', month: 'April', desktop: 60, mobile: null },
];

@Component({
  selector: 'app-root, app-dashboard-pilot',
  imports: [ComposedDashboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main>
    <h1>Visits dashboard</h1>
    <p>Explore recorded device visits and compare monthly trends.</p>
    <div class="controls">
      <button type="button" (click)="refresh()">Refresh visits</button>
      <button type="button" (click)="reverse()">Reverse months</button>
      <button type="button" (click)="remove()">Remove February</button>
      <button type="button" (click)="rows.set([])">Clear months</button>
      <button type="button" (click)="rows.set(sample)">Restore months</button>
      <button type="button" [attr.aria-pressed]="dark()" (click)="dark.set(!dark())">
        Dark theme
      </button>
    </div>
    <app-composed-dashboard [data]="rows()" [theme]="dark() ? 'dark' : 'light'" />
  </main>`,
  styles: `
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      color: var(--site-text, #18202c);
    }
    main {
      max-width: 1180px;
      padding: 24px 12px;
      margin: auto;
    }
    h1 {
      font-size: 28px;
      font-weight: 500;
    }
    p {
      line-height: 1.6;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 24px 0;
    }
    button {
      min-height: 40px;
      padding: 8px 12px;
      font: inherit;
      color: var(--site-text, #18202c);
      background: var(--site-bg, white);
      border: 1px solid var(--site-border, #d6dce5);
      border-radius: 6px;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 3px;
    }
  `,
})
export class App {
  readonly theme = input<ChartTheme>('light');
  protected readonly sample = sample;
  protected readonly rows = signal(sample);
  protected readonly dark = linkedSignal(() => this.theme() === 'dark');
  protected refresh(): void {
    this.rows.update((rows) =>
      rows.map((row) => ({ ...row, desktop: row.desktop === null ? null : row.desktop + 10 })),
    );
  }
  protected reverse(): void {
    this.rows.update((rows) => [...rows].reverse());
  }
  protected remove(): void {
    this.rows.update((rows) => rows.filter((row) => row.id !== 'feb'));
  }
}
