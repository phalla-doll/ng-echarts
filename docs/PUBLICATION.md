# Public package publication and verification (NG22)

Status: `@mantha911/ng-echarts@0.1.0-rc.21` is published on npm under `next`; `latest` retains rc.18. The rc.21 receipt and consumer status are recorded below. The user selected `@mantha911/ng-echarts`, authenticated as npm user `mantha911`, and requested completing the experimental prerelease while skipping the guided VoiceOver session. Human F09/R06/G2/G3/G4 remain pending; that explicit deferral permits this prerelease without claiming completed human interpretation. Private `@ng-echarts/chart-library@0.1.0-rc.17` and earlier archives retain their identities.

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

## Unreleased source after rc.18

The working tree now targets `0.1.0-rc.22` for [composed areas](experiments/NG17_COMPOSED_AREAS.md), after the preserved [rc.19 delivery checkpoint](experiments/RC19_RELEASE_REVIEW.md). These follow-up reports own their actual publication status; this does not change the rc.18 registry receipt, tags or archived bytes above. New package contents must use the new version and receive their own artifact checks and publication decision.


## rc.19 publication

Published 15 November 2026 from the exact [verified rc.19 candidate](experiments/RC19_RELEASE_REVIEW.md), using npm browser authentication as `mantha911`. Registry bytes match SHA-256 `85fd51a061557f6a33255c77581add6d1868ca47f45334f182d178953f5d38ba`. The [registry receipt](experiments/public-rc19/registry-verification.json) records actual tags: `next: 0.1.0-rc.19`, `latest: 0.1.0-rc.18`. npm accepted the publish before cached registry metadata exposed it; no duplicate upload was attempted. The receipt owns the fresh registry-consumer results. Preserve published rc.19, rc.18 and earlier archives. Human F09/R06/G2/G3/G4 remain pending under the user's continued deferral.


## rc.21 publication

The user authorized publishing the already verified rc.21 archive on 15 November. Its registry bytes match canonical SHA-256 `3b7b4af12f77af6065c10f27e175a84763c22a9409b9317c4711f114b691af11`. The [receipt](experiments/public-rc21/registry-verification.json) records `next: 0.1.0-rc.21`, `latest: 0.1.0-rc.18` and passing fresh registry declarations/docs/client/SSR consumers in three engines. The implementation [CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43687220519) passed before publication. No archive was repacked or replaced. This releases named bar stacks; area composition is a new rc.22 increment. Human release gates remain pending under the continued deferral.

## Trusted-publishing workflow

The manual [workflow](../.github/workflows/publish-prerelease.yml) accepts an exact version, reviewed SHA-256 and successful Workspace checks run ID. It requires the checked-out main commit to match that run, downloads its retained verified artifact, inspects source metadata/notices and exact consumer-stage results, and publishes those bytes with OIDC/provenance under `next`. It never repacks a replacement. Registry bytes/tags and fresh consumers are verified afterward; an already readable version cannot be republished. An accepted upload awaiting registry scanning is never retried automatically.

The publishing job uses GitHub-hosted Ubuntu with `id-token: write`, no stored npm publishing token, and the `npm-prerelease` environment. The intended npm trust mapping is repository `phalla-doll/ng-echarts`, filename `publish-prerelease.yml`, environment `npm-prerelease`, direct publishing allowed. The environment is intended to allow main only. Manual dispatch does not run on pushes or pull requests. [Guard tests](../tools/prerelease-guards.spec.mjs) cover unaccepted sources/runs, altered hashes and incomplete candidate evidence. Registration and first OIDC publication remain pending until their actual results are recorded; a workflow file alone does not establish working trust.

Official references: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm trust CLI](https://docs.npmjs.com/cli/v11/commands/npm-trust/). The pinned CLI supports trust commands; an authenticated listing returned no configured publisher before setup.
