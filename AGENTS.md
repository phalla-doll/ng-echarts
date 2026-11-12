# Repository Guidelines

## Project Structure and Scope

Planning repository for an Angular 22 chart library using Apache ECharts. Source, tests, and assets are not scaffolded.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: proposed API, rendering lifecycle, and implementation conventions.
- `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Planned directories: `projects/chart-library/`, `projects/playground/`, and `tools/consumer-fixtures/`. Store experiment reports under `docs/experiments/` when work begins.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Start with NG01/NG02. Prove the bar prototype through G1/G2 before expanding to line, area, and pie/donut. Preserve the pinned upstream revision and record per-file provenance for adapted code.

## Build, Test, and Development Commands

No `package.json`, development server, or build/test tooling exists yet.

- `git status --short`: inspect pending changes.
- `git diff --check`: detect whitespace errors in tracked changes.
- `git diff --cached --check`: check staged changes before committing.

Verify documentation links and heading anchors. During NG01, select the supported toolchain, add reproducible scripts and a lockfile, and document actual build, test, lint, and development commands here.

## Coding Style and Naming

Use two-space indentation, kebab-case filenames such as `bar-chart.ts`, and colocated component files. No formatter or linter is configured.

Require strict TypeScript and templates. Keep bindings simple; derive chart state with `computed` and deterministic transformations in pure functions. Keep DOM operations and ECharts side effects in the browser adapter. Use `protected` for template-only members and `readonly` signal references. Add no React runtime dependencies.

## Testing Guidelines

Frameworks and coverage thresholds remain undecided. Colocate unit tests as `*.spec.ts`; use deterministic fixtures. Check resizing, keyboard interaction, reduced motion, zoneless updates, SSR/hydration, and teardown in browsers. Validate packed artifacts in an isolated consumer, including declarations without `skipLibCheck`. Do not bypass hydration to claim compatibility. Record acceptance evidence; never mark planned checks as passing.

## Commit and Pull Request Guidelines

Follow the initial commit's style: `docs: add Angular ECharts product and R&D plans`. Keep subjects concise, imperative, and focused.

PRs should explain the problem and resulting behavior, reference issues or NG/R/F identifiers, and report validation and unresolved limits. Include comparison screenshots for visual changes. Preserve upstream notices and align affected specifications, decisions, and backlog entries.
