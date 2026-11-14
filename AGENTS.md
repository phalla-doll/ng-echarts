# Repository Guidelines

## Project Structure and Scope

Angular 22 chart library using Apache ECharts. Bar, line, area, pie/donut and the first shared-axis composed increment are implemented. NG20 adds linked charts with native and graphical month ranges. NG14 automated acceptance and NG15 documentation are recorded; human interpretation and release gates remain open. The demo is deployed to GitHub Pages.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: implemented API, rendering lifecycle, and implementation conventions.
- `docs/INSTALLATION.md`, `docs/INTEGRATION_GUIDE.md`, and `docs/COMPATIBILITY.md`: verified installation/examples, exact tested versions, and limits.
- `docs/LINKED_CHARTS.md`: application-owned point selection, derived companion data and keyboard/reset behavior.
- `docs/GITHUB_PAGES.md`: live preview, static build, verification, and manual deployment.
- `docs/IMPLEMENTATION_PLAN.md`, `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: delivery sequence, experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Library source and colocated tests: `projects/chart-library/{core,bar,line,area,pie,composed,radar,radial,calendar,sankey}/src/`; root compatibility exports: `projects/chart-library/src/`. Playground source: `projects/playground/src/`; assets: `projects/playground/public/`. Isolated consumers: `tools/consumer-fixtures/`; evidence: `docs/experiments/`.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Follow the implementation plan and upstream provenance ledger. G1 passes for bar. The user deferred R06 human listening to release acceptance and authorized continued development through NG17 composed charts and the first NG20 linked-chart integration; retain human F09 and G2/G3/G4 as pending until their evidence exists. NG16 records the private 0.1.0-rc.0 candidate; NG17 advances it to 0.1.0-rc.1 with the user-selected MIT license, preserved notices and exact-artifact checks; NG20 initially reused rc.1; its controlled bar feedback and native/graphical ranges advance the private candidate through rc.2/rc.3 to rc.4, preserving earlier artifacts. NG18 adds experimental focused radar in private rc.5; keep radar out of the compatibility root and preserve rc.4. NG18 radial progress advances the private candidate to rc.6, preserving rc.5; keep `/radial` focused and scalar progress semantics native. NG19 calendar advances the private candidate through rc.7 to rc.8 while preserving rc.6/rc.7; keep the single-year date/value contract and `/calendar` focused. NG19 Sankey adds a focused acyclic node/link contract in private rc.9, preserving rc.8; rc.10 preserves rc.9 and uses exported per-chart lazy registration across families to prevent shared-engine payload leakage. Keep `/sankey` outside the compatibility root. Private rc.11 combines the completed chart presentation refinement with Sankey and per-chart loading, preserving rc.10; rc.12 corrects packaged documentation only and preserves rc.11 runtime/declarations and archives; rc.13 adds opt-in bar pointer/table-focus month previews while preserving rc.12 and earlier archives; rc.14 retains keyboard focus during preview enablement and preserves the prepared rc.13 archive with its failed runtime record; rc.15 preserves rc.14 and prevents range-mode Escape from replaying a table preview when listeners reattach; rc.16 combines the verified rc.15 month previews with dimension-aware rendering and the navigation/animation follow-up, preserving rc.15 and all earlier archives; human release gates remain pending. Demo deployment does not publish the library package or close release gates.

## Build, Test, and Development Commands

Use Node from `.nvmrc` and npm 11.19.1; install with `npm ci`.

- `npm run build`: build library and production playground.
- `npm start`: serve playground; first run `npm run build:lib`.
- `npm run watch:lib`: rebuild library changes alongside the playground.
- `npm test`: run Vitest once; `npm run test:watch` watches.
- `npm run check`: formatting, builds, strict compilation, tests, isolated declarations/documentation/runtime consumers, SSR, three-browser scenarios, and package budgets. First install browsers with `npx playwright install chromium firefox webkit`.
- `npm run build:pages` / `npm run check:pages`: build an isolated source snapshot and verify its sealed static output under `/ng-echarts/` in all three browsers. Dirty snapshots are local-only; inputs/outputs must remain unchanged.
- `npm run deploy:pages`: requires clean source already pushed to current remote main; rebuilds/checks, validates its receipt and publishes immutable provenance with compiled assets to `gh-pages`. Never restamp or bypass stale-build guards. Pushes to main do not automatically redeploy.
- `npm run release:local`: build/pack one private candidate, verify metadata/notices and pass byte-identical copies to strict/docs/client/SSR consumers. `release:prepare` and `release:check` run separate phases; keep human gates pending.
- `npm run capture:visual`: capture the four MVP gallery families/themes at 320/390/768/1440 px, including tooltip bounds and narrow label/control evidence; first run `npm run build`.
- `npm run capture:composed` / `npm run capture:linked`: capture post-MVP composed and linked examples using the same responsive themes.
- `npm run test:pages-provenance`: test source/build integrity, receipts, stale/tampered artifact rejection and operation locks.
- `npm run format`: apply Prettier.
- Set `PLAYWRIGHT_PORT` when parallel worktrees need separate browser-test servers; the default remains 4173.

Verify documentation links, heading anchors, and `git diff --check` before committing.

## Coding Style and Naming

Use two-space indentation, kebab-case filenames such as `bar-chart.ts`, colocated component files, and Prettier. ESLint is not configured.

Require strict TypeScript and templates. Keep bindings simple; derive chart state with `computed` and deterministic transformations in pure functions. Keep DOM operations and ECharts side effects in the browser adapter. Use `protected` for template-only members and `readonly` signal references. Add no React runtime dependencies.

## Testing Guidelines

Use Vitest for colocated `*.spec.ts` tests and Playwright in `tests/browser/`, with deterministic fixtures. No numeric coverage threshold exists. Check resizing, keyboard interaction, motion, updates, hydration, and teardown in browsers. Validate packed artifacts outside the workspace with `skipLibCheck: false`. Record evidence; never mark planned checks as passing.

## Commit and Pull Request Guidelines

Follow the initial commit's style: `docs: add Angular ECharts product and R&D plans`. Keep subjects concise, imperative, and focused.

PRs should explain the problem and resulting behavior, reference issues or NG/R/F identifiers, and report validation and unresolved limits. Include comparison screenshots for visual changes. Preserve upstream notices and align affected specifications, decisions, and backlog entries.
