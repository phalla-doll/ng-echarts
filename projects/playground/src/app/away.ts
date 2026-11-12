import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-away',
  template: `<main>
    <h1>Navigation cleanup fixture</h1>
    <p>No charts are mounted on this route.</p>
  </main>`,
  styles: `
    main {
      padding: 2rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Away {}
