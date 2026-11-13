# NG15 installation and integration documentation

Recorded 13 November 2026 after the NG14 automated acceptance work. Status: **documentation implementation and verification complete for the experimental package**. Scope: task NG15, developer integration and compatibility documentation, requirements F01–F10. The user requested the next task while human interpretation remained deferred. This continuation does not close NG14/R06/G2/G3 or freeze the API. NG16 owns the final artifact, license/notices and G4.

## Developer path

The new [installation guide](../INSTALLATION.md) takes a developer from `npm run pack:lib` through a pinned standalone Angular CLI application, local tarball installation, lockfile reinstall, explicit strict compilation, bootstrap and production SSR. It explains keeping the tarball for repeat installs, nonzero host dimensions, immutable references and recovery. The CLI may leave strict defaults implicit; the recipe makes `strict`, `strictTemplates` and `skipLibCheck: false` explicit. A fresh production SSR request initially exposed the missing local host configuration; the checked recipe now sets `security.allowedHosts` for localhost/127.0.0.1 in the application's build options.

The [integration guide](../INTEGRATION_GUIDE.md) supplies a complete exported `App` matching the CLI bootstrap, four focused chart imports, shared typed rows/measures, keyboard table actions, immutable updates, theme changes and a selection handler. It includes the component/type index, event identities, formatting/state behavior, SSR/font/theme handling and accessibility expectations. It needs no global renderer setup or library-specific providers.

The [compatibility table](../COMPATIBILITY.md) separates exact tested versions, declared peers and workspace engines. It records three-browser client/SSR coverage, normal/stress measurement profiles, supported starting data envelopes, exclusions and pending release work. It does not broaden the version ranges owned by research findings or turn benchmark observations into hard API limits.

All four API references now link these guides and describe current family boundaries/envelopes. The shipped README is self-contained: installation, a complete first-chart `App`, focused components/contracts, raw events, missing/zero rules, formatting, state, SSR, keyboard interpretation and limits. The site's quick-start example now exports `App` with `app-root`, matching its documented destination; installation pages include bootstrap, strict settings, SSR hosts, exact compatibility and limits. No chart runtime, public inputs/outputs, gallery styling or dependency range changed.

## API inventory review

The source inventory was read from the public `input`/`output` declarations, including the Cartesian base's inherited members. Each name is present in its family guide or the explicitly linked shared bar reference.

| Component | Inputs | Outputs | Reference |
| --- | ---: | ---: | --- |
| Bar | 20 | 2 | [Bar API](../BAR_CHART_API.md) |
| Line | 19 | 2 | [Line API](../LINE_CHART_API.md), inherited Cartesian contract |
| Area | 21 | 2 | [Area API](../AREA_CHART_API.md), inherited Cartesian contract |
| Pie/donut | 18 | 2 | [Pie API](../PIE_CHART_API.md), independent measure/category contract |

The integration type index covers all public core types and `ChartFrame`. Defaults, required inputs, raw event payloads, supported values, immutable update semantics and family exclusions were reviewed against the implementations. Internal `ɵ` exports remain explicitly unsupported.

## Verification

Story: documented CLI scaffold → pinned dependencies/local tarball → exact copied `App` → production fallback HTML → four browser charts → keyboard actions, immutable updates, theme and resize. There is no API, database, credential or external data service in this flow.

`npm run check:docs` executes the marked shell blocks from `INSTALLATION.md` outside the workspace, merges its literal strict/SSR-host JSON settings and writes the exact TypeScript fence from `INTEGRATION_GUIDE.md` into the generated application. It installs the tarball without aliases/symlinks, repeats with `npm ci`, verifies exact versions, compiles with strict templates and dependency declarations, then builds and serves the unmodified generated entry points. The checker is now included in `npm run check` after the declaration consumer.

[Raw documentation-consumer evidence](data/ng15-documentation-consumer.json) records the source hashes, actual installed versions and passing Chromium/Firefox/WebKit results. Each engine verifies four canvases after hydration, raw keyboard selections for every family, updated values, dark theme colors, responsive 320/768/1440 px viewports and unchanged renderer IDs. Initial production HTML contains all four chart headings and zero canvases; no browser/hydration errors are accepted. This is a fresh CLI application, not a copy of the playground.

Validation passes:

- Production library and browser/server playground builds; strict Angular/TypeScript compilation.
- `npm run check:consumer`, including the **installed README** example, complete integration example, all family API examples, generated gallery/site examples and deliberately invalid templates, with `skipLibCheck: false`.
- `npm run check:docs`, including lockfile reinstall and all three browser engines.
- All **nine** documentation-page browser scenarios, including copying the root-compatible `App`, strict/SSR/compatibility text, navigation, both themes, mobile layout and denied clipboard access.
- Prettier, local documentation links/anchors and `git diff --check` in the final documentation review.

The final link review resolves **570 local links/heading anchors**. Stored installation/integration source hashes match the current guides, including the strict/SSR-host settings used by the fresh consumer.

The earlier NG14 regression remains the 119-unit/145-browser baseline; this documentation task runs the affected checks above rather than claiming a new full regression or new chart benchmarks. The existing packed client-only/SSR runtime and performance results remain applicable to unchanged chart code. The new recipe specifically verifies its generated SSR application's server fallback and browser hydration; client-only consumption also retains its separate packed-runtime evidence.

NG15's developer-install/reproduce criterion is met for the experimental toolchain. NG14's human F09 result and release gates remain pending. Next is NG16 local artifact preparation and final license/notice review; public registry publication remains separate.
