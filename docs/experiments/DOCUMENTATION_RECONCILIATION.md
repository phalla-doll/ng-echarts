# Documentation reconciliation after rc.11 deployment

The user requested a complete documentation follow-up after the combined chart/presentation changes were committed and deployed. This review reconciles current guides against exported TypeScript contracts, the checked private artifacts, current budget assertions and public deployment provenance. Dated experiment and release records remain historical evidence; their counts, source hashes and archive digests are not rewritten.

## Corrections

- README and packaged component indices include all nine implemented chart families and distinguish the five-family compatibility root from focused radar/radial/calendar/Sankey entries.
- The integration guide assigns `BarRangeSelection` to `/bar` or root, calendar selection to `/calendar`, and Sankey contracts to `/sankey`; `/core` is not described as exporting every family-specific type.
- Line marker/stroke cues, composed presentation, state geometry/inert controls, pie `showTotal` and calendar/Sankey `valueLabel` match source defaults. The optional measure label now appears in both input tables.
- The current full-check baseline is 257 unit / 353 browser passes with four expected skips. The later 30-scenario concept-font regression is a separate targeted run. Historical NG14 and candidate-specific counts remain unchanged.
- Current aggregate allowances are 218,000 gzip / 186,000 Brotli for root and 201,500 / 175,000 for emitted root-frame orphan chunks. Focused/core limits and the engine-free reachable frame contract are unchanged.
- Public deployment identity is recorded in [the Pages guide](../GITHUB_PAGES.md#rc11-sankey-presentation-and-webkit-deployment) and [its checkpoint](data/rc11-pages-deployment.json), including the WebKit font-load correction. The shipped private library remains separate from the demo.
- Public Installation text previously named rc.4. It now names the actual documentation candidate; isolated consumer checks assert both the tarball name and candidate status against the packed version before compiling the guide examples.

## Private artifact handling

The rc.11 tarball includes a packaged README with older aggregate caps and an outdated unreleased-features statement. Its bytes stay immutable. The corrected package README and changelog use **rc.12**, a documentation-only private successor; current installation/checklist pointers advance together. Runtime/declaration identity and exact-tarball consumers are checked without repeating unaffected application behavior tests. Human F09/R06/G2/G3/G4, naming and registry publication remain pending.

## Verification

Verified 14 November 2026:

- `npm run release:local` passes rc.12 metadata/notices, strict installed declarations and copied documentation sources, fresh pinned installation with three-engine hydration, and all six installed client/SSR modes. [The immutable manifest](data/local-release-0.1.0-rc.12.json) records the exact archive and consumer results.
- rc.12 is 147,238 bytes, SHA-256 `ed80ef3513f7e4b0a4b0d18f79317a6c88163df27e0d94d385a5a5aec72f9eb6`. All 68 archive paths match rc.11; only `package.json`, `README.md` and `CHANGELOG.md` differ. The remaining 65 files, including runtime chunks, source maps, declarations and notices, are byte-identical. All older local archives with tracked manifests still match their recorded digests.
- The production playground builds. `site-pages.spec.ts` and `code-examples.spec.ts` pass **15 scenarios** across Chromium, Firefox and WebKit, covering navigation, copyable highlighted examples, hydration, themes and narrow layouts. This targeted run does not replace the historical full regression count.
- `npm run format:check`, all **1,232** local Markdown links (including **66** heading anchors), and `git diff --check` pass.

The public documentation update uses the guarded clean-source Pages deployment procedure. Its build marker and verification receipt identify the actual deployed source; the earlier rc.11 checkpoint remains immutable historical evidence.
