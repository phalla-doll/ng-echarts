import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
async function open(page: Page) {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/calendar');
  const html = await response!.text();
  expect(html).toContain('2024-02-29');
  expect(html).toContain('Explore daily data');
  expect(html).not.toContain('<canvas');
  const chart = page.locator('nec-calendar-heatmap');
  await expect(chart.locator('canvas').first()).toBeVisible();
  return { chart, errors };
}
async function january(chart: Locator) {
  const data = chart.locator('.calendar-data');
  if ((await data.getAttribute('open')) === null) await data.locator(':scope > summary').click();
  const month = chart.locator('.calendar-month').first();
  if ((await month.getAttribute('open')) === null) await month.locator('summary').click();
}
async function point(page: Page, chart: Locator, date: string) {
  const target = await chart.locator('.plot').evaluate((host, day) => {
    const width = host.clientWidth;
    const quarter = width < 560 ? Math.floor((Number(day.slice(5, 7)) - 1) / 3) : 0;
    const startMonth = width < 560 ? quarter * 3 : 0,
      endMonth = width < 560 ? startMonth + 3 : 12;
    const year = Number(day.slice(0, 4));
    const first = new Date(year, startMonth, 1),
      last = new Date(year, endMonth, 0);
    const offset = (first.getDay() + 6) % 7;
    const count =
      Math.round((Date.UTC(year, endMonth, 0) - Date.UTC(year, startMonth, 1)) / 86400000) + 1;
    const weeks = Math.ceil((offset + count) / 7);
    const index =
      Math.round(
        (Date.UTC(year, Number(day.slice(5, 7)) - 1, Number(day.slice(8))) -
          Date.UTC(year, startMonth, 1)) /
          86400000,
      ) + offset;
    const rect = host.getBoundingClientRect();
    return {
      x: rect.left + 30 + (Math.floor(index / 7) + 0.5) * ((width - 38) / weeks),
      y: rect.top + 28 + quarter * 138 + ((index % 7) + 0.5) * 14,
    };
  }, date);
  await page.mouse.move(target.x, target.y);
  return target;
}
test('hydrates native leap-year tables, exposes missing versus zero, and emits matching pointer/keyboard values', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  await january(chart);
  const zero = chart.getByRole('button', { name: 'Select 2024-01-01: 0', exact: true });
  await zero.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.calendar-selection')).toHaveText('2024-01-01: 0 contributions');
  await expect(zero).toBeFocused();
  await expect(
    chart
      .locator('tr')
      .filter({ has: page.getByRole('rowheader', { name: '2024-01-02', exact: true }) }),
  ).toContainText('No data');
  await expect(chart.getByRole('button', { name: /Select 2024-01-02/ })).toHaveCount(0);
  await chart.locator('.calendar-data > summary').click();
  const target = await point(page, chart, '2024-01-03');
  await expect(chart.locator('[data-nec-tooltip]')).toContainText('2024-01-03');
  await expect(chart.locator('[data-nec-tooltip]')).toContainText('26');
  await page.mouse.click(target.x, target.y);
  await expect(page.locator('.calendar-selection')).toHaveText('2024-01-03: 26 contributions');
  await january(chart);
  await zero.focus();
  await page.getByRole('spinbutton', { name: 'Year', exact: true }).fill('2025');
  await page.getByRole('spinbutton', { name: 'Year', exact: true }).dispatchEvent('change');
  await expect(page.getByRole('spinbutton', { name: 'Year', exact: true })).toBeFocused();
  await expect(chart.locator('tbody tr')).toHaveCount(365);
  await expect(chart.getByRole('rowheader', { name: '2025-02-29', exact: true })).toHaveCount(0);
  await expect(page.locator('.calendar-selection')).toContainText('Select a recorded day');
  expect(errors).toEqual([]);
});
test('retains a stable scale and handles zero, missing, invalid and application states', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  const scale = await chart.locator('.calendar-scale').textContent();
  await page.locator('.radial-controls > summary').click();
  await page.getByRole('button', { name: 'Show recorded zeros', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
  expect(await chart.locator('.calendar-scale').textContent()).toBe(scale);
  await page.getByRole('button', { name: 'Missing values', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('No calendar observations available.');
  await expect(chart.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Invalid date', exact: true }).click();
  await expect(chart.getByRole('alert')).toContainText('Gregorian');
  await page.getByRole('button', { name: 'Loading state', exact: true }).click();
  await expect(chart.getByRole('status')).toHaveText('Loading calendar…');
  await page.getByRole('button', { name: 'Error state', exact: true }).click();
  await expect(chart.getByRole('alert')).toHaveText('Daily activity is temporarily unavailable.');
  await page.getByRole('button', { name: 'Restore sample', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
  expect(errors).toEqual([]);
});
test('fits both themes and both calendar layouts, retains hidden previews, and copies real source', async ({
  page,
}) => {
  const { chart, errors } = await open(page);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      if (
        (await page.locator('.site-shell').getAttribute('class'))!.includes('dark') !==
        (theme === 'dark')
      )
        await page.getByRole('button', { name: /Use (light|dark) theme/ }).click();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      await expect(chart.locator('canvas').first()).toBeVisible();
      const geometry = await chart
        .locator('.plot')
        .evaluate((e) => ({ width: e.clientWidth, height: e.clientHeight }));
      expect(geometry.height).toBe(geometry.width < 560 ? 566 : 152);
      await point(page, chart, '2024-02-29');
      await expect(chart.locator('[data-nec-tooltip]')).toContainText('2024-02-29');
    }
  }
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(page.getByRole('code')).toContainText('@ng-echarts/chart-library/calendar');
  const copy = page.getByRole('button', { name: 'Copy code', exact: true });
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    }),
  );
  await copy.click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toContain(
    'class DailyActivity',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(chart.locator('canvas').first()).toBeVisible();
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
  const mount = page.getByRole('button', { name: 'Mount calendar', exact: true });
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

test('keeps date-only identity across DST and far-east timezones', async ({ browser }) => {
  for (const timezoneId of ['America/New_York', 'Pacific/Kiritimati']) {
    const context = await browser.newContext({ timezoneId, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      const { chart, errors } = await open(page);
      await january(chart);
      await chart.getByRole('button', { name: 'Select 2024-01-03: 26', exact: true }).click();
      await expect(page.locator('.calendar-selection')).toHaveText('2024-01-03: 26 contributions');
      await expect(chart.locator('tbody tr')).toHaveCount(366);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }
});

test('recovers a failed renderer import with native daily values', async ({ page }) => {
  const directory = 'dist/playground/browser';
  const assets: string[] = [];
  for (const file of await readdir(directory))
    if (
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateCalendarRenderer\b/.test(
        await readFile(join(directory, file), 'utf8'),
      )
    )
      assets.push(file);
  expect(assets).toHaveLength(1);
  const asset = assets[0]!;
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/calendar');
  const chart = page.locator('nec-calendar-heatmap');
  await expect(chart.getByRole('alert')).toContainText('Unable to render chart');
  await expect(chart.locator('table')).toHaveCount(0);
  await page.unroute(`**/${asset}`);
  await chart.getByRole('button', { name: 'Retry calendar', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(chart.locator('canvas').first()).toBeVisible();
  await expect(chart.locator('table')).toHaveCount(12);
  await expect(chart.locator('.table-toggle')).toBeFocused();
  expect(errors).toEqual([]);
});

test('keeps every day readable in native monthly tables without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/calendar');
    const chart = page.locator('nec-calendar-heatmap');
    await expect(chart.locator('canvas')).toHaveCount(0);
    await expect(chart.locator('tbody tr')).toHaveCount(366);
    await january(chart);
    await expect(chart.getByRole('rowheader', { name: '2024-01-01', exact: true })).toBeVisible();
    await expect(
      chart.getByRole('button', { name: 'Select 2024-01-01: 0', exact: true }),
    ).toBeVisible();
    await expect(chart.getByRole('row', { name: '2024-01-02 No data', exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});

test('preserves exact native values when a timezone skips a civil date, then restores the plot for a supported year', async ({
  browser,
}) => {
  const context = await browser.newContext({ timezoneId: 'Pacific/Apia', reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    const { chart, errors } = await open(page);
    const year = page.getByRole('spinbutton', { name: 'Year', exact: true });
    await year.fill('2011');
    await year.press('Tab');
    await expect(chart.getByRole('status')).toContainText('This timezone skips a date in 2011.');
    await expect(chart.locator('canvas')).toHaveCount(0);
    await expect(chart.locator('tbody tr')).toHaveCount(365);
    await chart.locator('.calendar-data > summary').click();
    await chart.locator('.calendar-month').last().locator('summary').click();
    const day = chart.getByRole('button', { name: 'Select 2011-12-30: 13', exact: true });
    await day.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.calendar-selection')).toHaveText('2011-12-30: 13 contributions');
    await year.fill('2024');
    await year.press('Tab');
    await expect(chart.locator('canvas').first()).toBeVisible();
    await expect(chart.getByRole('status')).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
