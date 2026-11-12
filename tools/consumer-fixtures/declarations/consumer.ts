import { Component } from '@angular/core';
import {
  BarChart,
  ChartFrame,
  type ChartSeries,
  type NumericKey,
  type PointSelection,
} from '@ng-echarts/chart-library';
import type { EChartsCoreOption } from 'echarts/core';

// Check installed Angular template metadata and ECharts declarations under TS 6.
@Component({
  imports: [ChartFrame, BarChart],
  template: `<nec-chart-frame title="Isolated consumer" description="Packed library fixture">
      <p>Projected consumer content</p>
    </nec-chart-frame>
    <nec-bar-chart
      title="Packed bar"
      [data]="rows"
      rowIdKey="id"
      categoryKey="category"
      [series]="series"
      (pointSelect)="select($event)"
    />`,
})
export class Consumer {
  readonly options: EChartsCoreOption = { animation: false };
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 0 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
  select(point: PointSelection<Row>): void {
    void point.row.count;
  }
}

interface Row {
  id: string;
  category: string;
  count: number | null;
}
// @ts-expect-error A text field cannot be used as a numeric measure.
const invalidSeries: ChartSeries<Row> = { id: 'bad', key: 'category', label: 'Invalid' };
// @ts-expect-error Exclusively nullish fields cannot be numeric keys.
const nullish: NumericKey<{ missing: null }> = 'missing';
// @ts-expect-error Unknown and mixed fields must not slip through numeric constraints.
const unknown: NumericKey<{ unknown: unknown; mixed: number | string }> = 'unknown';
void [invalidSeries, nullish, unknown];
