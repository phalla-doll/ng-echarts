import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
import { artifactFingerprint, validateBuild } from './pages-provenance.mjs';
import { withPagesLock } from './pages-lock.mjs';
import { measureDemoNavigation } from './demo-navigation-performance.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'dist/pages/browser');
const routes = {
  '': 445000,
  line: 445000,
  area: 445000,
  pie: 445000,
  composed: 445000,
  radar: 445000,
  radial: 445000,
  calendar: 445000,
  sankey: 445000,
  linked: 455000,
  'chart-possibilities': 465000,
  'get-started': 240000,
  installation: 240000,
  components: 210000,
  formatting: 400000,
  playground: 445000,
};
const measuredRoutes = new Set([
  '',
  'chart-possibilities',
  'linked',
  'installation',
  'calendar',
  'sankey',
]);
const recordOnly = process.argv.includes('--record');
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

await withPagesLock(root, 'performance', async () => {
  const marker = await validateBuild(root, directory);
  const fingerprint = await artifactFingerprint(directory);
  const conceptFiles = (await import('./concept-assets.mjs')).conceptAssets(
    await readFile(join(root, 'docs/experiments/chart-style-gallery.html'), 'utf8'),
  );
  const assetBudgets = {
    'chart-style-gallery.html': 335000,
    'chart-style-gallery-embedded.html': 25000,
    [conceptFiles.engineName]: 250000,
  };
  for (const [name, budget] of Object.entries(assetBudgets)) {
    const bytes = gzipSync(await readFile(join(directory, 'concepts', name))).length;
    if (!recordOnly) assert(bytes <= budget, `${name} exceeded ${budget} gzipped bytes: ${bytes}`);
  }
  const mime = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.woff2': 'font/woff2',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
  };
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (!path.startsWith(marker.baseHref)) return response.writeHead(404).end();
      let file = resolve(directory, decodeURIComponent(path.slice(marker.baseHref.length)));
      if (file !== directory && !file.startsWith(directory + '/'))
        return response.writeHead(400).end();
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      let bytes = await readFile(file);
      const type = mime[extname(file)] ?? 'application/octet-stream';
      const compressed =
        /html|javascript|css|json|svg/u.test(type) &&
        request.headers['accept-encoding']?.includes('gzip');
      if (compressed) bytes = gzipSync(bytes);
      response.writeHead(200, {
        'Content-Type': type,
        'Content-Length': bytes.length,
        'Cache-Control': 'max-age=600',
        ...(compressed ? { 'Content-Encoding': 'gzip' } : {}),
      });
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${server.address().port}${marker.baseHref}`;
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const [route, byteBudget] of Object.entries(routes)) {
      const samples = [];
      const mobile = measuredRoutes.has(route);
      for (let iteration = 0; iteration < (mobile ? 3 : 1); iteration++) {
        const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 1,
          reducedMotion: 'reduce',
        });
        try {
          const page = await context.newPage();
          const errors = [];
          let conceptNavigations = 0;
          page.on('request', (request) => {
            if (
              request.isNavigationRequest() &&
              request.url().includes('/concepts/chart-style-gallery-embedded.html')
            )
              conceptNavigations++;
          });
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('response', (response) => {
            if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
          });
          page.on('requestfailed', (request) =>
            errors.push(`${request.url()}: ${request.failure()?.errorText}`),
          );
          if (mobile) {
            const cdp = await context.newCDPSession(page);
            await cdp.send('Network.enable');
            await cdp.send('Network.emulateNetworkConditions', {
              offline: false,
              latency: 150,
              downloadThroughput: 200000,
              uploadThroughput: 93750,
            });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
          }
          const response = await page.goto(base + (route ? route + '/' : ''), {
            waitUntil: 'domcontentloaded',
          });
          assert.equal(response.status(), 200);
          if (route === 'chart-possibilities') {
            await page.frameLocator('iframe').locator('#plot-calendar svg').waitFor();
          } else if (!['get-started', 'installation', 'components'].includes(route)) {
            await page.locator('canvas').first().waitFor();
          }
          await page.evaluate(
            () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
          );
          const readyMs = await page.evaluate(() => performance.now());
          await page.waitForLoadState('load');
          if (route === 'chart-possibilities')
            await page.locator('.loading-note').waitFor({ state: 'hidden' });
          const sample = await page.evaluate(() => {
            const windows = [
              window,
              ...Array.from(document.querySelectorAll('iframe'), (frame) => frame.contentWindow),
            ];
            const urls = new Set(windows.map((frame) => frame.location.href));
            const resources = windows.flatMap((frame) =>
              frame.performance
                .getEntriesByType('resource')
                .filter((entry) => !urls.has(entry.name)),
            );
            const documents = windows.map(
              (frame) => frame.performance.getEntriesByType('navigation')[0],
            );
            return {
              compressedBytes: [...resources, ...documents].reduce(
                (sum, entry) => sum + (entry.transferSize ? entry.encodedBodySize : 0),
                0,
              ),
              canvases: document.querySelectorAll('canvas').length,
              conceptPlots: windows
                .slice(1)
                .reduce(
                  (sum, frame) =>
                    sum + frame.document.querySelectorAll('.plot svg,.spark-plot svg').length,
                  0,
                ),
              resources: resources.map((entry) => ({
                url: entry.name,
                startMs: entry.startTime,
                encodedBytes: entry.encodedBodySize,
                transferBytes: entry.transferSize,
              })),
            };
          });
          samples.push({ readyMs, conceptNavigations, ...sample });
          assert(conceptNavigations <= 1, 'Hydration restarted the concept frame navigation.');
          assert.deepEqual(errors, [], `Browser errors at ${route || '/'}`);
        } finally {
          await context.close();
        }
      }
      const bytes = Math.max(...samples.map((sample) => sample.compressedBytes));
      const readyMs = median(samples.map((sample) => sample.readyMs));
      results.push({
        route: route || '/',
        throttled: mobile,
        byteBudget,
        readinessBudgetMs: mobile ? 5000 : null,
        medianFirstVisibleMs: readyMs,
        samples,
      });
      console.log(
        `${route || '/'}: ${Math.round(bytes / 1000)} kB; ${Math.round(readyMs)} ms first visible${mobile ? ' (mobile median of 3)' : ''}`,
      );
      if (!recordOnly) {
        assert(
          bytes <= byteBudget,
          `${route || '/'} exceeded ${byteBudget} compressed bytes: ${bytes}`,
        );
        if (mobile)
          assert(readyMs < 5000, `${route || '/'} exceeded 5 s controlled readiness: ${readyMs}`);
        if (route === '')
          assert(
            samples.every((sample) => sample.canvases <= 2),
            'Offscreen gallery charts rendered eagerly.',
          );
        if (route === 'chart-possibilities')
          assert(
            samples.every((sample) => sample.conceptPlots <= 3),
            'Offscreen concept plots rendered eagerly.',
          );
      }
    }
    const navigation = await measureDemoNavigation(browser, base, { enforce: !recordOnly });
    for (const result of navigation.results) {
      console.log(
        `${result.label} ${result.revisit ? 'revisit' : 'first navigation'}: ${Math.round(result.medianFirstChartMs)} ms (normal motion)`,
      );
    }
    const evidence = {
      sourceCommit: marker.sourceBaseCommit,
      sourceSha256: marker.sourceSha256,
      artifactSha256: marker.artifact.sha256,
      checkedAt: new Date().toISOString(),
      mode: recordOnly ? 'record-only' : 'enforced',
      viewport: { width: 390, height: 844 },
      mobile: {
        cpuRate: 4,
        latencyMs: 150,
        downloadBytesPerSecond: 200000,
        uploadBytesPerSecond: 93750,
      },
      results,
      navigation,
    };
    await writeFile(
      join(root, 'dist/demo-performance.json'),
      JSON.stringify(evidence, null, 2) + '\n',
    );
    assert.deepEqual(
      await artifactFingerprint(directory),
      fingerprint,
      'Performance checks changed the sealed artifact.',
    );
    await validateBuild(root, directory);
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
});
