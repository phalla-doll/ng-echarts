import { renderGallery, renderConcepts } from './browser-gallery.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, rm as removeReceipt } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import { expect as playwrightExpect } from '@playwright/test';
import {
  markerName,
  receiptPath,
  recordVerification,
  validateBuild,
  verifyPublicBuild,
} from './pages-provenance.mjs';
import { withPagesLock } from './pages-lock.mjs';

// This verifier also runs against public Pages, where a cold chart document
// can exceed the default five-second local assertion window.
const expect = playwrightExpect.configure({ timeout: process.argv[2] ? 60000 : 15000 });

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'dist/pages/browser');
const config = JSON.parse(await readFile(join(root, 'angular.json'), 'utf8'));
const base = config.projects.playground.architect.build.configurations.pages.baseHref;
async function checkPages() {
  let server;
  const publicUrl = process.argv[2];
  const marker = publicUrl
    ? await verifyPublicBuild(root, new URL(publicUrl))
    : await validateBuild(root, directory);
  if (!publicUrl) await removeReceipt(receiptPath(directory), { force: true });
  console.log(
    `Checking ${marker.artifact.fileCount} sealed files from ${marker.sourceBaseCommit}${publicUrl ? ' on public Pages' : ''}.`,
  );
  try {
    let url = process.argv[2];
    if (!url) {
      server = createServer(async (request, response) => {
        const requestUrl = new URL(request.url, 'http://localhost');
        const path = requestUrl.pathname;
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
      'radar/',
      'radial/',
      'calendar/',
      'sankey/',
      'linked/',
      'chart-possibilities/',
      'linked-validation/',
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
      const html = await response.text();
      assert(html.includes(`<base href="${base}">`));
      if (path === 'sankey/')
        assert(
          html.includes('Explore flow data') && html.includes('Select flow Direct to Trial: 0'),
          'Prerendered Sankey must retain node/link data and recorded zero actions',
        );
      if (path === 'calendar/')
        assert(
          html.includes('2024-02-29') && html.includes('Explore daily data'),
          'Prerendered calendar must retain native leap-day data',
        );
      if (path === 'radial/')
        assert(
          html.includes('<progress') && html.includes('value="6800"'),
          'Prerendered progress must retain its native raw value',
        );
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
          ['radar/', 1],
          ['radial/', 2],
        ]) {
          await page.goto(new URL(path, site).href);
          if (!['radar/', 'radial/'].includes(path)) await renderGallery(page);
          await expect(page.locator('canvas')).toHaveCount(count);
          await page.reload();
          if (!['radar/', 'radial/'].includes(path)) await renderGallery(page);
          await expect(page.locator('canvas')).toHaveCount(count);
          await expect(page.locator('.site-shell')).toHaveClass(/gallery-layout/);
          if (path === 'radial/') {
            const example = page.locator('#monthly-goal');
            const progress = example.getByRole('progressbar', {
              name: 'Monthly visit goal',
              exact: true,
            });
            await expect(progress).toHaveAttribute('value', '6800');
            await expect(progress).toHaveAttribute('max', '10000');
            await example.locator('summary').click();
            await example.getByRole('button', { name: 'Complete goal', exact: true }).click();
            await expect(progress).toHaveAttribute('value', '10000');
          }
        }
        await page.goto(new URL('sankey/', site).href);
        const flow = page.locator('nec-sankey-chart');
        await expect(flow.locator('canvas').first()).toBeVisible();
        await page.reload();
        await flow.locator('.flow-data > summary').click();
        await flow
          .getByRole('button', { name: 'Select flow Direct to Trial: 0', exact: true })
          .click();
        await expect(page.locator('.flow-selection')).toHaveText('Direct to Trial: 0 visits');
        await page.goto(new URL('calendar/', site).href);
        const calendar = page.locator('nec-calendar-heatmap');
        await expect(calendar.locator('canvas').first()).toBeVisible();
        // Firefox can expose the intermediate directory redirect as reload's response.
        // Initial HTML is checked above through fetch; here prove the page rehydrates.
        await page.reload();
        await expect(calendar.locator('canvas').first()).toBeVisible();
        await calendar.locator('.calendar-data > summary').click();
        await calendar.locator('.calendar-month').first().locator('summary').click();
        await calendar.getByRole('button', { name: 'Select 2024-01-01: 0', exact: true }).click();
        await expect(page.locator('.calendar-selection')).toHaveText('2024-01-01: 0 contributions');
        await page.goto(new URL('chart-possibilities/', site).href);
        const concepts = page.frameLocator('app-chart-possibilities iframe');
        await expect(concepts.locator('.card')).toHaveCount(12);
        await renderConcepts(page);
        await expect(concepts.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
        await expect(concepts.locator('html')).toHaveAttribute('data-theme', 'dark');
        await concepts.getByRole('button', { name: 'Find patterns', exact: true }).click();
        await expect(concepts.locator('.card:visible')).toHaveCount(2);
        await page.reload();
        await expect(concepts.locator('.card:visible')).toHaveCount(12);
        const standalone = page.getByRole('link', { name: 'Open standalone gallery', exact: true });
        assert(
          new URL(await standalone.getAttribute('href'), page.url()).pathname.startsWith(
            base + 'concepts/',
          ),
        );
        await page.goto(new URL('linked/', site).href);
        await expect(page.locator('app-linked-visits canvas')).toHaveCount(2);
        await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('month:feb');
        await expect(page.locator('.detail h2')).toHaveText('Device share · February');
        await page
          .locator('.overview')
          .getByRole('button', { name: 'Show data table', exact: true })
          .click();
        await expect(page.locator('.overview tr[aria-current=true]')).toContainText('February');
        await page.getByRole('button', { name: 'Reset period filter', exact: true }).click();
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
        await page.reload();
        await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');
        await expect(page.locator('app-linked-visits canvas')).toHaveCount(2);
        await page.goto(new URL('line/', site).href);
        await renderGallery(page);
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
        await renderGallery(page);
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
    if (!publicUrl) await recordVerification(root, directory, marker);
    else
      assert.equal(
        await (await fetch(new URL(markerName, publicUrl), { cache: 'no-store' })).text(),
        JSON.stringify(marker, null, 2) + '\n',
        'Public Pages changed during verification.',
      );
  } finally {
    server?.close();
  }
}
if (process.argv[2]) await checkPages();
else await withPagesLock(root, 'check', checkPages);
