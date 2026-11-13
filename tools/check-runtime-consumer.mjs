import { consumerArtifact } from './consumer-artifact.mjs';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { cp, mkdtemp, realpath, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, firefox, webkit } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const root = resolve(import.meta.dirname, '..');
const consumer = await realpath(await mkdtemp(join(tmpdir(), 'ng-echarts-runtime-')));
const children = [];
let staticServer;
async function run(command, args) {
  const child = spawn(command, args, {
    cwd: consumer,
    env: { ...process.env, NODE_PATH: '' },
    stdio: 'pipe',
  });
  let output = '';
  child.stdout.on('data', (data) => {
    output += data;
  });
  child.stderr.on('data', (data) => {
    output += data;
  });
  const status = await new Promise((done) => child.on('close', done));
  assert.equal(status, 0, `${command} ${args.join(' ')} failed:\n${output}`);
  return output;
}
async function exercise(engine, url, ssr) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' || /NG05\d+/.test(message.text())) errors.push(message.text());
    });
    const response = await page.goto(`${url}/validation`);
    const html = await response.text();
    assert.equal(response.status(), 200);
    assert(!html.includes('<canvas'), 'Server/static HTML must not contain a renderer');
    if (ssr)
      assert(
        html.includes('Deferred visits') && html.includes('Primary visits'),
        'SSR must render library markup',
      );
    else
      assert(!html.includes('Primary visits'), 'CSR fixture must start with a client-only shell');
    const primary = page.getByTestId('primary');
    await primary.locator('canvas').waitFor();
    assert.equal(await primary.locator('canvas').count(), 1);
    await primary.getByRole('button', { name: 'Show data table', exact: true }).click();
    await primary
      .getByRole('button', { name: 'Select Desktop for January: 342', exact: true })
      .waitFor();
    await primary.locator('.legend button').first().click();
    await expect(primary.locator('.legend button').first()).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await page.getByRole('button', { name: 'Reveal hidden chart', exact: true }).click();
    await page.getByTestId('hidden').locator('canvas').waitFor();
    await page.getByRole('button', { name: 'Finish loading', exact: true }).click();
    await page.getByTestId('loading').locator('canvas').waitFor();
    if (ssr) {
      await page
        .getByTestId('deferred')
        .getByRole('button', { name: 'Show data table', exact: true })
        .click();
      await page.getByTestId('deferred').locator('canvas').waitFor();
      await page.getByTestId('deferred').locator('table').waitFor();
    }
    const navigation = page.getByRole('navigation', { name: 'Playground pages' });
    await navigation.getByRole('link', { name: 'Pie & Donut Blocks', exact: true }).click();
    await expect(page.locator('nec-pie-chart canvas')).toHaveCount(3);
    await navigation.getByRole('link', { name: 'Pie validation', exact: true }).click();
    const pie = page.locator('.primary-pie nec-pie-chart');
    await expect(pie.locator('canvas')).toHaveCount(1);
    await pie.getByRole('button', { name: 'Show data table', exact: true }).click();
    await pie.getByRole('button', { name: 'Select Visits for April: 0', exact: true }).click();
    await expect(page.locator('.selection')).toHaveText('d/visits/0/table');
    await page.getByRole('button', { name: 'Update pie values', exact: true }).click();
    await expect(
      pie.getByRole('button', { name: 'Select Visits for January: 110', exact: true }),
    ).toBeVisible();
    if (ssr) {
      const deferred = page.locator('.deferred-pie');
      await deferred.getByRole('button', { name: 'Show data table', exact: true }).click();
      await expect(deferred.locator('canvas')).toHaveCount(1);
      await expect(deferred.locator('table')).toBeVisible();
    }
    await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
    await page.getByRole('heading', { name: 'Navigation cleanup fixture', exact: true }).waitFor();
    assert.equal(await page.locator('canvas').count(), 0);
    await page.getByRole('link', { name: 'Playground', exact: true }).click();
    await page.locator('nec-bar-chart canvas').waitFor();
    await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
    await expect(page.locator('.legend .swatch').first()).toHaveCSS(
      'background-color',
      'rgb(16, 185, 129)',
    );
    await page.getByRole('button', { name: 'Update values', exact: true }).click();
    await page.getByRole('button', { name: 'Show data table', exact: true }).click();
    await page
      .getByRole('button', { name: 'Select Desktop for January: 442', exact: true })
      .waitFor();
    await page
      .getByRole('button', { name: 'Select Desktop for January: 442', exact: true })
      .focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.selection')).toHaveText('January: desktop = 442 (table)');
    await page
      .getByRole('navigation', { name: 'Playground pages' })
      .getByRole('link', { name: 'Line Blocks', exact: true })
      .click();
    await expect(page.locator('nec-line-chart canvas')).toHaveCount(4);
    await page
      .getByRole('navigation', { name: 'Playground pages' })
      .getByRole('link', { name: 'Line validation', exact: true })
      .click();
    const line = page.locator('.primary-line nec-line-chart');
    await expect(line.locator('canvas')).toHaveCount(1);
    await line.getByRole('button', { name: 'Show data table', exact: true }).click();
    await line.getByRole('button', { name: 'Select Mobile for May: -20', exact: true }).click();
    await expect(page.locator('.selection')).toHaveText('e/mobile/-20/table');
    await page.getByRole('button', { name: 'Update line values', exact: true }).click();
    await expect(
      line.getByRole('button', { name: 'Select Desktop for January: 110', exact: true }),
    ).toBeVisible();
    if (ssr) {
      const deferred = page.locator('.deferred-line');
      await deferred.getByRole('button', { name: 'Show data table', exact: true }).click();
      await expect(deferred.locator('canvas')).toHaveCount(1);
      await expect(deferred.locator('table')).toBeVisible();
    }
    await page
      .getByRole('navigation', { name: 'Playground pages' })
      .getByRole('link', { name: 'Area Blocks', exact: true })
      .click();
    await expect(page.locator('nec-area-chart canvas')).toHaveCount(4);
    await page
      .getByRole('navigation', { name: 'Playground pages' })
      .getByRole('link', { name: 'Area validation', exact: true })
      .click();
    const areaChart = page.locator('.primary-area nec-area-chart');
    await expect(areaChart.locator('canvas')).toHaveCount(1);
    await areaChart.getByRole('button', { name: 'Show data table', exact: true }).click();
    await areaChart
      .getByRole('button', { name: 'Select Desktop for April: -160', exact: true })
      .click();
    await expect(page.locator('.selection')).toHaveText('d/desktop/-160/table');
    await page.getByRole('button', { name: 'Update area values', exact: true }).click();
    await expect(
      areaChart.getByRole('button', { name: 'Select Desktop for January: 110', exact: true }),
    ).toBeVisible();
    if (ssr) {
      const deferred = page.locator('.deferred-area');
      await deferred.getByRole('button', { name: 'Show data table', exact: true }).click();
      await expect(deferred.locator('canvas')).toHaveCount(1);
      await expect(deferred.locator('table')).toBeVisible();
    }
    await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await navigation.getByRole('link', { name: 'Composed Blocks', exact: true }).click();
    await expect(page.locator('nec-composed-chart canvas')).toHaveCount(1);
    await navigation.getByRole('link', { name: 'Composed validation', exact: true }).click();
    const composed = page.locator('.primary-composed nec-composed-chart');
    await expect(composed.locator('canvas')).toHaveCount(1);
    await composed.getByRole('button', { name: 'Show data table', exact: true }).click();
    await composed.getByRole('button', { name: 'Select Trend for March: 0', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.selection')).toHaveText('c/trend/0/table');
    await page.getByRole('button', { name: 'Update composed values', exact: true }).click();
    await expect(
      composed.getByRole('button', { name: 'Select Visits for January: 110', exact: true }),
    ).toBeVisible();
    await composed.locator('.legend button').first().click();
    await page.getByRole('button', { name: 'Switch series kind', exact: true }).click();
    await expect(composed.locator('.legend button').first()).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    if (ssr) {
      await page
        .locator('.deferred-composed')
        .getByRole('button', { name: 'Show data table', exact: true })
        .click();
      await expect(page.locator('.deferred-composed canvas')).toHaveCount(1);
    }
    await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await navigation.getByRole('link', { name: 'Linked Charts', exact: true }).click();
    await expect(page.locator('app-linked-visits canvas')).toHaveCount(2);
    await page
      .locator('.overview')
      .getByRole('button', { name: 'Show data table', exact: true })
      .click();
    const linkedPoint = page
      .locator('.overview')
      .getByRole('button', { name: 'Select Mobile for February: 491', exact: true });
    await linkedPoint.focus();
    await page.keyboard.press('Enter');
    await expect(linkedPoint).toBeFocused();
    await expect(page.locator('.detail h2')).toHaveText('Device share · February');
    await expect(page.locator('.linked-status')).toContainText('February: 1,367 visits');
    await expect(page.locator('.overview tr[aria-current=true]')).toContainText('February');
    await expect(page.locator('.overview .selection-label')).toHaveText('Selected');
    await page.getByRole('button', { name: 'Reset period filter', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');
    await expect(page.locator('.overview tr[aria-current]')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toBeFocused();
    await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('__range__');
    await expect(page.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('dec');
    await page.getByRole('combobox', { name: 'From', exact: true }).selectOption('feb');
    await page.getByRole('combobox', { name: 'To', exact: true }).selectOption('mar');
    await expect(page.locator('.linked-status')).toContainText('February–March: 2,169 visits');
    await expect(page.locator('.overview .selected-row')).toHaveCount(2);
    await page.getByRole('button', { name: 'Select range', exact: true }).click();
    const surface = page.locator('.nec-range-surface');
    await expect(surface).toBeVisible();
    await surface.scrollIntoViewIfNeeded();
    const bounds = await surface.boundingBox();
    assert(bounds);
    await page.mouse.move(bounds.x + (bounds.width * 1.5) / 12, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + (bounds.width * 3.5) / 12, bounds.y + bounds.height / 2, {
      steps: 6,
    });
    await expect(page.locator('.nec-range-draft')).toBeVisible();
    await expect(page.locator('.linked-status')).toContainText('February–March: 2,169 visits');
    await page.mouse.up();
    await expect(page.locator('.linked-status')).toContainText('February–April: 3,189 visits');
    await expect(page.locator('.overview .selected-row')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Select range', exact: true })).toBeFocused();
    await expect(page.locator('.overview tr[aria-current]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset period filter', exact: true }).click();
    await expect(page.locator('.overview .selected-row')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toBeFocused();
    await navigation.getByRole('link', { name: 'Linked validation', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Linked selection validation', exact: true }),
    ).toBeVisible();
    await expect(page.locator('app-linked-visits canvas')).toHaveCount(2);
    await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('month:feb');
    await expect(page.locator('.linked-status')).toContainText('February: 200 visits');
    await page.getByRole('button', { name: 'Update linked values', exact: true }).click();
    await expect(page.locator('.linked-status')).toContainText('February: 210 visits');
    await page
      .locator('.detail')
      .getByRole('button', { name: 'Show data table', exact: true })
      .click();
    await expect(
      page
        .locator('.detail')
        .getByRole('button', { name: 'Select Visits for Mobile: 0', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Remove February', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');
    await navigation.getByRole('link', { name: 'Navigate away', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    assert.deepEqual(errors, []);
    return {
      engine: browser.browserType().name(),
      version: browser.version(),
      mode: ssr ? 'ssr-hydration' : 'client',
      passed: true,
    };
  } finally {
    await browser.close();
  }
}
try {
  await cp(join(root, 'tools/consumer-fixtures/runtime'), consumer, { recursive: true });
  await cp(join(root, 'projects/playground'), join(consumer, 'projects/playground'), {
    recursive: true,
  });
  const tsconfig = JSON.parse(await readFile(join(root, 'tsconfig.json')));
  delete tsconfig.compilerOptions.paths;
  delete tsconfig.references;
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify(tsconfig));
  const angular = JSON.parse(await readFile(join(root, 'angular.json')));
  delete angular.projects['chart-library'];
  angular.projects.playground.architect.build.options.outputPath = 'dist/ssr';
  const client = structuredClone(angular.projects.playground);
  const options = client.architect.build.options;
  for (const key of ['server', 'ssr', 'outputMode']) delete options[key];
  options.browser = 'projects/playground/src/main.csr.ts';
  options.outputPath = 'dist/client';
  angular.projects.client = client;
  await writeFile(join(consumer, 'angular.json'), JSON.stringify(angular));
  await writeFile(
    join(consumer, 'projects/playground/src/main.csr.ts'),
    `import { bootstrapApplication } from '@angular/platform-browser';\nimport { provideRouter } from '@angular/router';\nimport { Root } from './app/root';\nimport { routes } from './app/app.routes';\nbootstrapApplication(Root, { providers: [provideRouter(routes)] }).catch(console.error);\n`,
  );
  console.log('Installing locked, isolated client/SSR consumers…');
  await run('npm', ['ci', '--no-audit', '--no-fund']);
  const packed = await consumerArtifact(root, consumer);
  assert(packed.files.some((file) => file.path === 'third-party/evilcharts-LICENSE.txt'));
  await run('npm', [
    'install',
    '--no-save',
    '--package-lock=false',
    '--no-audit',
    '--no-fund',
    `./${packed.filename}`,
  ]);
  const installed = await realpath(join(consumer, 'node_modules/@ng-echarts/chart-library'));
  assert(
    !relative(consumer, installed).startsWith('..'),
    'Runtime package must be installed inside the isolated consumer',
  );
  await run(process.execPath, [
    '--input-type=module',
    '-e',
    `import assert from 'node:assert/strict';
     import { createRequire } from 'node:module';
     import '@angular/compiler';
     const root = await import('@ng-echarts/chart-library');
     const bar = await import('@ng-echarts/chart-library/bar');
     const area = await import('@ng-echarts/chart-library/area');
     assert.equal(root.AreaChart, area.AreaChart);
     const line = await import('@ng-echarts/chart-library/line');
     assert.equal(root.LineChart, line.LineChart);
     const composed = await import('@ng-echarts/chart-library/composed');
     assert.equal(root.ComposedChart, composed.ComposedChart);
     const pie = await import('@ng-echarts/chart-library/pie');
     assert.equal(root.PieChart, pie.PieChart);
     const core = await import('@ng-echarts/chart-library/core');
     assert.equal(root.BarChart, bar.BarChart);
     assert.equal(root.ChartFrame, core.ChartFrame);
     assert.deepEqual(Object.keys(core).filter(name => !name.startsWith('ɵ')), ['ChartFrame']);
     const require = createRequire(process.cwd() + '/package.json');
     for (const path of ['src/lib/bar-chart', 'bar/src/lib/bar-chart', 'fesm2022/ng-echarts-chart-library-bar.mjs']) {
       assert.throws(() => require.resolve('@ng-echarts/chart-library/' + path), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
     }`,
  ]);
  const tree = JSON.parse(await run('npm', ['ls', '--omit=dev', '--json']));
  const forbidden = (node) =>
    Object.entries(node.dependencies ?? {}).some(
      ([name, value]) => ['react', 'react-dom'].includes(name) || forbidden(value),
    );
  assert(!forbidden(tree), 'React must not enter the Angular consumer dependency tree');
  for (const project of ['client', 'playground']) {
    console.log(`Building isolated ${project} production application…`);
    await run(process.execPath, [
      'node_modules/@angular/cli/bin/ng.js',
      'build',
      project,
      '--configuration',
      'production',
    ]);
  }
  const directory = join(consumer, 'dist/client/browser');
  staticServer = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const asset = pathname.includes('.') ? pathname.slice(1) : 'index.html';
      if (asset.includes('..')) {
        response.writeHead(400).end();
        return;
      }
      const body = await readFile(join(directory, asset));
      response.setHeader(
        'Content-Type',
        asset.endsWith('.js')
          ? 'text/javascript'
          : asset.endsWith('.css')
            ? 'text/css'
            : asset.endsWith('.woff2')
              ? 'font/woff2'
              : asset.endsWith('.ttf')
                ? 'font/ttf'
                : 'text/html',
      );
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => staticServer.listen(0, '127.0.0.1', done));
  const clientUrl = `http://127.0.0.1:${staticServer.address().port}`;
  const server = spawn(process.execPath, ['dist/ssr/server/server.mjs'], {
    cwd: consumer,
    env: { ...process.env, NODE_PATH: '', PORT: '0' },
    stdio: 'pipe',
  });
  children.push(server);
  let log = '';
  server.stdout.on('data', (data) => {
    log += data;
  });
  server.stderr.on('data', (data) => {
    log += data;
  });
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(
      server.exitCode === null && Date.now() < deadline,
      `Isolated SSR failed to start: ${log}`,
    );
    await delay(100);
  }
  const results = [];
  for (const engine of [chromium, firefox, webkit]) {
    results.push(await exercise(engine, clientUrl, false));
    results.push(await exercise(engine, `http://localhost:${port}`, true));
  }
  const evidence = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    package: packed.name,
    version: packed.version,
    artifact: { sha256: packed.sha256, exactCandidate: packed.exactCandidate },
    skipLibCheck: tsconfig.compilerOptions.skipLibCheck,
    workspaceAliases: false,
    installedOutsideWorkspace: true,
    entryPoints: ['.', './core', './bar', './line', './area', './pie', './composed'],
    compatibilityIdentity: true,
    privateImportsBlocked: true,
    reactRuntime: false,
    results,
  };
  await writeFile(
    join(root, 'docs/experiments/data/packed-runtime.json'),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(join(root, '.prettierrc'))),
      parser: 'json',
    }),
  );
  console.log(
    'PASS: independently installed tarball builds and runs in client and SSR/hydration applications across all three engines.',
  );
} finally {
  for (const child of children) child.kill('SIGTERM');
  staticServer?.close();
  await rm(consumer, { recursive: true, force: true });
}
