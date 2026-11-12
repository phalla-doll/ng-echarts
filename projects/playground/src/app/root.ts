import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `<nav aria-label="Playground pages">
      <a routerLink="/">Playground</a>
      <a routerLink="/comparison">Visual comparison</a>
      <a routerLink="/updates">Input updates</a>
      <a routerLink="/validation">Lifecycle validation</a>
      <a routerLink="/away">Navigate away</a>
    </nav>
    <router-outlet />`,
  styles: `
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      background: #18202c;
    }
    a {
      color: #edf2fa;
    }
    a:focus-visible {
      outline: 3px solid #648dff;
      outline-offset: 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Root {}
