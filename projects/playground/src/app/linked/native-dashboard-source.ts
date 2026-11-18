import { ChangeDetectionStrategy, Component } from '@angular/core';
import { composedDashboardSource } from './composed-dashboard-source';

/** The preserved native example is downloaded only when its disclosure is opened. */
@Component({
  selector: 'app-native-dashboard-source',
  template: `<pre
    tabindex="0"
    aria-label="Native dashboard Angular source"
  ><code>{{ source }}</code></pre>`,
  styleUrls: ['./linked-charts.css'],
  host: { style: 'display: block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeDashboardSource {
  protected readonly source = composedDashboardSource;
}
