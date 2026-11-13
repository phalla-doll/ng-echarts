import { expect, test } from '@playwright/test';
import { firstGreenBarPoint } from './canvas-point';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

test('hydrates linked charts and connects real plot clicks, keyboard values and a native month selector', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  const response = await page.goto('/linked');
  const html = await response!.text();
  expect(html).toContain('Linked Charts');
  expect(html).toContain('All months');
  expect(html).not.toContain('<canvas');
  await expect(page.getByRole('button', { name: 'Reset month filter', exact: true })).toHaveCount(
    0,
  );
  const overview = page.locator('.overview nec-bar-chart');
  const detail = page.locator('.detail nec-pie-chart');
  await expect(page.locator('canvas')).toHaveCount(2);
  const instances = await page
    .locator('app-linked-visits .plot')
    .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  const point = await firstGreenBarPoint(overview.locator('canvas'));
  await page.mouse.click(point.x, point.y);
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('jan');
  await expect(detail.getByRole('heading')).toHaveText('Device share · January');
  await expect(page.locator('.linked-status')).toContainText('January: 526 visits');
  await overview.getByRole('button', { name: 'Show data table', exact: true }).click();
  const february = overview.getByRole('button', {
    name: 'Select Mobile for February: 491',
    exact: true,
  });
  await february.focus();
  await page.keyboard.press('Enter');
  await expect(february).toBeFocused();
  await expect(detail.getByRole('heading')).toHaveText('Device share · February');
  await detail.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 876', exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Mobile: 491', exact: true }),
  ).toBeVisible();
  await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('mar');
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 512', exact: true }),
  ).toBeVisible();
  await detail.getByRole('button', { name: 'Select Visits for Mobile: 290', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.linked-status')).toHaveText('March: Mobile, 290 visits.');
  await page.getByRole('button', { name: 'Reset month filter', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Reset month filter', exact: true })).toHaveCount(
    0,
  );
  await expect(detail.getByRole('heading')).toHaveText('Device share · All months');
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 7,170', exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator('app-linked-visits .plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
  ).toEqual(instances);
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Linked validation', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Linked selection validation', exact: true }),
  ).toBeVisible();
  await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('feb');
  await expect(page.locator('.linked-status')).toContainText('February: 200 visits');
  expect(errors).toEqual([]);
});

test('retains month identity, source focus and independent legends through changes, removal and missing/zero data', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-validation');
  await expect(page.locator('canvas')).toHaveCount(2);
  const overview = page.locator('.overview nec-bar-chart');
  const detail = page.locator('.detail nec-pie-chart');
  await overview.getByRole('button', { name: 'Show data table', exact: true }).click();
  await detail.getByRole('button', { name: 'Show data table', exact: true }).click();
  const february = overview.getByRole('button', {
    name: 'Select Desktop for February: 200',
    exact: true,
  });
  await february.focus();
  await page.keyboard.press('Enter');
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Mobile: 0', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reverse months', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(february).toBeFocused();
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('feb');
  await page.getByRole('button', { name: 'Update linked values', exact: true }).click();
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 210', exact: true }),
  ).toBeVisible();
  await detail.locator('.legend button').first().click();
  await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('jan');
  await expect(detail.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'false');
  await expect(overview.locator('.legend button').first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('mar');
  await expect(detail.locator('tbody')).toContainText('Missing');
  await expect(
    detail.getByRole('button', { name: 'Select Visits for Desktop: 0', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('feb');
  await page.getByRole('button', { name: 'Remove February', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  await expect(detail.getByRole('heading')).toHaveText('Device share · All months');
  await page.getByRole('button', { name: 'Restore linked data', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Missing linked data', exact: true }).click();
  await expect(page.locator('.linked-status')).toHaveText('All months: No recorded device visits.');
  await page.getByRole('button', { name: 'Empty linked data', exact: true }).click();
  await expect(page.locator('.linked-status')).toHaveText(
    'No months available. Device share is empty.',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore linked data', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('keeps linked layouts usable in both themes and releases both charts on navigation', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  await page.goto('/linked');
  await expect(page.locator('canvas')).toHaveCount(2);
  const initialInstances = await page
    .locator('app-linked-visits .plot')
    .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
      await page.getByRole('combobox', { name: 'Month', exact: true }).selectOption('feb');
      await expect(page.locator('.detail h2')).toHaveText('Device share · February');
    }
  }
  expect(
    await page
      .locator('app-linked-visits .plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
  ).toEqual(initialInstances);
  await page.getByText('Standalone Angular example', { exact: true }).click();
  await expect(page.locator('code')).toContainText('linkedSignal');
  await expect(page.locator('code .hljs-keyword').first()).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Navigate away', exact: true })
    .click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Linked Charts', exact: true })
    .click();
  await expect(page.locator('canvas')).toHaveCount(2);
  await expect(page.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  expect(errors).toEqual([]);
});

test('copies the standalone linking example and offers a manual fallback when clipboard access fails', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copiedLinkedSource: string }).copiedLinkedSource = text;
        },
      },
    }),
  );
  await page.goto('/linked');
  await page.getByText('Standalone Angular example', { exact: true }).click();
  await page.getByRole('button', { name: 'Copy example', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedLinkedSource: string }).copiedLinkedSource,
    ),
  ).toBe(await page.locator('code').textContent());
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Copied', exact: true }).click();
  await expect(
    page.getByText(
      'Clipboard access is unavailable. Select the source above to copy it manually.',
      { exact: true },
    ),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
