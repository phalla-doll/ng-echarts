# Isolated consumer fixtures

`declarations/` compiles an Angular component against the production tarball, outside this workspace, with strict templates and `skipLibCheck: false`. It also checks the pinned ECharts declarations under TypeScript 6.

Run `npm run build:lib && npm run check:consumer`. The script installs dependencies in a temporary OS directory and removes it afterward. It uses no workspace aliases or linked packages. The fixture lockfile pins its compiler dependencies; the packed local artifact is added during the check.

The fixture exercises focused `/core`, `/bar`, `/line`, `/area`, `/pie`, and `/composed` imports plus a separate root-compatibility component. It checks all shipped export/type targets, rejects private deep imports and a bar import from core, and exercises `BarChart<T>`, inferred event types, category/value formatters, and number-format options. Deliberately invalid templates reject category/measure keys, nontext formatter returns, and invalid option types. Static negative cases also reject text, unknown, and exclusively nullish measures. The separate `npm run check:runtime` builds and runs isolated packed client and SSR applications for R08.

Runtime consumers use the focused playground imports. Before browser checks, an installed-package Node import confirms that root and all focused entries export the same component classes and private source/FESM paths are blocked. No browser globals are required merely to import those entries.

The strict check compiles the actual TypeScript integration example extracted from `docs/BAR_CHART_API.md`, alongside the generated gallery and quick-start examples, so the API guide cannot silently drift from the installed package.

NG15 also compiles the complete `docs/INTEGRATION_GUIDE.md` application and the first-chart block extracted from the **installed package's README**. `npm run check:docs` separately executes the scaffold/install/build blocks from `docs/INSTALLATION.md`, merges its explicit strict/SSR-host settings, repeats installation with `npm ci`, and bootstraps the exact integration example in a new CLI-generated application outside this workspace. It verifies production fallback HTML and four hydrated charts, keyboard selection, immutable updates, theme changes, resizing and stable renderer instances in Chromium, Firefox and WebKit. It does not copy the playground or use source aliases. Evidence is written to `docs/experiments/data/ng15-documentation-consumer.json`; the new check is part of `npm run check`.

Line coverage compiles the actual line API guide, eight generated line gallery variants, typed `/line` inputs/events, and invalid boolean/measure templates. Installed client/SSR browsers exercise line galleries, updates, missing values, keyboard actions, deferred hydration, and teardown after the existing bar scenarios. Core `ɵ` exports are implementation-only; public root/focused components retain identical class identities.

Area coverage compiles the actual area API example and eight generated variants, validates typed fills/stacks and invalid measure/boolean templates, compares root/focused component identities, and exercises area galleries, signed values, updates, tables, deferred hydration, and teardown in installed client/SSR consumers.

NG13 adds strict `/pie` and root compatibility imports, typed one-measure/category events, invalid numeric-key/radius templates, and compilation of the actual API and all generated pie examples. Runtime consumers exercise the pie gallery, zero table actions, immutable updates and deferred hydration in CSR/SSR across three engines.

NG16 adds exact-candidate mode to all three consumer scripts. `CHART_LIBRARY_TARBALL` supplies the retained artifact and `CHART_LIBRARY_TARBALL_SHA256` supplies its expected digest. The shared helper copies the supplied bytes into each temporary consumer and rejects a mismatch before installation; it does not repack the candidate. Ordinary checks still pack the current built library when no candidate is supplied. `npm run release:local` orchestrates these checks and requires their artifact identities to agree; see the [release checklist](../../docs/RELEASE_CHECKLIST.md).


NG17 adds focused/root composed class identity, inferred row events, numeric keys, a required bar/line discriminator and kind-specific option negatives. The installed strict compiler checks the actual composed API fence and both generated gallery themes. Client/SSR consumers render the composed gallery, activate raw zero table values, update inputs, preserve hidden IDs through kind changes, hydrate a deferred instance and clean up navigation in all three engines. Release records are now version-specific so rc.1 evidence retains the earlier NG16 rc.0 snapshot.
