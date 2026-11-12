# R01 toolchain and scaffold evidence

Status: pass for the initial toolchain scope. Executed 12 November 2026 on macOS with Node 24.22.2 and npm 11.19.1. Task: NG01. This snapshot established the build boundary without resolving the decision gates; see the linked current reports for later G1 evidence.

This report records the original scaffold at commit `7bcdaf5`. The current check command includes three-browser tests; run `npx playwright install chromium firefox webkit` before using it. Current implementation results are recorded in the [lifecycle/hydration report](R04_R05_VALIDATION.md).

## Tested versions

| Dependency | Installed version |
| --- | --- |
| Angular runtime, compiler, CLI, build, SSR | 22.2.6 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| ECharts | 6.1.0 |
| ng-packagr | 22.2.0 |
| Vitest / jsdom | 5.1.0 / 30.1.3 |
| Prettier | 3.10.1 |

Node is selected through `.nvmrc`; the package manifest declares npm 11.19.1. Angular, TypeScript, and RxJS versions fit the [Angular 22 compatibility ranges](https://angular.dev/reference/versions). The workspace and independent declaration fixture each have an npm lockfile. Tests use Angular CLI's [Vitest integration](https://angular.dev/guide/testing).

## Reproduction

Select Node 24.22.2, then run from the repository root:

```sh
npm ci
npm run check
```

On this machine, Node 24 is installed under `/opt/homebrew/opt/node@24/bin`; commands were run with that directory first on `PATH`. Contributors can use their preferred Node version manager.

## Results

| Check | Result and observed evidence |
| --- | --- |
| Clean installation | Pass: `npm ci --no-audit --no-fund` completed from the workspace lockfile |
| Formatting | Pass: Prettier checks TypeScript, JavaScript modules, JSON, HTML, CSS, and workflow YAML |
| Library production build | Pass: Angular partial compilation emitted FESM and declaration bundles under `dist/chart-library` |
| Playground production build | Pass: browser and server output emitted under `dist/playground`; route uses `RenderMode.Server` |
| Strict compilation | Pass: `ngc --noEmit` for library and playground, with strict TypeScript, strict templates, and `skipLibCheck: false` |
| Unit integration tests | Pass: two tests across two files; library input updates/projection and playground theme interaction |
| Isolated declarations | Pass: production tarball installed in a temporary directory outside the workspace; strict Angular template compilation consumes its component metadata and ECharts declarations |
| Server response | Pass: production server returned HTTP 200 with the library heading, projected content, and Angular hydration metadata |
| Git whitespace | Pass: `git diff --check` |

The packed package is private and uses the temporary name `@ng-echarts/chart-library`. The declaration check verifies that the installed package resolves within the isolated consumer rather than to a workspace link. Temporary artifacts are removed afterward.

The SSR build explicitly allows `localhost` and `127.0.0.1` for local validation. A deployed playground would need its actual hostname configured. The [hosted scaffold workflow](https://github.com/phalla-doll/ng-echarts/actions/runs/43179314050) passed for commit `7bcdaf5`. The prototype branch has only been validated locally so far.

## Remaining evidence

The presentation shell does not initialize ECharts. Renderer registration, typed chart-key inference, invalid-input examples, browser rendering, visual parity, lifecycle behavior, accessibility, and performance remain open. The SSR response proves server markup and configured hydration metadata; it does not prove browser hydration. The declaration consumer is not R08's complete packed client and SSR runtime validation.

Next tasks: NG02 reference fixtures and provenance, then NG03's provisional adapter choice. Preserve the existing acceptance criteria while collecting evidence for R02–R08.
