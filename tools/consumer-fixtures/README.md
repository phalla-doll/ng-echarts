# Isolated consumer fixtures

`declarations/` compiles an Angular component against the production tarball, outside this workspace, with strict templates and `skipLibCheck: false`. It also checks the pinned ECharts declarations under TypeScript 6.

Run `npm run build:lib && npm run check:consumer`. The script installs dependencies in a temporary OS directory and removes it afterward. It uses no workspace aliases or linked packages. The fixture lockfile pins its compiler dependencies; the packed local artifact is added during the check.

The fixture exercises focused `/core` and `/bar` imports plus a separate root-compatibility component. It checks all shipped export/type targets, rejects private deep imports and a bar import from core, and exercises `BarChart<T>`, inferred event types, category/value formatters, and number-format options. Deliberately invalid templates reject category/measure keys, nontext formatter returns, and invalid option types. Static negative cases also reject text, unknown, and exclusively nullish measures. The separate `npm run check:runtime` builds and runs isolated packed client and SSR applications for R08.

Runtime consumers use the focused playground imports. Before browser checks, an installed-package Node import confirms that root/core/bar export the same component classes and private source/FESM paths are blocked. No browser globals are required merely to import those entries.

The strict check compiles the actual TypeScript integration example extracted from `docs/BAR_CHART_API.md`, alongside the generated gallery and quick-start examples, so the API guide cannot silently drift from the installed package.

Line coverage compiles the actual line API guide, eight generated line gallery variants, typed `/line` inputs/events, and invalid boolean/measure templates. Installed client/SSR browsers exercise line galleries, updates, missing values, keyboard actions, deferred hydration, and teardown after the existing bar scenarios. Core `ɵ` exports are implementation-only; public root/focused components retain identical class identities.
