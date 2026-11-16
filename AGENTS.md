# Repository Guidelines

## Project Structure and Scope

Angular 22 chart library using Apache ECharts. Bar, line, area, pie/donut and composed bar/line/area charts with shared or opt-in independent value axes and separate named bar/area stacks are implemented. NG20 adds linked charts with native and graphical month ranges. NG14 automated acceptance and NG15 documentation are recorded; human interpretation and release gates remain open. The demo is deployed to GitHub Pages. Experimental `@mantha911/ng-echarts@0.1.0-rc.24` is published on npm under `next` (`latest` retains rc.18); human F09/R06/G2/G3/G4 remain pending under the user’s explicit prerelease deferral.

- `README.md`: overview and document index.
- `docs/PRODUCT_SPEC.md`: MVP scope and required behavior.
- `docs/TECHNICAL_ARCHITECTURE.md`: implemented API, rendering lifecycle, and implementation conventions.
- `docs/INSTALLATION.md`, `docs/INTEGRATION_GUIDE.md`, and `docs/COMPATIBILITY.md`: verified installation/examples, exact tested versions, and limits.
- `docs/PUBLICATION.md` and `docs/RELEASE_CHECKLIST.md`: published identity/tags, exact registry verification, archive preservation and pending human gates.
- `docs/LINKED_CHARTS.md`: application-owned point selection, derived companion data and keyboard/reset behavior.
- `docs/GITHUB_PAGES.md`: live preview, static build, verification, and manual deployment.
- `docs/IMPLEMENTATION_PLAN.md`, `docs/RND_PLAN.md`, `docs/BACKLOG.md`, and `docs/ACCEPTANCE_MATRIX.md`: delivery sequence, experiments, tasks, and evidence.
- `docs/RESEARCH_FINDINGS.md` and `docs/SOURCES.md`: compatibility facts and upstream references.

Library source and colocated tests: `projects/chart-library/{core,bar,line,area,pie,composed,radar,radial,calendar,sankey}/src/`; root compatibility exports: `projects/chart-library/src/`. Playground source: `projects/playground/src/`; assets: `projects/playground/public/`. Isolated consumers: `tools/consumer-fixtures/`; evidence: `docs/experiments/`.

## Implementation Workflow

The product specification owns scope; research findings own compatibility ranges. Follow the implementation plan and upstream provenance ledger. G1 passes for bar. The user deferred R06 human listening to release acceptance and authorized continued development through NG17 composed charts and the first NG20 linked-chart integration; retain human F09 and G2/G3/G4 as pending until their evidence exists. NG16 records the private 0.1.0-rc.0 candidate; NG17 advances it to 0.1.0-rc.1 with the user-selected MIT license, preserved notices and exact-artifact checks; NG20 initially reused rc.1; its controlled bar feedback and native/graphical ranges advance the private candidate through rc.2/rc.3 to rc.4, preserving earlier artifacts. NG18 adds experimental focused radar in private rc.5; keep radar out of the compatibility root and preserve rc.4. NG18 radial progress advances the private candidate to rc.6, preserving rc.5; keep `/radial` focused and scalar progress semantics native. NG19 calendar advances the private candidate through rc.7 to rc.8 while preserving rc.6/rc.7; keep the single-year date/value contract and `/calendar` focused. NG19 Sankey adds a focused acyclic node/link contract in private rc.9, preserving rc.8; rc.10 preserves rc.9 and uses exported per-chart lazy registration across families to prevent shared-engine payload leakage. Keep `/sankey` outside the compatibility root. Private rc.11 combines the completed chart presentation refinement with Sankey and per-chart loading, preserving rc.10; rc.12 corrects packaged documentation only and preserves rc.11 runtime/declarations and archives; rc.13 adds opt-in bar pointer/table-focus month previews while preserving rc.12 and earlier archives; rc.14 retains keyboard focus during preview enablement and preserves the prepared rc.13 archive with its failed runtime record; rc.15 preserves rc.14 and prevents range-mode Escape from replaying a table preview when listeners reattach; rc.16 combines the verified rc.15 month previews with dimension-aware rendering and the navigation/animation follow-up, preserving rc.15 and all earlier archives; rc.17 adds pre-hydration application theme inheritance and preserves rc.16 and earlier archives; human release gates remain pending. Demo deployment does not publish the library package or close release gates.

