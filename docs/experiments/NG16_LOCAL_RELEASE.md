# NG16 local release candidate

Started 13 November 2026 following the user's request to begin the next planned work. Candidate: `@ng-echarts/chart-library@0.1.0-rc.0`, private, original library code under the user-selected MIT license. Public package identity and registry publication remain separate.

## Implementation

The package now supplies a description, repository/homepage/issues metadata, keywords, a prerelease version, full original-code license, changelog and a third-party notice index. The existing EvilCharts notice remains verbatim. Exact copies of the directly tested dependency/peer license texts and ECharts NOTICE accompany the candidate. Scoped Git attributes preserve their upstream CRLF/trailing-blank-line bytes and exempt those vendored notices from whitespace normalization/checking; application/tooling files retain normal whitespace checks. `third-party/provenance.json` records source paths, package versions/SPDX identifiers and hashes; the artifact checker verifies those bytes and versions against the installed inputs. Dependencies remain external imports, with the existing focused package boundaries and peer ranges.

`npm run release:prepare` builds and packs one candidate and records its SHA-256/SHA-512 integrity, inventory, exports and metadata. `npm run release:check` inspects it, gives the same bytes and expected digest to all three isolated consumer checks, and records results only after they pass. Existing workspace commands retain their normal packing mode when no candidate is supplied.

The strict consumer checks the installed declarations and all actual guide/gallery examples. The new CLI documentation application checks installation, lockfile reinstall, SSR/hydration, four charts, updates, keyboard selection, themes, responsive dimensions and instance preservation. Installed client/SSR applications additionally exercise deferred rendering, family-specific data/visibility/actions and route teardown in all three engines. Reports now identify the supplied artifact and whether the check used exact candidate bytes.

The [release checklist](../RELEASE_CHECKLIST.md) documents commands, outputs, distribution contents and open decisions. The [artifact evidence](data/ng16-local-release.json) records the final executed result. The candidate's local tarball and checksum are under ignored `dist/releases/`.

## Verification

The complete `npm run check` passes in ordinary packing mode: production builds, strict compilation, 119 unit/integration tests, 172 browser scenarios plus two expected CDP-only skips, strict/documentation/runtime consumers, SSR and all seven bundle scenarios. The updated demo installation text additionally passes a rebuilt playground and nine three-engine documentation/theme scenarios.

`npm run release:local` passes against one final candidate: **ng-echarts-chart-library-0.1.0-rc.0.tgz**, **65,669 bytes**, **39 files**, SHA-256 `313e3c2d7a3593d9e7710e140a5f2dfda9e580c5a52f52b8f3aff77cdc7228b0`. Metadata, all exported type/runtime targets, original/upstream/dependency notices and hashes match. The strict declaration checker, fresh CLI documentation application, and client/SSR runtime checker each install a byte-identical copy; all three stages report this digest. The fresh app passes three engines and the runtime fixture passes six client/SSR modes. The evidence retains those consumer reports inside the candidate record.

A negative checksum experiment passes: supplying an all-zero expected digest fails before creating any consumer copy or running installation. The candidate remains unchanged. No benchmark rerun is needed for metadata/notices/tooling changes; the full bundle checks retain all seven budgets.

The candidate was prepared from base commit `edd2e8f` plus the NG16 working changes, as recorded by `includesWorkingTree: true`; per-file hashes identify its packaged content. The artifact/checksum remain under ignored `dist/releases/`. Source/documentation commits are separate from this local artifact. Formatting, 686 local documentation links/anchors and whitespace checks pass. NG16 source/metadata/notices are committed in `6297f85`. The updated [installation preview](https://phalla-doll.github.io/ng-echarts/installation/) returns HTTP 200 and includes the candidate filename and MIT status. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43368528003) succeeds; `preview-build.json` identifies clean source commit `6297f85`. Local/live Pages checks pass in Chromium, Firefox and WebKit.

## Release status

NG16 automated artifact checks pass and the local candidate is ready for review. Complete NG16/G4 acceptance remains open for the deferred human evidence. F09/R06 interpretation remains deferred, and NG14/G2/G3/G4 stay pending until that evidence exists. This candidate does not declare a stable API or publish a registry package.
