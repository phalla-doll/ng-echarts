var r=[{id:`chrome`,browser:`Chrome`,visitors:275},{id:`safari`,browser:`Safari`,visitors:200},{id:`firefox`,browser:`Firefox`,visitors:187},{id:`edge`,browser:`Edge`,visitors:173},{id:`other`,browser:`Other`,visitors:90}];var s={id:`visitors`,key:`visitors`,label:`Visitors`};var i={light:[`#3b82f6`,`#10b981`,`#f59e0b`,`#8b5cf6`,`#6b7280`],dark:[`#60a5fa`,`#34d399`,`#fbbf24`,`#a78bfa`,`#9ca3af`]};var w=[{kind:`pie`,id:`browser-share`,title:`Browser Share`,description:`Visitors by browser across five categories.`,rows:r,innerRadius:0,showLabels:!1},{kind:`pie`,id:`browser-donut`,title:`Browser Donut`,description:`The same browser distribution in a responsive ring.`,rows:r,innerRadius:.6,showLabels:!1},{kind:`pie`,id:`labeled-donut`,title:`Category Labels`,description:`Outside category labels with collision handling.`,rows:r,innerRadius:.6,showLabels:!0}];function b(e,o){let t=i[o?`dark`:`light`];return`import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PieChart, type ChartMeasure } from '@ng-echarts/chart-library/pie';
interface Browser { id: string; browser: string; visitors: number | null; }
@Component({
  selector: 'app-browser-chart', imports: [PieChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<nec-pie-chart title="${e.title}" description="${e.description}"
    [data]="rows" rowIdKey="id" categoryKey="browser" [measure]="measure"
    [innerRadius]="${e.innerRadius}" [showLabels]="${e.showLabels}" [showTotal]="${e.innerRadius>=.4}"
    theme="${o?`dark`:`light`}" [showDataTable]="false" [height]="300"
    ${t.map((a,n)=>`[style.--nec-series-${n+1}]="'${a}'"`).join(` `)}
  />\`,
})
export class BrowserChart {
  readonly rows: readonly Browser[] = ${JSON.stringify(e.rows,null,2)};
  readonly measure: ChartMeasure<Browser> = ${JSON.stringify(s)};
}
`}export{w as i,i as n,s as r,b as t};