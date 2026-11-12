import { Component } from '@angular/core';
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library/bar';

interface Row {
  id: string;
  category: string;
  count: number;
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid category key"
    [data]="rows"
    rowIdKey="id"
    categoryKey="count"
    [series]="series"
  />`,
})
export class InvalidConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid numeric key"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="badSeries"
  />`,
})
export class InvalidSeriesConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly badSeries = [{ id: 'bad', key: 'category', label: 'Invalid measure' }] as const;
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid category formatter"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    [categoryTickFormatter]="badFormatter"
  />`,
})
export class InvalidFormatterConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
  readonly badFormatter = (_category: string) => 42;
}

@Component({
  imports: [BarChart],
  template: `<nec-bar-chart
    title="Invalid value formatter"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    [valueFormatter]="badValueFormatter"
    [numberFormatOptions]="badNumberOptions"
  />`,
})
export class InvalidValueFormatterConsumer {
  readonly rows: readonly Row[] = [{ id: 'a', category: 'A', count: 1 }];
  readonly series: readonly ChartSeries<Row>[] = [{ id: 'count', key: 'count', label: 'Count' }];
  readonly badValueFormatter = (_value: number) => 42;
  readonly badNumberOptions = { style: 'invalid' } as const;
}

import { LineChart } from '@ng-echarts/chart-library/line';
@Component({
  imports: [LineChart],
  template: `<nec-line-chart
    title="Invalid line"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    [smooth]="'yes'"
  />`,
})
export class InvalidLine {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'category', label: 'Invalid' }] as const;
}

import { AreaChart } from '@ng-echarts/chart-library/area';
@Component({
  imports: [AreaChart],
  template: `<nec-area-chart
    title="Invalid line"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    [stacked]="'yes'"
  />`,
})
export class InvalidArea {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'category', label: 'Invalid' }] as const;
}

import { PieChart } from '@ng-echarts/chart-library/pie';
@Component({
  selector: 'invalid-pie',
  imports: [PieChart],
  template: `<nec-pie-chart
    title="Bad"
    [data]="data"
    rowIdKey="id"
    categoryKey="label"
    [measure]="{ id: 'v', key: 'label', label: 'Wrong' }"
    [innerRadius]="'wrong'"
  />`,
})
export class InvalidPie {
  readonly data = [{ id: 'a', label: 'A', value: 1 }];
}
