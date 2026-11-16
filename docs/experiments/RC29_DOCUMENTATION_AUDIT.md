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

[1,935 local links/anchors across 106 Markdown documents](documentation-audit/links.json) pass. Prettier and `git diff --check` pass. All [strict positive/negative documented examples](documentation-audit/strict-consumer.txt) compile against the digest-verified rc.29 archive with `skipLibCheck: false`. The [complete documented installation](documentation-audit/documented-install.txt) builds and hydrates in all three engines. All [six demo documentation/code browser cases](documentation-audit/browser-examples.txt) pass.

The [archive checks](documentation-audit/archives.json) retain canonical rc.28 `f556a3d25e766a4c4fb2ec343ae0bad6d57d868a0d97fd393c27e206c485d396` and rc.29 `e290db1ad3de9b18b83de79552039b2698d633aa8fc28b155a4b8fa8c990ffda`; `projects/chart-library` has no source changes. Package version, README/changelog, runtime, declarations and all earlier archives remain unchanged. npm publication is outside this repository/demo documentation correction. Human F09/R06/G2/G3/G4 remain deferred/pending.

The initial audit commit reused the historical rc.11 report filename; the follow-up restores that report byte-for-byte and records this audit separately. Its first local static check passed all three engines, but the obsolete performance run was stopped before correcting the source; it is not a complete delivery claim. A fresh clean-source CI and new demo documentation deployment require their own receipts; results will be recorded below after they exist. Until then, the [previous dashboard delivery](RC29_LINKED_WINDOW.md#completed-verification-and-delivery) retains its identity.
