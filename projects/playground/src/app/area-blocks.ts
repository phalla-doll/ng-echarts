import { lineExampleSource, type LineBlock } from './line-blocks';
import { areaRows, areaSeries } from './fixtures/evilcharts-area-fixture';
export interface AreaBlock extends Omit<LineBlock, 'kind'> {
  readonly kind: 'area';
  readonly stacked: boolean;
  readonly gradient: boolean;
}
const common = {
  kind: 'area',
  rows: areaRows,
  series: areaSeries,
  smooth: false,
  showPoints: false,
} as const;
export const areaBlocks: readonly AreaBlock[] = [
  {
    ...common,
    id: 'gradient-areas',
    title: 'Gradient Areas',
    description: 'Desktop and mobile visits with independent gradient fills.',
    stacked: false,
    gradient: true,
  },
  {
    ...common,
    id: 'stacked-areas',
    title: 'Stacked Areas',
    description: 'Monthly visits combined into stacked areas.',
    stacked: true,
    gradient: true,
  },
  {
    ...common,
    id: 'solid-areas',
    title: 'Solid Areas',
    description: 'The same stacked observations with a uniform translucent fill.',
    stacked: true,
    gradient: false,
  },
  {
    ...common,
    id: 'area-gaps',
    title: 'Missing Observations',
    description: 'Each series preserves its own missing-value gaps.',
    stacked: false,
    gradient: true,
    rows: areaRows.map((row, index) => ({
      ...row,
      desktop: index === 4 ? null : row.desktop,
      mobile: index === 7 ? null : row.mobile,
    })),
  },
];
export function areaExampleSource(block: AreaBlock, dark: boolean): string {
  return lineExampleSource({ ...block, kind: 'line' }, dark)
    .replaceAll('LineChart', 'AreaChart')
    .replaceAll('nec-line-chart', 'nec-area-chart')
    .replaceAll('ng-echarts/line', 'ng-echarts/area')
    .replace(
      ' [height]="230"',
      ` [stacked]="${block.stacked}" [gradient]="${block.gradient}" [height]="230"`,
    );
}
