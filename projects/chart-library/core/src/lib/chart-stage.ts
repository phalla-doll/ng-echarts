import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ChartState } from './cartesian-model';

/** Internal plot shell: state changes preserve the renderer's allocated geometry. */
@Component({
  selector: 'nec-chart-stage',
  template: `
    <ng-content />
    @let current = state();
    @if (current.kind !== 'ready') {
      <div class="chart-status" [class.is-loading]="current.kind === 'loading'">
        @if (current.kind === 'loading') {
          <span class="loading-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        }
        <p [attr.role]="current.kind === 'error' ? 'alert' : 'status'">{{ current.message }}</p>
        @if (current.kind === 'error' && retryable()) {
          <button type="button" (click)="retry.emit()">{{ retryLabel() }}</button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      min-width: 0;
    }
    .chart-status {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;
      overflow: auto;
      box-sizing: border-box;
      text-align: center;
    }
    p {
      margin: 0;
      max-width: 42ch;
      color: var(--nec-muted, #536176);
      font: inherit;
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
    }
    button {
      padding: 8px 12px;
      border: 1px solid var(--nec-border, #d6dce5);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--nec-focus, #648dff);
      outline-offset: 3px;
    }
    .loading-mark {
      display: flex;
      align-items: end;
      gap: 4px;
      height: 24px;
      opacity: 0.55;
    }
    i {
      width: 5px;
      height: 14px;
      border-radius: 2px;
      background: var(--nec-muted, #536176);
    }
    i:nth-child(2) {
      height: 24px;
    }
    i:nth-child(3) {
      height: 19px;
    }
  `,
  host: { '[style.min-height.px]': 'height()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartStage {
  readonly state = input.required<ChartState>();
  readonly height = input<number | null>(320);
  readonly retryable = input(false);
  readonly retryLabel = input('Retry chart');
  readonly retry = output<void>();
}
