# rc.24 experimental publication and demo delivery

Date: 16 November 2026. The user accepted the next-step recommendation to deliver rc.24 and reconcile current documentation. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Exact package delivery

The [OIDC publishing workflow](https://github.com/phalla-doll/ng-echarts/actions/runs/43788004335) uploads the preserved `@mantha911/ng-echarts@0.1.0-rc.24` archive from successful exact-main [CI 43737237117](https://github.com/phalla-doll/ng-echarts/actions/runs/43737237117), source `0593f344c904b11373c2c93ed5da117ed91258bb`. All six CI jobs pass. The artifact is 170,430 bytes, with 68 members and SHA-256 `6dd89361c4f6482b28b9a3f28d88bddf28a71eac9123ec1a8412517995d4c46f`; it matches the preserved macOS and earlier Linux candidates. No archive is repacked or overwritten. CI manifests retain their actual `includesWorkingTree: true` evidence state.

The upload, registry-byte verification and bounded normal npm resolution pass. Fresh strict declarations/negative bindings, documentation hydration and all six client/SSR runtime modes pass. The [registry receipt](public-rc24/registry-verification.json), [npm resolution](public-rc24/npm-resolution.json), [documentation consumer](public-rc24/documentation-consumer.json), [runtime consumers](public-rc24/packed-runtime.json), [workflow](public-rc24/publishing-workflow.json) and [provenance](public-rc24/provenance-statement.json) preserve the results. The [updated repository installation guide](public-rc24/updated-documentation-consumer.json) also passes a fresh local registry build/hydration flow in all three engines. Actual tags are `next: rc.24` and unchanged `latest: rc.18`. One publish dispatch was made; no duplicate upload was attempted. The [implementation report](NG17_DUAL_AXES.md) preserves the 335-unit/476-browser passing baseline, cross-platform reproduction, visual evidence and earlier failed test-probe corrections.

## Demo and documentation

Repository installation/API/status summaries and demo copy now identify published rc.24, including independent composed value axes. The packaged README/changelog, library runtime/declarations and all earlier archives are preserved. The packaged README's candidate wording records its preparation-time state; consult the repository publication record for current registry status.

The new demo deployment and its public three-browser verification are pending. The previous deployment remains source `8dd7619` until the guarded clean-source deployment succeeds. [GitHub Pages](../GITHUB_PAGES.md) owns deployment identity separately from the package source above.

## Subsequent work

The unchanged combined-root gzip budget has only 15 bytes of headroom at the rc.24 checkpoint. Reduce payload in a new version before adding shared zoom or bidirectional selection; retain focused lazy registration, existing limits and immutable rc.24 bytes. Advanced tooltip templates and decorative effects remain later scope. Human listening and full release acceptance remain pending under the existing deferral.

## Delivery-source correction

The first delivery-source [CI run 43788704313](https://github.com/phalla-doll/ng-echarts/actions/runs/43788704313), source `beeb4bb494b04c43808d424134529e2255b3fec7`, fails the strict consumer status-copy guard: the revised installation page says “Published 0.1.0-rc.24” while the existing contract recognizes “public 0.1.0-rc.24 candidate”. This run is excluded from complete-CI passing evidence. Restore the accurate experimental-public-candidate wording without weakening the guard. The corrected [strict registry consumer](public-rc24/corrected-strict-consumer.txt) passes locally with `skipLibCheck: false`; library/package bytes are unchanged. The guarded demo rebuild and new full CI remain separate verification steps.
