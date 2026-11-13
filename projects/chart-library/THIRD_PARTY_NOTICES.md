# Third-party notices

Original ng-echarts library code is MIT licensed; see `LICENSE`. Separate notices below retain their own copyright statements and terms.

## Adapted material included in this package

EvilCharts, revision `4c2dd7c9bae780703244265c9a4b509d40c055ad`, copyright 2026 Gurbinder, MIT. The first two default chart colors and bar-gradient boundaries were adapted from its ECharts examples. The full notice is in `third-party/evilcharts-LICENSE.txt`. Angular models, lifecycle adapters, controls, formatting and option builders are original project code. The source repository's `docs/UPSTREAM_PROVENANCE.md` records exact upstream paths and reuse boundaries.

## Runtime dependency and external peers

The built modules import dependencies rather than embedding their distributions. The following exact versions describe the verified local candidate; the package manifest owns the declared ranges. Their notice copies are supplied for reference alongside the candidate. `third-party/provenance.json` records exact versions, source paths, and SHA-256 hashes for the preserved notice bytes.

| Package | Tested version | Relationship | License and included notice |
| --- | --- | --- | --- |
| `tslib` | 2.8.1 | Runtime dependency, `^2.3.0` | 0BSD; `third-party/tslib-LICENSE.txt`, `third-party/tslib-CopyrightNotice.txt` |
| `@angular/core`, `@angular/common` | 22.2.6 | External peers, `^22.2.6` | MIT; `third-party/angular-LICENSE.txt` (identical license text in both installed packages) |
| `echarts` | 6.1.0 | External peer, `^6.1.0` | Apache-2.0; `third-party/echarts-LICENSE.txt`, `third-party/echarts-NOTICE.txt` |
| `zrender` | 6.1.0 | ECharts dependency, external to this package | BSD-3-Clause; `third-party/zrender-LICENSE.txt` |
| `rxjs` | 7.8.2 | Angular peer dependency, external to this package | Apache-2.0; `third-party/rxjs-LICENSE.txt` |

ECharts and ZRender also resolve their own `tslib` 2.3.0 dependency; these external packages retain their own distributions and notices. This package's directly tested `tslib` is 2.8.1. A wider admitted dependency range does not establish that every version has been tested.

The demo's Heroicons, fonts, syntax highlighting, and reference harness are outside the chart-library tarball. React is used only by the isolated upstream reference harness and is not a library dependency. Consumers should retain notices from the dependency versions they install.
