import { SankeyChart } from '@ng-echarts/chart-library/sankey';
import { CalendarHeatmap } from '@ng-echarts/chart-library/calendar';
import { RadialProgress } from '@ng-echarts/chart-library/radial';
import { RadarChart } from '@ng-echarts/chart-library/radar';
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
    title="Invalid row selection"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
    [selectedRowId]="12"
    [selectedRowIds]="[12]"
    [rangeSelection]="'yes'"
  />`,
})
export class InvalidBarSelection {
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

import { ComposedChart } from '@ng-echarts/chart-library/composed';
@Component({
  imports: [ComposedChart],
  template: `<nec-composed-chart
    title="Invalid composed kind"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
  />`,
})
export class InvalidComposedKind {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'count', label: 'V', kind: 'area' }] as const;
}
@Component({
  imports: [ComposedChart],
  template: `<nec-composed-chart
    title="Invalid composed options"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
  />`,
})
export class InvalidComposedOptions {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'count', label: 'V', kind: 'bar', smooth: true }] as const;
}
@Component({
  imports: [ComposedChart],
  template: `<nec-composed-chart
    title="Invalid composed measure"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
  />`,
})
export class InvalidComposedMeasure {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'category', label: 'V', kind: 'line' }] as const;
}
@Component({
  imports: [ComposedChart],
  template: `<nec-composed-chart
    title="Invalid composed missing kind"
    [data]="rows"
    rowIdKey="id"
    categoryKey="category"
    [series]="series"
  />`,
})
export class InvalidComposedMissingKind {
  readonly rows = [{ id: 'a', category: 'A', count: 1 }];
  readonly series = [{ id: 'v', key: 'count', label: 'V' }] as const;
}

@Component({
  imports: [RadarChart],
  template: `<nec-radar-chart
    title="Invalid radar scale"
    [data]="rows"
    rowIdKey="id"
    categoryKey="name"
    maxKey="name"
    [series]="series"
  />`,
})
export class InvalidRadarScale {
  readonly rows = [{ id: 'a', name: 'A', max: 100, value: 20 }];
  readonly series = [{ id: 'value', key: 'value', label: 'Value' }] as const;
}
@Component({
  imports: [RadarChart],
  template: `<nec-radar-chart
    title="Invalid radar fill"
    [data]="rows"
    rowIdKey="id"
    categoryKey="name"
    maxKey="max"
    [series]="series"
    [filled]="12"
  />`,
})
export class InvalidRadarFill {
  readonly rows = [{ id: 'a', name: 'A', max: 100, value: 20 }];
  readonly series = [{ id: 'value', key: 'value', label: 'Value' }] as const;
}

@Component({
  imports: [RadialProgress],
  template: `<nec-radial-progress title="Invalid value" [value]="wrong" />`,
})
export class InvalidRadialValue {
  readonly wrong = '68';
}
@Component({
  imports: [RadialProgress],
  template: `<nec-radial-progress title="Invalid maximum" [value]="68" [max]="wrong" />`,
})
export class InvalidRadialMax {
  readonly wrong = '100';
}

@Component({
  imports: [CalendarHeatmap],
  template: `<nec-calendar-heatmap
    title="Invalid calendar"
    [data]="rows"
    dateKey="count"
    valueKey="count"
    [year]="2024"
    [max]="40"
  />`,
})
export class InvalidCalendarDate {
  readonly rows = [{ date: '2024-01-01', count: 1 }];
  readonly wrong = '2024';
}

@Component({
  imports: [CalendarHeatmap],
  template: `<nec-calendar-heatmap
    title="Invalid calendar"
    [data]="rows"
    dateKey="date"
    valueKey="date"
    [year]="2024"
    [max]="40"
  />`,
})
export class InvalidCalendarValue {
  readonly rows = [{ date: '2024-01-01', count: 1 }];
  readonly wrong = '2024';
}

@Component({
  imports: [CalendarHeatmap],
  template: `<nec-calendar-heatmap
    title="Invalid calendar"
    [data]="rows"
    dateKey="date"
    valueKey="count"
    [year]="wrong"
    [max]="40"
  />`,
})
export class InvalidCalendarYear {
  readonly rows = [{ date: '2024-01-01', count: 1 }];
  readonly wrong = '2024';
}

@Component({
  imports: [SankeyChart],
  template: `<nec-sankey-chart title="Invalid nodes" [nodes]="nodes" [links]="[]" />`,
})
export class InvalidSankeyNode {
  readonly nodes = [{ id: 1, label: 'A' }];
}
@Component({
  imports: [SankeyChart],
  template: `<nec-sankey-chart title="Invalid links" [nodes]="[]" [links]="links" />`,
})
export class InvalidSankeyLink {
  readonly links = [{ id: 'ab', source: 'a', target: 'b', value: null }];
}
