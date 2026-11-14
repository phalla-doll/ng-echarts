# Public package preparation (NG22)

Status: `@mantha911/ng-echarts@0.1.0-rc.18` is published and verified on npm under `next`. The user selected `@mantha911/ng-echarts`, authenticated as npm user `mantha911`, and requested completing the experimental prerelease while skipping the guided VoiceOver session. Human F09/R06/G2/G3/G4 remain pending; that explicit deferral permits this prerelease without claiming completed human interpretation. Private `@ng-echarts/chart-library@0.1.0-rc.17` and earlier archives retain their identities.

## Registry checks

Checked 14 November 2026 with npm 11.19.1 against `https://registry.npmjs.org`:

| Check | Observed result | Meaning |
| --- | --- | --- |
| `npm whoami --registry=https://registry.npmjs.org` | HTTP 401 | Current credentials cannot authenticate; account identity and publishing rights are unverified |
| `npm view @phalla-doll/ng-echarts name version --json --registry=https://registry.npmjs.org` | HTTP 404 | No publicly readable package found; this does not establish scope ownership or reserve the name |
| `npm view @mantha911/ng-echarts name version --json --registry=https://registry.npmjs.org` | HTTP 404 | No publicly readable package found; scope ownership remains unverified |

Follow-up: interactive npm login succeeded as `mantha911`; the `phalla-doll` organization lookup returned Scope not found. The user then selected the matching personal scope `@mantha911/ng-echarts`. The package lookup returned 404 before creation; no previously readable package was found.

## Concrete publication sequence

1. Record the chosen name, registry and owning npm user/organization. Authenticate interactively using `npm login --registry=https://registry.npmjs.org` and confirm identity with `npm whoami`. Keep credentials out of the repository and evidence files.
2. Preserve the [human interpretation result sheet](experiments/RC17_HUMAN_REVIEW.md) as pending under the user’s explicit 14 November deferral. Future full release acceptance still requires the listening evidence; this experimental prerelease is the recorded exception.
3. Prepare a new public candidate under the selected identity. Update package metadata, workspace aliases, focused imports, copied examples, strict/negative consumers and documentation together. Adapt the current private-only artifact inspector to the public contract as a deliberate change. Preserve rc.17 and earlier private archives; changing a manifest creates a different artifact requiring its own verification.
4. Run the complete workspace/browser/static checks and exact-artifact consumer verification for that public candidate. Record its inventory, source commit, checksum and MIT/upstream notices. Declare the experimental API/versioning policy before publication.
5. From the exact verified public tarball, inspect `npm publish /absolute/path/to/verified-public-candidate.tgz --dry-run --access public --tag next --ignore-scripts --registry=https://registry.npmjs.org`. A successful dry run does not establish publishing rights. Use `next` for the prerelease rather than changing `latest`.
6. Publish that same tarball using the reviewed destination and tag after release acceptance. Verify the registry integrity/version/dist-tag, then install the registry package in a fresh consumer and repeat the documented build and hydration flow.

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
