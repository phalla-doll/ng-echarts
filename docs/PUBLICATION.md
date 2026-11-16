# Public package publication and verification (NG22)

Status: `@mantha911/ng-echarts@0.1.0-rc.24` is published on npm under `next`; `latest` retains rc.18. The rc.24 receipt and consumer status are recorded below. The user selected `@mantha911/ng-echarts`, authenticated as npm user `mantha911`, and requested completing the experimental prerelease while skipping the guided VoiceOver session. Human F09/R06/G2/G3/G4 remain pending; that explicit deferral permits this prerelease without claiming completed human interpretation. Private `@ng-echarts/chart-library@0.1.0-rc.17` and earlier archives retain their identities.

## Historical checks before publication

Checked 14 November 2026 with npm 11.19.1 against `https://registry.npmjs.org`:

| Check | Observed result | Meaning |
| --- | --- | --- |
| `npm whoami --registry=https://registry.npmjs.org` | HTTP 401 | Initial result before interactive login; superseded by the successful authenticated publication below |
| `npm view @phalla-doll/ng-echarts name version --json --registry=https://registry.npmjs.org` | HTTP 404 | No publicly readable package found; this does not establish scope ownership or reserve the name |
| `npm view @mantha911/ng-echarts name version --json --registry=https://registry.npmjs.org` | HTTP 404 | Pre-creation result; the selected personal scope and successful publication are verified below |

Follow-up: interactive npm login succeeded as `mantha911`; the `phalla-doll` organization lookup returned Scope not found. The user then selected the matching personal scope `@mantha911/ng-echarts`. The package lookup returned 404 before creation; no previously readable package was found.

## Concrete publication sequence

1. Record the chosen name, registry and owning npm user/organization. Authenticate interactively using `npm login --registry=https://registry.npmjs.org` and confirm identity with `npm whoami`. Keep credentials out of the repository and evidence files.
2. Preserve the [human interpretation result sheet](experiments/RC17_HUMAN_REVIEW.md) as pending under the user’s explicit 14 November deferral. Future full release acceptance still requires the listening evidence; this experimental prerelease is the recorded exception.
3. Prepare a new public candidate under the selected identity. Update package metadata, workspace aliases, focused imports, copied examples, strict/negative consumers and documentation together. Validate the public metadata contract with the artifact inspector: identity/version, `private: false`, explicit npm registry/public access/`next`, exports, peers, licenses and notices. Preserve rc.17 and earlier private archives; changing a manifest creates a different artifact requiring its own verification.
4. Run the complete workspace/browser/static checks and exact-artifact consumer verification for that public candidate. Record its inventory, source commit, checksum and MIT/upstream notices. Declare the experimental API/versioning policy before publication.
5. From the exact verified public tarball, inspect `npm publish /absolute/path/to/verified-public-candidate.tgz --dry-run --access public --tag next --ignore-scripts --registry=https://registry.npmjs.org`. A successful dry run does not establish publishing rights. Request `next` explicitly. On first publication npm can also create its initial `latest` alias; read back actual tags and do not assume that alias can be deleted.
6. Publish that same tarball using the reviewed destination and tag after automated verification and the applicable release decision. The rc.18 experimental exception preserves the user’s human-review deferral; it does not close full release acceptance. Verify the registry integrity/version/dist-tag, then install the registry package in a fresh consumer and repeat the documented build and hydration flow.

The existing private candidate is intentionally not converted in place or sent to npm. The first publication uses the exact checked tarball and manual npm authentication. Future CI publishing can use trusted publishing after npm package settings are configured.

## CI publishing setup

Prefer npm trusted publishing from this repository's GitHub Actions workflow when the chosen owner has configured it in npm package settings. The configuration must match the GitHub owner, repository and workflow filename; grant that job `id-token: write`. npm uses short-lived credentials and automatically supplies provenance on supported GitHub-hosted runners. Initial account/package setup still requires the owning npm account. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Scoped public packages require public access on first publication; see [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/). Keep the manual prerelease path above reviewable before enabling later registry automation.


## First publication result

