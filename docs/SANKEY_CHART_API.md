# Experimental Sankey chart

Import `SankeyChart`, `SankeyNode`, `SankeyLink` and `SankeySelection` from `@ng-echarts/chart-library/sankey`. This focused entry stays outside the compatibility root and the four-family MVP. The package is private; human F09/R06/G2/G3/G4 remain pending.

## Standalone example

```ts
import { Component } from '@angular/core';
import { SankeyChart, type SankeyNode, type SankeyLink } from '@ng-echarts/chart-library/sankey';

@Component({
  selector: 'app-visit-flow',
  imports: [SankeyChart],
  template: `<nec-sankey-chart
    title="Visitor journey" valueLabel="Visits"
    description="Illustrative visits from arrival to outcome. Ribbon width represents visits."
    [nodes]="nodes"
    [links]="links"
    theme="light"
  />`,
})
export class VisitFlow {
  readonly nodes: readonly SankeyNode[] = [
  {
    "id": "search",
    "label": "Search"
  },
  {
    "id": "direct",
    "label": "Direct"
  },
  {
    "id": "browse",
    "label": "Browse"
  },
  {
    "id": "trial",
    "label": "Trial"
  },
  {
    "id": "customer",
    "label": "Customer"
  },
  {
    "id": "exit",
    "label": "Exit"
  }
];
  readonly links: readonly SankeyLink[] = [
  {
    "id": "search-browse",
    "source": "search",
    "target": "browse",
    "value": 420
  },
  {
    "id": "direct-browse",
    "source": "direct",
    "target": "browse",
    "value": 280
  },
  {
    "id": "browse-trial",
    "source": "browse",
    "target": "trial",
    "value": 480
  },
  {
    "id": "browse-exit",
    "source": "browse",
    "target": "exit",
    "value": 220
  },
  {
    "id": "trial-customer",
    "source": "trial",
    "target": "customer",
    "value": 360
  },
  {
    "id": "trial-exit",
    "source": "trial",
    "target": "exit",
    "value": 120
  },
  {
    "id": "direct-trial",
    "source": "direct",
    "target": "trial",
    "value": 0
  }
];
}
```

## Contract

Required inputs: `title`, `nodes` and `links`. A node has nonempty string `id` and `label`. A link has its own nonempty string `id`, source/target node IDs and a finite nonnegative numeric `value`. IDs must be unique within their own collection. Labels may repeat. Inputs are immutable arrays; replace them to update the chart. Original node/link objects survive selection events, including consumer-specific fields.

The first increment supports a horizontal directed acyclic graph with at most 24 nodes and 60 links. Dangling endpoints, self-links, cycles (including zero links), duplicate directed pairs, invalid values, overflowing node totals and numeric ranges that underflow on normalization are configuration errors. Aggregate parallel edges explicitly. No implicit aggregation, negative values, missing/null weights, circular flows, drag layout or legend filtering is provided. Empty node/link arrays produce an empty state; links without nodes are invalid. Isolated nodes and recorded-zero links remain in the tables. All-zero graphs have a native status and tables without a canvas.

Node height encodes the larger incoming/outgoing total, following ECharts Sankey semantics; those totals are shown independently and need not balance. Ribbons encode positive link weights relative to the maximum, preserving raw values in tables, tooltips and events. No graph-wide total is shown because summing intermediate links would double count flow. Node order follows supplied order within layout columns; updates can reposition nodes. Depth determines theme color. Labels truncate to fit; native tables and tooltips retain full labels. The diagram scrolls inside its own region on narrow screens, with at least 140 px per topology column and 560 px overall. Native tables fit the component and retain the supplied data order.

## Inputs and events

| Input | Default / behavior |
| --- | --- |
| `description` | Empty text; describe units and interpretation |
| `valueLabel` | `Value`; nonempty measure name in node/link tooltips |
| `theme`, `themeRevision` | `light`, `0`; existing CSS token resolution and explicit refresh |
| `locale`, `numberFormatOptions`, `valueFormatter` | `en-US`, unset, unset; shared formatting across tables/tooltips; invalid formatting becomes an error |
| `loading`, `error` | `false`, `null`; explicit error precedes loading, then validation/render errors, empty, ready |
| `animation` | `true`; initial and dynamic reduced-motion preference overrides it |

`select` emits a discriminated `SankeySelection<N,L>`:

- Node: `{ kind: "node", node: N, incoming: number, outgoing: number, source: "plot" | "table" }`.
- Link: `{ kind: "link", link: L, value: number, source: "plot" | "table" }`.

Zero links and isolated nodes have table actions only. Input updates do not emit selection. The application owns selected state and must clear or reconcile stored selections when inputs change. Native Enter/Space actions are equivalent to plotted node/ribbon clicks. A canvas is browser-only and hidden from assistive technology; initial SSR/no-JavaScript HTML retains node totals and link values in native disclosures.

## Rendering and limits

Only the Sankey chart, Tooltip and Canvas modules load lazily. The shared plot controller handles hidden containers, resize, asynchronous import races and disposal. Retry flows recovers a failed import; native values are available before hydration and after successful retry. Error/loading states hide data and dispose any current plot, matching existing components. Human interpretation remains unverified.

Upstream behavior: [Apache Sankey options](https://github.com/apache/echarts-doc/blob/master/en/option/series/sankey.md), checked against installed ECharts 6.1.0 `lib/chart/sankey/sankeyLayout.js`, `SankeySeries.js` and `SankeyView.js`. No upstream example code is copied.

## Visual presentation

`valueLabel: string` names the measure in aligned link and node tooltips; it defaults to `Value` and must be nonempty text. The gallery uses `Visits`. Loading, empty and error states preserve the plot area and retain inert control space.

Four theme palette entries are resolved in the browser and cycle by node depth. Node labels include the larger incoming/outgoing total, matching node height. Narrow diagrams expose an adjacent scroll hint and a keyboard-focusable horizontal scroll region. Arrow keys move within the diagram; Home/End reach its bounds, consistently across the tested engines.

The browser adapter confines HTML tooltips to the currently visible scrollport, rather than the full offscreen diagram, and dismisses them on scroll/resize. Its scroll listener is disposed with the renderer.
