# NG22 experimental public prerelease

Prepared 14 November 2026. The user selected `@mantha911/ng-echarts` after interactive npm login returned user `mantha911`. The user explicitly requested skipping the guided VoiceOver session and continuing the experimental prerelease. Human F09/R06/G2/G3/G4 remain pending; no listening result or stable API claim is supplied.

## Package contract

- Identity: `@mantha911/ng-echarts@0.1.0-rc.18`, public access, `next` dist-tag, registry `https://registry.npmjs.org/`.
- Current imports, focused exports, workspace aliases, copied examples and strict/negative consumers use the public identity. Earlier private candidate reports and archives retain the original identity and bytes.
- The MIT license, Angular/ECharts peer contracts, upstream notice bytes and experimental API semantics are preserved. The Angular notice is a non-executable text asset; its source mode is normalized to 0644 without changing its content.
- Candidate preparation packs into temporary storage and refuses to replace an existing archive. The fixture check confirms repeated preparation leaves archive, checksum and manifest unchanged.

## Exact artifact verification

The [candidate manifest](data/local-release-0.1.0-rc.18.json) records a 155,890-byte archive with SHA-256 `7a341195044fd031183da0c4d41f16f087dc1b2189b03819644d67b7287fe47c`. Strict declarations/negative bindings, copied examples, fresh documented installation and all six independently installed client/SSR modes passed against that exact file. [Documented install evidence](public-rc18/ng15-documentation-consumer.json) and [runtime evidence](public-rc18/packed-runtime.json) preserve this run separately from earlier receipts.

The renamed copied line/area example generators resolve their focused imports; installed strict compilation checks those generated applications. The [bundle report](public-rc18/package-boundaries.json) passes all twelve scenarios with unchanged focused/core/root caps. The full browser suite and CI validate the renamed source; actual outcomes are recorded in the release execution receipt and [Actions](https://github.com/phalla-doll/ng-echarts/actions/workflows/ci.yml?query=branch%3Amain).

## Registry verification procedure

After the complete release checks pass, dry-run and publish the same archive with explicit public access and `next`. Compare registry SHA-512 integrity and the downloaded archive SHA-256 to the verified candidate. Run the strict, documented and client/SSR consumers with `CHART_LIBRARY_REGISTRY_SPEC=@mantha911/ng-echarts@0.1.0-rc.18` and `CHART_LIBRARY_TARBALL_SHA256` set to that candidate digest. This mode checks the downloaded registry tarball before installing by its exact registry identity in the fresh consumer.

The [publication guide](../PUBLICATION.md) records the manual first-publication path and later trusted-publishing setup. The [human result sheet](RC17_HUMAN_REVIEW.md) remains pending under the user’s explicit deferral.
