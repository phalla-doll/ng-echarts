# Demo performance audit

Audited 13 November 2026 at source `e7bd5b43b556a3414fda3ab9cc8e8d57db8814ad`, also identified by the public deployment marker. The largest loading problem is the Chart possibilities document: it downloads the full ECharts engine after Angular starts, then renders every plot twice. The ordinary galleries have a smaller but measurable delay from their renderer download chain and eager offscreen work.

This is an audit checkpoint. Application code and the public deployment are unchanged. A smaller engine was tested through browser request interception only. The [measurement record](data/demo-performance-audit.json) preserves results, settings, resource timings, rendering counters and the bundle experiment.

## Scope and measurement

- Built the library, production playground and all 31 static Pages routes on Node 24.22.2 and npm 11.19.1. Served the sealed Pages output at `/ng-echarts/`, with gzip and a 600-second cache lifetime matching the public host's policy.
- Measured cold contexts and warm reloads for 13 primary demo routes in Chromium: bar, line, area, pie, composed, radar, linked, chart possibilities, get started, installation, components, formatting and playground. Validation and benchmark fixtures are outside the loading comparison.
- Compared four public routes with cold contexts and warm reloads. The live concept document matches the repository source byte for byte.
- Repeated four local routes at 390 × 844, 4× CPU slowdown, 150 ms network latency, 200,000 bytes/s download and 93,750 bytes/s upload. Desktop uses 1440 × 1000. Both use device scale factor 1 and reduced motion; these are lab conditions, not measurements on a physical phone.
- Ran Lighthouse 13.6.0 with Chromium 158. Bar and chart possibilities each have three local mobile runs; linked, installation, concept desktop and public concept mobile each have one run. Lighthouse's default simulated mobile measurements are separate from the directly throttled readiness measurements.
- Profiled bar startup CPU, recorded a public browser trace, instrumented concept chart creation/updates, exercised filters, bubble mode and themes, and checked five navigation round trips.
- Passed 27 existing browser scenarios across Chromium, Firefox and WebKit, covering the concept gallery, bar gallery and site pages, including mobile layouts, themes, keyboard controls, offline standalone use and navigation cleanup. Timing and CPU findings are Chromium-specific.

Chart readiness below waits for the mounted chart canvases, or all 14 concept plot SVG roots, followed by two animation frames. It also waits for the document load event; it is conservative and does not claim the first visible plot could not have appeared earlier. Documentation timing uses load plus two frames and is not an interactivity assertion. Each direct timing is one sample. Public network samples varied substantially, so compare routes using the controlled local results.

## Loading results

| Route               | Local desktop cold | Controlled mobile cold | Controlled mobile cached reload | Compressed body bytes on local cold load |
| ------------------- | -----------------: | ---------------------: | ------------------------------: | ---------------------------------------: |
| Chart possibilities |             293 ms |               4,526 ms |                          834 ms |                                   607 kB |
| Bar Blocks          |             211 ms |               3,601 ms |                          577 ms |                                   446 kB |
| Linked Charts       |             207 ms |               3,367 ms |                          535 ms |                                   440 kB |
| Installation        |              94 ms |               1,594 ms |                          321 ms |                                   225 kB |

Bytes include documents, scripts, styles and fonts, exclude response headers, and count the iframe document once. kB uses decimal units. The remaining primary chart routes complete in 175–210 ms on the unthrottled local desktop; the remaining documentation routes complete in 91–93 ms.

The first public Chart possibilities sample took **17.32 seconds** to reach the same readiness condition and **0.73 seconds** on cached reload. Its iframe request began at 5.44 seconds and lasted 11.63 seconds. An earlier browser observation started the iframe at 2.11 seconds and spent 12.31 seconds downloading it. The first four public timings were collected while another public Lighthouse probe was in flight, so contention can contribute to those results. Public bar, linked and installation cold observations were 10.47, 1.73 and 4.01 seconds respectively.

A final independent public concept probe, with no other audit load running, completed in **1.67 seconds cold** and **0.43 seconds cached**. Public observations therefore reproduce slow visits but also show substantial connection/CDN variability. They do not establish a typical 17-second load or isolate the hosting provider as the cause. Use the controlled local mobile results to compare implementation costs.

## Lighthouse and user experience

