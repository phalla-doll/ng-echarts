# R08 packed Angular consumer

Status: pass for the bar prototype. Recorded 12 November 2026. Tasks: NG08. Requirements: F01, F05, F06, F10. Gate: G1. This is a private local artifact, not an npm release or a claim about unimplemented chart families.

## Method

Run `npm run build`, `npm run check:consumer`, and `npm run check:runtime` using Node from `.nvmrc`. The complete workspace check includes both consumer commands.

The runtime script packs the production library and creates a real temporary consumer outside this workspace. Its manifest and independent lockfile are in `tools/consumer-fixtures/runtime/`. It installs the tarball into that consumer's own `node_modules`, checks the installed real path, removes workspace TypeScript aliases/references, clears `NODE_PATH`, and builds production applications with `skipLibCheck: false` and strict templates. It copies the playground as consumer source, using only the public package import for the library; library source files are not copied or resolved through a sibling checkout.

One application has a client-only entry without hydration providers. A separate application uses the real Angular SSR entry and Express server. Tests exercise both applications in Chromium, Firefox, and WebKit. Child servers, browsers, and temporary installations are cleaned up even on failure.

## Observed result

All six engine/runtime combinations passed; [raw results](data/packed-runtime.json) record browser versions and the isolation checks.

- Client HTML starts with a shell; SSR HTML contains chart headings and the deferred chart's markup. Neither response contains a server canvas.
- The primary chart creates one browser canvas. Native legend state and the complete table work.
- Initially hidden and loading charts start when revealed/ready.
- In SSR mode, interacting with the dehydrated table control triggers deferred hydration, replays the event, and renders the table and canvas.
- Navigation removes chart canvases; navigation back initializes the current chart once.
- A theme switch changes the palette, and an immutable value update appears in the table.
- Application exceptions, console errors, and hydration diagnostics remain absent.
- The installed production dependency tree has no React or React DOM runtime. The package contains declarations and the preserved upstream MIT notice.

The separate declaration consumer accepts inferred generic rows and the category-tick callback. Deliberately invalid category keys, measure keys, and numeric-returning category formatters fail compilation. It also checks ECharts declarations under TypeScript 6 without suppressing dependency errors.

## Limits

The checked versions are Angular/CLI 22.2.6, TypeScript 6.0.3, ECharts 6.1.0, Node 24.22.2, and npm 11.19.1. Peer ranges are a contract to validate further, not evidence that every version in those ranges has run. No public package identity, distribution license for original code, npm publication, or release candidate is selected by this experiment. Repeat the consumer checks when the API, exports, dependencies, or build configuration change, and across the other families before G3/G4.