## Build, Test, and Development Commands

Use Node from `.nvmrc` and npm 11.19.1; install with `npm ci`.

- `npm run build`: build library and production playground.
- `npm start`: serve playground; first run `npm run build:lib`.
- `npm run watch:lib`: rebuild library changes alongside the playground.
- `npm test`: run Vitest once; `npm run test:watch` watches.
- `npm run check`: formatting, builds, strict compilation, tests, isolated declarations/documentation/runtime consumers, SSR, three-browser scenarios, and package budgets. First install browsers with `npx playwright install chromium firefox webkit`.
- `npm run build:pages` / `npm run check:pages`: build an isolated source snapshot and verify its sealed static output under `/ng-echarts/` in all three browsers. Dirty snapshots are local-only; inputs/outputs must remain unchanged.
- `npm run deploy:pages`: requires clean source already pushed to current remote main; rebuilds/checks, validates its receipt and publishes immutable provenance with compiled assets to `gh-pages`. Never restamp or bypass stale-build guards. Pushes to main do not automatically redeploy.
- `npm run release:local`: build/pack one local candidate, verify metadata/notices and pass byte-identical copies to strict/docs/client/SSR consumers. `release:prepare` and `release:check` run separate phases; keep human gates pending.
- `npm run check:release-immutability`: after preparing an artifact, verify that repeated preparation cannot overwrite its archive, checksum or manifest. Registry consumers use `CHART_LIBRARY_REGISTRY_SPEC` plus the recorded `CHART_LIBRARY_TARBALL_SHA256`; see `docs/RELEASE_CHECKLIST.md`.
- `npm run capture:visual`: capture the four MVP gallery families/themes at 320/390/768/1440 px, including tooltip bounds and narrow label/control evidence; first run `npm run build`.
- `npm run benchmark:composed:stacked` / `npm run benchmark:composed:area`: measure named bar stacks and named area stacks separately; preserve the original composed benchmark and existing limits.
- `npm run test:prerelease-guards`: check publication source/run/artifact guards and bounded read-only registry propagation recovery.
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

## Public prerelease exception — 14 November 2026

The user selected `@mantha911/ng-echarts` after authenticating as npm user `mantha911`, requested skipping the VoiceOver session, and authorized completing the experimental public prerelease. rc.18 changes the package identity and current imports while preserving private rc.17 and earlier archives. The exact verified artifact was published to npm with public access and the `next` tag. Keep human F09/R06/G2/G3/G4 pending: the user’s deferral permits this experimental publication without claiming completed human interpretation, a stable API, or full release acceptance.

The rc.18 publication is complete. npm retains both `next` and its initial `latest` alias for rc.18 and rejected deleting `latest` with HTTP 400; preserve that observed limitation in current docs. The published archive and packaged README/changelog are immutable. Preserve rc.17 and earlier artifacts, use a new version for package-content changes, and keep repository-only documentation corrections separate from package publication.


## 15 November delivery follow-up

The user authorized completing rc.19 delivery, reconciling deployment records and extending composed charts with named bar stacks, and explicitly continued the human-review deferral. rc.19 preserves the exact verified performance/Angular artifact and is published under `next`; the initial `latest` alias remains rc.18. Preserve both registry archives and all earlier candidates. Stacked composition has a separate rc.20 artifact and report. rc.21 corrects packaged documentation only after rc.19 publication, preserving rc.20 runtime/declarations and every archive. At that checkpoint source/local candidate was rc.21 and npm next remained rc.19. Do not change archived contents in place. Current human interpretation preparation is in `docs/experiments/RC20_HUMAN_REVIEW.md`; F09/R06/G2/G3/G4 remain pending. The prior rc.18 publication section remains historical evidence.

Use `npm run benchmark:composed:stacked` to measure the named-stack variant separately from other workloads. It preserves the original composed benchmark record and asserts actual rendered stack membership.


## Composed-area continuation — 15 November

The user authorized completing CI verification, publishing the exact rc.21 artifact and implementing area/line composition, while retaining the human-review deferral. rc.21 is published under next (latest retains rc.18); its immutable archive is preserved. rc.22 adds composed areas, independent fills and named area stacks separate from bar groups, with shared pure area-fill construction and unchanged renderer registration. Keep the current increment evidence in `docs/experiments/NG17_COMPOSED_AREAS.md`. The manually dispatched trusted-publishing workflow requires exact main/CI/artifact identity and registry verification; registration/first OIDC delivery must have evidence before being called active. Human F09/R06/G2/G3/G4 remain pending.

