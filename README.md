# ng-echarts

An Angular 22 chart component library inspired by EvilCharts, using Apache ECharts for rendering and TypeScript for its public API.

Status: planning and research. Created 12 November 2026. This folder contains product and engineering plans; implementation and compatibility experiments have not started.

## Project direction

Build native Angular components, beginning with the upstream ECharts implementations. Preserve the selected visual designs and interactions while replacing React lifecycle, composition, state, and overlays with Angular equivalents. Validate one bar chart before expanding to the MVP collection.

`ng-echarts` is the requested local project name. A public package name and namespace remain undecided; package availability and potential confusion with existing ECharts integrations must be checked before publication.

## Documents

| Document | Purpose |
| --- | --- |
| [Product specification](docs/PRODUCT_SPEC.md) | Users, scope, behavior, requirements, and acceptance criteria |
| [Research findings](docs/RESEARCH_FINDINGS.md) | Upstream inventory, verified compatibility facts, reuse assessment, and unknowns |
| [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md) | Proposed Angular design, public API, rendering lifecycle, and decisions |
| [Research and development plan](docs/RND_PLAN.md) | Experiments, deliverables, decision gates, and effort estimates |
| [Delivery backlog](docs/BACKLOG.md) | Ordered implementation tasks and release checks |
| [Acceptance matrix](docs/ACCEPTANCE_MATRIX.md) | Requirements mapped to experiments, delivery tasks, and release evidence |
| [Sources](docs/SOURCES.md) | Primary references and the pinned upstream revision |

## How the plans fit together

The product specification defines scope and required behavior. Research findings own the checked toolchain ranges and upstream facts. The architecture describes how to meet the specification; the R&D plan resolves uncertainties before the backlog expands the implementation. The acceptance matrix connects these documents without replacing their detailed criteria.

Keep the four-family MVP separate from later chart families and advanced visual variants. The bar prototype establishes feasibility; it does not establish release readiness for the other charts. Decisions remain provisional until the relevant experiment passes and its evidence is recorded.

Before coding, read the [template and derived-state conventions](docs/TECHNICAL_ARCHITECTURE.md#templates-and-derived-state). They apply Angular's template guidance to chart states, legends, accessible tables, and the renderer boundary.

## Target environment

Angular 22 with strict TypeScript and template checking. Use the supported Node.js, TypeScript, and RxJS ranges recorded in [research findings](docs/RESEARCH_FINDINGS.md#angular-22-toolchain). Exact tool versions will be locked during the first experiment.

## First development milestone

Build a standalone Angular bar chart with typed data, light and dark themes, responsive resizing, tooltip, selectable legend, reduced motion, and safe destruction. Prove that it works in both a client application and an application using server rendering and hydration. Use its measured results to decide the MVP architecture.

No dependencies have been installed, no upstream source has been copied into this folder, and no package has been published.
