# Preview deployment hardening

The user approved this checkpoint after the graphical range integration exposed a stale-build race: the upload helper generated a current-commit marker while copying older output. The pending Chart possibilities gallery is now committed, and publication is bound to the source captured before compilation and the exact bytes checked afterward. Human release acceptance and npm publication remain separate.

## Source and artifact contract

`build:pages` captures the Git commit/tree, source digest, dirty flag and pinned Node/npm versions before compilation. A clean build extracts that Git tree into an isolated workspace; a dirty development build copies the exact captured inputs. Relative aliases remain inside that workspace, and the pinned installed dependencies are shared. Pre/post checks reject changed inputs. Source/index/history are not rewritten by the builder.

After normal static preparation, `preview-build.json` seals every emitted path, size and SHA-256, including physical route HTML, lazy chunks, fonts, the standalone gallery, licenses and `.nojekyll`. It records build-start/completion times, not upload time. The concept asset must match its source bytes and revision query. Source aliases are supported; output symlinks are refused.

`check:pages` validates source/output before and after the local browser suite and writes a receipt only after Chromium, Firefox and WebKit all pass. The receipt binds the exact immutable marker. Failed checks invalidate the old receipt. Build/check/upload use the same operation lock; dead-owner locks recover, while active operations are not overwritten.

Publication preflight requires a clean source commit already pushed as current remote main. The upload helper revalidates source, output and receipt, verifies its temporary copy, and publishes the original marker plus `preview-verification.json` without relabeling them. Legacy/missing markers, dirty or changed source, edited/extra/deleted output, unverified artifacts, reused/incomplete receipts and outdated/unpushed source are rejected. Normal branch history and existing Pages configuration are preserved; direct branch pushes/older clients are outside these local guards.

Public verification pins the intended commit (current HEAD by default), requires a clean marker and matching receipt, and hashes every inventoried response before browser checks. It detects a changed marker during verification and never creates a local publication receipt. Current identity is observable in [build provenance](https://phalla-doll.github.io/ng-echarts/preview-build.json) and [verification proof](https://phalla-doll.github.io/ng-echarts/preview-verification.json).

## Gallery checkpoint and CI

`fa21a04` commits the approved twelve-concept gallery and its refinement evidence. `3096673` preserves the subsequent treemap spacing/label refinement. The standalone ECharts distribution and Inter font are verified against their pinned source bytes, with notices retained; the full concept engine remains outside the Angular library artifact. The build now validates the latest document hash/revision pair, so a formatted or edited source cannot keep a stale cache query unnoticed.

Workspace CI seals/checks its clean checkout before the full test suite updates tracked measurement evidence. `test:pages-provenance` is included in `npm run check`. The earlier graphical-feature and documentation CI runs both succeeded ([feature](https://github.com/phalla-doll/ng-echarts/actions/runs/43418375061), [documentation](https://github.com/phalla-doll/ng-echarts/actions/runs/43419412144)). Commit-specific results remain observable in the repository’s [Workspace checks](https://github.com/phalla-doll/ng-echarts/actions/workflows/ci.yml).

## Executed evidence

The initial 19 deployment-integrity tests and a real isolated 30-route build/local three-browser check pass. Coverage includes immutable Git copies, source changes during compilation, dirty-build refusal after successful checks, later-commit staleness, output edits/additions/deletions/symlinks, missing/legacy metadata, incomplete/reused receipts, interrupted checks, active/dead locks, relative source aliases, public byte verification and the actual publisher refusing invalid input before contacting GitHub. The actual publisher also rejects a browser-verified dirty development build. The previous local probe is invalidated by later source changes; it is not a publication candidate.

The checkpoint also passes all **176 component/integration tests**, strict installed declarations and the fresh documented application against the retained byte-identical rc.4 archive. Full verification uses `npm run check`; to audit that frozen artifact, supply `CHART_LIBRARY_TARBALL` and its recorded SHA-256 as described in the [release checklist](../RELEASE_CHECKLIST.md). New measurement outputs do not replace earlier versioned release evidence.

For publication, commit/push the intended source and run `npm run deploy:pages`, then run the public checker before changing source again. The current clean source/build identity and browser receipt are published at the provenance links above; commit-specific full-suite results are retained by Workspace checks. The public verifier pins the source and every output byte, so an older or dirty deployment cannot be mistaken for the requested checkpoint.

## Release boundaries

Original code remains MIT licensed, existing notices remain intact, and the private rc.4 archive is retained unchanged. No new package API/version, registry publication, naming decision or human F09/R06/G2/G3/G4 acceptance is introduced. The supported build environment remains the pinned Node/npm and existing browser matrix.
