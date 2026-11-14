import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkConceptEngine } from './concept-assets.mjs';

export const rendererRoutes = {
  '': ['bar'],
  line: ['line'],
  area: ['area'],
  pie: ['pie'],
  composed: ['composed'],
  radar: ['radar'],
  radial: ['radial'],
  calendar: ['calendar'],
  sankey: ['sankey'],
  linked: ['bar', 'pie'],
  playground: ['bar'],
  formatting: ['bar'],
};

const routeComponents = {
  '': 'gallery',
  line: 'gallery',
  area: 'gallery',
  pie: 'gallery',
  composed: 'gallery',
  radar: 'radar-blocks',
  radial: 'radial-blocks',
  calendar: 'calendar-blocks',
  sankey: 'sankey-blocks',
  linked: 'linked-charts',
  playground: 'app',
  formatting: 'formatting',
};

const familyCharts = {
  bar: ['bar'],
  line: ['line'],
  area: ['line'],
  composed: ['bar', 'line'],
  pie: ['pie'],
  radar: ['radar'],
  radial: ['pie'],
  calendar: ['heatmap'],
  sankey: ['sankey'],
};

function assertFocusedGraph(outputs, files, allowedCharts, label) {
  for (const name of files) {
    for (const [input, contribution] of Object.entries(outputs[name].inputs ?? {})) {
      if (contribution.bytesInOutput <= 0) continue;
      const chart = input.match(/echarts\/lib\/chart\/([^/.]+)(?:\/|\.js$)/)?.[1];
      assert(
        !chart || ['helper', 'custom', ...allowedCharts].includes(chart),
        `${label} preloads unrelated ${chart} chart code`,
      );
    }
  }
}

export function rendererPreloads(outputs) {
  const families = {};
  for (const family of new Set(Object.values(rendererRoutes).flat())) {
    const entry = Object.entries(outputs).find(([, output]) =>
      output.entryPoint?.includes(`-${family}-${family}-renderer-`),
    );
    assert(entry, `Missing ${family} renderer in browser build statistics.`);
    const files = new Set();
    function visit(name) {
      if (files.has(name)) return;
      assert(outputs[name], `Unknown browser preload dependency: ${name}`);
      files.add(name);
      for (const dependency of outputs[name].imports ?? []) {
        if (!dependency.external && dependency.kind !== 'dynamic-import') visit(dependency.path);
      }
    }
    visit(entry[0]);
    // Deferred component facades otherwise add a second dependency waterfall
    // after Angular starts. Warming the renderer alone does not fetch them.
    const component = Object.entries(outputs).find(([, output]) =>
      output.entryPoint?.endsWith(`/mantha911-ng-echarts-${family}.mjs`),
    );
    if (component) visit(component[0]);
    assertFocusedGraph(outputs, files, familyCharts[family], `${family} renderer`);
    families[family] = [...files].filter((name) => name.endsWith('.js'));
  }
  return Object.fromEntries(
    Object.entries(rendererRoutes).map(([route, names]) => {
      const files = new Set(names.flatMap((name) => families[name]));
      const component = Object.entries(outputs).find(([, output]) =>
        output.entryPoint?.endsWith(`/app/${routeComponents[route]}.ts`),
      );
      function visit(name) {
        if (files.has(name)) return;
        assert(outputs[name], `Unknown route preload dependency: ${name}`);
        files.add(name);
        for (const dependency of outputs[name].imports ?? []) {
          if (!dependency.external && dependency.kind !== 'dynamic-import') visit(dependency.path);
        }
      }
      if (component) visit(component[0]);
      assertFocusedGraph(
        outputs,
        files,
        names.flatMap((name) => familyCharts[name]),
        `${route || 'bar'} route`,
      );
      return [
        route,
        [...files]
          .filter((name) => name.endsWith('.js'))
          .map((href) => ({ href, rel: 'modulepreload' })),
      ];
    }),
  );
}

export function preloadMarkup(manifest, route) {
  const links = (manifest.routes[route] ?? [])
    .map(
      ({ href, rel }) =>
        `<link rel="${rel}"${rel === 'preload' ? ' as="script"' : ''} href="${manifest.base}${href}">`,
    )
    .join('');
  return `${links}<script id="demo-preloads" type="application/json">${JSON.stringify(manifest).replaceAll('<', '\\u003c')}</script>`;
}

export async function prepareDemo(directory) {
  const browser = join(directory, 'browser');
  const stats = JSON.parse(await readFile(join(directory, 'browser-stats.json'), 'utf8'));
  const { files, engineName } = await checkConceptEngine();
  await mkdir(join(browser, 'concepts'), { recursive: true });
  for (const [name, source] of Object.entries(files)) {
    await writeFile(join(browser, 'concepts', name), source);
  }
  const index = await readFile(join(browser, 'index.csr.html'), 'utf8').catch(() =>
    readFile(join(browser, 'index.html'), 'utf8'),
  );
  const base = index.match(/<base href="([^"]+)">/u)?.[1];
  assert(base?.startsWith('/') && base.endsWith('/'), 'Missing demo base URL.');
  const routes = rendererPreloads(stats.outputs);
  routes['chart-possibilities'] = [{ href: `concepts/${engineName}`, rel: 'preload' }];
  const manifest = { base, routes };
  await writeFile(join(browser, 'demo-preloads.json'), JSON.stringify(manifest));
  async function inject(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory() && folder === browser && entry.name !== 'concepts')
        await inject(path);
      else if (entry.isFile() && entry.name === 'index.html') {
        const route = folder === browser ? '' : folder.slice(browser.length + 1);
        const html = await readFile(path, 'utf8');
        await writeFile(path, html.replace('<head>', `<head>${preloadMarkup(manifest, route)}`));
      }
    }
  }
  await inject(browser);
  console.log(
    `Prepared shared concept assets and ${Object.keys(routes).length} renderer preload maps.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert(process.argv[2], 'Pass an Angular build output directory.');
  await prepareDemo(resolve(process.argv[2]));
}
