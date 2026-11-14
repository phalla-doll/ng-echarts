import { type SankeyNode, type SankeyLink, normalizeSankey } from './sankey-model';
const nodes = [
  { id: 'a', label: 'Same', note: 'Original' },
  { id: 'b', label: 'Same' },
  { id: 'c', label: 'C' },
];
const links = [
  { id: 'ab', source: 'a', target: 'b', value: 4 },
  { id: 'bc', source: 'b', target: 'c', value: 0 },
];
it('keeps original rows, duplicate labels, finite separate totals and zero topology', () => {
  const result = normalizeSankey(nodes, links);
  expect(result.kind).toBe('ready');
  if (result.kind === 'error') return;
  expect(result.nodes[0]?.row).toBe(nodes[0]);
  expect(result.links[0]).toBe(links[0]);
  expect(result.nodes.map((n) => [n.incoming, n.outgoing, n.depth])).toEqual([
    [0, 4, 0],
    [4, 0, 1],
    [0, 0, 2],
  ]);
  expect(normalizeSankey([], []).kind).toBe('empty');
  expect(normalizeSankey(nodes, []).kind).toBe('ready');
  expect(normalizeSankey(nodes, [{ ...links[0]!, value: 0 }]).kind).toBe('ready');
});
const invalidCases: [readonly SankeyNode[], readonly SankeyLink[], string][] = [
  [nodes.concat(nodes[0]!), links, 'unique'],
  [[{ id: '', label: 'A' }], [], 'nonempty'],
  [[{ id: 'a', label: ' ' }], [], 'nonempty'],
  [nodes, [...links, links[0]!], 'unique'],
  [nodes, [{ ...links[0]!, source: 'missing' }], 'endpoints'],
  [nodes, [{ ...links[0]!, target: 'a' }], 'self-links'],
  [nodes, [...links, { ...links[0]!, id: 'parallel' }], 'parallel'],
  [nodes, [...links, { id: 'ca', source: 'c', target: 'a', value: 0 }], 'acyclic'],
  [nodes, [{ ...links[0]!, value: -1 }], 'nonnegative'],
  [nodes, [{ ...links[0]!, value: Infinity }], 'nonnegative'],
  [nodes, [{ ...links[0]!, value: NaN }], 'nonnegative'],
  [
    nodes,
    [
      { ...links[0]!, value: Number.MAX_VALUE },
      { id: 'ac', source: 'a', target: 'c', value: Number.MAX_VALUE },
    ],
    'totals',
  ],
  [
    nodes,
    [
      { ...links[0]!, value: Number.MAX_VALUE },
      { ...links[1]!, value: Number.MIN_VALUE },
    ],
    'numeric range',
  ],
  [Array.from({ length: 25 }, (_, i) => ({ id: String(i), label: String(i) })), [], '24 nodes'],
];
it.each(invalidCases)('rejects invalid topology or values %#', (n, l, message) => {
  const result = normalizeSankey(n, l);
  expect(result).toEqual({ kind: 'error', message: expect.stringContaining(message) });
});
it('rejects non-array inputs and preserves prototype-like IDs safely', () => {
  expect(normalizeSankey(null as never, []).kind).toBe('error');
  expect(
    normalizeSankey(
      [
        { id: '__proto__', label: 'Prototype' },
        { id: 'constructor', label: 'Constructor' },
      ],
      [{ id: 'edge', source: '__proto__', target: 'constructor', value: 1 }],
    ).kind,
  ).toBe('ready');
});
