# Repository Guidelines

## Project Structure and Scope

Angular 22 chart library using Apache ECharts. Bar, line, area, and pie/donut are implemented. NG14 automated acceptance and NG15 documentation are recorded; human interpretation and release gates remain open. The demo is deployed to GitHub Pages.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: implemented API, rendering lifecycle, and implementation conventions.
- `docs/INSTALLATION.md`, `docs/INTEGRATION_GUIDE.md`, and `docs/COMPATIBILITY.md`: verified installation/examples, exact tested versions, and limits.
- `docs/GITHUB_PAGES.md`: live preview, static build, verification, and manual deployment.
- `docs/IMPLEMENTATION_PLAN.md`, `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: delivery sequence, experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Library source and colocated tests: `projects/chart-library/{core,bar,line,area,pie}/src/`; root compatibility exports: `projects/chart-library/src/`. Playground source: `projects/playground/src/`; assets: `projects/playground/public/`. Isolated consumers: `tools/consumer-fixtures/`; evidence: `docs/experiments/`.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Follow the implementation plan and upstream provenance ledger. G1 passes for bar. The user deferred R06 human listening to release acceptance and authorized continued development through NG14/NG15; retain human F09 and G2/G3/G4 as pending until their evidence exists. NG16 final artifact/license/notices is next. Demo deployment does not publish the library package or close release gates.

## Build, Test, and Development Commands

Use Node from `.nvmrc` and npm 11.19.1; install with `npm ci`.

- `npm run build`: build library and production playground.
- `npm start`: serve playground; first run `npm run build:lib`.
- `npm run watch:lib`: rebuild library changes alongside the playground.
- `npm test`: run Vitest once; `npm run test:watch` watches.
- `npm run check`: formatting, builds, strict compilation, tests, isolated declarations/documentation/runtime consumers, SSR, three-browser scenarios, and package budgets. First install browsers with `npx playwright install chromium firefox webkit`.
- `npm run build:pages` / `npm run check:pages`: prerender and verify the static preview under `/ng-echarts/`; retain direct-route HTML, subpath-safe links/fonts, hydration, and notices.
- `npm run deploy:pages`: rebuild/check and push compiled assets to `gh-pages`; requires GitHub CLI access. Source commits are separate, and pushes to `main` do not automatically redeploy the preview.
- `npm run format`: apply Prettier.

Verify documentation links, heading anchors, and `git diff --check` before committing.

## Coding Style and Naming

Use two-space indentation, kebab-case filenames such as `bar-chart.ts`, colocated component files, and Prettier. ESLint is not configured.

Require strict TypeScript and templates. Keep bindings simple; derive chart state with `computed` and deterministic transformations in pure functions. Keep DOM operations and ECharts side effects in the browser adapter. Use `protected` for template-only members and `readonly` signal references. Add no React runtime dependencies.

## Testing Guidelines

Use Vitest for colocated `*.spec.ts` tests and Playwright in `tests/browser/`, with deterministic fixtures. No numeric coverage threshold exists. Check resizing, keyboard interaction, motion, updates, hydration, and teardown in browsers. Validate packed artifacts outside the workspace with `skipLibCheck: false`. Record evidence; never mark planned checks as passing.

## Commit and Pull Request Guidelines

Follow the initial commit's style: `docs: add Angular ECharts product and R&D plans`. Keep subjects concise, imperative, and focused.

PRs should explain the problem and resulting behavior, reference issues or NG/R/F identifiers, and report validation and unresolved limits. Include comparison screenshots for visual changes. Preserve upstream notices and align affected specifications, decisions, and backlog entries.
