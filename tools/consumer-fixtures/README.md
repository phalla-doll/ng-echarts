# Isolated consumer fixtures

`declarations/` compiles an Angular component against the production tarball, outside this workspace, with strict templates and `skipLibCheck: false`. It also checks the pinned ECharts declarations under TypeScript 6.

Run `npm run build:lib && npm run check:consumer`. The script installs dependencies in a temporary OS directory and removes it afterward. It uses no workspace aliases or linked packages. The fixture lockfile pins its compiler dependencies; the packed local artifact is added during the check.

The fixture now exercises `BarChart<T>`, inferred event types, and deliberately invalid category/measure keys. Static negative cases reject text, unknown, and exclusively nullish measures. R08 still requires complete packed client and SSR application builds and browser runtime checks.
