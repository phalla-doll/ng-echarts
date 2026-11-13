import { expect, test } from '@playwright/test';
import { installResourceAudit } from './resource-audit';
async function open(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || /NG05\d+/.test(m.text())) errors.push(m.text());
  });
  const response = await page.goto('/radar');
  const html = await response!.text();
  expect(html).toContain('Capability profile');
  expect(html).not.toContain('<canvas');
  const chart = page.locator('nec-radar-chart');
  await expect(chart.locator('canvas')).toHaveCount(1);
  return { chart, errors };
}
test('hydrates, emits equivalent plot/table identities and preserves keyboard focus across updates', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  const canvas = await chart.locator('canvas').boundingBox();
  expect(canvas).not.toBeNull();
  const radius = Math.min(
    (canvas!.width / 2 - 72) / Math.cos(Math.PI / 6),
    (canvas!.height - 64) / 2,
  );
  await page.mouse.move(
    canvas!.x + canvas!.width / 2,
    canvas!.y + canvas!.height / 2 - radius * 0.78,
  );
  await expect(chart.locator('[data-nec-tooltip]')).toContainText('Speed: 78 / 100');
  await page.mouse.click(
    canvas!.x + canvas!.width / 2,
    canvas!.y + canvas!.height / 2 - radius * 0.78,
  );
  await expect(page.locator('.block-selection')).toHaveText('Speed: current = 78 (plot)');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  const action = chart.getByRole('button', { name: 'Select Current for Speed: 78', exact: true });
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.block-selection')).toHaveText('Speed: current = 78 (table)');
  await expect(chart.locator('tbody tr')).toHaveCount(6);
  await expect(chart.locator('tbody tr').first()).toContainText('0 – 100');
  await page.locator('.radar-controls summary').click();
  await page.getByRole('button', { name: 'Update scores', exact: true }).click();
  await expect(
    chart.getByRole('button', { name: 'Select Current for Speed: 83', exact: true }),
  ).toBeVisible();
  await chart.locator('.legend button').first().focus();
  await page.keyboard.press('Space');
  await expect(chart.locator('.legend button').first()).toBeFocused();
  await expect(chart.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Reverse dimensions', exact: true }).click();
  await expect(chart.locator('tbody tr').first()).toContainText('Value');
  await expect(chart.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(chart.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('keeps missing observations explicit, hides stale plots in states and recovers', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  await page.locator('.radar-controls summary').click();
  await page.getByRole('button', { name: 'Make one value missing', exact: true }).click();
  await expect(chart.getByRole('status')).toContainText('Missing values: Current');
  await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(chart.locator('tbody tr').first()).toContainText('Missing');
  await expect(chart.getByRole('button', { name: /Select Current for Speed/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(chart.locator('.plot')).toBeHidden();
  await expect(chart.locator('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Error state', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Scores are temporarily unavailable.');
  await page.getByRole('button', { name: 'Restore sample', exact: true }).click();
  await expect(chart.locator('canvas')).toHaveCount(1);
  await expect(chart.locator('table')).toBeVisible();
  await expect(
    chart.getByRole('button', { name: 'Select Current for Speed: 78', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('fits both themes at narrow widths, resizes a mounted plot, and preserves shared focus styling', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => chart.locator('canvas').evaluate((c) => c.getBoundingClientRect().width))
      .toBeGreaterThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const theme of ['light', 'dark']) {
      const shell = page.locator('.site-shell');
      if ((await shell.getAttribute('class'))!.includes('dark') !== (theme === 'dark'))
        await page.getByRole('button', { name: /Use (light|dark) theme/ }).click();
      await expect(chart.locator('canvas')).toHaveCount(1);
      const legend = chart.locator('.legend button').first();
      await page.keyboard.press('Tab');
      await legend.focus();
      await expect(legend).toBeFocused();
      await expect
        .poll(() =>
          legend.evaluate((e) => e.matches(':focus-visible') && getComputedStyle(e).outlineWidth),
        )
        .toBe('1px');
    }
  }
  expect(errors).toEqual([]);
});
test('disposes the renderer and motion listeners across 100 mount cycles and navigation', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await installResourceAudit(page);
  const { chart, errors } = await open(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.radar-controls summary').click();
  const mount = page.getByRole('button', { name: 'Mount chart', exact: true });
  for (let i = 0; i < 100; i++) {
    const oldPlot = await chart.locator('.plot').elementHandle();
    await mount.click();
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(await oldPlot!.getAttribute('_echarts_instance_')).toBe('');
    await oldPlot!.dispose();
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    await expect.poll(() => page.evaluate(() => window.chartFocusListeners)).toBe(0);
    await expect(page.locator('[data-nec-tooltip]')).toHaveCount(0);
    await mount.click();
    await expect(chart.locator('canvas')).toHaveCount(1);
  }
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Bar Blocks', exact: true })
    .click();
  await expect(chart).toHaveCount(0);
  expect(errors).toEqual([]);
});
