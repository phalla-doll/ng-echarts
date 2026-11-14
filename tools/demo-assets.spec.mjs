import assert from 'node:assert/strict';
import test from 'node:test';
import { conceptAssets, checkConceptEngine } from './concept-assets.mjs';
import { preloadMarkup, rendererPreloads } from './prepare-demo.mjs';

test('derives web assets without changing offline bytes or interpreting replacement tokens', () => {
  const engine = 'const literal = "$&";';
  const application = '<script>window.galleryApplication = true;</script>';
  const source = `<style>src:url('data:font/woff2;base64,YWJj')</style><!-- concept-engine:start --><script>${engine}</script><!-- concept-engine:end -->${application}`;
  const assets = conceptAssets(source);
  assert.equal(assets.files['chart-style-gallery.html'], source);
  assert.equal(assets.files[assets.engineName], engine);
  const embedded = assets.files['chart-style-gallery-embedded.html'];
  assert(embedded.includes(`src="${assets.engineName}"`));
  assert(embedded.endsWith(application));
  assert(embedded.includes('../fonts/inter-latin.woff2'));
  assert(!embedded.includes('data:font'));
  assert.equal(
    conceptAssets(source.replace('galleryApplication', 'newApplication')).engineName,
    assets.engineName,
  );
  assert.notEqual(
    conceptAssets(source.replace(engine, engine + '0;')).engineName,
    assets.engineName,
  );
});

test('rejects missing engine boundaries and verifies the pinned modular engine', async () => {
  assert.throws(() => conceptAssets('<script>unbounded</script>'), /markers/);
  const assets = await checkConceptEngine();
  assert(assets.files['chart-style-gallery-embedded.html'].includes('function requestRender()'));
  assert(!assets.files['chart-style-gallery-embedded.html'].includes('var echarts='));
  assert(assets.files[assets.engineName].includes('Apache Software Foundation'));
});

test('warms only the requested renderer graph and preserves the Pages prefix', () => {
  const outputs = { 'shared.js': { imports: [] }, 'unused.js': { imports: [] } };
  for (const family of [
    'bar',
    'line',
    'area',
    'pie',
    'composed',
    'radar',
    'radial',
    'calendar',
    'sankey',
  ]) {
    outputs[`${family}.js`] = {
      entryPoint: `ng-echarts-chart-library-${family}-${family}-renderer-hash.mjs`,
      imports: [
        { path: 'shared.js', kind: 'import-statement' },
        { path: 'unused.js', kind: 'dynamic-import' },
      ],
    };
  }
  const routes = rendererPreloads(outputs);
  assert.deepEqual(
    routes[''].map((link) => link.href),
    ['bar.js', 'shared.js'],
  );
  assert.deepEqual(
    routes.linked.map((link) => link.href),
    ['bar.js', 'shared.js', 'pie.js'],
  );
  assert.deepEqual(
    routes.calendar.map((link) => link.href),
    ['calendar.js', 'shared.js'],
  );
  assert.equal(routes.installation, undefined);
  const manifest = { base: '/ng-echarts/', routes };
  assert(preloadMarkup(manifest, '').includes('href="/ng-echarts/bar.js"'));
  assert(!preloadMarkup(manifest, 'installation').includes('<link'));
  assert.throws(() => rendererPreloads({}), /Missing bar renderer/);
});

test('rejects unrelated chart code entering a renderer preload graph', () => {
  const outputs = {};
  for (const family of [
    'bar',
    'line',
    'area',
    'composed',
    'pie',
    'radar',
    'radial',
    'calendar',
    'sankey',
  ]) {
    outputs[`${family}.js`] = {
      entryPoint: `ng-echarts-chart-library-${family}-${family}-renderer-hash.mjs`,
      imports: [],
      inputs: {},
    };
  }
  outputs['bar.js'].inputs['node_modules/echarts/lib/chart/sankey/SankeyView.js'] = {
    bytesInOutput: 100,
  };
  assert.throws(() => rendererPreloads(outputs), /bar renderer preloads unrelated sankey/);
  outputs['bar.js'].inputs['node_modules/echarts/lib/chart/sankey/SankeyView.js'].bytesInOutput = 0;
  assert.doesNotThrow(() => rendererPreloads(outputs));
});

test('warms the destination component graph while keeping deferred families independent', () => {
  const outputs = { 'shared.js': { imports: [] }, 'highlighter.js': { imports: [] } };
  for (const family of [
    'bar',
    'line',
    'area',
    'composed',
    'pie',
    'radar',
    'radial',
    'calendar',
    'sankey',
  ]) {
    outputs[`${family}-renderer.js`] = {
      entryPoint: `ng-echarts-chart-library-${family}-${family}-renderer-hash.mjs`,
      imports: [{ path: 'shared.js', kind: 'import-statement' }],
    };
    outputs[`${family}-component.js`] = {
      entryPoint: `dist/chart-library/fesm2022/ng-echarts-chart-library-${family}.mjs`,
      imports: [{ path: 'shared.js', kind: 'import-statement' }],
    };
  }
  outputs['gallery.js'] = {
    entryPoint: 'projects/playground/src/app/gallery.ts',
    imports: [
      { path: 'shared.js', kind: 'import-statement' },
      { path: 'line-component.js', kind: 'dynamic-import' },
      { path: 'highlighter.js', kind: 'dynamic-import' },
    ],
  };
  const routes = rendererPreloads(outputs);
  expectNames(routes[''], ['bar-renderer.js', 'shared.js', 'bar-component.js', 'gallery.js']);
  expectNames(routes.line, ['line-renderer.js', 'shared.js', 'line-component.js', 'gallery.js']);
  assert.equal(routes.installation, undefined);
  outputs['gallery.js'].inputs = {
    'node_modules/echarts/lib/chart/sankey/SankeyView.js': { bytesInOutput: 100 },
  };
  assert.throws(() => rendererPreloads(outputs), /bar route preloads unrelated sankey/);
  function expectNames(links, names) {
    assert.deepEqual(
      links.map((link) => link.href),
      names,
    );
  }
});
