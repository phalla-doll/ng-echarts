import {
  browserRows,
  visitorMeasure,
  browserPalette,
  type BrowserRow,
} from './fixtures/evilcharts-pie-fixture';
export interface PieBlock {
  readonly kind: 'pie';
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly rows: readonly BrowserRow[];
  readonly innerRadius: number;
  readonly showLabels: boolean;
}
export const pieBlocks: readonly PieBlock[] = [
  {
    kind: 'pie',
    id: 'browser-share',
    title: 'Browser Share',
    description: 'Visitors by browser across five categories.',
    rows: browserRows,
    innerRadius: 0,
    showLabels: false,
  },
  {
    kind: 'pie',
    id: 'browser-donut',
    title: 'Browser Donut',
    description: 'The same browser distribution in a responsive ring.',
    rows: browserRows,
    innerRadius: 0.6,
    showLabels: false,
  },
  {
    kind: 'pie',
    id: 'labeled-donut',
    title: 'Category Labels',
    description: 'Outside category labels with collision handling.',
    rows: browserRows,
    innerRadius: 0.6,
    showLabels: true,
  },
];
export function pieExampleSource(block: PieBlock, dark: boolean): string {
  const palette = browserPalette[dark ? 'dark' : 'light'];
  return `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PieChart, type ChartMeasure } from '@mantha911/ng-echarts/pie';
interface Browser { id: string; browser: string; visitors: number | null; }
@Component({
  selector: 'app-browser-chart', imports: [PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<nec-pie-chart title="${block.title}" description="${block.description}"
    [data]="rows" rowIdKey="id" categoryKey="browser" [measure]="measure"
    [innerRadius]="${block.innerRadius}" [showLabels]="${block.showLabels}" [showTotal]="${block.innerRadius >= 0.4}"
    theme="${dark ? 'dark' : 'light'}" [showDataTable]="false" [height]="300"
    ${palette.map((color, index) => `[style.--nec-series-${index + 1}]="'${color}'"`).join(' ')}
  />\`,
})
export class BrowserChart {
  readonly rows: readonly Browser[] = ${JSON.stringify(block.rows, null, 2)};
  readonly measure: ChartMeasure<Browser> = ${JSON.stringify(visitorMeasure)};
}
`;
}
