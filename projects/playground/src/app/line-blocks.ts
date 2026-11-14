// Monthly fixture also appears in the pinned EvilCharts line examples; see provenance ledger.
import type { BarBlock } from './bar-blocks';
import { barExampleSource } from './bar-blocks';
import { deviceRows, deviceSeries } from './fixtures/evilcharts-bar-fixture';
export interface LineBlock extends Omit<BarBlock, 'kind' | 'layout' | 'stacked' | 'gradient'> {
  readonly kind: 'line';
  readonly smooth: boolean;
  readonly showPoints: boolean;
}
const common = { kind: 'line', rows: deviceRows, series: deviceSeries } as const;
export const lineBlocks: readonly LineBlock[] = [
  {
    ...common,
    id: 'straight-lines',
    title: 'Device Trends',
    description: 'Desktop and mobile visits across twelve months.',
    smooth: false,
    showPoints: true,
  },
  {
    ...common,
    id: 'smooth-lines',
    title: 'Smooth Trends',
    description: 'The monthly observations with smooth interpolation.',
    smooth: true,
    showPoints: true,
  },
  {
    ...common,
    id: 'line-only',
    title: 'Minimal Lines',
    description: 'Straight lines without persistent point markers.',
    smooth: false,
    showPoints: false,
  },
  {
    ...common,
    id: 'missing-observations',
    title: 'Missing Observations',
    description: 'Missing observations remain gaps in each series.',
    smooth: false,
    showPoints: true,
    rows: deviceRows.map((row, index) => ({
      ...row,
      desktop: index === 4 ? null : row.desktop,
      mobile: index === 7 ? null : row.mobile,
    })),
  },
];
export function lineExampleSource(block: LineBlock, dark: boolean): string {
  // Reuse the verified standalone-example structure, with family-specific options.
  return barExampleSource(
    { ...block, kind: 'bar', layout: 'vertical', stacked: false, gradient: false },
    dark,
  )
    .replaceAll('BarChart', 'LineChart')
    .replaceAll('nec-bar-chart', 'nec-line-chart')
    .replaceAll('ng-echarts/bar', 'ng-echarts/line')
    .replace(/ layout="vertical"/, '')
    .replace(
      '    [stacked]="false" [gradient]="false"',
      `    [smooth]="${block.smooth}" [showPoints]="${block.showPoints}"`,
    );
}
