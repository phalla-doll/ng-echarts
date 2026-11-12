import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shared presentation shell; no renderer or chart lifecycle behavior yet. */
@Component({
  selector: 'nec-chart-frame',
  templateUrl: './chart-frame.html',
  styleUrl: './chart-frame.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartFrame {
  readonly title = input.required<string>();
  readonly description = input('');
}
