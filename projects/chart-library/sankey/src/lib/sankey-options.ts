import type { SankeySeriesOption } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import {
  ɵtooltipMarkup as tooltipMarkup,
  ɵtooltipStyle as tooltipStyle,
  type ɵCartesianThemeTokens,
  type ValueFormatter,
} from '@mantha911/ng-echarts/core';
import type { FlowNode, SankeyLink } from './sankey-model';
export interface SankeyView {
  readonly nodes: readonly FlowNode<unknown>[];
  readonly links: readonly SankeyLink[];
  readonly maximum: number;
  readonly tokens: ɵCartesianThemeTokens;
  readonly animation: boolean;
  readonly format: ValueFormatter;
  readonly valueLabel?: string;
}
export type SankeyOption = ComposeOption<SankeySeriesOption | TooltipComponentOption>;
export function buildSankeyOptions(view: SankeyView): SankeyOption {
  const { nodes, links, maximum, tokens, format } = view;
  const positive = links.filter((link) => link.value > 0);
  const active = new Set(positive.flatMap((link) => [link.source, link.target]));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const linkById = new Map(links.map((link) => [link.id, link]));
  return {
    animation: view.animation,
    animationDuration: 250,
    animationDurationUpdate: 150,
    backgroundColor: tokens.background,
    textStyle: { fontFamily: tokens.fontFamily, color: tokens.text },
    tooltip: {
      trigger: 'item',
      confine: true,
      ...tooltipStyle(tokens),
      formatter: (params: unknown) => {
        const p = params as { dataType?: unknown; data?: { id?: unknown } } | null;
        const id = p?.data?.id;
        if (typeof id !== 'string') return '';
        if (p?.dataType === 'edge') {
          const link = linkById.get(id);
          return link
            ? tooltipMarkup(
                `${nodeById.get(link.source)!.label} → ${nodeById.get(link.target)!.label}`,
                [{ label: view.valueLabel ?? 'Value', value: format(link.value) }],
              )
            : '';
        }
        const node = nodeById.get(id);
        return node
          ? tooltipMarkup(node.label, [
              { label: `Incoming ${view.valueLabel ?? 'value'}`, value: format(node.incoming) },
              { label: `Outgoing ${view.valueLabel ?? 'value'}`, value: format(node.outgoing) },
            ])
          : '';
      },
    },
    series: [
      {
        id: 'sankey',
        type: 'sankey',
        orient: 'horizontal',
        nodeAlign: 'left',
        left: 12,
        right: 104,
        top: 20,
        bottom: 20,
        nodeWidth: 12,
        nodeGap: 24,
        draggable: false,
        layoutIterations: 0,
        emphasis: { focus: 'adjacency' },
        label: {
          color: tokens.text,
          fontFamily: tokens.fontFamily,
          fontSize: 12,
          lineHeight: 18,
          width: 84,
          overflow: 'truncate',
          formatter: (params) => {
            const node = nodeById.get(params.name);
            return node ? `${node.label}\n${format(Math.max(node.incoming, node.outgoing))}` : '';
          },
        },
        lineStyle: { color: 'source', opacity: 0.3, curveness: 0.5 },
        data: nodes
          .filter((node) => active.has(node.id))
          .map((node) => ({
            id: node.id,
            name: node.id,
            itemStyle: { color: tokens.series[node.depth % tokens.series.length] },
          })),
        links: positive.map((link) => ({
          id: link.id,
          source: link.source,
          target: link.target,
          value: link.value / maximum,
        })),
      },
    ],
  };
}
