# NG20 linked-chart integration

Started 13 November 2026 when the user chose linked charts after NG17. This first increment links one monthly overview to a device-share detail through application state. It reuses the verified private rc.1 library and its existing typed point events; no library component, public API, dependency range or candidate bytes change. Range brushing and broader two-way/hover/zoom behavior remain open.

## Implemented behavior

The [linked guide](../LINKED_CHARTS.md) owns the interaction contract. `/linked` presents the overview, a native month selector, Show all months reset, live context and device-share chart in the established gallery shell. Both charts retain their native tables and independent legends. The standalone example expands, highlights and copies like the existing developer examples; a denied clipboard operation supplies a manual fallback.

Plot clicks on either overview series and keyboard table activation select the same stable month ID. The month selector is another equivalent path. Derived data uses the current input rows, preserving an available selection across updates, renaming and reordering. Removing the ID clears the filter; adding it back later does not resurrect an obsolete selection. Selection changes keep focus on the initiating control and update both the detail title and complete values. A detail point action announces the device's current value without creating a reverse link or feedback loop.

Null-only device aggregates remain missing; zero stays numeric. Empty month data and entirely missing observations have explicit application text. Counts are finite and nonnegative for device share; arbitrary signed measures are outside this example. The linked validation route supplies immutable updates, reorder, removal, empty/all-missing data and recovery. Both chart instances retain identity across normal selections and theme changes; navigation tears them down.

`LinkedVisits` uses Angular `linkedSignal` to reconcile selection and `computed` to derive the current rows, totals and status. It owns no chart instance or browser listener. Library renderers/controllers retain their existing behavior. The monthly dataset is the already attributed Desktop/Mobile fixture; guide/validation rows, selection code and the outline link glyph are original local work. [Provenance](../UPSTREAM_PROVENANCE.md#ng20-linked-chart-integration) records these boundaries.

## Executed verification

- Production playground build, strict workspace TypeScript/templates, and all 134 unit/integration tests pass (128 library + 6 playground). New tests distinguish missing/zero aggregation and verify current-data identity, renaming, removal, reintroduction and empty reset.
- The targeted browser regression passes **42 scenarios** across Chromium, Firefox and WebKit: 12 linked scenarios plus existing site pages, mobile navigation, gallery interactions and four-family visual refinements. Linked checks include real painted-bar clicks, raw keyboard values, select/reset, source focus, stable instances, independent legends, zero/missing values, updates/removal/recovery, responsive themes, copy/failure fallback, hydration and route cleanup. There are no collected console/hydration errors or leftover native resources after teardown.
- `check:consumer` installs the unchanged exact rc.1 tarball, compiles the displayed standalone linking example with strict templates and `skipLibCheck: false`, and requires its source to match the guide fence. Existing export/API/example and negative-type checks continue to pass.
- `check:runtime` installs those same retained bytes outside the workspace, then builds and runs the copied application in all six client/SSR browser modes. The new flow activates an overview value with the keyboard, observes the matching detail, resets, navigates to validation, updates a selected month, retains a raw zero device value, clears a removed ID and tears down. Route checks wait for the destination heading before operating controls, avoiding a false match against the preceding page's equal chart count.

[NG20 consumer evidence](data/ng20-linked-consumers.json) snapshots the installed-runtime report and exact artifact identity. SHA-256 remains `2009034295ffaa07955e0ec2a6370689b2d8922e6e06a527dc97c8beeeaaaacb`; the [NG17 candidate record](data/local-release-0.1.0-rc.1.json) remains unchanged. There is no new release packing, broader performance claim or library bundle-budget change in this application increment. The complete 190-scenario NG17 browser run remains historical; this report claims the targeted run above, not an unexecuted full rerun.

## Visual review

`npm run capture:linked` records [12 captures and source hashes](captures/linked/manifest.json) across dark/light themes and 1440/768/390/320 px. The page reuses the gallery's Inter typography, neutral tokens, outline navigation, card geometry and green/rose device identity. Native labels, source focus, complete tables and code remain usable on narrow screens; the automated matrix records no page overflow, browser or HTTP errors.

Reviewed captures: [desktop dark](captures/linked/linked-dark-1440.png), [mobile light](captures/linked/linked-light-320.png), [keyboard action](captures/linked/linked-dark-320-keyboard.png), and [narrow code](captures/linked/linked-light-320-code.png). The keyboard image uses a viewport capture so a fixed header does not appear midway through a stitched oversized element.

## Remaining scope and release status

This completes the agreed one-way linked-chart example. Persistent plot highlighting, shared legends, ECharts connections, cross-chart hover/zoom, range brushing, multi-select and two-way propagation require separate design/checklists. Human interpretation remains deferred and F09/R06/G2/G3/G4 remain pending. The [manual review](R06_MANUAL_REVIEW.md) includes the new linked context/focus checks. No registry publication occurs.

The Pages production build prerenders **29 physical routes** under `/ng-echarts/`. Local static checks pass in all three engines, including direct linked routes, selection/detail updates, reload resetting to all months, fonts, themes and mobile navigation. Formatting, local documentation links/anchors and whitespace checks pass before committing. Live deployment is recorded below.

## Preview delivery

Implementation, documentation, captures and evidence are committed in `ff4f555`. The [linked example](https://phalla-doll.github.io/ng-echarts/linked/) is live from static commit `b06fd5bb20c2ec780198606ae2c36d4047a0e6ec`. The [Pages deployment](https://github.com/phalla-doll/ng-echarts/actions/runs/43380959584) succeeds; `preview-build.json` identifies clean source `ff4f55593f0d8c5656094c8f9d77566085451b5a`. Local/live Pages checks pass in Chromium, Firefox and WebKit, including month selection, detail updates and reload reset. All 760 local documentation links/anchors, capture/source/icon hashes, unchanged rc.1 checksum, formatting and whitespace checks pass before the implementation commit. The final delivery-note links are checked separately.
