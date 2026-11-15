import type { ComposedSeries } from '@mantha911/ng-echarts/composed';
import { deviceRows, type DeviceRow } from '../../fixtures/evilcharts-bar-fixture';
import type { BarBlock } from '../bar/bar-blocks';
export interface ComposedBlock extends Omit<
  BarBlock,
  'kind' | 'layout' | 'stacked' | 'gradient' | 'series'
> {
  readonly kind: 'composed';
  readonly series: readonly ComposedSeries<DeviceRow>[];
}
// Original trailing three-observation mean derived from the attributed monthly fixture.
export const composedRows: readonly DeviceRow[] = deviceRows.map((row, index) => {
  const window = deviceRows.slice(Math.max(0, index - 2), index + 1);
  return { ...row, trend: window.reduce((sum, value) => sum + value.desktop!, 0) / window.length };
});
export const combinedComposedRows: readonly DeviceRow[] = deviceRows.map((row, index) => {
  const window = deviceRows.slice(Math.max(0, index - 2), index + 1);
  return {
    ...row,
    trend: window.reduce((sum, value) => sum + value.desktop! + value.mobile!, 0) / window.length,
  };
});
export const composedBlocks: readonly ComposedBlock[] = [
  {
    kind: 'composed',
    id: 'visits-and-trend',
    title: 'Visits & Trend',
    description:
      'Monthly desktop visits with a trailing three-month mean, using one visits scale. Early months use the observations available so far.',
    rows: composedRows,
    series: [
      { id: 'visits', key: 'desktop', label: 'Visits', kind: 'bar' },
      { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line', showPoints: true },
    ],
  },
  {
    kind: 'composed',
    id: 'stacked-visits-and-trend',
    title: 'Stacked Visits & Trend',
    description:
      'Desktop and mobile visits share a stack. The line is a supplied trailing three-month mean of combined visits on the same visits scale. Named bar stacks are available in rc.21 and later.',
    rows: combinedComposedRows,
    series: [
      { id: 'desktop', key: 'desktop', label: 'Desktop', kind: 'bar', stack: 'visits' },
      { id: 'mobile', key: 'mobile', label: 'Mobile', kind: 'bar', stack: 'visits' },
      { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line', showPoints: true },
    ],
  },
  {
    kind: 'composed',
    id: 'area-visits-and-trend',
    title: 'Area Visits & Trend',
    description:
      'Desktop visits as a gradient area with an independent supplied three-month mean. Missing observations remain gaps. Available in rc.22 and later.',
    rows: composedRows,
    series: [
      { id: 'visits', key: 'desktop', label: 'Visits', kind: 'area', gradient: true },
      { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
    ],
  },
  {
    kind: 'composed',
    id: 'stacked-area-visits-and-trend',
    title: 'Stacked Areas & Trend',
    description:
      'Desktop and mobile visits share an area stack; the line is a separately supplied trailing mean of combined visits on the same scale. Available in rc.22 and later.',
    rows: combinedComposedRows,
    series: [
      {
        id: 'desktop',
        key: 'desktop',
        label: 'Desktop',
        kind: 'area',
        stack: 'visits',
        gradient: false,
      },
      {
        id: 'mobile',
        key: 'mobile',
        label: 'Mobile',
        kind: 'area',
        stack: 'visits',
        gradient: false,
      },
      { id: 'trend', key: 'trend', label: '3-month mean', kind: 'line' },
    ],
  },
];
export function composedExampleSource(block: ComposedBlock, dark: boolean): string {
  return [
    "import { ChangeDetectionStrategy, Component } from '@angular/core';",
    "import { ComposedChart, type ComposedSeries } from '@mantha911/ng-echarts/composed';",
    '',
    'interface Visit { id: string; month: string; desktop: number | null; mobile: number | null; trend?: number | null; }',
    '@Component({',
    "  selector: 'app-visits-and-trend',",
    '  imports: [ComposedChart],',
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    '  template: `<nec-composed-chart',
    `    title="${block.title}"`,
    `    description="${block.description}"`,
    '    [data]="visits" rowIdKey="id" categoryKey="month" [series]="series"',
    `    theme="${dark ? 'dark' : 'light'}" [height]="230" [showDataTable]="false"`,
    '    [categoryTickFormatter]="monthTick"',
    '  />`,',
    '})',
    'export class VisitsAndTrend {',
    `  readonly visits: readonly Visit[] = ${JSON.stringify(block.rows, null, 2)};`,
    `  readonly series: readonly ComposedSeries<Visit>[] = ${JSON.stringify(block.series, null, 2)};`,
    '  readonly monthTick = (month: string) => month.slice(0, 3);',
    '}',
  ].join('\n');
}
