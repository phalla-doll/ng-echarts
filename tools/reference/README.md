# Pinned EvilCharts visual reference

This private research harness renders the unmodified primary, stacked, horizontal, and gradient bar examples from revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. Its React dependencies are isolated in this directory's development manifest and lockfile. They are not Angular library dependencies.

From the workspace root, using the Node version in `.nvmrc`:

```sh
npm run reference:prepare
npm run build
npm run capture:bar
```

Preparation downloads the pinned archive, extracts source into ignored `upstream/`, extracts the original root/dark theme variables, and records source SHA-256 hashes. Source code is not rewritten. Vite builds the example with React 19.2.3, ECharts 6.1.0, Motion 12.23.26, and generated Tailwind utilities. The harness uses a system font rather than the upstream Next.js font loader. It is a client-only reference, not the full upstream website or its SSR setup.

Capture requires free local ports 4174 and 4175. The script starts both production servers, captures both implementations at exact 320, 768, and 1440 px host widths in both themes, records dimensions/browser/DPR/font/source hashes, and stops its child servers. The current run captures Angular’s `/comparison` route, mapping the pinned neutral tokens and abbreviating category ticks without changing full tooltip/table labels. It produces 80 images, including tooltips at 320 and 768 px, plus a browsable comparison gallery. Images and metadata are saved under `docs/experiments/captures/bar-variants/`; `bar-reference/` and `bar-alignment/` remain historical. The manifest records the comparison stylesheet hash and raw CSS tokens alongside geometry.

The original reference includes its brush and short axis labels. Angular keeps 12 px ticks and visible value labels; the primary reference uses 10 px ticks and omits value labels. The Angular prototype has a title, native controls, a larger independent plot, and an accessible table toggle. Compare visible differences against the product specification; do not treat the images as an automatic pixel-equivalence test. The [R03 review](../../docs/experiments/R03_VISUAL_REVIEW.md) records the findings.

The source archive retains upstream's MIT license. The tracked [notice](../../projects/chart-library/third-party/evilcharts-LICENSE.txt) also accompanies the adapted fixture/palette and rendered references. Do not copy additional upstream material without updating the provenance ledger.

NG11 extends the same pinned harness with unmodified primary/solid/monotoneY line examples. Run `npm run capture:line` after preparation/build to record 36 line comparison captures plus four gallery captures. See [NG11](../../docs/experiments/NG11_LINE_CHART.md) for the exact mapping, source hashes, and intentional differences; the line tool uses the same free local ports and stops its child servers.
