import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
async function open(page: Page) {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/sankey');
  const html = await response!.text();
  expect(html).toContain('Explore flow data');
  expect(html).toContain('Search');
  expect(html).not.toContain('<canvas');
  const chart = page.locator('nec-sankey-chart');
  await expect(chart.locator('canvas').first()).toBeVisible();
  return { chart, errors };
}
test('hydrates native tables and emits equivalent node/link pointer and keyboard actions', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  await chart.locator('.flow-data > summary').click();
  const node = chart.getByRole('button', { name: 'Select node Search', exact: true });
  await node.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flow-selection')).toHaveText('Search: 0 incoming, 420 outgoing');
  await expect(node).toBeFocused();
  const zero = chart.getByRole('button', { name: 'Select flow Direct to Trial: 0', exact: true });
  await zero.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.flow-selection')).toHaveText('Direct to Trial: 0 visits');
  await chart.locator('.flow-data > summary').click();
  const plot = await chart.locator('.plot').boundingBox();
  // First source node occupies x=12..24 and the top fraction of the flow height.
  await page.mouse.click(plot!.x + 18, plot!.y + 40);
  await expect(page.locator('.flow-selection')).toHaveText('Search: 0 incoming, 420 outgoing');
  await page.mouse.move(plot!.x + 55, plot!.y + 45);
  await expect(chart.locator('[data-nec-tooltip]')).toContainText('Search');
  await page.mouse.click(plot!.x + 55, plot!.y + 45);
  await expect(page.locator('.flow-selection')).toHaveText('Search to Browse: 420 visits');
  await page.locator('.radial-controls > summary').click();
  await page.getByRole('button', { name: 'Update and reorder links', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
  await chart.locator('.flow-data > summary').click();
  await chart
    .getByRole('button', { name: 'Select flow Search to Browse: 840', exact: true })
    .click();
  await expect(page.locator('.flow-selection')).toHaveText('Search to Browse: 840 visits');
  expect(errors).toEqual([]);
});
test('handles zeros, empty graphs, invalid cycles, application states and hidden previews', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  await page.locator('.radial-controls > summary').click();
  await page.getByRole('button', { name: 'Show recorded zeros', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('No positive flow');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await expect(chart.locator('tbody tr')).toHaveCount(13);
  await page.getByRole('button', { name: 'Empty graph', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('No flow nodes available.');
  await page.getByRole('button', { name: 'Invalid cycle', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('acyclic');
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('Loading flows…');
  await page.getByRole('button', { name: 'Error state', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Visitor flow is temporarily unavailable.');
  await page.getByRole('button', { name: 'Restore sample', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByRole('code')).toContainText('@mantha911/ng-echarts/sankey');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
  expect(errors).toEqual([]);
});
test('fits light/dark themes at all review widths with scroll contained to the graph', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      if (
        (await page.locator('.site-shell').getAttribute('class'))!.includes('dark') !==
        (theme === 'dark')
      )
        await page.getByRole('button', { name: /Use (light|dark) theme/ }).click();
      await expect(chart.locator('canvas').first()).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      const region = chart.getByRole('region', {
        name: 'Flow diagram. Scroll horizontally for wider graphs.',
        exact: true,
      });
      await region.focus();
      await page.keyboard.press('End');
      expect(await region.evaluate((e) => e.scrollWidth >= e.clientWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
test('releases chart, resize, motion and focus resources over 100 mount cycles and navigation', async ({
  page,
}) => {
  test.setTimeout(120000);
  await installResourceAudit(page);
  const { chart, errors } = await open(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.radial-controls > summary').click();
  const mount = page.getByRole('button', { name: 'Mount flow', exact: true });
  for (let i = 0; i < 100; i++) {
    const plot = await chart.locator('.plot').elementHandle();
    await mount.click();
    await expect(chart).toHaveCount(0);
    expect(await plot!.getAttribute('_echarts_instance_')).toBe('');
    await plot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
    await mount.click();
    await expect(chart.locator('canvas').first()).toBeVisible();
  }
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Navigate away', exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
  expect(errors).toEqual([]);
});

test('recovers a failed renderer import with native flow values', async ({ page }) => {
  const directory = 'dist/playground/browser';
  const assets: string[] = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateSankeyRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      assets.push(file);
  expect(assets).toHaveLength(1);
  const asset = assets[0]!;
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/sankey');
  const chart = page.locator('nec-sankey-chart');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await expect(chart.locator('table')).toHaveCount(0);
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry flows', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(chart.locator('canvas').first()).toBeVisible();
  await expect(chart.locator('table')).toHaveCount(2);
  await expect(chart.locator('.table-toggle')).toBeFocused();
  expect(errors).toEqual([]);
});

test('serves node totals and recorded zero links without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/sankey');
    const chart = page.locator('nec-sankey-chart');
    await expect(chart.locator('canvas')).toHaveCount(0);
    await expect(chart.locator('tbody tr')).toHaveCount(13);
    await chart.locator('.flow-data > summary').click();
    await expect(
      chart.getByRole('button', { name: 'Select flow Direct to Trial: 0', exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
