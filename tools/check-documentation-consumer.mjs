import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, realpath, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import ts from 'typescript';
import { chromium, firefox, webkit } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const parent = await realpath(await mkdtemp(join(tmpdir(), 'ng-echarts-docs-')));
const consumer = join(parent, 'chart-consumer');
const installation = await readFile(join(root, 'docs/INSTALLATION.md'), 'utf8');
const integration = await readFile(join(root, 'docs/INTEGRATION_GUIDE.md'), 'utf8');
const app = integration.match(/^```ts\n([\s\S]*?)\n```/m)?.[1];
assert(app, 'Integration guide must contain the full application');
const shell = (id) => {
  const code = installation.match(
    new RegExp(`<!-- ng-echarts: ${id} -->\\s*\x60\x60\x60sh\\n([\\s\\S]*?)\\n\x60\x60\x60`),
  )?.[1];
  assert(code, `Missing documented ${id} commands`);
  return code;
};
let server;
const run = async (command, args, cwd, env = {}) => {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, NG_CLI_ANALYTICS: 'false', ...env },
    stdio: 'pipe',
  });
  let output = '';
  child.stdout.on('data', (data) => (output += data));
  child.stderr.on('data', (data) => (output += data));
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  assert.equal(code, 0, `${command} ${args.join(' ')} failed:\n${output}`);
  return output;
};
try {
  const packed = JSON.parse(
    await run(
      'npm',
      ['pack', join(root, 'dist/chart-library'), '--pack-destination', parent, '--json'],
      parent,
    ),
  )[0];
  console.log('Scaffolding the exact documented Angular application outside the workspace…');
  await run('sh', ['-eu', '-c', shell('scaffold')], parent);
  console.log('Installing the documented version pins and local tarball…');
  await run('sh', ['-eu', '-c', shell('install')], consumer, {
    CHART_LIBRARY_TARBALL: join(parent, packed.filename),
  });
  // The guide instructs consumers to retain the artifact and repeat from the lockfile.
  await run('npm', ['ci', '--no-audit', '--no-fund'], consumer);
  const configPath = join(consumer, 'tsconfig.json');
  const parsed = ts.parseConfigFileTextToJson(configPath, await readFile(configPath, 'utf8'));
  assert(!parsed.error);
  const config = parsed.config;
  const settings = JSON.parse(installation.match(/^```json\n([\s\S]*?)\n```/m)?.[1] ?? 'null');
  assert(settings, 'Installation guide must contain its explicit strict settings');
  Object.assign(config.compilerOptions, settings.compilerOptions);
  Object.assign(config.angularCompilerOptions, settings.angularCompilerOptions);
  assert.equal(config.compilerOptions.strict, true);
  assert.equal(config.angularCompilerOptions.strictTemplates, true);
  assert(!config.compilerOptions.paths, 'Fresh consumer must not use workspace aliases');
  await writeFile(configPath, JSON.stringify(config));
  await writeFile(join(consumer, 'src/app/app.ts'), app);
  const angularPath = join(consumer, 'angular.json');
  const angular = JSON.parse(await readFile(angularPath, 'utf8'));
  const ssrSettings = JSON.parse(
    installation.match(/<!-- ng-echarts: ssr-hosts -->\s*```json\n([\s\S]*?)\n```/m)?.[1] ?? 'null',
  );
  assert(ssrSettings, 'Installation guide must configure its local SSR hostnames');
  Object.assign(angular.projects['chart-consumer'].architect.build.options, ssrSettings);
  await writeFile(angularPath, JSON.stringify(angular));
  const installed = await realpath(join(consumer, 'node_modules/@ng-echarts/chart-library'));
  assert(!relative(consumer, installed).startsWith('..'));
  const manifest = JSON.parse(await readFile(join(consumer, 'package.json'), 'utf8'));
  const resolved = JSON.parse(await run('npm', ['ls', '--depth=0', '--json'], consumer));
  for (const name of [
    '@angular/common',
    '@angular/core',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/cli',
    '@angular/build',
    '@angular/platform-browser',
    '@angular/platform-server',
    '@angular/ssr',
  ])
    assert.equal(resolved.dependencies[name].version, '22.2.6');
  assert.equal(resolved.dependencies.typescript.version, '6.0.3');
  assert.equal(resolved.dependencies.echarts.version, '6.1.0');
  console.log('Compiling and building the complete integration-guide example…');
  await run(
    process.execPath,
    [
      'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',
      '-p',
      'tsconfig.app.json',
      '--noEmit',
    ],
    consumer,
  );
  await run('sh', ['-eu', '-c', shell('build')], consumer);
  // The generated CLI server logs the configured port rather than the bound address.
  // Select an ephemeral numeric port before launching its unchanged entry point.
  const reservation = createServer();
  await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
  const address = reservation.address();
  assert(address && typeof address !== 'string');
  const selectedPort = address.port;
  await new Promise((resolve, reject) =>
    reservation.close((error) => (error ? reject(error) : resolve())),
  );
  server = spawn(process.execPath, ['dist/chart-consumer/server/server.mjs'], {
    cwd: consumer,
    env: { ...process.env, PORT: String(selectedPort) },
    stdio: 'pipe',
  });
  let log = '';
  server.stdout.on('data', (data) => (log += data));
  server.stderr.on('data', (data) => (log += data));
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = log.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(
      server.exitCode === null && Date.now() < deadline,
      `Documented server did not start: ${log}`,
    );
    await delay(100);
  }
  const url = `http://localhost:${port}`;
  const response = await fetch(url);
  const html = await response.text();
  assert.equal(response.status, 200, html);
  for (const title of ['Monthly visits', 'Visit trends', 'Stacked visits', 'Desktop share'])
    assert(html.includes(title));
  assert(!html.includes('<canvas'));
  const results = [];
  for (const engine of [chromium, firefox, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 1000 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' || /NG05\d+/.test(message.text()))
          errors.push(message.text());
      });
      await page.goto(url);
      await expect(page.locator('canvas')).toHaveCount(4);
      for (const family of ['bar', 'line', 'area', 'pie']) {
        const chart = page.locator(`nec-${family}-chart`);
        await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
        const action = chart.getByRole('button', {
          name: 'Select Desktop for January: 342',
          exact: true,
        });
        await action.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.selection')).toHaveText('jan/desktop/342/table');
      }
      const instances = await page
        .locator('.plot')
        .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
      await page.getByRole('button', { name: 'Update values', exact: true }).click();
      for (const family of ['bar', 'line', 'area', 'pie'])
        await expect(
          page
            .locator(`nec-${family}-chart`)
            .getByRole('button', { name: 'Select Desktop for January: 352', exact: true }),
        ).toBeVisible();
      await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
      for (const frame of await page.locator('.chart-frame').all())
        await expect(frame).toHaveCSS('background-color', 'rgb(24, 32, 44)');
      const desktop = page.locator('nec-bar-chart .legend button').first();
      await desktop.focus();
      await page.keyboard.press('Space');
      await expect(desktop).toHaveAttribute('aria-pressed', 'false');
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
      }
      expect(
        await page
          .locator('.plot')
          .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
      ).toEqual(instances);
      assert.deepEqual(errors, []);
      results.push({
        engine: engine.name(),
        version: browser.version(),
        charts: 4,
        keyboardEvents: true,
        immutableUpdates: true,
        themes: true,
        responsive: true,
        stableInstances: true,
        passed: true,
      });
    } finally {
      await browser.close();
    }
  }
  const evidence = {
    recordedAt: new Date().toISOString(),
    node: process.version,
    npm: (await run('npm', ['--version'], consumer)).trim(),
    method:
      'Fresh pinned CLI scaffold outside workspace; execute INSTALLATION.md shell blocks; install local tarball; copy exact INTEGRATION_GUIDE.md App; strict ngc and production build; generated server HTML then three-engine hydration/actions/updates/themes/resize.',
    sources: Object.fromEntries(
      [
        ['docs/INSTALLATION.md', installation],
        ['docs/INTEGRATION_GUIDE.md', integration],
      ].map(([name, text]) => [name, createHash('sha256').update(text).digest('hex')]),
    ),
    installedOutsideWorkspace: true,
    lockfileReinstall: true,
    workspaceAliases: false,
    skipLibCheck: false,
    strictTemplates: true,
    versions: Object.fromEntries(
      Object.entries(resolved.dependencies).map(([name, value]) => [name, value.version]),
    ),
    generatedPackage: manifest.name,
    ssrHeadings: 4,
    serverCanvasCount: 0,
    results,
    passed: true,
  };
  await writeFile(
    join(root, 'docs/experiments/data/ng15-documentation-consumer.json'),
    await format(JSON.stringify(evidence), {
      ...(await resolveConfig(join(root, '.prettierrc'))),
      parser: 'json',
    }),
  );
  console.log(
    'PASS: documented installation and full application build, render and hydrate in all three engines.',
  );
} finally {
  server?.kill('SIGTERM');
  await rm(parent, { recursive: true, force: true });
}
