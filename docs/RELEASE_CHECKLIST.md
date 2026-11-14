# Local release candidate checklist

The local candidate is `@ng-echarts/chart-library@0.1.0-rc.17`. The user selected MIT for original library code on 13 November 2026. The package remains private; public naming and publication are NG22 work. This checklist separates verified artifact behavior from release decisions and the deferred human interpretation review.

## Prepare and verify one artifact

Use Node 24.22.2 and npm 11.19.1 after `npm ci`. Artifact inspection also uses the system `tar` command:

```sh
npm run check
npm run release:local
```

`release:local` builds the production library, packs it once into `dist/releases/`, inspects its contents, then supplies byte-identical copies of that tarball to strict declarations, the fresh documentation application, and client/SSR runtime consumers. It does not repack a replacement between checks. Every consumer receives the candidate SHA-256; a mismatch fails before copying/installing. The release checker verifies the digest again between stages and requires the documentation/runtime reports to identify that exact artifact.

Outputs:

- `dist/releases/ng-echarts-chart-library-0.1.0-rc.17.tgz` — local candidate.
- `dist/releases/ng-echarts-chart-library-0.1.0-rc.17.tgz.sha256` — SHA-256 checksum.
- `dist/releases/release-manifest.json` — inventory, hashes, metadata, source snapshot and verification results.
- [Current candidate evidence](experiments/data/local-release-0.1.0-rc.17.json) — tracked copy of the verified manifest after the check.

Earlier rc.0 artifact results remain preserved in the [NG16 record](experiments/data/ng16-local-release.json). The [rc.1 manifest](experiments/data/local-release-0.1.0-rc.1.json), [rc.2 manifest](experiments/data/local-release-0.1.0-rc.2.json) and [rc.3 manifest](experiments/data/local-release-0.1.0-rc.3.json) are also preserved. Each version writes its own evidence filename. The [rc.4 manifest](experiments/data/local-release-0.1.0-rc.4.json) and archive are preserved; the [rc.5 manifest](experiments/data/local-release-0.1.0-rc.5.json) remains preserved too; the [rc.6 manifest](experiments/data/local-release-0.1.0-rc.6.json) and archive remain unchanged and the [rc.7 manifest](experiments/data/local-release-0.1.0-rc.7.json) and archive remain preserved with subsequent rc.8–rc.12 records retained separately below.

The source snapshot records the base commit and whether local changes were included. File hashes identify the exact artifact content even when a local candidate was prepared from a working tree. Build outputs remain ignored; retain the tarball/checksum together when sharing with another local consumer.

For separate phases or a specific prepared artifact:

```sh
npm run release:prepare
npm run release:check
```

To run an individual checker against a retained candidate, set its absolute path and the digest from its checksum file:

```sh
export CHART_LIBRARY_TARBALL="$PWD/dist/releases/ng-echarts-chart-library-0.1.0-rc.17.tgz"
export CHART_LIBRARY_TARBALL_SHA256="$(cut -d ' ' -f1 "$CHART_LIBRARY_TARBALL.sha256")"
npm run check:consumer
```

The `check:docs` and `check:runtime` scripts accept the same variables. Without a supplied candidate, the ordinary workspace check retains its build-and-pack behavior.

## Artifact checklist

The automated candidate check requires:

- Correct local identity/version, `private: true`, MIT metadata, description/repository, unchanged Angular/ECharts peer ranges, tslib dependency and `sideEffects: false`.
- Root, core, bar, line, area, pie, composed and focused radar/radial/calendar/sankey declarations/runtime targets present, with private implementation imports blocked by installed-consumer checks.
- Complete packaged README/example, changelog, original-code [MIT license](../projects/chart-library/LICENSE), [third-party notices](../projects/chart-library/THIRD_PARTY_NOTICES.md), and preserved notice/provenance files.
- Copied license/notice bytes matching their recorded hashes and the exact installed dependency versions; upstream EvilCharts copyright remains intact.
- No raw workspace source or test files, node_modules, private paths or archive links in the tarball. Source maps and public declarations are intentional package files.
- Strict external Angular compilation with `skipLibCheck: false`, expected negative-template diagnostics and no React dependency tree.
- Fresh documented install and lockfile reinstall, all four families, keyboard value actions, updates, themes, resizing and stable instances in three browsers.
- Installed client and SSR/hydration applications covering the four MVP families and composed/radar/radial/calendar/sankey extensions, deferred rendering and navigation cleanup in Chromium, Firefox and WebKit.

