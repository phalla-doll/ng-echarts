# Local release candidate checklist

The local candidate is `@ng-echarts/chart-library@0.1.0-rc.6`. The user selected MIT for original library code on 13 November 2026. The package remains private; public naming and publication are NG22 work. This checklist separates verified artifact behavior from release decisions and the deferred human interpretation review.

## Prepare and verify one artifact

Use Node 24.22.2 and npm 11.19.1 after `npm ci`. Artifact inspection also uses the system `tar` command:

```sh
npm run check
npm run release:local
```

`release:local` builds the production library, packs it once into `dist/releases/`, inspects its contents, then supplies byte-identical copies of that tarball to strict declarations, the fresh documentation application, and client/SSR runtime consumers. It does not repack a replacement between checks. Every consumer receives the candidate SHA-256; a mismatch fails before copying/installing. The release checker verifies the digest again between stages and requires the documentation/runtime reports to identify that exact artifact.

Outputs:

- `dist/releases/ng-echarts-chart-library-0.1.0-rc.6.tgz` — local candidate.
- `dist/releases/ng-echarts-chart-library-0.1.0-rc.6.tgz.sha256` — SHA-256 checksum.
- `dist/releases/release-manifest.json` — inventory, hashes, metadata, source snapshot and verification results.
- [Current candidate evidence](experiments/data/local-release-0.1.0-rc.6.json) — tracked copy of the verified manifest after the check.

Earlier rc.0 artifact results remain preserved in the [NG16 record](experiments/data/ng16-local-release.json). The [rc.1 manifest](experiments/data/local-release-0.1.0-rc.1.json), [rc.2 manifest](experiments/data/local-release-0.1.0-rc.2.json) and [rc.3 manifest](experiments/data/local-release-0.1.0-rc.3.json) are also preserved. Each version writes its own evidence filename. The [rc.4 manifest](experiments/data/local-release-0.1.0-rc.4.json) and archive are preserved; the [rc.5 manifest](experiments/data/local-release-0.1.0-rc.5.json) remains preserved too; preparing rc.6 does not replace earlier records.

The source snapshot records the base commit and whether local changes were included. File hashes identify the exact artifact content even when a local candidate was prepared from a working tree. Build outputs remain ignored; retain the tarball/checksum together when sharing with another local consumer.

For separate phases or a specific prepared artifact:

```sh
npm run release:prepare
npm run release:check
```

To run an individual checker against a retained candidate, set its absolute path and the digest from its checksum file:

```sh
export CHART_LIBRARY_TARBALL="$PWD/dist/releases/ng-echarts-chart-library-0.1.0-rc.6.tgz"
export CHART_LIBRARY_TARBALL_SHA256="$(cut -d ' ' -f1 "$CHART_LIBRARY_TARBALL.sha256")"
npm run check:consumer
```

The `check:docs` and `check:runtime` scripts accept the same variables. Without a supplied candidate, the ordinary workspace check retains its build-and-pack behavior.

## Artifact checklist

The automated candidate check requires:

- Correct local identity/version, `private: true`, MIT metadata, description/repository, unchanged Angular/ECharts peer ranges, tslib dependency and `sideEffects: false`.
- Root, core, bar, line, area, pie, composed and focused radar/radial declarations/runtime targets present, with private implementation imports blocked by installed-consumer checks.
- Complete packaged README/example, changelog, original-code [MIT license](../projects/chart-library/LICENSE), [third-party notices](../projects/chart-library/THIRD_PARTY_NOTICES.md), and preserved notice/provenance files.
- Copied license/notice bytes matching their recorded hashes and the exact installed dependency versions; upstream EvilCharts copyright remains intact.
- No raw workspace source or test files, node_modules, private paths or archive links in the tarball. Source maps and public declarations are intentional package files.
- Strict external Angular compilation with `skipLibCheck: false`, expected negative-template diagnostics and no React dependency tree.
- Fresh documented install and lockfile reinstall, all four families, keyboard value actions, updates, themes, resizing and stable instances in three browsers.
- Installed client and SSR/hydration applications covering the four MVP families and composed/radar/radial extensions, deferred rendering and navigation cleanup in Chromium, Firefox and WebKit.

The recorded dependency versions describe verified inputs, not every version admitted by the peer ranges. Demo-only icons, fonts, highlighting and the React reference harness remain outside the library artifact.

## Remaining release decisions

| Item | Status / evidence |
| --- | --- |
| Local candidate automated checks | Passed for `0.1.0-rc.6`; recorded in [current candidate evidence](experiments/data/local-release-0.1.0-rc.6.json) and the [radial report](experiments/NG18_RADIAL_PROGRESS.md); preserved rc.0 results remain in [NG16](experiments/NG16_LOCAL_RELEASE.md) |
| Original library license | MIT selected by the user; full text ships in the candidate |
| Human interpretation, F09/R06 | Deferred; follow the [manual review](experiments/R06_MANUAL_REVIEW.md) across every family |
| NG14/G2/G3/G4 acceptance | Pending until the required human evidence exists; successful artifact checks do not close these gates |
| Public package name/namespace | Undecided; current identity is local and experimental |
| Registry destination/publishing credentials | Not configured as part of NG16 |
| Public API stability/versioning promise | Experimental; no stable API freeze is declared by this candidate |

Record the human results, resolve remaining release decisions, and update the acceptance matrix before marking the complete release gates passed. NG16's automated packaging work can be reviewed independently while the existing human deferral remains in effect.

## Preview checkpoint

The [deployment-hardening report](experiments/PREVIEW_DEPLOYMENT_HARDENING.md) records the preserved private rc.4 archive with the committed concept gallery and guarded preview workflow. Demo publication requires clean/current pushed source, sealed output and a three-browser receipt; the public marker/receipt preserve build-time identity. This does not repack rc.4, publish to a registry, resolve public naming or close human F09/R06/G2/G3/G4.
