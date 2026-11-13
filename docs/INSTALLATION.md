# Install the local package

The package is private and experimental. Build a tarball from this checkout; there is no public npm installation. Use Node **24.22.2** from `.nvmrc` and npm **11.19.1**. The [compatibility table](COMPATIBILITY.md) separates tested versions from declared peer ranges.

## Build and pack

Run these commands in the repository root after selecting the toolchain:

```sh
npm ci
npm run pack:lib
export CHART_LIBRARY_TARBALL="$PWD/dist/ng-echarts-chart-library-0.1.0-rc.0.tgz"
```

The `CHART_LIBRARY_TARBALL` variable is an absolute path for the commands below. If you open another terminal, set it to the actual tarball location. Keep the tarball available for subsequent installs, or copy it into the consuming project's `vendor/` directory before installing it. Commit the consumer's resulting lockfile and use `npm ci` for repeat installs. Rebuild/repack/reinstall when changing the library; a tarball installation does not watch the checkout.

## Existing Angular application

In an Angular application using the tested versions:

```sh
npm install "$CHART_LIBRARY_TARBALL" echarts@6.1.0
```

Use focused imports from `/bar`, `/line`, `/area`, or `/pie`. No `angular.json` scripts, global ECharts registration, library stylesheet, or additional provider is required. The package supplies component styles and lazy renderer registration. Give the chart's containing card a nonzero width; `height` is the plot height, with native controls adding to the total height.

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
