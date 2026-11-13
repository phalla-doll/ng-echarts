# Repository Guidelines

## Project Structure and Scope

Angular 22 chart library using Apache ECharts. Bar, line, area, pie/donut and the first shared-axis composed increment are implemented. NG20 adds a linked-chart application example. NG14 automated acceptance and NG15 documentation are recorded; human interpretation and release gates remain open. The demo is deployed to GitHub Pages.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: implemented API, rendering lifecycle, and implementation conventions.
- `docs/INSTALLATION.md`, `docs/INTEGRATION_GUIDE.md`, and `docs/COMPATIBILITY.md`: verified installation/examples, exact tested versions, and limits.
- `docs/LINKED_CHARTS.md`: application-owned point selection, derived companion data and keyboard/reset behavior.
- `docs/GITHUB_PAGES.md`: live preview, static build, verification, and manual deployment.
- `docs/IMPLEMENTATION_PLAN.md`, `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: delivery sequence, experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Library source and colocated tests: `projects/chart-library/{core,bar,line,area,pie,composed}/src/`; root compatibility exports: `projects/chart-library/src/`. Playground source: `projects/playground/src/`; assets: `projects/playground/public/`. Isolated consumers: `tools/consumer-fixtures/`; evidence: `docs/experiments/`.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Follow the implementation plan and upstream provenance ledger. G1 passes for bar. The user deferred R06 human listening to release acceptance and authorized continued development through NG17 composed charts and the first NG20 linked-chart integration; retain human F09 and G2/G3/G4 as pending until their evidence exists. NG16 records the private 0.1.0-rc.0 candidate; NG17 advances it to 0.1.0-rc.1 with the user-selected MIT license, preserved notices and exact-artifact checks; NG20 reuses rc.1 without library changes. Human release gates remain pending. Demo deployment does not publish the library package or close release gates.

## Build, Test, and Development Commands

Use Node from `.nvmrc` and npm 11.19.1; install with `npm ci`.

- `npm run build`: build library and production playground.
- `npm start`: serve playground; first run `npm run build:lib`.
- `npm run watch:lib`: rebuild library changes alongside the playground.
- `npm test`: run Vitest once; `npm run test:watch` watches.
- `npm run check`: formatting, builds, strict compilation, tests, isolated declarations/documentation/runtime consumers, SSR, three-browser scenarios, and package budgets. First install browsers with `npx playwright install chromium firefox webkit`.
- `npm run build:pages` / `npm run check:pages`: prerender and verify the static preview under `/ng-echarts/`; retain direct-route HTML, subpath-safe links/fonts, hydration, and notices.
- `npm run deploy:pages`: rebuild/check and push compiled assets to `gh-pages`; requires GitHub CLI access. Source commits are separate, and pushes to `main` do not automatically redeploy the preview.
- `npm run release:local`: build/pack one private candidate, verify metadata/notices and pass byte-identical copies to strict/docs/client/SSR consumers. `release:prepare` and `release:check` run separate phases; keep human gates pending.
- `npm run capture:visual`: capture the four MVP gallery families/themes at 320/390/768/1440 px, including tooltip bounds and narrow label/control evidence; first run `npm run build`.
- `npm run capture:composed` / `npm run capture:linked`: capture post-MVP composed and linked examples using the same responsive themes.
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