rc.22 was published via the registered GitHub OIDC workflow from fully successful CI for dc283159dedd8677f04198d7cedb671553395d6b. Preserve its archive and packaged documentation. The first post-upload consumer step hit registry propagation (ETARGET); the workflow now waits for normal npm resolution and offers an explicit verification-only recovery operation that never uploads. The verification-only recovery passes all registry consumers in run 43691971304. The clean deployed source is 1cef86b909455af7d2a89ef04c348dde289bd700; its marker, sealed hashes and all three browser flows are verified. Full CI for that delivery source passes in run 43691952570 (326 unit tests, 22 publication/readiness tests, 458 browser passes and four skips). The area increment report owns actual receipts and failed-run corrections.

## Composed dashboard and horizontal continuation — 15 November

The user authorized all three recommended follow-ups: a composed-to-detail linked dashboard, a realistic npm-installed consumer and horizontal composition. Local rc.23 adds `ComposedChart.layout` with vertical defaults and horizontal category-axis hit decoding, rotated stack caps/area gradients and unchanged engine registration. Preserve rc.22 and every earlier archive. The dashboard itself uses existing rc.22 APIs; `npm run check:dashboard` installs the digest-verified published rc.22 baseline outside the workspace and checks the exact displayed standalone App in three engines. `npm run dashboard:source` regenerates that source after component/App edits. Run horizontal stack/area benchmarks separately with `benchmark:composed:horizontal` and `benchmark:composed:horizontal-area`. The [increment record](docs/experiments/NG20_COMPOSED_DASHBOARD.md) owns actual evidence. npm next remains rc.22. The user-authorized commit/redeploy delivers clean source `8dd761922b8b9548a5c2bac67a40cc7f80b8075e` to Pages as static commit `787baedfc6390e44f239472513061eeb9b78a6d2`; its 35 routes and 140 sealed files pass local/public three-engine checks. Preserve that deployed identity across receipt-only documentation commits. Dual axes and broader linking remain subsequent work; human F09/R06/G2/G3/G4 remain pending.

The full CI run for deployed source `8dd761922b8b9548a5c2bac67a40cc7f80b8075e` passes in run `43727454898`. Its independently verified rc.23 tarball has digest `6a68ccc06bf76b6f92803198f23dc4207444fe165c3f7ec4a6b39cc0ace1f246`; the preserved local rc.23 digest remains `5b658b17816fbb36c3e79a69410548fddbb2e24a8a5b15dc188931c9407ac92f`. Only two inferred TypeScript union member orders differ; all runtime files and other package members are byte-identical. Preserve both archives/digests and use the selected exact-artifact digest for any later operation. No rc.23 npm upload is part of this demo deployment. The increment report owns comparison and delivery receipts.

## rc.23 publication and rc.24 value axes

The user authorized rc.23 npm delivery, stable declarations and bounded dual-axis composition. rc.23 is published via OIDC workflow run `43730083266` from successful exact-main CI `43728864141`, source `9ea7c866bf0bf8e9f6ae3551cab0cf08d32218d9`; canonical registry digest is `6a68ccc06bf76b6f92803198f23dc4207444fe165c3f7ec4a6b39cc0ace1f246`. npm next is rc.23 and latest remains rc.18. All registry consumers pass; both rc.23 archives remain preserved. Local rc.24 adds explicit layout/configuration declaration annotations and opt-in one/two labeled value axes, per-axis formatting, raw point values and cross-axis stack rejection. A shared browser-only curve helper keeps per-family registration lazy. `npm run check:reproducibility` compares the warm artifact with two independent cache-free roots; Linux CI comparison is separate evidence. `npm run capture:composed:axes` preserves new screenshots separately. The [rc.23 publication](docs/experiments/RC23_PUBLICATION.md) and [rc.24 increment](docs/experiments/NG17_DUAL_AXES.md) own actual receipts. rc.24 is not published, and demo source remains `8dd7619` until separately deployed. Human F09/R06/G2/G3/G4 remain pending.


