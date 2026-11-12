# Pinned EvilCharts visual reference

This private research harness renders the unmodified `ex-echarts-bar-chart` example from revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`. Its React dependencies are isolated in this directory's development manifest and lockfile. They are not Angular library dependencies.

From the workspace root, using the Node version in `.nvmrc`:

```sh
npm run reference:prepare
npm run build
npm run capture:bar
```

Preparation downloads the pinned archive, extracts source into ignored `upstream/`, extracts the original root/dark theme variables, and records source SHA-256 hashes. Source code is not rewritten. Vite builds the example with React 19.2.3, ECharts 6.1.0, Motion 12.23.26, and generated Tailwind utilities. The harness uses a system font rather than the upstream Next.js font loader. It is a client-only reference, not the full upstream website or its SSR setup.

Capture requires free local ports 4174 and 4175. The script starts both production servers, captures both implementations at exact 320, 768, and 1440 px host widths in both themes, records dimensions/browser/DPR/font/source hashes, and stops its child servers. Images and metadata are saved under `docs/experiments/captures/bar-reference/`.

The original reference includes its brush and short axis labels. The Angular prototype has a title, native controls, a larger independent plot, and an accessible table toggle. Compare visible differences against the product specification; do not treat the images as an automatic pixel-equivalence test. The [R03 review](../../docs/experiments/R03_VISUAL_REVIEW.md) records the findings.

The source archive retains upstream's MIT license. The tracked [notice](../../projects/chart-library/third-party/evilcharts-LICENSE.txt) also accompanies the adapted fixture/palette and rendered references. Do not copy additional upstream material without updating the provenance ledger.
