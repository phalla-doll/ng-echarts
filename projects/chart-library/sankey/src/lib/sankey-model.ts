export interface SankeyNode {
  readonly id: string;
  readonly label: string;
}
export interface SankeyLink {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly value: number;
}
export type SankeySelection<N extends SankeyNode, L extends SankeyLink> =
  | {
      readonly kind: 'node';
      readonly node: N;
      readonly incoming: number;
      readonly outgoing: number;
      readonly source: 'plot' | 'table';
    }
  | {
      readonly kind: 'link';
      readonly link: L;
      readonly value: number;
      readonly source: 'plot' | 'table';
    };
export interface FlowNode<N> {
  readonly row: N;
  readonly id: string;
  readonly label: string;
  readonly incoming: number;
  readonly outgoing: number;
  readonly depth: number;
}
export type SankeyModel<N, L> =
  | { readonly kind: 'error'; readonly message: string }
  | {
      readonly kind: 'ready' | 'empty';
      readonly nodes: readonly FlowNode<N>[];
      readonly links: readonly L[];
      readonly maximum: number;
    };

/** Validate identity and topology before any graph reaches the browser renderer. */
export function normalizeSankey<N extends SankeyNode, L extends SankeyLink>(
  nodes: readonly N[],
  links: readonly L[],
): SankeyModel<N, L> {
  const error = (message: string): SankeyModel<N, L> => ({ kind: 'error', message });
  if (!Array.isArray(nodes) || !Array.isArray(links))
    return error('Sankey nodes and links must be arrays.');
  if (nodes.length > 24 || links.length > 60)
    return error('Sankey supports at most 24 nodes and 60 links.');
  const byId = new Map<
    string,
    {
      row: N;
      id: string;
      label: string;
      incoming: number;
      outgoing: number;
      depth: number;
      degree: number;
      next: string[];
    }
  >();
  for (const node of nodes) {
    if (
      !node ||
      typeof node.id !== 'string' ||
      !node.id.trim() ||
      typeof node.label !== 'string' ||
      !node.label.trim()
    )
      return error('Sankey nodes require nonempty text IDs and labels.');
    if (byId.has(node.id)) return error('Sankey node IDs must be unique.');
    byId.set(node.id, {
      row: node,
      id: node.id,
      label: node.label,
      incoming: 0,
      outgoing: 0,
      depth: 0,
      degree: 0,
      next: [],
    });
  }
  const ids = new Set<string>();
  const pairs = new Map<string, Set<string>>();
  let maximum = 0;
  for (const link of links) {
    if (!link || typeof link.id !== 'string' || !link.id.trim() || ids.has(link.id))
      return error('Sankey link IDs must be unique nonempty text.');
    ids.add(link.id);
    const from = byId.get(link.source),
      to = byId.get(link.target);
    if (!from || !to) return error('Sankey link endpoints must reference existing node IDs.');
    if (from === to) return error('Sankey self-links are not supported.');
    if (pairs.get(link.source)?.has(link.target))
      return error(
        'Sankey allows one link per directed node pair; aggregate parallel links explicitly.',
      );
    if (!pairs.has(link.source)) pairs.set(link.source, new Set());
    pairs.get(link.source)!.add(link.target);
    if (typeof link.value !== 'number' || !Number.isFinite(link.value) || link.value < 0)
      return error('Sankey link values must be finite nonnegative numbers.');
    maximum = Math.max(maximum, link.value);
    from.outgoing += link.value;
    to.incoming += link.value;
    if (!Number.isFinite(from.outgoing) || !Number.isFinite(to.incoming))
      return error('Sankey node totals must remain finite.');
    from.next.push(link.target);
    to.degree++;
  }
  // Include zero-valued edges in cycle detection: topology never changes with weights.
  const queue = [...byId.values()].filter((n) => n.degree === 0);
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i]!;
    for (const id of node.next) {
      const target = byId.get(id)!;
      target.depth = Math.max(target.depth, node.depth + 1);
      if (--target.degree === 0) queue.push(target);
    }
  }
  if (queue.length !== nodes.length)
    return error('Sankey links must form a directed acyclic graph.');
  if (links.some((link) => link.value > 0 && link.value / maximum === 0))
    return error('Sankey values span an unsupported numeric range.');
  return {
    kind: nodes.length ? 'ready' : 'empty',
    nodes: [...byId.values()].map(({ row, id, label, incoming, outgoing, depth }) => ({
      row,
      id,
      label,
      incoming,
      outgoing,
      depth,
    })),
    links,
    maximum,
  };
}
