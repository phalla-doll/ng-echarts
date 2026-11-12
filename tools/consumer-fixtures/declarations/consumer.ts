import { Component } from '@angular/core';
import { ChartFrame } from '@ng-echarts/chart-library';
import type { EChartsCoreOption } from 'echarts/core';

// Check installed Angular template metadata and ECharts declarations under TS 6.
@Component({
  imports: [ChartFrame],
  template: `<nec-chart-frame title="Isolated consumer" description="Packed library fixture">
    <p>Projected consumer content</p>
  </nec-chart-frame>`,
})
export class Consumer {
  readonly options: EChartsCoreOption = { animation: false };
}
