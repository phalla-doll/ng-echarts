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


## Completed publication

`@mantha911/ng-echarts@0.1.0-rc.18` is readable and installable from npm. [Registry verification](public-rc18/registry-verification.json) confirms that the public tarball, local canonical archive and archive produced by the green Linux CI run have identical SHA-256 `7a341195044fd031183da0c4d41f16f087dc1b2189b03819644d67b7287fe47c`.

Fresh consumers installed by the exact registry identity after checking the fetched archive against that digest: strict positive/negative compilation passed, [documented installation and hydration](public-rc18/registry-ng15-documentation-consumer.json) passed all three engines, and [client/SSR runtime modes](public-rc18/registry-packed-runtime.json) passed all six modes. The source [CI run](https://github.com/phalla-doll/ng-echarts/actions/runs/43603889528) passed every workspace, browser, Pages/performance and aggregate job. Local checks recorded 267 unit tests and 416 browser passes with four expected skips; the updated installation/code/typography pages also passed 21 focused cases after the public-install text was finalized.

npm retained an initial `latest` alias in addition to the requested `next` tag and rejected its deletion with HTTP 400. [The publication guide](../PUBLICATION.md#first-publication-result) documents this registry limitation; the prerelease version and experimental status remain explicit. Earlier private archives and human gates retain their prior status.


## Final availability-copy review

The shared gallery and linked-page footers now link to the npm prerelease installation instructions. Line, pie, radar, radial, calendar and Sankey introductions and the architecture/workflow summaries identify the public package while retaining their historical private-origin versions. Current guides and app text no longer claim that npm installation is unavailable.

Strict compilation and 42 gallery/linked/documentation browser cases passed in Chromium, Firefox and WebKit. The [capture manifest](public-rc18/footer-captures.json) records the live a3f2a86 footer and local follow-up at the same viewport; [before](public-rc18/footer-before.png) and [after](public-rc18/footer-after.png) were visually inspected. This changes demo/docs copy only; the published tarball remains byte-identical to the verified archive.