The recorded dependency versions describe verified inputs, not every version admitted by the peer ranges. Demo-only icons, fonts, highlighting and the React reference harness remain outside the library artifact.

## Remaining release decisions

| Item | Status / evidence |
| --- | --- |
| Local candidate automated checks | Passed for `0.1.0-rc.17`; [exact artifact manifest](experiments/data/local-release-0.1.0-rc.17.json) and [follow-up evidence](experiments/RC17_RELEASE_REVIEW.md); rc.16 results remain preserved in the [combined checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) |
| Original library license | MIT selected by the user; full text ships in the candidate |
| Human interpretation, F09/R06 | Pending; complete the [rc.17 result sheet](experiments/RC17_HUMAN_REVIEW.md) following the [manual review](experiments/R06_MANUAL_REVIEW.md) across every family |
| NG14/G2/G3/G4 acceptance | Pending until the required human evidence exists; successful artifact checks do not close these gates |
| Public package name/namespace | Selection pending; [NG22 preparation](PUBLICATION.md) records the two registry lookups and proposed npm target |
| Registry destination/publishing credentials | npm authentication returns 401; owning account/scope rights remain unverified ([plan](PUBLICATION.md)) |
| Public API stability/versioning promise | Experimental; no stable API freeze is declared by this candidate |

Record the human results, resolve remaining release decisions, and update the acceptance matrix before marking the complete release gates passed. NG16's automated packaging work can be reviewed independently while the existing human deferral remains in effect.

## Preview checkpoint

The [deployment-hardening report](experiments/PREVIEW_DEPLOYMENT_HARDENING.md) records the preserved private rc.4 archive with the committed concept gallery and guarded preview workflow. Demo publication requires clean/current pushed source, sealed output and a three-browser receipt; the public marker/receipt preserve build-time identity. This does not repack rc.4, publish to a registry, resolve public naming or close human F09/R06/G2/G3/G4.

The preserved [rc.8 evidence](experiments/data/local-release-0.1.0-rc.8.json) and archive remain unchanged; rc.9 adds focused Sankey.

The verified [rc.9 archive and evidence](experiments/data/local-release-0.1.0-rc.9.json) remain preserved. rc.10 changes only lazy engine loading to prevent unrelated chart code entering other galleries.

The [rc.10 candidate](experiments/data/local-release-0.1.0-rc.10.json) remains byte-identical. rc.11 combines the verified per-chart loading with the completed [presentation refinement](experiments/PREMIUM_CHART_REFINEMENT.md), including optional donut totals and calendar/Sankey measure labels. Human F09/R06/G2/G3/G4 remain pending.

The [rc.11 candidate](experiments/data/local-release-0.1.0-rc.11.json) remains unchanged. rc.12 corrects only packaged documentation and candidate metadata; implementation, public declarations, dependencies, licensing and notices remain the rc.11 baseline. Its exact-artifact checks are recorded separately.


The [rc.12 candidate](experiments/data/local-release-0.1.0-rc.12.json) remains unchanged. rc.13 adds opt-in bar point previews; exact-artifact checks and the [follow-up report](experiments/NG20_MONTH_PREVIEWS.md) record this increment separately. No public publication or human-gate resolution is implied.


The prepared [rc.13 record](experiments/data/local-release-0.1.0-rc.13.json) retains its failed runtime status; [rc.14](experiments/data/local-release-0.1.0-rc.14.json) retains its passing exact-consumer checks. A later Firefox/WebKit range-Escape regression is described in the [preview follow-up](experiments/NG20_MONTH_PREVIEWS.md). rc.15 corrects it while preserving both archives.


The [verified rc.15 preview-only artifact](experiments/data/local-release-0.1.0-rc.15.json) remains unchanged. The [combined rc.16 checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) adds dimension-aware controller/renderer behavior and verifies it alongside the demo navigation changes.
