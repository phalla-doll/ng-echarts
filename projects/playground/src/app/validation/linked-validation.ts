import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LinkedVisits, type VisitMonth } from '../linked/linked-visits';
import { SiteAppearance } from '../shell/site-appearance';
export const linkedValidationRows: readonly VisitMonth[] = [
  { id: 'jan', month: 'January', desktop: 120, mobile: 80 },
  { id: 'feb', month: 'February', desktop: 200, mobile: 0 },
  { id: 'mar', month: 'March', desktop: null, mobile: 40 },
  { id: 'apr', month: 'April', desktop: 60, mobile: null },
];
@Component({
  selector: 'app-linked-validation',
  imports: [LinkedVisits],
  template: `<main class="utility-page validation-page">
    <h1>Linked selection validation</h1>
    <p>
      Months and range endpoints follow stable IDs through immutable data changes. Removing an
      endpoint restores all months; removing an interior month shrinks the range.
    </p>
    <section class="validation-controls" aria-label="Chart controls">
      <div class="control-group" role="group" aria-labelledby="linked-validation-controls-0">
        <h2 id="linked-validation-controls-0">Appearance</h2>
        <div class="control-actions">
          <button
            type="button"
            [attr.aria-pressed]="horizontal()"
            (click)="horizontal.set(!horizontal())"
          >
            Horizontal overview
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button type="button" [attr.aria-pressed]="stacked()" (click)="stacked.set(!stacked())">
            Stack overview
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
          <button
            type="button"
            [attr.aria-pressed]="gradient()"
            (click)="gradient.set(!gradient())"
          >
            Gradient overview
            <span class="toggle-indicator" aria-hidden="true"></span>
          </button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="linked-validation-controls-1">
        <h2 id="linked-validation-controls-1">Data</h2>
        <div class="control-actions">
          <button type="button" (click)="refresh()">Update linked values</button>
          <button type="button" (click)="reverse()">Reverse months</button>
          <button type="button" (click)="remove()">Remove February</button>
          <button class="control-restore" type="button" (click)="rows.set(initial)">
            Restore linked data
          </button>
        </div>
      </div>
      <div class="control-group" role="group" aria-labelledby="linked-validation-controls-2">
        <h2 id="linked-validation-controls-2">States</h2>
        <div class="control-actions">
          <button type="button" (click)="rows.set([])">Empty linked data</button>
          <button type="button" (click)="rows.set(missing)">Missing linked data</button>
        </div>
      </div>
    </section>
    <app-linked-visits
      [data]="rows()"
      [theme]="theme()"
      [layout]="horizontal() ? 'horizontal' : 'vertical'"
      [stacked]="stacked()"
      [gradient]="gradient()"
    />
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedValidation {
  protected readonly horizontal = signal(false);
  protected readonly stacked = signal(false);
  protected readonly gradient = signal(false);
  protected readonly rows = signal(linkedValidationRows);
  protected readonly initial = linkedValidationRows;
  protected readonly missing: readonly VisitMonth[] = [
    { id: 'none', month: 'No observations', desktop: null, mobile: null },
  ];
  protected readonly theme = inject(SiteAppearance).theme;
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
