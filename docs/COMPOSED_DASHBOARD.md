# Composed linked dashboard

The `/linked-dashboard` example connects stacked bars or areas plus an independently supplied trend line to a horizontal device breakdown. It uses existing `pointSelect` events and Angular signals; it works with published `@mantha911/ng-echarts@0.1.0-rc.22`. Horizontal **composed** layout is a separate rc.23 library addition; this example's horizontal detail uses the existing bar component.

## Run and copy the example

In this checkout, run `npm run build:lib`, then `npm start`, and open `/linked-dashboard`. The source panel contains a complete standalone `App`. Copy it into `src/app/app.ts` in the pinned Angular application from [Installation](INSTALLATION.md#fresh-angular-application), retaining its generated bootstrap and app configuration. Install `@mantha911/ng-echarts@0.1.0-rc.22` and `echarts@6.1.0`, and enable strict templates and `skipLibCheck: false` as documented there.

The source is generated from the actual [dashboard component](../projects/playground/src/app/linked/composed-dashboard.ts) and [consumer App](../projects/playground/src/app/linked/dashboard-app.ts). Run `npm run dashboard:source` after editing either file. `npm run check:dashboard` rejects stale source, copies the exact displayed component into a fresh Angular SSR application outside the workspace, installs the pinned npm rc.22 archive after checking its recorded SHA-256, reinstalls from the lockfile, builds strictly, and exercises the dashboard in Chromium, Firefox and WebKit. It writes a separate [registry dashboard receipt](experiments/data/ng20-dashboard-registry-consumer.json).

```sh
npm run check:dashboard
# Retain the runnable CLI application; its location is printed at completion.
npm run check:dashboard -- --keep
```

For a prepared local candidate, use `CHART_LIBRARY_TARBALL` and `CHART_LIBRARY_TARBALL_SHA256` with `node tools/check-documentation-consumer.mjs --dashboard --candidate`. This writes a separate candidate receipt and never changes the rc.22 registry receipt. No npm publishing operation runs in either mode.

## Selection and data ownership

- A native Month field, overview plot hits and overview table actions select the same row ID. The companion always derives from current input rows, without retaining the selected event's row object.
- A `linkedSignal` retains an available selected ID through immutable refreshes and reordering. Removing that ID clears selection and restores all months. Empty data produces an empty overview and explicit context; restoring data recovers the charts.
- Switching bars to areas keeps selection and legend IDs. Each legend controls only its chart; hiding a series retains its raw table values and does not filter the device breakdown.
- Reset returns to all months and focuses the Month field before the reset control disappears. If an input update removes the selected month while Reset owns focus, focus also returns to the Month field. Point activation keeps focus on the initiating native control. The context and raw-action messages are polite status regions.
- Composed charts have no controlled selection-band input in this increment. The Month field, context message and detail title identify the committed selection. There is no bidirectional selection, hover preview or graphical range selection in this example; the [existing linked example](LINKED_CHARTS.md) retains its range and preview flows.

## Numeric meaning

Every action reports the raw selected segment or trend value, never a stacked height. Device details add recorded observations for the selected scope; all-null observations stay missing and recorded zero stays zero. The message below the charts identifies partial sums when observations are missing. The trend is a mean of combined device visits over the current and up to two preceding **supplied-order** rows. Every observation in that window must be recorded; otherwise the trend is missing. Reordering input deliberately changes that supplied-order trend, while stable selection IDs persist. This demo does not infer calendar continuity or complete totals from partial observations.

The regional horizontal composition example at `/composed#horizontal-visits-and-target` instead uses original illustrative regional values and independently supplied targets. See [Composed API](COMPOSED_CHART_API.md#horizontal-layout-in-local-rc23) for the rc.23 layout contract and [increment evidence](experiments/NG20_COMPOSED_DASHBOARD.md) for actual checks. Human F09/R06/G2/G3/G4 remain deferred/pending.
