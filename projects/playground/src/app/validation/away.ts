import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-away',
  imports: [RouterLink],
  template: `<main class="utility-page validation-page">
    <h1>Navigation cleanup fixture</h1>
    <p>No charts are mounted on this route.</p>
    <section class="validation-empty">
      <h2>Charts removed</h2>
      <p>This page provides a clean destination for checking chart teardown after navigation.</p>
      <a class="ui-button" routerLink="/validation">Back to lifecycle validation</a>
    </section>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Away {}
