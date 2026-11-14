import type { BarLayout, ChartSeries } from '@mantha911/ng-echarts/bar';
import { deviceRows, deviceSeries, type DeviceRow } from './fixtures/evilcharts-bar-fixture';
import { horizontalRows, horizontalSeries } from './fixtures/evilcharts-horizontal-fixture';

export interface BarBlock {
  readonly kind: 'bar';
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly rows: readonly DeviceRow[];
  readonly series: readonly ChartSeries<DeviceRow>[];
  readonly layout: BarLayout;
  readonly stacked: boolean;
  readonly gradient: boolean;
  readonly color?: string;
}

/** Compositions of the existing, attributed fixtures; no new upstream datasets. */
export const barBlocks: readonly BarBlock[] = [
  {
    kind: 'bar',
    id: 'device-visits',
    title: 'Device Visits',
    description: 'Desktop and mobile visits across twelve months.',
    rows: deviceRows,
    series: deviceSeries,
    layout: 'vertical',
    stacked: false,
    gradient: false,
  },
  {
    kind: 'bar',
    id: 'stacked-comparison',
    title: 'Stacked Comparison',
    description: 'Monthly visits combined into stacked totals.',
    rows: deviceRows,
    series: deviceSeries,
    layout: 'vertical',
    stacked: true,
    gradient: false,
  },
  {
    kind: 'bar',
    id: 'gradient-fills',
    title: 'Gradient Fills',
    description: 'The same monthly observations with fading fills.',
    rows: deviceRows,
    series: deviceSeries,
    layout: 'vertical',
    stacked: false,
    gradient: true,
  },
  {
    kind: 'bar',
    id: 'horizontal-comparison',
    title: 'Horizontal Comparison',
    description: 'Desktop visits from January through June.',
    rows: horizontalRows,
    series: horizontalSeries,
    layout: 'horizontal',
    stacked: false,
    gradient: false,
    color: '#3b82f6',
  },
];

export function barExampleSource(block: BarBlock, dark: boolean): string {
  const name = block.id
    .split('-')
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join('');
  return [
    "import { ChangeDetectionStrategy, Component } from '@angular/core';",
    "import { BarChart, type ChartSeries } from '@mantha911/ng-echarts/bar';",
    '',
    'interface Visit { id: string; month: string; desktop: number | null; mobile: number | null; }',
    '',
    '@Component({',
    `  selector: 'app-${block.id}',`,
    '  imports: [BarChart],',
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    '  template: `<nec-bar-chart',
    `    title="${block.title}"`,
    `    description="${block.description}"`,
    '    [data]="visits" rowIdKey="id" categoryKey="month" [series]="series"',
    '    [categoryTickFormatter]="monthTick"',
    '    [showDataTable]="false"',
    `    theme="${dark ? 'dark' : 'light'}" layout="${block.layout}"`,
    `    [stacked]="${block.stacked}" [gradient]="${block.gradient}" [height]="230"`,
    '  />`,',
    '})',
    `export class ${name} {`,
    `  readonly visits: readonly Visit[] = ${JSON.stringify(block.rows, null, 2)};`,
    `  readonly series: readonly ChartSeries<Visit>[] = ${JSON.stringify(
      block.series.map((series) =>
        block.color ? { ...series, color: dark ? block.color : '#2563eb' } : series,
      ),
      null,
      2,
    )};`,
    '  readonly monthTick = (month: string) => month.slice(0, 3);',
    '}',
  ].join('\n');
}