| Page and condition                                | Performance score | First contentful paint | Largest contentful paint | Total blocking time | Cumulative layout shift |
| ------------------------------------------------- | ----------------: | ---------------------: | -----------------------: | ------------------: | ----------------------: |
| Bar, local mobile median of three                 |                96 |                 0.63 s |                   0.63 s |              241 ms |                       0 |
| Chart possibilities, local mobile median of three |                93 |                 0.65 s |                   0.65 s |              325 ms |                   0.039 |
| Linked, local mobile single run                   |               100 |                 0.79 s |                   0.79 s |               63 ms |                       0 |
| Installation, local mobile single run             |               100 |                 0.63 s |                   0.63 s |               84 ms |                       0 |
| Chart possibilities, public mobile single run     |                87 |                 0.83 s |                   0.83 s |              492 ms |                   0.054 |
| Chart possibilities, local desktop single run     |               100 |                 0.19 s |                   0.19 s |               17 ms |                   0.040 |

The bar score ranged from 79 to 99 and blocking time from 123 to 953 ms; the concept mobile score was 92–93 and blocking time 319–344 ms. The medians retain that distinction instead of presenting the worst bar run as typical. Individual Lighthouse scores are variable; [Chrome's scoring guidance](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) explains the limitations.

The good LCP values do not describe chart availability: the observed LCP element is page text, such as the Chart possibilities heading, rather than the interactive plots. Track first visible plot and full-gallery readiness alongside ordinary Web Vitals. LCP and CLS are within Google's recommended ranges in these lab runs; field INP and the 75th-percentile user experience were not measured. [Web Vitals guidance](https://web.dev/articles/vitals) distinguishes loading, responsiveness and visual stability.

## Ranked findings

### 1 Full ECharts inside a delayed document download

**High impact, confirmed.** [The concept source](chart-style-gallery.html) is 1,273,377 bytes. Its inline engine is 1,121,883 bytes, about 88% of the document. GitHub serves the document compressed at 444,342 bytes, making it roughly 72% of the public concept page's compressed body payload. The engine includes chart families and a Canvas renderer unused by this SVG gallery.

The document also embeds the same 48,432-byte Inter font that the parent already downloads, represented as 64,576 base64 characters. Because it is inside the HTML, the browser cannot reuse the parent's cached font response for that embedded copy. Every gallery source revision invalidates the entire HTML payload, including the engine and font.

**Recommended first change:** bundle only the nine chart types and SVG renderer required by this gallery, retaining notices and standalone offline operation. Apache documents this [supported modular import approach](https://echarts.apache.org/handbook/en/basics/import/).

The isolated esbuild experiment reduced the engine to 702,751 raw bytes and the complete document from 439,969 to 310,221 locally gzipped bytes: **129,748 bytes, or 29.5%, saved**. These use the same compressor on both versions; the public host's gzip settings produce a slightly different original size. The experiment retained 14 plots, filtering, bubble mode and theme switching with no page errors. Full desktop and filtered mobile screenshots were byte-identical to baseline. This verifies the sampled states, not every tooltip or chart behavior.

A later web-specific build could externalize a hashed modular engine and reuse the parent's font while retaining the downloadable offline document. That needs explicit generated-asset provenance and regression checks because the current deployment copies and validates the standalone source byte for byte.

### 2 The browser discovers the iframe after Angular startup

**High impact, confirmed.** The [iframe template](../../projects/playground/src/app/chart-possibilities.html) binds its source only when `browserReady()` is true. The [wrapper](../../projects/playground/src/app/chart-possibilities.ts) sets that flag in `afterNextRender`. Consequently the prerendered HTML cannot start the real document request during initial parsing.

In the controlled mobile sample, the main document responds at 151 ms but the gallery request starts at 1,282 ms. That is about 1.13 seconds of delayed discovery after the response, before transferring the gallery itself. Public observations show an even longer dependency wait when application scripts download slowly.

**Recommended change:** make the trusted same-origin iframe URL discoverable in prerendered markup, then perform theme and height synchronization through a reliable post-load handshake. Preserve origin/source checks and handle the child finishing before Angular registers its listener. The measured discovery gap is an opportunity to overlap work, not a guaranteed equal reduction in total load time.

### 3 Every concept plot receives its initial options twice

**High impact, confirmed.** The concept's font-ready initialization calls `setTheme(initial)`, and the wrapper's load handler sends another theme message. `setTheme` calls `render()` even if the theme has not changed. Instrumentation observes **14 chart instances and 28 `setOption` calls** at startup. Those calls total about 585 ms synchronously in the 4× CPU diagnostic run, in addition to about 56 ms creating instances. Instrumentation adds some overhead, so these are diagnostic costs rather than a savings guarantee.

**Recommended change:** track whether the requested theme has already been rendered, avoid redundant option application, and keep resize/ready notifications independent from theme redraws. Verify dark and saved light startup, direct loads, client navigation and reloads.

### 4 Offscreen plots and code examples compete with visible content

**Medium impact, confirmed; savings need measurement after implementation.** The concept's `render()` loop initializes all 14 plots immediately, although only the calendar is initially visible on a narrow screen. A theme change applies another 14 option updates, about 172 ms in the instrumented 4× CPU run. The ordinary [gallery loop](../../projects/playground/src/app/gallery.html) similarly mounts every block immediately.

The [bar block](../../projects/playground/src/app/bar-block.html) and pie equivalent retain the complete code view under `[hidden]`. The [highlighting directive](../../projects/playground/src/app/highlight-code.ts) still computes and binds highlighted HTML at startup. The shared highlighter chunk adds about 13 kB compressed and code-bearing pages also request a 35 kB code font. Some import snippets are intentionally visible below the fold, so removing the highlighter wholesale would change the product.

**Recommended change:** prioritize the visible plot, initialize later plots near the viewport, and defer full code highlighting until Code is opened. Preserve card dimensions, data-table access, fragment navigation, printing and theme state for plots created later. Account for the concept's expanding iframe when defining visibility. [Angular's defer guide](https://angular.dev/guide/templates/defer) covers supported viewport and interaction triggers for Angular blocks.

### 5 Ordinary chart routes have a serial renderer dependency chain

**Medium impact, confirmed.** The application route and chart components load before their dynamic renderer import, which then discovers the ECharts engine chunks. On the public bar sample, the renderer is requested at 5.92 seconds, its two shared engine chunks at 6.26 seconds, and the page reaches chart readiness at 10.47 seconds. The two engine chunks together are about 193 kB compressed on that host. Documentation routes do not request them.

The lazy boundary protects SSR and pages without charts; it should remain. **Recommended change:** investigate demo-specific early warming of the renderer needed by the current chart route, overlapping its download with Angular startup. Keep the library's browser adapter and focused family imports lazy. Validate this separately from initial-shell budgets and avoid prefetching every gallery renderer indiscriminately.

### 6 Current budgets miss the slowest content

**Medium impact, confirmed.** Angular's initial bundle is about 350 kB raw, below its 500 kB warning. The concept HTML is an asset and its engine is inline, so that budget does not constrain the largest request. The existing [package budget checker](../../tools/check-bundle-size.mjs) measures consumer library imports, not the demo's complete route payload or chart readiness.

**Recommended change:** add route-level compressed-byte budgets and cold first-visible-plot readiness checks, including iframe assets. Keep package-isolation budgets as separate checks. Derive timing limits from repeatable controlled baselines rather than a single public network sample.

### 7 Public caching helps reloads but has a short freshness window

**Lower priority, confirmed.** Public responses already use gzip and `Cache-Control: max-age=600`. The fast cached reloads show that browser caching works. The 10-minute policy still causes more revalidation than an immutable policy for hashed JavaScript and fonts. This is a hosting-level opportunity; an Angular application change cannot set GitHub Pages response headers.

Consider a configurable hosting/cache layer only after reducing payload and startup work. Revalidation does not always redownload the entire body, so a short cache lifetime alone does not explain every slow visit.

## Findings that do not justify changes

- No failed chart requests or browser page errors appeared in the primary-page timing runs or the isolated smaller-engine comparison.
- The site already prerenders content, splits routes, compresses text assets and self-hosts fonts. There is no external font provider, analytics request or large image blocking these flows.
- Images and icons are small; image conversion and extra preconnect hints are not useful priorities here. Lighthouse finds no additional preconnect candidates.
- Layout shift is small compared with the loading delay. Fixing plot delivery and redundant rendering takes precedence over the minor loading-note and dynamically inserted-card shifts.
- The five diagnostic navigation round trips retained one embedded frame and working theme state. Heap use rose from about 17.1 to 18.8 MB; this short instrumented sample is insufficient to establish a memory leak or long-term stability. Existing gallery resource-cleanup scenarios pass.

## Recommended implementation order

1. Ship the smaller modular concept engine, start its document request earlier, and remove duplicate initial theme renders. Recheck offline operation, source/asset revision validation, theme synchronization and all three browsers.
2. Render offscreen charts progressively and defer hidden full-source highlighting. Preserve accessible content, stable geometry and fragment behavior.
3. Shorten normal gallery renderer discovery and introduce demo route payload/readiness budgets. Re-measure under the same mobile settings before choosing hosting changes.

The audit does not change library package candidates or pending human release gates. Any eventual public demo update must follow the existing clean-source build, verification and deployment workflow.
