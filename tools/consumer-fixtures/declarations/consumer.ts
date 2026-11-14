import { Component } from '@angular/core';
import {
  BarChart,
  type CategoryTickFormatter,
  type ChartSeries,
  type NumericKey,
  type PointSelection,
  type PointPreview,
  type ValueFormatter,
} from '@mantha911/ng-echarts/bar';
import { ChartFrame } from '@mantha911/ng-echarts/core';
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
      [categoryTickFormatter]="categoryTickFormatter"
      [numberFormatOptions]="numberFormatOptions"
      [valueFormatter]="valueFormatter"
      [previewEnabled]="true"
      (pointPreview)="preview($event)"
      (pointSelect)="select($event)"
    />`,
})
export class Consumer {
  readonly numberFormatOptions: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
  readonly valueFormatter: ValueFormatter = (value) => `${value} visits`;
  readonly options: EChartsCoreOption = { animation: false };
  readonly categoryTickFormatter: CategoryTickFormatter = (category, index) =>
    `${index}: ${category}`;
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 0 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
  preview(point: PointPreview<Row> | null): void {
    if (point) {
      const value: number = point.value;
      const row: Row = point.row;
      void [value, row, point.trigger];
    }
  }
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
// @ts-expect-error Category ticks accept text labels and return text, never numbers.
const invalidFormatter: CategoryTickFormatter = (category: number) => category;
void invalidFormatter;
// @ts-expect-error Numeric value formatters must return synchronous text.
const invalidValueFormatter: ValueFormatter = (value) => value;
void invalidValueFormatter;
