import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
const primarySelector = '#monthly-goal nec-radial-progress';
async function open(page: import('@playwright/test').Page) {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/radial');
  const html = await response!.text();
  expect(html).toContain('<progress');
  expect(html).toContain('6800');
  expect(html).not.toContain('<canvas');
  const chart = page.locator(primarySelector);
  await expect(page.locator('nec-radial-progress canvas')).toHaveCount(2);
  return { chart, errors, block: page.locator('#monthly-goal') };
}
async function arcColor(chart: import('@playwright/test').Locator) {
  return chart.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const ratio = canvas.width / canvas.clientWidth;
    const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.365;
    return Array.from(
      canvas
        .getContext('2d')!
        .getImageData(
          Math.round((canvas.clientWidth / 2 + radius * Math.SQRT1_2) * ratio),
          Math.round((canvas.clientHeight / 2 - radius * Math.SQRT1_2) * ratio),
          1,
          1,
        ).data,
    ).join(',');
  });
}
test('hydrates two named native progress values and paints real zero/full rings without remounting', async ({
  page,
}) => {
  const { chart, errors, block } = await open(page);
  const native = chart.getByRole('progressbar', { name: 'Monthly visit goal', exact: true });
  await expect(native).toHaveAttribute('value', '6800');
  await expect(native).toHaveAttribute('max', '10000');
  await expect(native).toHaveAttribute('aria-valuetext', '68%; 6,800 of 10,000');
  expect(await native.getAttribute('tabindex')).toBeNull();
  const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
  const filled = await arcColor(chart);
  await block.locator('summary').click();
  await block.getByRole('button', { name: 'Show zero', exact: true }).click();
  await expect(native).toHaveAttribute('value', '0');
  await expect(chart.locator('.progress-label strong')).toHaveText('0%');
  await expect.poll(() => arcColor(chart)).not.toBe(filled);
  await block.getByRole('button', { name: 'Complete goal', exact: true }).click();
  await expect(native).toHaveAttribute('value', '10000');
  await expect(chart.locator('.progress-label strong')).toHaveText('100%');
  await expect.poll(() => arcColor(chart)).toBe(filled);
  expect(await chart.locator('.plot').getAttribute('_echarts_instance_')).toBe(instance);
  await expect(chart.locator('[data-nec-tooltip], .legend, .table-toggle')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('updates through keyboard controls, never clamps invalid inputs, and recovers state precedence', async ({
  page,
}) => {
  const { chart, errors, block } = await open(page);
  await block.locator('summary').click();
  const field = block.getByRole('spinbutton', { name: 'Completed visits', exact: true });
  await field.fill('2000');
  await field.press('ArrowUp');
  await expect(chart.getByRole('progressbar')).toHaveAttribute('value', '2001');
  await field.fill('9999.99');
  await expect(chart.locator('.progress-label strong')).toHaveText('>99.9%');
  await field.fill('0.001');
  await expect(chart.locator('.progress-label strong')).toHaveText('<0.1%');
  await field.fill('10001');
  await expect(chart.getByRole('alert')).toContainText('between zero');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await expect(chart.getByRole('progressbar')).toHaveCount(0);
  await block.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('Loading progress…');
  await block.getByRole('button', { name: 'Error state', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Visit totals are temporarily unavailable.');
  await block.getByRole('button', { name: 'Restore sample', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await block.getByRole('button', { name: 'Missing value', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('No progress data available.');
  await expect(chart.getByRole('progressbar')).toHaveCount(0);
  const restore = block.getByRole('button', { name: 'Restore sample', exact: true });
  await restore.focus();
  await page.keyboard.press('Enter');
  await expect(chart.getByRole('progressbar')).toHaveAttribute('value', '6800');
  await expect(restore).toBeFocused();
  expect(errors).toEqual([]);
});
test('fits both themes at four widths, recovers a hidden preview and offers working code controls', async ({
  page,
}) => {
  const { chart, errors, block } = await open(page);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const dark of [false, true]) {
      const shell = page.locator('.site-shell');
      if ((await shell.getAttribute('class'))!.includes('dark') !== dark)
        await page.getByRole('button', { name: /Use (light|dark) theme/ }).click();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await expect(chart.locator('canvas')).toHaveCount(1);
      const fits = await chart.locator('.progress-label').evaluate((e) => {
        const a = e.getBoundingClientRect(),
          b = e.parentElement!.getBoundingClientRect();
        return a.left >= b.left && a.right <= b.right && a.top >= b.top && a.bottom <= b.bottom;
      });
      expect(fits).toBe(true);
    }
  }
  await block.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(block.getByRole('code')).toContainText('@ng-echarts/chart-library/radial');
  await block.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(chart.locator('canvas')).toBeVisible();
  await page.reload();
  await expect(page.locator('nec-radial-progress canvas')).toHaveCount(2);
  expect(errors).toEqual([]);
});
test('releases instance, observer, motion and frame resources over 100 primary mount cycles', async ({
  page,
}) => {
  test.setTimeout(120000);
  await installResourceAudit(page);
  const { chart, errors, block } = await open(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await block.locator('summary').click();
  const mount = block.getByRole('button', { name: 'Mount progress', exact: true });
  for (let i = 0; i < 100; i++) {
    const plot = await chart.locator('.plot').elementHandle();
    await mount.click();
    await expect(chart.locator('canvas')).toHaveCount(0);
    expect(await plot!.getAttribute('_echarts_instance_')).toBe('');
    await plot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 1, observedTargets: 1, motionListeners: 1, frames: 0 });
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(2);
    await mount.click();
    await expect(chart.locator('canvas')).toHaveCount(1);
  }
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Navigate away', exact: true })
    .click();
  await expect(page.locator('canvas, progress')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
  expect(errors).toEqual([]);
});

test('recovers a failed renderer import with a fresh native progress value', async ({ page }) => {
  const directory = 'dist/playground/browser';
  const assets: string[] = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateRadialRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      assets.push(file);
  expect(assets).toHaveLength(1);
  const asset = assets[0]!;
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/radial');
  const chart = page.locator(primarySelector);
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await expect(chart.getByRole('progressbar')).toHaveCount(0);
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry progress', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(chart.getByRole('progressbar')).toHaveAttribute('value', '6800');
  await expect(chart.locator('.chart-frame')).toBeFocused();
  await expect(chart.locator('.chart-frame')).toHaveAttribute('tabindex', '-1');
  expect(errors).toEqual([]);
});
