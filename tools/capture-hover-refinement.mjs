import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, firefox, webkit } from 'playwright';
import { expect } from '@playwright/test';
import { format, resolveConfig } from 'prettier';

const phase = process.argv[2] ?? 'after';
assert(['before', 'after'].includes(phase));
const base = process.argv[3] ?? 'http://localhost:4186/';
const output = resolve(process.argv[4] ?? `docs/experiments/captures/hover-refinement/${phase}`);
const server = process.argv[3]
  ? null
  : spawn(process.execPath, ['dist/playground/server/server.mjs'], {
      env: { ...process.env, PORT: '4186' },
      stdio: 'pipe',
    });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const checks = [],
  captures = [],
  errors = [],
  engines = [];
let log = '',
  browser;
server?.stdout.on('data', (data) => (log += data));
server?.stderr.on('data', (data) => (log += data));
try {
  if (server) {
    const deadline = Date.now() + 30_000;
    while (true) {
      assert(server.exitCode === null && Date.now() < deadline, log);
      try {
        if ((await fetch(base)).ok) break;
      } catch {}
      await delay(100);
    }
  }
  await mkdir(output, { recursive: true });
  for (const engine of [chromium, firefox, webkit]) {
    browser = await engine.launch();
    engines.push({ name: engine.name(), version: browser.version() });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    const navigate = async (route, theme) => {
      await page.goto(new URL(route, base).href);
      const shell = page.locator('.site-shell');
      await expect(async () => {
        const light = page.getByRole('button', { name: 'Use light theme', exact: true });
        if (await light.count()) await light.click();
        await expect(shell).not.toHaveClass(/dark/, { timeout: 1000 });
      }).toPass({ timeout: 15_000 });
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
        await expect(shell).toHaveClass(/dark/);
      }
      await expect
        .poll(
          async () =>
            new URL(await page.locator('.skip-link').getAttribute('href'), base).pathname.replace(
              /\/$/,
              '',
            ),
          { timeout: 15_000 },
        )
        .toBe(new URL(route, base).pathname.replace(/\/$/, ''));
      await page.evaluate(() => document.fonts.ready);
    };
    const read = (locator) =>
      locator.evaluate((element) => {
        const s = getComputedStyle(element),
          b = element.getBoundingClientRect();
        const swatch = element.querySelector('.swatch');
        return {
          color: s.color,
          background: s.backgroundColor,
          border: s.borderColor,
          borderStyle: s.borderStyle,
          decoration: s.textDecorationLine,
          radius: s.borderRadius,
          cursor: s.cursor,
          pressed: element.getAttribute('aria-pressed'),
          current: element.getAttribute('aria-current'),
          swatchOpacity: swatch ? getComputedStyle(swatch).opacity : null,
          width: b.width,
          height: b.height,
          outline: s.outlineWidth,
          outlineStyle: s.outlineStyle,
          transition: s.transitionDuration,
          opacity: s.opacity,
        };
      });
    const audit = async (
      name,
      locator,
      theme,
      { visual = false, staticElement = false, visualTarget = locator } = {},
    ) => {
      await expect(locator).toBeVisible();
      await locator.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await locator.evaluate((element) => element.ownerDocument.activeElement?.blur());
      const normal = await read(locator);
      await locator.hover();
      const hover = await read(locator);
      assert.equal(hover.width, normal.width, `${name} changed width`);
      assert.equal(hover.height, normal.height, `${name} changed height`);
      assert.equal(hover.pressed, normal.pressed, `${name} changed pressed state`);
      assert.equal(hover.current, normal.current, `${name} changed current state`);
      assert.equal(hover.swatchOpacity, normal.swatchOpacity, `${name} changed series visibility`);
      assert.equal(hover.borderStyle, normal.borderStyle, `${name} changed border geometry`);
      const visibleStyle = ({ color, background, border, decoration }) => ({
        color,
        background,
        border,
        decoration,
      });
      const changed = JSON.stringify(visibleStyle(normal)) !== JSON.stringify(visibleStyle(hover));
      if (phase === 'after')
        assert.equal(
          changed,
          !staticElement,
          `${engine.name()} ${theme} ${name}: incorrect hover feedback`,
        );
      checks.push({
        engine: engine.name(),
        theme,
        width: page.viewportSize().width,
        route: new URL(page.url()).pathname,
        name,
        normal,
        hover,
        changed,
      });
      if (visual && engine === chromium && process.env['HOVER_CAPTURE_IMAGES'] !== '0') {
        const box = await visualTarget.boundingBox();
        const viewport = page.viewportSize();
        const x = Math.max(0, box.x - 8),
          y = Math.max(0, box.y - 8);
        const nameOnDisk = `${name}-${theme}.png`;
        captures.push({
          name: nameOnDisk,
          sha256: hash(
            await page.screenshot({
              path: resolve(output, nameOnDisk),
              clip: {
                x,
                y,
                width: Math.min(box.width + 16, viewport.width - x),
                height: Math.min(box.height + 16, viewport.height - y),
              },
            }),
          ),
        });
      }
    };
    for (const theme of ['dark', 'light']) {
      await navigate('', theme);
      await expect(page.locator('canvas').first()).toBeVisible();
      await audit('header-theme', page.locator('.site-actions button'), theme, { visual: true });
      await audit('navigation', page.locator('nav a').filter({ hasText: 'Line Blocks' }), theme);
      await audit('navigation-current', page.locator('nav a[aria-current=page]'), theme);
      await audit('copy-page', page.locator('.copy-page'), theme);
      const block = page.locator('.block-section').first();
      await audit('reload', block.locator('.reload-button'), theme);
      await audit('view-selected', block.locator('.block-views button[aria-pressed=true]'), theme, {
        visual: true,
      });
      await audit('view-idle', block.locator('.block-views button[aria-pressed=false]'), theme);
      await audit('copy-icon', block.locator('.integration-heading button'), theme, {
        visual: true,
      });
      await audit('legend-visible', block.locator('.legend button').first(), theme);
      await block.locator('.legend button').first().click();
      await audit('legend-hidden', block.locator('.legend button').first(), theme, {
        visual: true,
      });
      await audit('static-card', block.locator('.block-card'), theme, { staticElement: true });
      await audit('footer-link', page.locator('.gallery-footer a'), theme);
      await navigate('linked/', theme);
      await expect(page.locator('canvas')).toHaveCount(2);
      const month = page.getByRole('combobox', { name: 'Period', exact: true });
      await month.selectOption('month:dec');
      await audit('month', month, theme, { visual: true });
      await audit('reset', page.locator('.reset-month'), theme);
      await audit('disclosure', page.locator('.linking-guide summary'), theme, { visual: true });
      await page.locator('.linking-guide summary').click();
      await audit('linked-copy', page.locator('.code-tools button'), theme);
      await audit('table-toggle', page.locator('.overview .table-toggle'), theme);
      await page.locator('.overview .table-toggle').click();
      await audit('table-value', page.locator('.overview tr[aria-current] button').last(), theme);
      if (phase === 'after') {
        await page.setViewportSize({ width: 320, height: 1000 });
        await audit('month-mobile', month, theme, {
          visual: true,
          visualTarget: page.locator('.linked-toolbar'),
        });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(320);
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      await navigate('components/', theme);
      await audit('component-card', page.locator('a.component-card').first(), theme);
      await audit(
        'documentation-copy',
        page.locator('.documentation-heading app-copy-button button'),
        theme,
      );
      await navigate('playground/', theme);
      await expect(page.locator('canvas')).toHaveCount(1);
      await audit('workbench-switch', page.locator('.setting-toggle').first(), theme);
      await audit('workbench-button', page.locator('.update-button'), theme);
      await audit('workbench-reset', page.locator('.reset-button'), theme);
      await navigate('comparison/', theme);
      await audit(
        'comparison-selected',
        page.locator('.controls button[aria-pressed=true]').first(),
        theme,
      );
      await audit(
        'comparison-idle',
        page.locator('.controls button[aria-pressed=false]').first(),
        theme,
      );
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(1440);
    }
    if (phase === 'after') {
      await navigate('linked/', 'dark');
      await expect(page.locator('canvas')).toHaveCount(2);
      const button = page.locator('.site-actions button');
      await button.hover();
      const hovered = await read(button);
      await page.mouse.down();
      const pressed = await read(button);
      assert.notEqual(pressed.background, hovered.background, 'Press must differ from hover');
      await page.mouse.move(0, 0);
      await page.mouse.up();
      checks.push({ engine: engine.name(), name: 'press-feedback', hovered, pressed });
      await page.keyboard.press('Tab');
      await button.focus();
      await button.hover();
      await expect(button).toBeFocused();
      await expect(button).toHaveCSS('outline-width', '1px');
      await expect(button).toHaveCSS('outline-style', 'solid');
      checks.push({ engine: engine.name(), name: 'focus-with-hover', style: await read(button) });

      // Temporary probes verify disabled styling without adding a demo flow.
      await page.locator('.gallery-content').evaluate((host) => {
        const box = document.createElement('div');
        box.id = 'hover-disabled-probes';
        for (const native of [true, false]) {
          const button = document.createElement('button');
          button.className = 'ui-button';
          button.textContent = native ? 'Native disabled probe' : 'ARIA disabled probe';
          if (native) button.disabled = true;
          else button.setAttribute('aria-disabled', 'true');
          box.append(button);
        }
        host.append(box);
      });
      for (const [index, name] of ['native-disabled-probe', 'aria-disabled-probe'].entries()) {
        const probe = page.locator('#hover-disabled-probes button').nth(index);
        await audit(name, probe, 'dark', { staticElement: true });
        await expect(probe).toHaveCSS('opacity', '0.5');
        await expect(probe).toHaveCSS('cursor', 'not-allowed');
      }
      await page.locator('#hover-disabled-probes').evaluate((element) => element.remove());
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(button).toHaveCSS('transition-duration', '0.12s, 0.12s, 0.12s, 0.12s');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(button).toHaveCSS('transition-duration', '0s');
      checks.push({
        engine: engine.name(),
        name: 'motion-preference',
        duration: '120ms colors only; 0ms with reduced motion',
      });

      await page.emulateMedia({ forcedColors: 'active' });
      if (await page.evaluate(() => matchMedia('(forced-colors: active)').matches)) {
        const system = await page.evaluate(() => {
          const probe = document.createElement('span');
          probe.style.cssText = 'color:HighlightText;background-color:Highlight';
          document.querySelector('.site-shell').append(probe);
          const style = getComputedStyle(probe);
          const result = { color: style.color, background: style.backgroundColor };
          probe.remove();
          return result;
        });
        await page.locator('.overview .legend button').first().click();
        await expect(page.locator('.overview .legend button').first()).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        for (const target of [
          button,
          page.getByRole('combobox', { name: 'Period', exact: true }),
          page.locator('.overview .legend button').first(),
        ]) {
          await target.hover();
          await expect(target).toHaveCSS('color', system.color);
          await expect(target).toHaveCSS('background-color', system.background);
        }
        checks.push({ engine: engine.name(), name: 'forced-color-hover', system });
      }
      if (engine !== firefox) {
        const touch = await browser.newPage({
          viewport: { width: 320, height: 900 },
          hasTouch: true,
          isMobile: true,
          reducedMotion: 'reduce',
        });
        await touch.goto(new URL('linked/', base).href);
        await expect(touch.locator('canvas')).toHaveCount(2);
        assert(
          await touch.evaluate(() => matchMedia('(hover: none) and (pointer: coarse)').matches),
        );
        const month = touch.getByRole('combobox', { name: 'Period', exact: true });
        const normal = await read(month);
        await month.hover();
        const hover = await read(month);
        assert.equal(normal.background, hover.background);
        assert.equal(normal.border, hover.border);
        await month.selectOption('month:dec');
        await touch.getByRole('button', { name: 'Reset period filter', exact: true }).tap();
        await expect(month).toHaveValue('');
        await expect(month).toBeFocused();
        await expect
          .poll(() => touch.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(320);
        checks.push({
          engine: engine.name(),
          name: 'coarse-pointer-tap',
          width: 320,
          normal,
          hover,
          reset: 'cleared with touch; month focus retained',
        });
        await touch.close();
      }
    }
    await browser.close();
    browser = null;
  }
  assert.deepEqual(errors, []);
  const sources = [];
  for (const path of [
    'projects/playground/src/styles.css',
    'projects/playground/src/site-controls.css',
    'projects/playground/src/gallery-shell.css',
    'projects/playground/src/documentation.css',
    'projects/playground/src/app/root.css',
    'projects/playground/src/app/gallery.css',
    'projects/playground/src/app/bar-block.css',
    'projects/playground/src/app/copy-button.ts',
    'projects/playground/src/app/linked-visits.css',
    'projects/playground/src/app/comparison.css',
    'tools/capture-hover-refinement.mjs',
  ])
    sources.push({ path, sha256: hash(await readFile(path)) });
  const hoverFile = 'projects/playground/src/site-hover.css';
  try {
    sources.push({ path: hoverFile, sha256: hash(await readFile(hoverFile)) });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(
    resolve(output, 'manifest.json'),
    await format(
      JSON.stringify({
        recordedAt: new Date().toISOString(),
        phase,
        base,
        node: process.version,
        reducedMotion: 'reduce',
        deviceScaleFactor: 2,
        engines,
        checks,
        captures,
        sources,
        errors,
      }),
      { ...(await resolveConfig('.prettierrc')), parser: 'json' },
    ),
  );
  console.log(
    `PASS: ${phase}: ${checks.length} interaction checks; ${checks.filter((check) => check.changed === false).length} unchanged targets; ${captures.length} captures; no geometry/state changes or browser errors.`,
  );
} finally {
  await browser?.close();
  server?.kill();
}
