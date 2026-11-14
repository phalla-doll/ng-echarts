import type { SankeyNode, SankeyLink } from '@ng-echarts/chart-library/sankey';
export const flowNodes: readonly SankeyNode[] = [
  { id: 'search', label: 'Search' },
  { id: 'direct', label: 'Direct' },
  { id: 'browse', label: 'Browse' },
  { id: 'trial', label: 'Trial' },
  { id: 'customer', label: 'Customer' },
  { id: 'exit', label: 'Exit' },
];
export const flowLinks: readonly SankeyLink[] = [
  { id: 'search-browse', source: 'search', target: 'browse', value: 420 },
  { id: 'direct-browse', source: 'direct', target: 'browse', value: 280 },
  { id: 'browse-trial', source: 'browse', target: 'trial', value: 480 },
  { id: 'browse-exit', source: 'browse', target: 'exit', value: 220 },
  { id: 'trial-customer', source: 'trial', target: 'customer', value: 360 },
  { id: 'trial-exit', source: 'trial', target: 'exit', value: 120 },
  { id: 'direct-trial', source: 'direct', target: 'trial', value: 0 },
];
export function sankeyExampleSource(dark = false): string {
  return `import { Component } from '@angular/core';
import { SankeyChart, type SankeyNode, type SankeyLink } from '@ng-echarts/chart-library/sankey';

@Component({
  selector: 'app-visit-flow',
  imports: [SankeyChart],
  template: \`<nec-sankey-chart
    title="Visitor journey" valueLabel="Visits"
    description="Illustrative visits from arrival to outcome. Ribbon width represents visits."
    [nodes]="nodes"
    [links]="links"
    theme="${dark ? 'dark' : 'light'}"
  />\`,
})
export class VisitFlow {
  readonly nodes: readonly SankeyNode[] = ${JSON.stringify(flowNodes, null, 2)};
  readonly links: readonly SankeyLink[] = ${JSON.stringify(flowLinks, null, 2)};
}
`;
}
