import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

for (const family of ['bar', 'line', 'area', 'composed', 'pie']) {
  test(`${family} pages native rows with keyboard focus and leaves the plot unchanged`, async ({
    page,
  }) => {
    const errors = collectBrowserErrors(page);
    const response = await page.goto(`/${family === 'bar' ? '' : `${family}-`}benchmark`);
    expect(await response!.text()).not.toContain('<canvas');
    await page.waitForFunction(() => !!window.angularBarBenchmark);
    await page.evaluate(() => window.angularBarBenchmark!.prepareTable(123, 50));
    const chart = page.locator(`nec-${family}-chart`);
    await expect(chart.locator('canvas')).toHaveCount(1);
    const canvas = await chart.locator('canvas').elementHandle();
    await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
    const next = chart.getByRole('button', { name: 'Next table page', exact: true });
    const previous = chart.getByRole('button', { name: 'Previous table page', exact: true });
    const status = chart.locator('nec-table-pager [role=status]');
    await expect(chart.locator('tbody tr')).toHaveCount(50);
    await expect(status).toHaveText('Rows 1–50 of 123');
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    // Settle the initial ResizeObserver before checking page-only updates.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const updates = await page.evaluate(() => window.angularBarBenchmark!.plotUpdates());
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(status).toHaveText('Rows 51–100 of 123');
    await expect(chart.locator('tbody tr')).toHaveCount(50);
    await expect(chart.locator('tbody th').first()).toHaveText('Category 50');
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(status).toHaveText('Rows 101–123 of 123');
    await expect(chart.locator('tbody tr')).toHaveCount(23);
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(status).toHaveText('Rows 101–123 of 123');
    await previous.focus();
    await page.keyboard.press('Space');
    await expect(status).toHaveText('Rows 51–100 of 123');
    await expect(previous).toBeFocused();
    expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
    expect(await page.evaluate(() => window.angularBarBenchmark!.plotUpdates())).toBe(updates);
    await chart.getByRole('button', { name: 'Hide data table', exact: true }).click();
    await chart.getByRole('button', { name: 'Show data table', exact: true }).click();
    await expect(status).toHaveText('Rows 51–100 of 123');
    await page.evaluate(() => window.angularBarBenchmark!.clear());
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('wraps the pager at 320px in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/benchmark');
  await page.waitForFunction(() => !!window.angularBarBenchmark);
  for (const theme of ['light', 'dark']) {
    await page.getByRole('button', { name: `Use ${theme} theme`, exact: true }).click();
    await page.evaluate(() => window.angularBarBenchmark!.prepareTable(123, 50));
    await page
      .locator('[data-benchmark-host]')
      .evaluate((host: HTMLElement) => (host.style.width = '100%'));
    await page.getByRole('button', { name: 'Show data table', exact: true }).click();
    const nav = page.getByRole('navigation', { name: 'Benchmark data table pages', exact: true });
    const bounds = await nav.evaluate((element) => ({
      width: element.clientWidth,
      content: element.scrollWidth,
    }));
    expect(bounds.content).toBeLessThanOrEqual(bounds.width + 1);
    await expect(nav.getByRole('button', { name: 'Next table page', exact: true })).toBeVisible();
  }
});
