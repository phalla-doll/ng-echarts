import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import { expect } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'dist/pages/browser');
const config = JSON.parse(await readFile(join(root, 'angular.json'), 'utf8'));
const base = config.projects.playground.architect.build.configurations.pages.baseHref;
let server;
try {
  let url = process.argv[2];
  if (!url) {
    server = createServer(async (request, response) => {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (!path.startsWith(base)) return response.writeHead(404).end();
      let file = resolve(directory, decodeURIComponent(path.slice(base.length)));
      if (file !== directory && !file.startsWith(directory + '/'))
        return response.writeHead(400).end();
      try {
        if ((await stat(file)).isDirectory()) {
          if (!path.endsWith('/')) return response.writeHead(301, { Location: path + '/' }).end();
          file = join(file, 'index.html');
        }
        response.setHeader(
          'Content-Type',
          {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.woff2': 'font/woff2',
            '.json': 'application/json',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
          }[extname(file)] ?? 'application/octet-stream',
        );
        response.end(await readFile(file));
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise((done) => server.listen(0, '127.0.0.1', done));
    url = `http://127.0.0.1:${server.address().port}${base}`;
  }
  const site = new URL(url);
  for (const path of [
    '',
    'line/',
    'area/',
    'pie/',
    'composed/',
    'composed-validation/',
    'composed-benchmark/',
    'installation/',
    'get-started/',
    'components/',
    'playground/',
    'validation/',
    'line-validation/',
    'area-validation/',
    'pie-validation/',
  ]) {
    const response = await fetch(new URL(path, site));
    assert.equal(response.status, 200, `Direct route ${path} must exist without a SPA fallback`);
    assert((await response.text()).includes(`<base href="${base}">`));
  }
  for (const engine of [chromium, firefox, webkit]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' || /NG05\d+/.test(message.text()))
          errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400 && response.url().startsWith(site.origin))
          errors.push(`${response.status()} ${response.url()}`);
      });
      for (const [path, count] of [
        ['', 4],
        ['line/', 4],
        ['area/', 4],
        ['pie/', 3],
        ['composed/', 1],
      ]) {
        await page.goto(new URL(path, site).href);
        await expect(page.locator('canvas')).toHaveCount(count);
        await page.reload();
        await expect(page.locator('canvas')).toHaveCount(count);
        await expect(page.locator('.site-shell')).toHaveClass(/gallery-layout/);
      }
      await page.goto(new URL('line/', site).href);
      await expect(page.locator('canvas')).toHaveCount(4);
      await page.locator('app-bar-block a').first().click();
      await expect(page.getByRole('heading', { name: 'Line Blocks', exact: true })).toBeVisible();
      assert(new URL(page.url()).pathname.startsWith(base + 'line'));
      assert(new URL(page.url()).hash);
      await page
        .getByRole('navigation', { name: 'Playground pages' })
        .getByRole('link', { name: 'Installation', exact: true })
        .click();
      await page
        .locator('.documentation-outline')
        .getByRole('link', { name: 'Bootstrap your chart', exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`${base}installation#bootstrap$`));
      const skip = page.getByRole('link', { name: 'Skip to content', exact: true });
      await skip.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#page-content')).toBeFocused();
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await page
        .getByRole('navigation', { name: 'Playground pages' })
        .getByRole('link', { name: 'Pie & Donut Blocks', exact: true })
        .click();
      await expect(page.locator('canvas')).toHaveCount(3);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(390);
      assert.deepEqual(errors, []);
      await expect.poll(() => page.evaluate(() => document.fonts.check('12px Inter'))).toBe(true);
      console.log(
        `PASS: ${engine.name()} static routes, reloads, lazy charts/fonts, anchors, focus, themes and mobile navigation at ${site.href}`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server?.close();
}
