# Public package preparation (NG22)

Status: preparation in progress; no registry publication. The verified local identity remains private `@ng-echarts/chart-library`. Public identity selection, registry ownership and human release acceptance remain outstanding.

## Registry checks

Checked 14 November 2026 with npm 11.19.1 against `https://registry.npmjs.org`:

| Check | Observed result | Meaning |
| --- | --- | --- |
| `npm whoami --registry=https://registry.npmjs.org` | HTTP 401 | Current credentials cannot authenticate; account identity and publishing rights are unverified |
| `npm view @phalla-doll/ng-echarts name version --json --registry=https://registry.npmjs.org` | HTTP 404 | No publicly readable package found; this does not establish scope ownership or reserve the name |
| `npm view @ng-echarts/chart-library name version --json --registry=https://registry.npmjs.org` | HTTP 404 | No publicly readable package found; scope ownership remains unverified |

Recommended public target for user selection: `@phalla-doll/ng-echarts` on npm. The GitHub account name alone does not establish an npm account or scope. Retain the current private imports until the chosen npm owner can authenticate and confirm rights to the selected scope.

## Concrete publication sequence

1. Record the chosen name, registry and owning npm user/organization. Authenticate interactively using `npm login --registry=https://registry.npmjs.org` and confirm identity with `npm whoami`. Keep credentials out of the repository and evidence files.
2. Complete the [human interpretation result sheet](experiments/RC17_HUMAN_REVIEW.md), fix recorded failures, and reconcile F09/R06/G2/G3/G4 in the [release checklist](RELEASE_CHECKLIST.md). Human gates remain required by the repository workflow.
3. Prepare a new public candidate under the selected identity. Update package metadata, workspace aliases, focused imports, copied examples, strict/negative consumers and documentation together. Adapt the current private-only artifact inspector to the public contract as a deliberate change. Preserve rc.17 and earlier private archives; changing a manifest creates a different artifact requiring its own verification.
4. Run the complete workspace/browser/static checks and exact-artifact consumer verification for that public candidate. Record its inventory, source commit, checksum and MIT/upstream notices. Declare the experimental API/versioning policy before publication.
5. From the exact verified public tarball, inspect `npm publish /absolute/path/to/verified-public-candidate.tgz --dry-run --access public --tag next --ignore-scripts --registry=https://registry.npmjs.org`. A successful dry run does not establish publishing rights. Use `next` for the prerelease rather than changing `latest`.
6. Publish that same tarball using the reviewed destination and tag after release acceptance. Verify the registry integrity/version/dist-tag, then install the registry package in a fresh consumer and repeat the documented build and hydration flow.

The existing private candidate is intentionally not converted in place or sent to npm. No executable publishing workflow is enabled before a concrete public identity and accepted artifact exist.

## CI publishing setup

Prefer npm trusted publishing from this repository's GitHub Actions workflow when the chosen owner has configured it in npm package settings. The configuration must match the GitHub owner, repository and workflow filename; grant that job `id-token: write`. npm uses short-lived credentials and automatically supplies provenance on supported GitHub-hosted runners. Initial account/package setup still requires the owning npm account. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

Scoped public packages require public access on first publication; see [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/). Keep the manual prerelease path above reviewable before enabling later registry automation.
