# Repository Guidelines

## Project Structure and Scope

Angular 22 chart library using Apache ECharts. The workspace is scaffolded; chart implementation is pending.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: proposed API, rendering lifecycle, and implementation conventions.
- `docs/IMPLEMENTATION_PLAN.md`, `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: delivery sequence, experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Library source and colocated tests: `projects/chart-library/src/`. Playground source: `projects/playground/src/`; assets: `projects/playground/public/`. Isolated consumers: `tools/consumer-fixtures/`; evidence: `docs/experiments/`.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Follow the implementation plan, beginning with NG02 after the scaffold. Prove the bar prototype through G1/G2 before expanding to line, area, and pie/donut. Record per-file provenance against the pinned upstream revision.

## Build, Test, and Development Commands

Use Node from `.nvmrc` and npm 11.19.1; install with `npm ci`.

- `npm run build`: build library and production playground.
- `npm start`: serve playground; first run `npm run build:lib`.
- `npm run watch:lib`: rebuild library changes alongside the playground.
- `npm test`: run Vitest once; `npm run test:watch` watches.
- `npm run check`: formatting, builds, strict compilation, tests, isolated declarations, and SSR response.
- `npm run format`: apply Prettier.

Verify documentation links, heading anchors, and `git diff --check` before committing.

## Coding Style and Naming

Use two-space indentation, kebab-case filenames such as `bar-chart.ts`, colocated component files, and Prettier. ESLint is not configured.

Require strict TypeScript and templates. Keep bindings simple; derive chart state with `computed` and deterministic transformations in pure functions. Keep DOM operations and ECharts side effects in the browser adapter. Use `protected` for template-only members and `readonly` signal references. Add no React runtime dependencies.

## Testing Guidelines

Use Vitest and colocated `*.spec.ts` tests with deterministic fixtures. No numeric coverage threshold exists. Check resizing, keyboard interaction, reduced motion, zoneless updates, hydration, and teardown in browsers. Validate packed artifacts outside the workspace with `skipLibCheck: false`. SSR markup alone does not prove hydration. Record evidence; never mark planned checks as passing.

## Commit and Pull Request Guidelines

Follow the initial commit's style: `docs: add Angular ECharts product and R&D plans`. Keep subjects concise, imperative, and focused.

PRs should explain the problem and resulting behavior, reference issues or NG/R/F identifiers, and report validation and unresolved limits. Include comparison screenshots for visual changes. Preserve upstream notices and align affected specifications, decisions, and backlog entries.
