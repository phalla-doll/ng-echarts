import { chromium, firefox, webkit, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://phalla-doll.github.io/ng-echarts/';
const directory = 'tmp/control-live';
await mkdir(directory, { recursive: true });
const results = [];
for (const engine of [chromium, firefox, webkit]) {
  const browser = await engine.launch();
  const errors = [];
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const open = async (route, chart) => {
    await page.goto(new URL(route, base).href, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`${chart} canvas`).first()).toBeVisible({ timeout: 60000 });
  };
  try {
    await open('calendar/', 'nec-calendar-heatmap');
    const year = page.getByRole('spinbutton', { name: 'Year', exact: true });
    for (const theme of ['dark', 'light']) {
      const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
      if (await toggle.count()) await toggle.click();
      await expect(page.locator('.site-shell')).toHaveClass(
        theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b)/,
      );
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const field = await year.evaluate((input) => {
          const box = input.getBoundingClientRect();
          const parent = input.parentElement.getBoundingClientRect();
          const style = getComputedStyle(input);
          return {
            height: parent.height,
            offset: Math.abs(box.top + box.height / 2 - parent.top - parent.height / 2),
            background: style.backgroundColor,
            border: style.borderTopWidth,
          };
        });
        expect(field.height).toBe(44);
        expect(field.offset).toBeLessThanOrEqual(1);
        expect(field.background).toBe('rgba(0, 0, 0, 0)');
        expect(field.border).toBe('0px');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        if (width === 390)
          await page.screenshot({ path: `${directory}/${engine.name()}-calendar-${theme}.png` });
      }
    }
    await year.focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Tab');
    await expect(year).toHaveValue('2025');
    await page.getByRole('button', { name: 'Reset Daily contributions', exact: true }).click();
    await expect(year).toHaveValue('2024');

    await open('radial/', 'nec-radial-progress');
    await page.locator('.radial-controls summary').first().click();
    const value = page.locator('.value-field input').first();
    const initial = await value.inputValue();
    await value.focus();
    await page.keyboard.press('ArrowUp');
    await expect(value).toHaveValue(String(Number(initial) + 1));
    await expect(value).toBeFocused();
    await page
      .locator('.radial-controls')
      .first()
      .getByRole('button', { name: 'Restore sample', exact: true })
      .click();
    await expect(value).toHaveValue(initial);

    await open('radar/', 'nec-radar-chart');
    await page.locator('.radar-controls summary').click();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const buttons = page.locator('.radar-actions button');
      const first = await buttons.nth(0).boundingBox();
      const second = await buttons.nth(1).boundingBox();
      const third = await buttons.nth(2).boundingBox();
      if (width === 1440) {
        expect(second.y).toBe(first.y);
        expect(third.y).toBe(first.y);
      } else expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
      expect(Math.abs(second.width - first.width)).toBeLessThanOrEqual(1);
    }
    const fill = page.getByRole('button', { name: 'Fill polygons', exact: true });
    await fill.focus();
    await page.keyboard.press('Space');
    await expect(fill).toHaveAttribute('aria-pressed', 'false');
    await expect(fill).toBeFocused();

    await open('linked/', 'nec-bar-chart');
    await page.getByRole('combobox', { name: 'Period', exact: true }).selectOption('__range__');
    const from = page.getByRole('combobox', { name: 'From', exact: true });
    const to = page.getByRole('combobox', { name: 'To', exact: true });
    await expect(from).toBeVisible();
    await expect(to).toBeVisible();
    const first = await from.boundingBox();
    const second = await to.boundingBox();
    expect(first.x + first.width).toBeLessThanOrEqual(second.x);
    await from.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab');
    await page.getByRole('button', { name: 'Reset period filter', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');

    await open('linked-dashboard/', 'nec-composed-chart');
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    await page.evaluate(() => document.fonts.ready);
    expect(errors).toEqual([]);
    results.push({
      browser: engine.name(),
      passed: true,
      calendarThemes: ['dark', 'light'],
      widths: [390, 1440],
      centeredNumericField: true,
      keyboardStepReset: true,
      radialValue: true,
      radarRowsSwitchFocus: true,
      linkedRangeReset: true,
      dashboardZoomReset: true,
      errors,
    });
    console.log(
      `PASS: ${engine.name()} live calendar, radial, radar, linked range and dashboard controls.`,
    );
  } catch (error) {
    await page
      .screenshot({ path: `${directory}/${engine.name()}-failure.png`, fullPage: true })
      .catch(() => {});
    await writeFile(
      `${directory}/${engine.name()}-failure.json`,
      JSON.stringify({ error: String(error), errors }, null, 2) + '\n',
    );
    throw error;
  } finally {
    await browser.close();
  }
}
await writeFile(
  `${directory}/results.json`,
  JSON.stringify({ recordedAt: new Date().toISOString(), base, results, passed: true }, null, 2) +
    '\n',
);