The rc.24 implementation and test corrections are verified in full CI run `43736006909` for `c30bad62a663626b820b0b9f03c87e27d70c1b2c`: 335 unit tests, 476 browser passes/four skips, exact consumers, Pages and budgets. The immutable 170,430-byte rc.24 archive has SHA-256 `6dd89361c4f6482b28b9a3f28d88bddf28a71eac9123ec1a8412517995d4c46f`; macOS/Linux warm and independent clean builds match all members/declarations. Two earlier Linux WebKit horizontal-probe failures remain recorded; the corrected test uses the first-category band and canvas-relative clicks. Root gzip has only 15 bytes of headroom under the unchanged 222,000-byte cap. Preserve this artifact and every earlier archive; rc.24 remained unpublished at this checkpoint and the demo retained `8dd7619`. Receipt-only documentation commits preserve the verified implementation identity.

## rc.24 delivery — 16 November

The user accepted the next-step recommendation to publish the preserved rc.24 artifact, deploy the updated demo and reconcile status documentation. Exact-main CI `43737237117` passes for source `0593f344c904b11373c2c93ed5da117ed91258bb`; its archive matches the canonical rc.24 digest above. OIDC publishing run `43788004335` passes upload, registry bytes and all fresh consumers; next is rc.24 and latest remains rc.18. The [delivery report](docs/experiments/RC24_PUBLICATION.md) owns fresh registry-consumer and demo deployment results. Preserve packaged README/changelog and every archive. Reduce payload in a new version before adding shared zoom/two-way linking; do not increase budget caps. Human F09/R06/G2/G3/G4 remain deferred/pending.

The corrected demo is deployed from clean source `42b27aa63841184467d97b17fec63f8c2c4d6644` as static commit `4470047011dd1c96295964a58bd562ca662aa4bf`, sealed SHA-256 `3ef31eda4f6c23732b586595724f8e686a56514b7cdaec1634c02e17b3079459`; Pages run `43789318430` passes. Local/public verification of 35 routes/140 files passes all three engines, alongside 17 performance guards and the live fractional keyboard action. Source CI `43789117814` passes all jobs: 335 unit tests and 476 browser passes/four skips. Its independent CI archive matches all 68 published members and the canonical rc.24 digest. Earlier delivery-source CI `43788704313` fails an installation-status wording guard; its correction passes the strict registry consumer without weakening the guard or changing package bytes. Preserve the deployed identity across receipt-only commits.

## rc.25 payload continuation — 16 November

The user prioritized bundle headroom after rc.24 delivery. Local rc.26 introduces internal shared presentation inputs/state and a browser lifecycle binding, with family-specific CSS. Existing supported APIs, lazy renderer registration, eleven entry identities, measurement method and caps remain unchanged. Root gzip measures 221,060 bytes (940 bytes of headroom), with identical ECharts/ZRender module sets in all twelve scenarios and no eager engine modules. The [increment report](docs/experiments/RC26_PAYLOAD_REDUCTION.md) owns actual full regression, exact candidate and clean-build results. npm next retains rc.24/latest rc.18 and the demo retains verified source `42b27aa`; preserve every archive and keep human gates pending. Further features require fresh root/core budget checks.

rc.25's isolated rebuild exposed inferred axis-union order variation in one core declaration, with all runtime members identical. Preserve canonical rc.25 `a5b5edf7a03e975bfceb9db21973445d1f82d7abbe0685afde860cb574085732` and diagnostic `12bd51fc1a0c31aabd0c35d088dff467a772b008dc0b1df5e4115269ebdfadd3`. The rc.26 correction names Cartesian option/axis return types explicitly. Concurrent legend work remains in the original checkout; the payload branch owns isolated final verification and does not combine those edits.

