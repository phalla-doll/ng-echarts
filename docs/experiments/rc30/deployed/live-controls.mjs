import { chromium, firefox, webkit } from 'playwright';
import { expect as testExpect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const expect = testExpect.configure({ timeout: 30000 });
const base = 'https://phalla-doll.github.io/ng-echarts/';
const results = [];
for (const engine of [chromium, firefox, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' || /NG05\d+/.test(m.text())) errors.push(m.text());
    });
    await page.goto(new URL('radar/', base).href, { waitUntil: 'domcontentloaded' });
    const chart = page.locator('nec-radar-chart');
    await expect(chart.locator('canvas')).toHaveCount(1);
    await expect(chart.locator('.table-toggle,table')).toHaveCount(0);
    const legend = chart.locator('.legend');
    const current = legend.getByRole('button').first();
    const canvas = await chart.locator('canvas').elementHandle();
    const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
    await expect(legend).not.toHaveClass(/legend-list/);
    await page.getByRole('button', { name: 'Aligned list', exact: true }).click();
    await expect(legend).toHaveClass(/legend-list/);
    await expect(current.locator('.legend-note')).toHaveText('Visible');
    await current.focus();
    await page.keyboard.press('Space');
    await expect(current).toBeFocused();
    await expect(current).toHaveAttribute('aria-pressed', 'false');
    await expect(current.locator('.legend-note')).toHaveText('Hidden');
    await page.getByRole('button', { name: 'Inline chips', exact: true }).click();
    await expect(legend).not.toHaveClass(/legend-list/);
    await expect(current).toHaveAttribute('aria-pressed', 'false');
    await expect(current.locator('.legend-note')).toHaveCount(0);
    await expect(chart.locator('.plot')).toHaveAttribute('_echarts_instance_', instance);
    if (!(await canvas.evaluate((e) => e.isConnected)))
      throw Error('Renderer replaced by layout changes');
    await page.getByRole('button', { name: 'Aligned list', exact: true }).click();
    await page.getByRole('button', { name: 'Code', exact: true }).click();
    await expect(page.locator('.block-code')).toContainText('legendLayout="list"');
    await expect(page.locator('.block-code code.syntax-code')).toBeVisible();
    await page.evaluate(async () => {
      const faces = await document.fonts.load('12px "Google Sans Code"');
      if (!faces.length || faces.some((f) => f.status !== 'loaded'))
        throw Error('Code font did not load');
    });
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.setViewportSize({ width: 390, height: 1000 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390);
    await page.getByRole('button', { name: 'Reset capability profile', exact: true }).click();
    await expect(legend).not.toHaveClass(/legend-list/);
    await page.goto(new URL('radar-validation/', base).href, { waitUntil: 'domcontentloaded' });
    await expect(chart.locator('canvas')).toHaveCount(1);
    await page.locator('.radar-controls summary').click();
    await page.getByRole('button', { name: 'Make one value missing', exact: true }).click();
    await page.getByRole('button', { name: 'Aligned list', exact: true }).click();
    await expect(current.locator('.legend-note')).toHaveText('Missing data');
    await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
    const action = chart.getByRole('button', { name: 'Select Target for Speed: 92', exact: true });
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.block-selection')).toHaveText('Speed: target = 92 (table)');
    await page.goto(new URL('installation/', base).href, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toContainText('public 0.1.0-rc.30 candidate');
    await expect(page.locator('#page-content')).toContainText(
      'npm next selects rc.30; latest retains rc.18',
    );
    await page.evaluate(() => document.fonts.load('12px "Google Sans Code"'));
    expect(errors).toEqual([]);
    results.push({
      browser: engine.name(),
      galleryTablesAbsent: true,
      keyboard: true,
      layoutAndRendererIdentity: true,
      codeMirror: true,
      mobileWidth: 390,
      reset: true,
      missingDataNotes: true,
      rawTableAction: true,
      currentInstallationCopy: true,
      pageErrors: errors,
      passed: true,
    });
    console.log(
      `PASS: ${engine.name()} live radar layouts, keyboard, mobile, missing data, table action and installation copy.`,
    );
  } finally {
    await browser.close();
  }
}
await writeFile(
  'tmp/rc30-live-controls.json',
  JSON.stringify(
    { url: base, checkedAt: new Date().toISOString(), results, passed: true },
    null,
    2,
  ) + '\n',
);
