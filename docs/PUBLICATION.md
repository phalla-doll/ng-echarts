# Public package preparation (NG22)

Status: public candidate preparation in progress. The user selected `@mantha911/ng-echarts`, authenticated as npm user `mantha911`, and requested completing the experimental prerelease while skipping the guided VoiceOver session. Human F09/R06/G2/G3/G4 remain pending; that explicit deferral permits this prerelease without claiming completed human interpretation. Private `@ng-echarts/chart-library@0.1.0-rc.17` and earlier archives retain their identities.

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
