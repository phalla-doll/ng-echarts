import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { collectBrowserErrors } from './resource-audit';

for (const theme of ['dark', 'light']) {
  test(`keeps radar ${theme} legends aligned, responsive and keyboard-operable across layout changes`, async ({
    page,
  }, testInfo) => {
    const errors = collectBrowserErrors(page);
    const response = await page.goto('/radar-validation');
    expect(await response!.text()).not.toContain('<canvas');
    const chart = page.locator('nec-radar-chart');
    await expect(chart.locator('canvas')).toHaveCount(1);
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    const legend = chart.locator('.legend');
    const current = legend.getByRole('button').first();
    const button = await current.elementHandle();
    const canvas = await chart.locator('canvas').elementHandle();
    const instance = await chart.locator('.plot').getAttribute('_echarts_instance_');
    await expect(legend).not.toHaveClass(/legend-list/);
    await current.focus();
    await page.keyboard.press('Space');
    await expect(current).toBeFocused();
    await expect(current).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Aligned list', exact: true }).click();
    await expect(legend).toHaveClass(/legend-list/);
    await expect(current.locator('.legend-note')).toHaveText('Hidden');
    await current.focus();
    await page.keyboard.press('Enter');
    await expect(current).toBeFocused();
    await expect(current).toHaveAttribute('aria-pressed', 'true');
    await expect(current.locator('.legend-note')).toHaveText('Visible');
    await page.locator('.radar-controls summary').click();
    await page.getByRole('button', { name: 'Make one value missing', exact: true }).click();
    await expect(current.locator('.legend-note')).toHaveText('Missing data');

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const layout of ['Inline chips', 'Aligned list']) {
        await page.getByRole('button', { name: layout, exact: true }).click();
        await expect(current.locator('.legend-note')).toBeVisible();
        await expect(current.locator('.legend-note')).toHaveText('Missing data');
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
        for (const item of await legend.getByRole('button').all()) {
          await expect
            .poll(() => item.evaluate((element) => element.scrollWidth <= element.clientWidth))
            .toBe(true);
        }
        if (layout === 'Aligned list') {
          const bounds = await legend.getByRole('button').evaluateAll((items) =>
            items.map((item) => {
              const { left, right } = item.getBoundingClientRect();
              const note = item.querySelector('.legend-note')!.getBoundingClientRect();
              return { left, right, noteRight: note.right };
            }),
          );
          for (const edge of ['left', 'right', 'noteRight'] as const)
            expect(
              Math.max(...bounds.map((item) => item[edge])) -
                Math.min(...bounds.map((item) => item[edge])),
            ).toBeLessThan(1);
        }
        expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
        expect(await button!.evaluate((element) => element.isConnected)).toBe(true);
        await expect(chart.locator('.plot')).toHaveAttribute('_echarts_instance_', instance!);
        if (testInfo.project.name === 'chromium' && [390, 1440].includes(width)) {
          await mkdir('docs/experiments/rc30/visual', { recursive: true });
          await chart.screenshot({
            path: `docs/experiments/rc30/visual/radar-${layout === 'Inline chips' ? 'chips' : 'list'}-${theme}-${width}.png`,
          });
        }
      }
    }
    await page.setViewportSize({ width: 320, height: 1000 });
    await current.locator('.legend-label').evaluate((element) => {
      element.textContent = 'ComparisonWithAnUnbrokenVeryLongSeriesName';
    });
    await expect
      .poll(() => current.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
    await current.focus();
    await page.keyboard.press('Space');
    await expect(current).toBeFocused();
    await expect(current.locator('.legend-note')).toHaveText('Hidden');
    await page.getByRole('button', { name: 'Code', exact: true }).click();
    await expect(page.locator('.block-code')).toContainText('legendLayout="list"');
    expect(errors).toEqual([]);
  });
}

test('keeps radar gallery chips and native choices available before JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 1000 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/radar');
    const chart = page.locator('nec-radar-chart');
    await expect(chart.locator('.legend')).not.toHaveClass(/legend-list/);
    await expect(chart.locator('.legend-label').first()).toHaveText('Current');
    await expect(page.getByRole('button', { name: 'Inline chips', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(chart.locator('.table-toggle, table, canvas')).toHaveCount(0);
  } finally {
    await context.close();
  }
});
