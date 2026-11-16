# Published prerelease verification

The published experimental candidate is `@mantha911/ng-echarts@0.1.0-rc.24`, including independent composed value axes and deterministic declarations. The preserved rc.27 [payload-reduction candidate](experiments/RC27_FINAL_REVIEW.md) precedes current rc.28 [legend integration source](experiments/RC28_LEGEND_INTEGRATION.md); no rc.28 archive or publication is claimed. The user selected MIT for original library code on 13 November 2026. The user selected this experimental public identity and explicitly deferred the human listening session while requesting publication under `next`. Human gates remain pending. This checklist separates verified artifact behavior from release decisions and the deferred human interpretation review.

The rc.24 publication and registry-consumer status are recorded in its [receipt](experiments/public-rc24/registry-verification.json). Actual npm tags are `next: 0.1.0-rc.24` and `latest: 0.1.0-rc.18`; npm rejected deletion of the initial `latest` alias. See the [registry receipt](experiments/public-rc18/registry-verification.json) and [publication procedure](PUBLICATION.md). These results are separate from the pending human interpretation gates.

## Prepare and verify one artifact

Use Node 24.22.2 and npm 11.19.1 after `npm ci`. Artifact inspection also uses the system `tar` command:

```sh
npm run check
npm run release:local
```

For an already retained archive, run `npm run release:check`; do not run preparation again under the same version. `npm run check:release-immutability` tests the refusal to overwrite in a temporary fixture. The preparation commands above apply to a new, unprepared candidate version.

`release:local` builds the production library, packs it once into `dist/releases/`, inspects its contents, then supplies byte-identical copies of that tarball to strict declarations, the fresh documentation application, and client/SSR runtime consumers. It does not repack a replacement between checks. Preparation refuses to overwrite an existing candidate archive; recheck it with `release:check` or use a new version for changed package contents. Every consumer receives the candidate SHA-256; a mismatch fails before copying/installing. The release checker verifies the digest again between stages and requires the documentation/runtime reports to identify that exact artifact.

Preserved rc.22 output example (new candidates use their own version):

- `dist/releases/mantha911-ng-echarts-0.1.0-rc.22.tgz` — published rc.22 archive.
- `dist/releases/mantha911-ng-echarts-0.1.0-rc.22.tgz.sha256` — SHA-256 checksum.
- `dist/releases/release-manifest.json` — inventory, hashes, metadata, source snapshot and verification results.
- [Preserved rc.22 evidence](experiments/data/local-release-0.1.0-rc.22.json) — tracked copy of the verified manifest after the check.

Earlier rc.0 artifact results remain preserved in the [NG16 record](experiments/data/ng16-local-release.json). The [rc.1 manifest](experiments/data/local-release-0.1.0-rc.1.json), [rc.2 manifest](experiments/data/local-release-0.1.0-rc.2.json) and [rc.3 manifest](experiments/data/local-release-0.1.0-rc.3.json) are also preserved. Each version writes its own evidence filename. The [rc.4 manifest](experiments/data/local-release-0.1.0-rc.4.json) and archive are preserved; the [rc.5 manifest](experiments/data/local-release-0.1.0-rc.5.json) remains preserved too; the [rc.6 manifest](experiments/data/local-release-0.1.0-rc.6.json) and archive remain unchanged and the [rc.7 manifest](experiments/data/local-release-0.1.0-rc.7.json) and archive remain preserved with subsequent rc.8–rc.12 records retained separately below.

The source snapshot records the base commit and whether local changes were included. File hashes identify the exact artifact content even when a local candidate was prepared from a working tree. Build outputs remain ignored; retain the tarball/checksum together when sharing with another local consumer.

For separate phases or a specific prepared artifact:

```sh
npm run release:prepare
npm run release:check
```

To run an individual checker against a retained candidate, set its absolute path and the digest from its checksum file:

```sh
export CHART_LIBRARY_TARBALL="$PWD/dist/releases/mantha911-ng-echarts-0.1.0-rc.22.tgz"
export CHART_LIBRARY_TARBALL_SHA256="$(cut -d ' ' -f1 "$CHART_LIBRARY_TARBALL.sha256")"
npm run check:consumer
```

The `check:docs` and `check:runtime` scripts accept the same variables. Without a supplied candidate, the ordinary workspace check retains its build-and-pack behavior.

## Verify the published registry package

All three consumer scripts support exact registry installs. The helper verifies the fetched registry tarball before each consumer installs by its exact npm identity. Use rc.23 source (verified publication commit `9ea7c866bf0bf8e9f6ae3551cab0cf08d32218d9`) and the digest from its [registry receipt](experiments/public-rc23/registry-verification.json). Current source intentionally rejects a mismatched registry identity:

