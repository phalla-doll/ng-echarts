# Related documentation reconciliation

Date: 16 November 2026. The user requested checking that related documentation is covered and current after rc.28 publication and the rc.29/shared-window delivery.

## Coverage

- README/document index, installation, publication and release checklist: published rc.28 under next, latest rc.18, unpublished verified rc.29, exact candidate/registry evidence and final verifier CI `43825201013`.
- Product scope, architecture, integration, compatibility, research/R&D, backlog, implementation plan and acceptance matrix: published horizontal/value-axis/legend/table features, application-owned dashboard window and remaining general-purpose library zoom/graphical linking scope. Historical increment evidence remains labelled and preserved.
- Bar/line/area/composed/pie guides: published rc.28 legend availability and shared input documentation. Calendar/Sankey guides: published default-true table opt-outs. Radar/radial/calendar introductions: current published identity with historical introduction versions retained. Legacy heading anchors remain supported.
- Linked and composed dashboard guides: range/preview versus shared-window examples, full-history trend calculation, native zoom/pan/reset, device/month selection, feedback and exact published-rc.22 standalone baseline.
- Demo installation/component paragraphs: next rc.28/latest rc.18, source candidate rc.29 and the actual legend-layout scope.
- [Packaged errata](../PACKAGED_DOCUMENTATION_ERRATA.md): frozen rc.28/rc.29 README availability statements, without changing any package contents. The source radar template does not apply the inherited list-layout class; its chip-only presentation is recorded in the API/spec/backlog rather than claimed complete.

## Verification

[1,956 local links/anchors across 107 Markdown documents](documentation-audit/links.json) pass. Prettier and `git diff --check` pass. All [strict positive/negative documented examples](documentation-audit/strict-consumer.txt) compile against the digest-verified rc.29 archive with `skipLibCheck: false`. The [complete documented installation](documentation-audit/documented-install.txt) builds and hydrates in all three engines. All [six demo documentation/code browser cases](documentation-audit/browser-examples.txt) pass.

The [archive checks](documentation-audit/archives.json) retain canonical rc.28 `f556a3d25e766a4c4fb2ec343ae0bad6d57d868a0d97fd393c27e206c485d396` and rc.29 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`; `projects/chart-library` has no source changes. Package version, README/changelog, runtime, declarations and all earlier archives remain unchanged. npm publication is outside this repository/demo documentation correction. Human F09/R06/G2/G3/G4 remain deferred/pending.

The initial audit commit reused the historical rc.11 report filename; the follow-up restores that report byte-for-byte and records this audit separately. Its first local static check passed all three engines, but the obsolete performance run was stopped before correcting the source and CI `43830525290` was cancelled as superseded. Use the completed source verification and deployment below.

## Documentation deployment

Clean source `d188d59f07d299424814b39024160651ba7e0a5d` is deployed as static commit `8e29fd8eeee03ba83d1dbacc72faa3d634a906a6`, sealed SHA-256 `5dac8b379fda6c2fc60ab780d4d63ca821b143d7562a3246e71c260b1c452801`. [Pages run 43831211803](https://github.com/phalla-doll/ng-echarts/actions/runs/43831211803) succeeds. All 40 routes/145 files pass local/public checks in Chromium, Firefox and WebKit; all seventeen performance guards and normal-motion navigation pass. The live installation page names rc.28/rc.29 correctly, and the component page records the radar limitation. [Deployment](documentation-audit/deployed/deployment.json), [exact marker](documentation-audit/deployed/preview-build.txt), [receipt](documentation-audit/deployed/preview-verification.txt), [public checks](documentation-audit/deployed/public-verification.txt), [performance](documentation-audit/deployed/performance.json), [installation copy](documentation-audit/deployed/live-installation.txt), [component copy](documentation-audit/deployed/live-components.txt).

Receipt-only repository updates preserve this deployed source. Package/archive versions and human gates remain unchanged.

## Completed source verification

[CI 43830706126](https://github.com/phalla-doll/ng-echarts/actions/runs/43830706126) passes all six jobs for corrected source `d188d59f07d299424814b39024160651ba7e0a5d`: 342 unit tests, 488 browser passes/four expected skips, the WebKit horizontal probe, exact consumers, reproducibility and Pages/performance guards. Its [independent candidate](documentation-audit/ci-artifact.json) retains canonical rc.29 bytes; documentation changes do not alter the package. Historical rc.11 reconciliation and every archived artifact remain preserved.
