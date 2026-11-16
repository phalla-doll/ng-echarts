import type { ComposedSeries, ComposedValueAxis } from '@mantha911/ng-echarts/composed';
import { deviceRows, type DeviceRow } from '../../fixtures/evilcharts-bar-fixture';
import type { BarBlock } from '../bar/bar-blocks';
export interface ComposedBlock extends Omit<
  BarBlock,
  'kind' | 'layout' | 'stacked' | 'gradient' | 'series'
> {
  readonly kind: 'composed';
  readonly layout?: 'vertical' | 'horizontal';
  readonly lineSummary?: 'latest' | 'total';
  readonly valueAxes?: readonly ComposedValueAxis[];
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
  {
    kind: 'composed',
    id: 'horizontal-visits-and-target',
    title: 'Regional Visits & Target',
    description:
      'Regional desktop and mobile visits share a horizontal bar stack. The line shows supplied targets in visits. The first supplied region stays at the top. Horizontal composition requires the local rc.23 candidate.',
    layout: 'horizontal',
    lineSummary: 'total',
    rows: [
      { id: 'north', month: 'Northern Europe', desktop: 180, mobile: 80, trend: 300 },
      { id: 'southeast', month: 'Southeast Asia', desktop: 140, mobile: 110, trend: 280 },
      { id: 'south', month: 'South America', desktop: 120, mobile: 90, trend: 240 },
      { id: 'oceania', month: 'Oceania', desktop: 100, mobile: 60, trend: 200 },
    ],
    series: [
      { id: 'desktop', key: 'desktop', label: 'Desktop', kind: 'bar', stack: 'visits' },
      { id: 'mobile', key: 'mobile', label: 'Mobile', kind: 'bar', stack: 'visits' },
      { id: 'trend', key: 'trend', label: 'Target', kind: 'line' },
    ],
  },
  {
    kind: 'composed',
    id: 'revenue-and-conversion',
    title: 'Revenue & Conversion',
    description:
      'Revenue uses the left USD axis; conversion is a supplied fraction on the right percentage axis. The scales are independent. Available since rc.24.',
    rows: [
      { id: 'jan', month: 'January', desktop: 1200, mobile: null, trend: 0.12 },
      { id: 'feb', month: 'February', desktop: 1800, mobile: null, trend: 0.18 },
      { id: 'mar', month: 'March', desktop: 0, mobile: null, trend: 0 },
      { id: 'apr', month: 'April', desktop: null, mobile: null, trend: 0.2 },
    ],
    valueAxes: [
      {
        id: 'revenue',
        label: 'Revenue',
        unit: 'USD',
        numberFormatOptions: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
      },
      {
        id: 'conversion',
        label: 'Conversion',
        unit: '%',
        numberFormatOptions: { style: 'percent', maximumFractionDigits: 0 },
      },
    ],
    series: [
      { id: 'revenue', key: 'desktop', label: 'Revenue', kind: 'bar' },
      { id: 'conversion', key: 'trend', label: 'Conversion', kind: 'line', axisId: 'conversion' },
    ],
  },
];
export function composedExampleSource(block: ComposedBlock, dark: boolean): string {
  return [
    "import { ChangeDetectionStrategy, Component } from '@angular/core';",
    `import { ComposedChart, type ComposedSeries${block.valueAxes ? ', type ComposedValueAxis' : ''} } from '@mantha911/ng-echarts/composed';`,
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
    ...(block.layout ? [`    layout="${block.layout}"`] : []),
    ...(block.valueAxes ? ['    [valueAxes]="valueAxes"'] : []),
    ...(block.layout === 'horizontal' ? [] : ['    [categoryTickFormatter]="monthTick"']),
    '  />`,',
    '})',
    'export class VisitsAndTrend {',
    `  readonly visits: readonly Visit[] = ${JSON.stringify(block.rows, null, 2)};`,
    `  readonly series: readonly ComposedSeries<Visit>[] = ${JSON.stringify(block.series, null, 2)};`,
    ...(block.valueAxes
      ? [
          `  readonly valueAxes: readonly ComposedValueAxis[] = ${JSON.stringify(block.valueAxes, null, 2)};`,
        ]
      : []),
    '  readonly monthTick = (month: string) => month.slice(0, 3);',
    '}',
  ].join('\n');
}
