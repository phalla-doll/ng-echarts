import assert from 'node:assert/strict';

export const navigationConditions = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
  cpuRate: 4,
  latencyMs: 150,
  downloadBytesPerSecond: 200000,
  uploadBytesPerSecond: 93750,
};
const scenarios = [
  ['line', 'Line Blocks', false],
  ['pie', 'Pie & Donut Blocks', false],
  ['calendar', 'Calendar Heatmap', false],
  ['sankey', 'Sankey Flow', false],
  ['', 'Bar Blocks', true],
  ['line', 'Line Blocks', true],
  ['pie', 'Pie & Donut Blocks', true],
  ['calendar', 'Calendar Heatmap', true],
];
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** Measure real router transitions with normal animation, including new/repeated families. */
export async function measureDemoNavigation(
  browser,
  base,
  { iterations = 3, enforce = true } = {},
) {
  const results = scenarios.map(([route, label, revisit]) => ({
    route: route || '/',
    label,
    revisit,
    budgetMs: revisit ? 750 : 1500,
    samples: [],
  }));
  for (let iteration = 0; iteration < iterations; iteration++) {
    const context = await browser.newContext({
      viewport: navigationConditions.viewport,
      deviceScaleFactor: navigationConditions.deviceScaleFactor,
      reducedMotion: navigationConditions.reducedMotion,
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('requestfailed', (request) =>
        errors.push(`${request.url()}: ${request.failure()?.errorText}`),
      );
      page.on('response', (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: navigationConditions.latencyMs,
        downloadThroughput: navigationConditions.downloadBytesPerSecond,
        uploadThroughput: navigationConditions.uploadBytesPerSecond,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: navigationConditions.cpuRate });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.locator('canvas').first().waitFor();
      // Let the initial entrance animation finish before beginning a separate journey.
      await page.waitForTimeout(350);
      for (const result of results) {
        await page.evaluate(() => {
          const old = new Set(document.querySelectorAll('canvas'));
          const measurement = { start: performance.now(), readyMs: null, pending: false };
          window.demoNavigationMeasurement = measurement;
          performance.clearResourceTimings();
          const observer = new MutationObserver(() => {
            const canvas = Array.from(document.querySelectorAll('#page-content canvas')).find(
              (item) => !old.has(item),
            );
            if (!canvas || measurement.pending) return;
            measurement.pending = true;
            observer.disconnect();
            requestAnimationFrame(() =>
              requestAnimationFrame(
                () => (measurement.readyMs = performance.now() - measurement.start),
              ),
            );
          });
          observer.observe(document.getElementById('page-content'), {
            childList: true,
            subtree: true,
          });
        });
        await page.getByRole('link', { name: result.label, exact: true }).first().click();
        await page.waitForFunction(() => window.demoNavigationMeasurement.readyMs !== null);
        const sample = await page.evaluate(() => ({
          firstChartMs: window.demoNavigationMeasurement.readyMs,
          downloadedBytes: performance
            .getEntriesByType('resource')
            .reduce((sum, entry) => sum + (entry.transferSize ? entry.encodedBodySize : 0), 0),
        }));
        result.samples.push(sample);
        await page.waitForTimeout(350);
      }
      assert.deepEqual(errors, [], 'Navigation generated browser or network errors.');
    } finally {
      await context.close();
    }
  }
  for (const result of results) {
    result.medianFirstChartMs = median(result.samples.map((sample) => sample.firstChartMs));
    if (enforce)
      assert(
        result.medianFirstChartMs < result.budgetMs,
        `${result.label} ${result.revisit ? 'revisit' : 'first visit'} exceeded ${result.budgetMs} ms: ${result.medianFirstChartMs}`,
      );
  }
  return { conditions: navigationConditions, iterations, results };
}
