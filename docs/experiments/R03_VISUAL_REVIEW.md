# R03 bar visual comparison

Status: reference capture and initial review complete; parity remains pending. Recorded 12 November 2026. Chart: grouped vertical bar. Tasks: NG02, NG04. Requirements: F03, F04, F06, F09. Gate: G2.

## Reference and method

The isolated [reference harness](../../tools/reference/README.md) builds the unmodified pinned `ex-echarts-bar-chart` React example and its real imported bar/UI modules at revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. It extracts the source's light/dark theme tokens and generates Tailwind utilities. It uses a system font, rather than the full upstream website's Next.js font integration. React is confined to the reference tool's development dependencies.

Both implementations use the original twelve-month Desktop/Mobile values and their green/rose colors. Chromium 158.0.8127.18 captured each at DPR 1, reduced motion, a 1000 px viewport height, and a viewport 40 px wider than the specified **host**. The reference host is 360 px high including its brush/legend; Angular reserves 360 px for the plot and adds its title and controls. This geometry difference is recorded, not hidden through image scaling.

The [capture manifest](captures/bar-reference/manifest.json) records exact host/canvas rectangles, fonts, browser, and SHA-256 hashes of the primary example, bar module, and upstream theme CSS. All twelve captures were inspected.

| Host width | Light reference / Angular | Dark reference / Angular |
| --- | --- | --- |
| 320 px | [Upstream](captures/bar-reference/upstream-light-320.png) / [Angular](captures/bar-reference/angular-light-320.png) | [Upstream](captures/bar-reference/upstream-dark-320.png) / [Angular](captures/bar-reference/angular-dark-320.png) |
| 768 px | [Upstream](captures/bar-reference/upstream-light-768.png) / [Angular](captures/bar-reference/angular-light-768.png) | [Upstream](captures/bar-reference/upstream-dark-768.png) / [Angular](captures/bar-reference/angular-dark-768.png) |
| 1440 px | [Upstream](captures/bar-reference/upstream-light-1440.png) / [Angular](captures/bar-reference/angular-light-1440.png) | [Upstream](captures/bar-reference/upstream-dark-1440.png) / [Angular](captures/bar-reference/angular-dark-1440.png) |

## Findings and disposition

| Concern | Observed result | Next action |
| --- | --- | --- |
| Values, order, and series palette | Twelve groups preserve their relative values/order and the selected light/dark colors | Retain fixture and behavioral tests |
| Narrow controls | At 320 px, the title/description wrap and the legend buttons stack without clipping | Retain wrapping and visible button labels |
| Brush | Present upstream and absent in Angular | Intentional MVP exclusion; do not add it to satisfy visual similarity |
| Legend and table | Upstream overlays a small legend above the plot; Angular supplies buttons below it and a table control | Intentional accessible UI difference; retain keyboard operation and visible state |
| Axis labels | Upstream abbreviates months and uses smaller labels; Angular uses full names, reducing visible tick density at 320/768 px | Prototype a pure category-tick formatter while retaining full table/tooltip labels; verify its typed input and error behavior |
| Plot spacing and axes | Angular's title/card padding, explicit value labels, grid treatment, and plot height differ | Normalize a comparison theme and review spacing/axis defaults after the formatter work; retain useful value interpretation |
| Default surface colors | Upstream uses neutral surfaces; the playground uses its blue-gray theme tokens | Add a documented token-mapping comparison fixture; do not present current default-theme captures as identical styling |
| Tooltip and other variants | Captures show the default grouped view with no hover | Add tooltip captures and stacked/horizontal/gradient references before final visual acceptance |

## Template review

The component derives state, options, legend items, and table rows in TypeScript. The table's formatting is deferred until expansion. Templates use simple guards, named actions, and stable `@for` identifiers. DOM reads, CSS color resolution, renderer imports, and instance calls stay in browser modules. No computed builder initializes or mutates the renderer.

## Reproduction and status

Run `npm run reference:prepare`, `npm run build`, and `npm run capture:bar`. The pinned source and tool lockfile make the reference reproducible; screenshots still depend on recorded fonts and browser versions.

R03 remains pending until the axis/spacing decisions and variant/tooltip comparisons are resolved. These screenshots establish comparison evidence, not pixel equivalence or a passed G2. The product specification's visual criteria and performance targets remain unchanged.
