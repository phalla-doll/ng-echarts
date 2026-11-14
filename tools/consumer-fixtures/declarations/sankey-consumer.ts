import { Component } from '@angular/core';
import {
  SankeyChart,
  type SankeyNode,
  type SankeyLink,
  type SankeySelection,
} from '@ng-echarts/chart-library/sankey';
interface Node extends SankeyNode {
  readonly note: string;
}
interface Link extends SankeyLink {
  readonly note: string;
}
@Component({
  imports: [SankeyChart],
  template: `<nec-sankey-chart
    title="Flow"
    [nodes]="nodes"
    [links]="links"
    (select)="selected($event)"
  />`,
})
export class SankeyConsumer {
  readonly nodes: readonly Node[] = [
    { id: 'a', label: 'A', note: 'Source' },
    { id: 'b', label: 'B', note: 'Target' },
  ];
  readonly links: readonly Link[] = [
    { id: 'ab', source: 'a', target: 'b', value: 0, note: 'Recorded zero' },
  ];
  selected(event: SankeySelection<Node, Link>): void {
    const note: string = event.kind === 'node' ? event.node.note : event.link.note;
    const source: 'plot' | 'table' = event.source;
    void [note, source];
  }
}