The isolated rc.26 payload candidate is 166,359 bytes, SHA-256 `62109131e98fe79e7f4556df12f1ba7194d1e6b02a4b629ba1f474f5bdfe7b2b`. All 68 members/11 declarations match warm/two-clean macOS and Linux PR builds. PR CI `43796458090` passes all six jobs for head `8b8b08e` and merge checkout `8f8badc2e5e07239b763780a2fbcdea81c9dbcec`: 335 unit tests and 476 browser passes/four skips, exact consumers, Pages and unchanged budgets. Local symlinked root gzip is 221,060 bytes; Linux CI is 221,051. Public signal contracts for all ten components and narrow donut/selected-row screenshots match rc.24. [PR #1](https://github.com/phalla-doll/ng-echarts/pull/1) keeps this verified payload candidate separate from concurrent legend edits. npm/demo and human gates retain their prior status. Receipt-only commits preserve the verified implementation identity.

## rc.27 final review — 16 November

Final review found that radar also consumes the scale-description style moved during payload consolidation. rc.27 shares that rule between radar and composed charts and checks computed spacing in responsive gallery and installed CSR/SSR consumers. The [review record](docs/experiments/RC27_FINAL_REVIEW.md) owns actual results. Preserve sealed rc.26 and earlier archives. Source remains isolated on the payload PR; npm next retains rc.24/latest rc.18, the demo retains `42b27aa`, and human gates remain pending.

## rc.26 legend continuation — 16 November

The user selected inline chips and aligned lists, with chips as default. Local rc.26 adds `legendLayout` to Cartesian/radar/pie charts and mirrors the pie-gallery choice into its source example. Preserve archived rc.25 and every earlier artifact. The [legend report](docs/experiments/RC26_LEGEND_LAYOUTS.md) owns actual checks; do not raise budget caps. npm next and Pages remain rc.24 delivery identities; human gates remain pending.

The user requested removing every gallery table control after reviewing the radar block. Local rc.26 disables tables in radar and linked previews and adds default-true `showDataTable` opt-outs to calendar/Sankey. Keep the eleven gallery routes free of table controls/markup, mirror opt-outs in gallery code examples, and retain native table acceptance on explicit validation routes. Published artifacts and human gates are unchanged.

## rc.28 integration — 16 November

The user requested committing and pushing all local legend/gallery work after discovering it was absent from the deployed payload PR. Merge the local work with remote main while retaining rc.27 radar styling and explicit Cartesian option declarations. Advance current source to rc.28 to avoid reusing the separately archived rc.26/rc.27 identities; the [integration record](docs/experiments/RC28_LEGEND_INTEGRATION.md) owns actual checks. Preserve every archive and keep npm next rc.24/latest rc.18 and human gates pending. The previous legend sections record historical local source versions, not contents of the archived payload candidates.

The rc.28 legend/gallery source is pushed as `9de7a843213eb9d382655e51aba1ca51c51060bd` and deployed as static `392e16f525e2f1eacc0c5389bea7d5f027d3aec0` (sealed SHA-256 `670f23c88f5091bbf1a5347dd3c841c2f7c99714195eead4da47c17875046ef9`), Pages run `43804898460`. All 40 static routes/145 files pass local/public three-engine checks and all 17 performance guards. A verification follow-up migrates the remaining range/table assertion and tests transparent chip borders plus inherited list separators without JavaScript; 52 cases/two expected skips pass all three engines. The first source CI has failing old assertions; fresh CI remains separate evidence. Retain this deployed identity across verification/receipt-only commits; npm tags, every archive and human gates remain unchanged.


## Validation layout delivery — 16 November

The user requested refining every page under Validation, then committing, pushing and redeploying. UI source `ab01535ddfeadc2a5ca0c73c147c33c6dde0913c` is pushed and deployed as static `8385b07d43475a2fefbcc0b9104893669f593883`, sealed SHA-256 `ca371773b0f59f958d65cd8f75931fc38bc50eb10b30811079f5d8d7cbfc9880`; Pages run `43806930543` succeeds. All 40 routes/145 files pass local/public three-engine checks and all 17 performance guards. Initial public Firefox lazy-import errors remain recorded; all four module URLs return valid HTTP 200 JavaScript and the unchanged verifier's rerun passes all engines. Live keyboard toggles, updated raw table action/focus and 390 px controls pass. [Delivery evidence](docs/experiments/validation-layout/deployed/deployment.json) preserves this identity.

Local regression passes 148 browser cases/two expected heap skips and 110 responsive views. Source CI `43806716429` passes workspace/Pages/Chromium/Firefox but its Linux WebKit combined area-gallery matrix exhausts 30 seconds near the final click. The verification-only correction splits that matrix into separate theme tests, retaining every width/assertion and the unchanged timeout. Six local browser/theme cases pass; fresh CI remains separate evidence. Preserve deployed source `ab01535` across receipt/test-only follow-ups. Package identity stays rc.28 source, npm next rc.24/latest rc.18; all archives and pending human gates remain unchanged.
