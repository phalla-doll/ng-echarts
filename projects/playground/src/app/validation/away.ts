import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-away',
  template: `<main class="utility-page">
    <h1>Navigation cleanup fixture</h1>
    <p>No charts are mounted on this route.</p>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Away {}
