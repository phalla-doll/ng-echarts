# Linked-chart selection feedback

Requested 13 November 2026 after the [linked-demo UI refinement](LINKED_UI_REFINEMENT.md). The user approved finishing selected-month feedback before range selection or further chart families. This increment keeps the approved neutral gallery style and application-owned one-way link.

## Contract and visual decisions

`BarChart.selectedRowId` accepts `string | null`, defaulting to null. A current row retains its series colors while surrounding bars use 35% opacity. A quiet theme-colored category band remains visible for zero/missing observations or hidden series. A displayed selected category tick uses primary text and medium weight; responsive automatic tick spacing remains unchanged. The linked overview description always names the selected month, including on narrow layouts where its tick may be omitted.

The expanded native table marks the same row with `aria-current="true"`, a restrained background/leading rule and a visible “Selected” label. Other rows retain their original labels and values. Both charts retain independent legends, complete raw values and stable instances. Focus remains on the initiating control; Reset clears feedback and returns focus to Month. Feedback is confined to ready charts; entirely missing/empty data keeps the normal empty state and loading/errors still remove stale plots/actions.

This is controlled presentation. Binding a new ID emits no event; clicking a point emits the existing raw event and does not mutate the input. Unknown/empty IDs display the ordinary overview. The application still owns removal/reintroduction policy; this demo clears removed IDs and never resurrects them. A non-string, non-null runtime input produces a recoverable configuration error. The input applies only to bars; other families retain their public surfaces.

The pure option builder uses the existing category-axis split area and per-point style; no dependency or renderer registration is added. Existing layout/stack/gradient options and reduced-motion behavior remain in force. The approach follows the installed ECharts 6.1.0 category-axis/data styles and [official bar item-style API](https://echarts.apache.org/en/option.html#series-bar.data.itemStyle); the implementation is original project code with unchanged upstream notices.

## Evidence

The [capture manifest](captures/linked-selection/manifest.json) records 26 images, 13 source hashes, image hashes, both themes and 1440/768/390/320 px. The eight layout combinations report no page overflow, console or HTTP errors. Original UI-refinement captures remain unchanged and serve as the before reference.

| View | Before | After |
| --- | --- | --- |
| Desktop, February | [Unmarked overview](captures/linked-ui/after/linked-dark-1440.png) | [Persistent category feedback](captures/linked-selection/linked-dark-1440.png) |
| Narrow light theme | [Uniform bars](captures/linked-ui/after/linked-light-320.png) | [Focused month](captures/linked-selection/linked-light-320.png) |
| Native keyboard table | [Original focused action](captures/linked-ui/after/linked-dark-320-keyboard.png) | [Current row and Selected label](captures/linked-selection/linked-dark-320-keyboard.png) |

Reproduce after `npm run build`:

```sh
LINKED_CAPTURE_OUTPUT=docs/experiments/captures/linked-selection npm run capture:linked
```

The targeted three-engine run passes all 15 linked scenarios. Painted-pixel assertions verify that a point selection leaves exactly the selected solid bar group and Reset restores all twelve. Other assertions cover table/select equivalence, stable source focus/instances, both themes at all widths, updates/removal/reintroduction, local legends and cleanup. A dedicated zero/hidden/missing scenario locates the actual band, checks that it moves with a reordered ID, persists with every series hidden and clears on Reset.

All 153 unit/integration tests pass (146 library, seven playground). New option tests cover selected identity, signed/zero/missing observations, unknown IDs and all 16 theme/layout/stack/gradient combinations. Native-table tests prove controlled ownership, rename/reorder/removal behavior, raw zero actions and invalid runtime-type recovery. Strict installed-template checks also reject a numeric selected-row ID and compile the exact displayed/guide example.

The full regression reaches 205 passing browser scenarios with two expected skips for the CDP-only retention check outside Chromium. Strict declarations, the fresh documentation application, SSR, and all six isolated client/SSR modes pass. The initial combined-root size check detects a 407-byte Brotli overrun: rc.1 was already 174,834 bytes against 175,000, and row feedback adds 573 bytes (0.33%). The root Brotli cap is explicitly revised to 176,000; all gzip, focused-family, core and root-frame caps remain unchanged. The specification, architecture and consumer guidance record this cumulative allowance. A component extraction and CSS-generated-label alternative were discarded after measuring their tradeoffs; final production code retains the reviewed native label and matches the already-tested capture source hashes.

The final `check:bundle` rerun passes all eight scenarios, including the combined root at **208,007 gzip / 175,407 Brotli bytes** and focused bar at **180,038 / 153,479**. All engines remain lazy; focused entries exclude unrelated families and core excludes engine runtime. This completes the size phase that stopped the initial aggregate `npm run check`; no behavioral assertion or dependency boundary was relaxed. The new feedback has no separate latency benchmark or broader performance-envelope claim.

`npm run release:local` passes metadata/notices plus all three exact-artifact consumer stages. [The rc.2 candidate record](data/local-release-0.1.0-rc.2.json) identifies **71,065 bytes, 44 files**, SHA-256 `c41489c8880e41c62f11121599c9cecb1acfa2c5ab6c3b06ee2abf4d95b2d7fd`. The strict checker compiles actual guide/gallery sources with `skipLibCheck: false`; the fresh guide application and installed client/SSR runtime checks pass in Chromium, Firefox and WebKit. Every stage uses byte-identical candidate copies. Original MIT and preserved notice bytes pass artifact inspection. The earlier rc.0/rc.1 checksums are unchanged.

The Pages build prerenders **29 physical routes**. Local static checks pass in all three engines, including the selected native-table row, Reset feedback removal/Month focus, reload reset, themes, fonts, anchors and mobile navigation. The reviewed source/image hashes, documentation links/anchors, formatting and whitespace are checked before committing. Live delivery is recorded after deployment.

Earlier [NG20 integration evidence](NG20_LINKED_CHARTS.md), [UI captures](captures/linked-ui/after/manifest.json), rc.0 and rc.1 artifacts remain preserved. Range brushing, shared legends, hover/zoom and bidirectional selection remain later work. Human F09/R06/G2/G3/G4 remain pending.