```sh
export CHART_LIBRARY_REGISTRY_SPEC="@mantha911/ng-echarts@0.1.0-rc.23"
export CHART_LIBRARY_TARBALL_SHA256="6a68ccc06bf76b6f92803198f23dc4207444fe165c3f7ec4a6b39cc0ace1f246"
npm run check:consumer
npm run check:docs
npm run check:runtime
```

Preserve the published archive, checksum, packaged README/changelog and notice bytes. A change to package contents requires a new candidate version and verification; repository-only documentation updates do not repack rc.18.

## Artifact checklist

The automated candidate check requires:

- Correct public identity/version, `private: false`, explicit npm registry/public access/`next` publish configuration, MIT metadata, description/repository, unchanged Angular/ECharts peer ranges, tslib dependency and `sideEffects: false`.
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
| Local candidate automated checks | rc.24 exact-artifact checks, full local browsers, cross-platform byte comparisons and aggregate Linux CI pass in the [current increment](experiments/NG17_DUAL_AXES.md). Preserved full CI for `0.1.0-rc.22`; [manifest](experiments/data/local-release-0.1.0-rc.22.json), [area report](experiments/NG17_COMPOSED_AREAS.md), [rc.20/rc.21 report](experiments/NG17_STACKED_COMPOSED.md) and published [rc.19 evidence](experiments/RC19_RELEASE_REVIEW.md); rc.16 results remain preserved in the [combined checkpoint](experiments/COMBINED_PREVIEW_PERFORMANCE.md) |
| Original library license | MIT selected by the user; full text ships in the candidate |
| Human interpretation, F09/R06 | Pending; complete the [current result sheet](experiments/RC20_HUMAN_REVIEW.md) following the [manual review](experiments/R06_MANUAL_REVIEW.md) across every family |
| NG14/G2/G3/G4 acceptance | Pending until the required human evidence exists; successful artifact checks do not close these gates |
| Public package name/namespace | Published `@mantha911/ng-echarts@0.1.0-rc.24`; [NG22 execution](PUBLICATION.md) |
| Registry destination/publishing credentials | Authenticated as `mantha911` after interactive npm login ([record](PUBLICATION.md)) |
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


The [first public prerelease](experiments/NG22_PUBLIC_PRERELEASE.md#completed-publication) is verified against registry bytes and fresh registry consumers. npm retained its initial `latest` alias alongside `next`; the [publication record](PUBLICATION.md#first-publication-result) records the rejected removal. Human F09/R06/G2/G3/G4 remain pending under the user’s explicit experimental-prerelease exception.

## Preserved rc.19 delivery checkpoint

The [performance follow-up](experiments/PERFORMANCE_FOLLOW_UP.md) introduced `0.1.0-rc.19`. Its [delivery checkpoint](experiments/RC19_RELEASE_REVIEW.md) records the prepared immutable archive, exact consumer checks, overwrite refusal and publication status. Earlier rc.18 receipts remain historical published evidence. Preserve rc.18 and all earlier archives, and prepare a distinct new artifact before any future publication. To recheck the published rc.18 registry receipt with the exact-source-identity guard, use the matching rc.18 source checkout.


## rc.20 named composed stacks

That checkpoint targeted documentation-corrected `0.1.0-rc.21` for [named composed stacks](experiments/NG17_STACKED_COMPOSED.md). Preserve the verified rc.19 archive/checksum/versioned manifest; never repack or overwrite it for the new API. The rc.20 runtime is preserved in a documentation-only rc.21 successor; the report owns exact-artifact results. rc.21 was subsequently published; its registry receipt is linked above. Human interpretation and G2/G3/G4 remain pending; the user explicitly continued the listening deferral on 15 November.


## rc.22 composed areas and trusted publishing

The [area increment](experiments/NG17_COMPOSED_AREAS.md) records the published rc.22 contract and passing exact-artifact consumers; [manifest](experiments/data/local-release-0.1.0-rc.22.json). Full CI, OIDC upload and verification-only registry consumer recovery pass. Preserve published rc.22, rc.21 and all earlier archives. rc.22 was prepared after its packaged README/changelog and runtime were finalized. The publish mode of the [trusted publishing workflow](../.github/workflows/publish-prerelease.yml) can use only an exact reviewed artifact from fully successful CI for its own main commit; no push/tag automatically publishes a package. npm registration is read back, OIDC upload succeeds and verification-only registry consumers pass; [publication record](PUBLICATION.md#rc22-oidc-publication). Human interpretation remains deferred.


## rc.23 publication and rc.24 preparation

[rc.23 publication](experiments/RC23_PUBLICATION.md) completes exact CI-artifact OIDC delivery and fresh registry consumers. Both differing rc.23 archives remain preserved. [rc.24](experiments/NG17_DUAL_AXES.md) adds explicit declaration types and independent value axes; its warm/two-clean/cross-platform comparisons pass. The original implementation increment did not authorize publication; the user's 16 November continuation authorizes the separate [rc.24 delivery](experiments/RC24_PUBLICATION.md). Preserve the exact archive. Human interpretation remains pending.
