# rc.19 delivery checkpoint

Prepared and verified 15 November 2026 from base source `fb6cb05e5c985bca7f2f06bddf6460795ab511a3`. This preserves the performance/Angular checkpoint before the separate rc.20 stacked-composition increment. Human F09/R06/G2/G3/G4 remain pending under the user's continued deferral.

## Exact artifact

`mantha911-ng-echarts-0.1.0-rc.19.tgz`: 161,441 bytes; SHA-256 `85fd51a061557f6a33255c77581add6d1868ca47f45334f182d178953f5d38ba`. The bytes match the earlier source-consumer archive recorded in the [Angular follow-up](ANGULAR_PRACTICES_FOLLOW_UP.md). The [candidate manifest](data/local-release-0.1.0-rc.19.json) records metadata, every file/notice hash and exact-consumer results. The prior source regression is recorded separately in that follow-up: 297 unit/integration tests and 446 browser passes with four expected skips.

Using Node 24.22.2 and npm 11.19.1, `npm run release:local` passes metadata/notices, strict external declarations/invalid inputs, the exact documented installation/application in three engines, and independently installed client/SSR consumers in all six engine/rendering combinations. Retained [documentation](rc19/documentation-consumer.json) and [runtime](rc19/packed-runtime.json) receipts identify the same exact candidate bytes. `npm run check:release-immutability` passes: repeated preparation cannot replace the archive, checksum or manifest. A versioned manifest copy is retained beside the archive in ignored `dist/releases/`.

`npm publish dist/releases/mantha911-ng-echarts-0.1.0-rc.19.tgz --dry-run --access public --tag next --ignore-scripts --registry=https://registry.npmjs.org/ --json` passes. The initial `npm whoami` returned HTTP 401. The user completed npm browser login and the separate publication authentication prompt; identity then resolved to `mantha911`.

The same exact archive was published on 15 November. Its [release-source CI](https://github.com/phalla-doll/ng-echarts/actions/runs/43680879332) passed at the exact recorded source commit. After registry metadata became readable, downloaded bytes matched the candidate exactly. Actual tags are `next: 0.1.0-rc.19` and `latest: 0.1.0-rc.18`. Fresh registry declarations/negative bindings, documented installation/hydration in three engines and six client/SSR modes pass from the matching rc.19 source snapshot. The [registry receipt](public-rc19/registry-verification.json), [documentation consumer](public-rc19/documentation-consumer.json) and [runtime consumer](public-rc19/packed-runtime.json) preserve this evidence. No duplicate publish or modification of published rc.18/earlier archives occurred.

## Demo and human review

The current demo already includes rc.19 source and theme persistence, verified through its sealed marker/receipt and a fresh three-engine public check. The [deployment record](../GITHUB_PAGES.md#current-deployment--15-november-follow-up) now identifies it accurately. Stacked composed charts require the separate rc.20 source/candidate and are not in that deployed build.

The user explicitly continued the human-review deferral on 15 November. The [current result sheet](RC20_HUMAN_REVIEW.md) extends the original cross-family review to pagination, stacked composition and theme persistence; all listening results remain pending.
