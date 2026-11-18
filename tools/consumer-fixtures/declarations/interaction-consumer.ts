import { Component } from '@angular/core';
import { BarChart } from '@mantha911/ng-echarts/bar';
import {
  CategoryRange,
  type CategoryRangeSelection,
  type CategoryRangeCancellation,
} from '@mantha911/ng-echarts/interaction';
// @ts-expect-error Interactions remain outside the compatibility root.
import { CategoryRange as RootRange } from '@mantha911/ng-echarts';
void RootRange;

@Component({
  imports: [BarChart, CategoryRange],
  template: `<nec-bar-chart
    title="Range"
    [data]="rows"
    rowIdKey="id"
    categoryKey="label"
    [series]="series"
    [necCategoryRange]="ids"
    [rangeEnabled]="true"
    [rangeContext]="rows"
    (categoryRangeSelect)="select($event)"
    (categoryRangeCancel)="cancel($event)"
  />`,
})
export class InteractionConsumer {
  readonly rows = [{ id: 'zero', label: 'Zero', value: 0 }];
  readonly ids = ['zero'];
  readonly series = [{ id: 'v', key: 'value' as const, label: 'Value' }];
  select(selection: CategoryRangeSelection) {
    const id: string = selection.from;
    void id;
  }
  cancel(reason: CategoryRangeCancellation) {
    const text: string = reason;
    void text;
  }
}
// @ts-expect-error IDs are stable strings, never numeric category indices.
const bad: CategoryRangeSelection = { from: 0, to: 1, rowIds: [0, 1], source: 'pointer' };
void bad;
