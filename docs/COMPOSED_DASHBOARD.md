# Composed linked dashboard

With published rc.33, the demo also offers [optional graphical overview/detail ranges](INTERACTION_API.md) using a separately generated candidate source and consumer. The native rc.22-compatible example remains displayed and independently checked. See the [increment record](experiments/RC33_GRAPHICAL_LINKING.md) for current evidence.

The native `/linked-dashboard` source example connects stacked bars or areas plus a supplied-order trend to a horizontal device breakdown or monthly device detail. Both charts share an application-owned visible-month window. It uses existing `pointSelect` events and Angular signals; it works with published `@mantha911/ng-echarts@0.1.0-rc.22`. Horizontal **composed** layout is a separate rc.23 library addition; this example's horizontal detail uses the existing bar component.

## Run and copy the example

In this checkout, run `npm run build:lib`, then `npm start`, and open `/linked-dashboard`. Choose **Native dashboard source (published rc.22)** for a complete standalone `App`. Copy it into `src/app/app.ts` in the pinned Angular application from [Installation](INSTALLATION.md#fresh-angular-application), retaining its generated bootstrap and app configuration. Install `@mantha911/ng-echarts@0.1.0-rc.22` and `echarts@6.1.0`, and enable strict templates and `skipLibCheck: false` as documented there.

The native source is generated from the [baseline dashboard component](../projects/playground/src/app/linked/composed-dashboard-baseline.ts) and [baseline consumer App](../projects/playground/src/app/linked/dashboard-baseline-app.ts). The enhanced source uses the [current component](../projects/playground/src/app/linked/composed-dashboard.ts) and [current App](../projects/playground/src/app/linked/dashboard-app.ts). Run `npm run dashboard:source` after editing either pair. `npm run check:dashboard` rejects stale sources and installs the exact native example in a fresh strict Angular SSR application against digest-verified published rc.22, then reinstalls/builds and runs all three engines. It writes the separate [registry dashboard receipt](experiments/data/ng20-dashboard-registry-consumer.json). `npm run check:dashboard:interaction` checks the enhanced displayed source against the candidate, including graphical commit/cancellation and the shared window.

```sh
npm run check:dashboard
# Retain the runnable CLI application; its location is printed at completion.
npm run check:dashboard -- --keep
```

For a prepared local candidate, use `CHART_LIBRARY_TARBALL` and `CHART_LIBRARY_TARBALL_SHA256` with `node tools/check-documentation-consumer.mjs --dashboard --candidate`. This writes a separate candidate receipt and never changes the rc.22 registry receipt. No npm publishing operation runs in either mode.

## Selection and data ownership

- A native Month field, overview plot/table hits and monthly device-detail plot/table actions select the same row ID. The companion always derives from current input rows, without retaining the selected event's row object.
- A `linkedSignal` retains an available, visible selected ID through immutable refreshes and reordering. Removing that ID clears selection within the current visible window. Empty data produces an empty overview and explicit context; restoring data recovers the charts.
- Switching bars to areas keeps selection and legend IDs. Each legend controls only its chart; hiding a series retains its raw table values and does not filter the device breakdown.
- Reset dashboard month clears the month selection within the visible window and focuses the Month field before the reset control disappears. If an input update removes the selected month while Reset owns focus, focus also returns to the Month field. Point activation keeps focus on the initiating native control. The context and raw-action messages are polite status regions.
- Composed charts have no controlled selection-band input in this increment. The Month field and context message identify the committed selection. Aggregate detail titles name the selected period; monthly device detail keeps its device title and marks the selected month through bar/table feedback. Month selection works in both chart directions through the Device monthly view. There is no hover preview or graphical brushing in this example; the [existing linked example](LINKED_CHARTS.md) retains its range and preview flows.

## Numeric meaning

Every action reports the raw selected segment or trend value, never a stacked height. Device details add recorded observations for the selected scope; all-null observations stay missing and recorded zero stays zero. The message below the charts identifies partial sums when observations are missing. The trend is a mean of combined device visits over the current and up to two preceding **supplied-order** rows from the full input, computed before slicing the visible window. Every observation in that window must be recorded; otherwise the trend is missing. Reordering input deliberately changes that supplied-order trend, while stable selection IDs persist. This demo does not infer calendar continuity or complete totals from partial observations.

The regional horizontal composition example at `/composed#horizontal-visits-and-target` instead uses original illustrative regional values and independently supplied targets. See [Composed API](COMPOSED_CHART_API.md#horizontal-layout-in-local-rc23) for the rc.23 layout contract and [increment evidence](experiments/NG20_COMPOSED_DASHBOARD.md) for actual checks. Human F09/R06/G2/G3/G4 remain deferred/pending.

## Shared zoom and device detail

From/To and Zoom in/out/Previous/Next/Reset zoom control one inclusive category window by stable endpoint IDs. No engine zoom component or new library input is required. A boundary crossing collapses both bounds to the changed month; input reordering normalizes their order, and removing either bound restores all input months. Zoom clears a selected month only when it leaves the visible window. Zoom in centers on an available selected month or the current midpoint, rounds odd counts up and stops at one month. Zoom out doubles the count up to all months; pan moves one window and clamps while retaining its size.

The default detail adds recorded Desktop/Mobile observations over the chosen month or visible window. Choose a device from that chart or the Device field to see its monthly values in the same window. Detail actions update the Month field/context and the current detail row; overview actions do the same. All devices restores the aggregate breakdown. Reset month clears selection; Reset zoom restores visibility while retaining a still-available month. Neither action changes legends or the chosen device. Unavailable zoom/pan actions use guarded aria-disabled buttons, preserving keyboard focus.

The separately displayed native standalone source includes the pure window helpers and uses only APIs already available in published rc.22; enhanced graphical ranges require rc.33. The shared installed-consumer journey covers both directions, endpoint removal/reordering, reset focus and responsive controls. [Current continuation evidence](experiments/RC29_LINKED_WINDOW.md) separates verified results from pending delivery. General-purpose library zoom, wheel/pinch zoom, shared graphical brushes and disjoint selections remain subsequent scope.
