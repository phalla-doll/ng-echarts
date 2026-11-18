# Install ng-echarts

The experimental public identity is `@mantha911/ng-echarts`; prereleases use the `next` dist-tag. Install the registry package below, or use the exact local-tarball procedure to test a checkout. Use Node **24.22.2** from `.nvmrc` and npm **11.19.1**. The [compatibility table](COMPATIBILITY.md) separates tested versions from declared peer ranges.

As verified on 18 November 2026, npm `next` selects rc.32 and the initial `latest` alias remains rc.18. A bare install resolves rc.18. Use `@next` deliberately or pin `@0.1.0-rc.32` for a repeatable dependency, then retain the lockfile. The [rc.32 publication record](experiments/RC32_PUBLICATION.md) separates the successful exact upload, registry propagation timeout and verification-only consumer recovery. The [first-publication record](PUBLICATION.md#first-publication-result) preserves npm’s rejected attempt to remove the initial `latest` alias.


Registry prerelease installation:

```sh
npm install @mantha911/ng-echarts@next echarts@6.1.0
```

The API remains experimental. Human screen-reader interpretation is unreviewed; the user requested skipping that session and proceeding with the prerelease.

The [packaged documentation errata](PACKAGED_DOCUMENTATION_ERRATA.md) supersede stale feature-availability wording in frozen rc.28/rc.29 readmes. Their archives are preserved; consult the API guides here for current behavior, including the radar chip-only presentation in rc.28/rc.29. Published rc.30 completes radar lists and corrects its packaged README; its [record](experiments/RC30_RADAR_LEGENDS.md) separates candidate verification, registry publication and demo delivery.

## Build and pack

The checkout now builds local rc.33 with optional graphical dashboard ranges; it is not published. npm `next` selects rc.32, the preserved lifecycle/color cleanup. The [interaction API](INTERACTION_API.md) and [increment record](experiments/RC33_GRAPHICAL_LINKING.md) separate candidate verification from publication and demo delivery.

Run these commands in the repository root after selecting the toolchain:

```sh
npm ci
npm run pack:lib
export CHART_LIBRARY_TARBALL="$PWD/dist/mantha911-ng-echarts-0.1.0-rc.33.tgz"
```

The `CHART_LIBRARY_TARBALL` variable is an absolute path for the commands below. If you open another terminal, set it to the actual tarball location. Keep the tarball available for subsequent installs, or copy it into the consuming project's `vendor/` directory before installing it. Commit the consumer's resulting lockfile and use `npm ci` for repeat installs. Rebuild/repack/reinstall when changing the library; a tarball installation does not watch the checkout.

## Existing Angular application

In an Angular application using the tested versions:

```sh
npm install "$CHART_LIBRARY_TARBALL" echarts@6.1.0
```

Use focused imports from `/bar`, `/line`, `/area`, `/pie`, `/composed`, `/radar`, `/radial`, `/calendar`, or `/sankey`. No `angular.json` scripts, global ECharts registration, library stylesheet, or additional provider is required. The package supplies component styles and lazy renderer registration. Give the chart's containing card a nonzero width; `height` is the plot height for charts that expose it, with native controls adding to the total height. Sankey uses node/link arrays and a contained horizontal scroll region for wider graphs; see the [Sankey API](SANKEY_CHART_API.md). Calendar height adapts to its year/quarter layout; its dateKey/valueKey/year/max contract differs from Cartesian row/series inputs.

## Fresh Angular application

Run the following scaffold block **outside this repository**, for example from its parent directory. It creates a new `chart-consumer` directory. The explicit CLI version and pins below reproduce the tested toolchain rather than allowing a later Angular minor to enter the fixture.

<!-- ng-echarts: scaffold -->
```sh
npx --yes --package=@angular/cli@22.2.6 ng new chart-consumer \
  --skip-install --skip-git --skip-tests --routing=false --ssr --zoneless \
  --style=css --package-manager=npm --defaults --interactive=false --ai-config=none
```

Change into the new application with `cd chart-consumer`, then run:

<!-- ng-echarts: install -->
```sh
npm pkg set \
  'dependencies.@angular/common=22.2.6' \
  'dependencies.@angular/compiler=22.2.6' \
  'dependencies.@angular/core=22.2.6' \
  'dependencies.@angular/forms=22.2.6' \
  'dependencies.@angular/platform-browser=22.2.6' \
  'dependencies.@angular/platform-server=22.2.6' \
  'dependencies.@angular/router=22.2.6' \
  'dependencies.@angular/ssr=22.2.6' \
  'dependencies.rxjs=7.8.2' \
  'dependencies.tslib=2.8.1' \
  'devDependencies.@angular/build=22.2.6' \
  'devDependencies.@angular/cli=22.2.6' \
  'devDependencies.@angular/compiler-cli=22.2.6' \
  'devDependencies.typescript=6.0.3'
npm install "$CHART_LIBRARY_TARBALL" echarts@6.1.0
```

Merge these explicit settings into the generated `tsconfig.json`, retaining its other compiler options. The scaffold can leave strict defaults implicit; these fields make the checked contract visible.

```json
{
  "compilerOptions": { "strict": true, "skipLibCheck": false },
  "angularCompilerOptions": { "strictTemplates": true }
}
```

Replace `src/app/app.ts` with the complete [integration example](INTEGRATION_GUIDE.md#complete-four-chart-application). Keep the generated `src/main.ts`, `src/main.server.ts`, and app configuration: they already bootstrap its exported `App` class. The example uses an inline template, so the generated `app.html` and `app.css` are unused.

For local production SSR, merge the following into `projects.chart-consumer.architect.build.options` in `angular.json`. Angular's SSR host check otherwise rejects the local request. When integrating into an existing application, use its actual serving hostnames.

<!-- ng-echarts: ssr-hosts -->
```json
{
  "security": { "allowedHosts": ["localhost", "127.0.0.1"] }
}
```

<!-- ng-echarts: build -->
```sh
npm run build
```

For interactive development run `npm start -- --port 4311`, then open `http://localhost:4311`. To inspect the production SSR build:

```sh
PORT=4311 node dist/chart-consumer/server/server.mjs
```

The page contains four titled charts. Open a data table and activate a value by keyboard; the selection message shows the original row/measure/value. Update the data and switch the theme without remounting. Initial server HTML contains headings, controls and fallback surfaces; canvases appear after browser hydration.

For a client-only application, use `--ssr=false` in the scaffold command and omit the server-only Angular package pins. The same `App` and focused imports work without hydration providers. Existing [packed runtime checks](experiments/data/packed-runtime.json) separately cover client-only and SSR applications across three engines.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| npm cannot find the tarball | Rebuild with `npm run pack:lib`; verify the absolute path and retain the file for lockfile installs |
| Angular peer conflict | Compare installed Angular packages and compiler with the exact [tested versions](COMPATIBILITY.md); the manifest's wider peer ranges are not a test of every allowed combination |
| Heading/legend appears but plot does not | Ensure the host is visible and has width, wait for browser initialization/font loading, and inspect accessible error text; a hidden host is intentionally deferred |
| A change does not update the plot | Supply new row/series/options references; use `themeRevision` after CSS/font changes |
| Missing keyboard point actions | Retain the default table or provide equivalent actions; hover and Code tabs are not keyboard alternatives |
| Hydration mismatch | Keep initial data, locale, formatter behavior, titles and identifiers deterministic; retain Angular hydration and let the adapter own only its plot surface |

The [API index and integration guide](INTEGRATION_GUIDE.md) cover shared types, updates, events and states. The [compatibility and limits](COMPATIBILITY.md) document records measured envelopes, exclusions, and open release evidence.

<a id="unreleased-source-follow-up"></a>

## Current feature availability

Current published package: `0.1.0-rc.32`, with bounded lifecycle/color cleanup on top of rc.30. npm `next` selects rc.32 and `latest` remains rc.18. Local source is rc.33 and adds an optional `/interaction` entry; it is unpublished. Chip/list legends for Cartesian/pie and gallery table opt-outs ship since rc.28; radar lists since rc.30, horizontal composition since rc.23 and independent axes since rc.24. The native shared-window dashboard remains compatible with published rc.22; graphical ranges require rc.33. Preserve every archive. The [rc.32 publication](experiments/RC32_PUBLICATION.md) and [rc.33 increment](experiments/RC33_GRAPHICAL_LINKING.md) own their separate evidence.

| Capability | Published availability |
| --- | --- |
| Table pagination / named bar stacks / composed areas | rc.19 / rc.21 / rc.22 and later |
| Horizontal composition / independent composed value axes | rc.23 / rc.24 and later |
| Cartesian and pie/donut chip/list legends | rc.28 and later; radar lists ship since rc.30, while rc.28/rc.29 retain radar chips |
| Calendar/Sankey `showDataTable` opt-out | rc.28 and later; default `true` |
| Optional graphical dashboard window | Local rc.33 only; unpublished; native From/To remain equivalent |
| Shared-window dashboard and month actions from either chart | Application code using existing rc.22 APIs; verified against that exact npm baseline and installed consumers |


The [composed dashboard guide](COMPOSED_DASHBOARD.md) provides a complete dashboard example and a digest-verified npm consumer check. The [rc.23 increment](experiments/NG20_COMPOSED_DASHBOARD.md) records local verification separately from rc.22 publication.
