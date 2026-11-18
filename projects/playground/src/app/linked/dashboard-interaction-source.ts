import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HighlightCode } from '../code-examples/highlight-code';
import { composedDashboardSource } from './composed-dashboard-interaction-source';

/** Keep complete copyable source and its highlighter out of the initial chart route. */
@Component({
  selector: 'app-dashboard-interaction-source',
  imports: [HighlightCode],
  template: `<pre
    tabindex="0"
    aria-label="Composed linked dashboard Angular source"
  ><code [appHighlight]="source"></code></pre>`,
  styleUrls: ['./linked-charts.css'],
  host: { style: 'display: block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardInteractionSource {
  protected readonly source = composedDashboardSource;
}