Published 14 November 2026 from the exact checked archive after [all release-source CI jobs passed](https://github.com/phalla-doll/ng-echarts/actions/runs/43603889528). The [registry receipt](experiments/public-rc18/registry-verification.json) binds npm’s integrity and downloaded bytes to the canonical SHA-256, with fresh strict/docs/client/SSR consumers installing by registry name in all three engines.

```sh
npm install @mantha911/ng-echarts@next echarts@6.1.0
```

npm accepted the upload with HTTP 202 before it became installable. [Publish-time scanning can delay availability](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/); no duplicate publish was attempted.

The observed tags are `next: 0.1.0-rc.18` and `latest: 0.1.0-rc.18`. Despite publishing explicitly with `--tag next`, npm bootstrapped `latest` for this first version and rejected `npm dist-tag rm ... latest` with HTTP 400 after authentication. This [first-publication behavior is recorded in npm’s issue tracker](https://github.com/npm/cli/issues/8490). No substitute stable version was created. This remains an experimental prerelease; install `@next` or pin the exact version. Future publishing must inspect actual tags rather than assume the initial `latest` alias can be removed.

Human F09/R06/G2/G3/G4 remain pending under the user’s explicit deferral. This publication does not claim a stable API or completed human interpretation. Trusted-publishing automation remains an optional future setup; this first publication used interactive npm authentication.

## Source follow-up after rc.18

The current published source is `0.1.0-rc.24` for [explicit value axes](experiments/NG17_DUAL_AXES.md), following [rc.23](experiments/RC23_PUBLICATION.md) horizontal composition, after the preserved [rc.19 delivery checkpoint](experiments/RC19_RELEASE_REVIEW.md). These follow-up reports own their actual publication status; this does not change the rc.18 registry receipt, tags or archived bytes above. New package contents must use the new version and receive their own artifact checks and publication decision.


## rc.19 publication

Published 15 November 2026 from the exact [verified rc.19 candidate](experiments/RC19_RELEASE_REVIEW.md), using npm browser authentication as `mantha911`. Registry bytes match SHA-256 `85fd51a061557f6a33255c77581add6d1868ca47f45334f182d178953f5d38ba`. The [registry receipt](experiments/public-rc19/registry-verification.json) records actual tags: `next: 0.1.0-rc.19`, `latest: 0.1.0-rc.18`. npm accepted the publish before cached registry metadata exposed it; no duplicate upload was attempted. The receipt owns the fresh registry-consumer results. Preserve published rc.19, rc.18 and earlier archives. Human F09/R06/G2/G3/G4 remain pending under the user's continued deferral.


## rc.21 publication

The user authorized publishing the already verified rc.21 archive on 15 November. Its registry bytes match canonical SHA-256 `3b7b4af12f77af6065c10f27e175a84763c22a9409b9317c4711f114b691af11`. The [receipt](experiments/public-rc21/registry-verification.json) records `next: 0.1.0-rc.21`, `latest: 0.1.0-rc.18` and passing fresh registry declarations/docs/client/SSR consumers in three engines. The implementation [CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43687220519) passed before publication. No archive was repacked or replaced. This releases named bar stacks; area composition is a new rc.22 increment. Human release gates remain pending under the continued deferral.

## Trusted-publishing workflow

The publish mode of the manual [workflow](../.github/workflows/publish-prerelease.yml) accepts an exact version, reviewed SHA-256 and successful Workspace checks run ID. It requires the checked-out main commit to match that run, downloads its retained verified artifact, inspects source metadata/notices and exact consumer-stage results, and publishes those bytes with OIDC/provenance under `next`. It never repacks a replacement. Registry bytes/tags and fresh consumers are verified afterward; an already readable version cannot be republished. An accepted upload awaiting registry scanning is never retried automatically.

The publishing job uses GitHub-hosted Ubuntu with `id-token: write`, no stored npm publishing token, and the `npm-prerelease` environment. The registered npm trust mapping is repository `phalla-doll/ng-echarts`, filename `publish-prerelease.yml`, environment `npm-prerelease`, direct publishing allowed. The environment permits main only. Manual dispatch does not run on pushes or pull requests. [Guard tests](../tools/prerelease-guards.spec.mjs) cover unaccepted sources/runs, altered hashes and incomplete candidate evidence. [npm registration](experiments/trusted-publishing/npm-registration.json) was read back, and the first OIDC upload succeeded. The first post-upload consumer step encountered metadata propagation; verification recovery is recorded below.

Official references: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm trust CLI](https://docs.npmjs.com/cli/v11/commands/npm-trust/). The pinned CLI supports trust commands; an authenticated listing returned no configured publisher before setup.

## rc.22 OIDC publication

[Publishing run](https://github.com/phalla-doll/ng-echarts/actions/runs/43691186511) published the reviewed rc.22 archive exactly once with GitHub OIDC and npm provenance, after the full [CI run](https://github.com/phalla-doll/ng-echarts/actions/runs/43690113895) passed for the same source commit. The [registry receipt](experiments/public-rc22/registry-verification.json) records SHA-256 `d1e9d2afdb720293ead15274b8302363b4dab86f14bf2d9c637f992b0e2f0a87`, `next: rc.22` and unchanged `latest: rc.18`.

The upload and exact-byte checks passed; the run then failed when the normal npm packument still returned ETARGET to the first consumer. No second upload was attempted. The workflow now waits for bounded read-only npm resolution, validates the downloaded digest and supports `operation=verify` to rerun consumers without calling the publisher. Unexpected authentication/other errors fail immediately. The first [verification-only run](https://github.com/phalla-doll/ng-echarts/actions/runs/43691683904) passed npm resolution, then caught a repository Installation-status wording mismatch. That copy is corrected and local registry declarations pass; the final [verification-only run](https://github.com/phalla-doll/ng-echarts/actions/runs/43691971304) passes all registry declarations/docs/client/SSR consumers across three engines. Publication steps were skipped; recovery made zero uploads. The [receipt](experiments/public-rc22/registry-verification.json) retains these outcomes. Human F09/R06/G2/G3/G4 remain pending under the continued deferral.

To repeat read-only rc.22 registry verification, select the workflow’s `verify` operation, or run:

```sh
gh workflow run publish-prerelease.yml --ref main \
  -f operation=verify -f version=0.1.0-rc.22 \
  -f sha256=d1e9d2afdb720293ead15274b8302363b4dab86f14bf2d9c637f992b0e2f0a87
```

For a future new publication, use `operation=publish` with the new source version, reviewed archive digest and successful full CI run ID for that exact main commit. Published versions remain immutable.

## rc.23 OIDC publication

The user authorized rc.23 delivery from the exact successful main CI artifact. [Full CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43728864141) and [OIDC publication](https://github.com/phalla-doll/ng-echarts/actions/runs/43730083266) pass for source `9ea7c866bf0bf8e9f6ae3551cab0cf08d32218d9`. Canonical registry SHA-256 is `6a68ccc06bf76b6f92803198f23dc4207444fe165c3f7ec4a6b39cc0ace1f246`; the [receipt](experiments/public-rc23/registry-verification.json) records `next: rc.23` and unchanged `latest: rc.18`. Bounded normal npm resolution, strict declarations/negative bindings, fresh docs and all six client/SSR runtime modes pass after a single upload. [Publication report](experiments/RC23_PUBLICATION.md).

The preserved macOS rc.23 candidate has a distinct digest because two inferred declaration union occurrences have reversed member order. The selected CI archive is separately preserved and was uploaded without repacking or substituting the macOS digest. Runtime files and all other members match. Both archives and all prior releases remain immutable. rc.24 explicitly stabilizes these declarations and adds new APIs; it was separate unpublished source work at the rc.23 checkpoint and is delivered below. Human F09/R06/G2/G3/G4 remain deferred/pending.

## rc.24 OIDC publication

The user authorized rc.24 delivery on 16 November. The [publication report](experiments/RC24_PUBLICATION.md) records exact-main CI `43737237117`, source `0593f344c904b11373c2c93ed5da117ed91258bb`, and [OIDC run 43788004335](https://github.com/phalla-doll/ng-echarts/actions/runs/43788004335). The reviewed 170,430-byte archive has SHA-256 `6dd89361c4f6482b28b9a3f28d88bddf28a71eac9123ec1a8412517995d4c46f`; registry bytes match, next selects rc.24 and latest retains rc.18. The [registry receipt](experiments/public-rc24/registry-verification.json) and [delivery report](experiments/RC24_PUBLICATION.md) record passing strict declarations, documentation and all six client/SSR runtime consumers. Runtime/declarations, packaged documentation and all earlier archives remain immutable. Demo delivery is separate; human F09/R06/G2/G3/G4 remain deferred/pending.
