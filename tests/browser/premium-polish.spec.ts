import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

for (const [route, selector] of [
  ['radar', 'nec-radar-chart'],
  ['radial', 'nec-radial-progress'],
  ['calendar', 'nec-calendar-heatmap'],
  ['sankey', 'nec-sankey-chart'],
]) {
  test(`${route} preserves plot and card geometry through loading and error states`, async ({
    page,
  }) => {
    const errors = collectBrowserErrors(page);
    await page.goto(`/${route}`);
    const chart = page.locator(selector!).first();
    await expect(chart.locator('canvas').first()).toBeVisible();
    const card = page.locator('.block-card').first();
    const controls = page
      .locator('details')
      .filter({ has: page.locator('summary', { hasText: /^Try/ }) })
      .first();
    await controls.locator('summary').click();
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['dark', 'light']) {
        const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
        if (await toggle.count()) await toggle.click();
        const stage = chart.locator('nec-chart-stage');
        const initial = await card.boundingBox();
        const stageInitial = await stage.boundingBox();
        for (const state of ['Loading state', 'Error state']) {
          await page.getByRole('button', { name: state, exact: true }).click();
          await expect(chart.locator('.plot')).toBeHidden();
          await expect(
            chart.locator(state === 'Loading state' ? '[role=status]' : '[role=alert]'),
          ).toBeVisible();
          expect(
            Math.abs((await stage.boundingBox())!.height - stageInitial!.height),
          ).toBeLessThanOrEqual(1);
          expect(
            Math.abs((await card.boundingBox())!.height - initial!.height),
          ).toBeLessThanOrEqual(1);
          for (const control of await chart.locator('.chart-controls').all()) {
            await expect(control).toBeHidden();
          }
          await page.getByRole('button', { name: state, exact: true }).click();
          await expect(chart.locator('canvas').first()).toBeVisible();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
      }
    }
    expect(errors).toEqual([]);
  });
}

test('pie totals and shares track visible categories, including keyboard hiding and recovery', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto('/pie');
  const chart = page.locator('#browser-donut nec-pie-chart');
  await chart.scrollIntoViewIfNeeded();
  await expect(chart.locator('canvas')).toBeVisible();
  await expect(chart.locator('.donut-total strong')).toHaveText('925');
  const buttons = chart.locator('.legend button');
  await expect(buttons.first()).toContainText('29.7%');
  await buttons.first().focus();
  await page.keyboard.press('Space');
  await expect(buttons.first()).toBeFocused();
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'false');
  await expect(chart.locator('.donut-total strong')).toHaveText('650');
  await expect(buttons.nth(1)).toContainText('30.8%');
  for (const button of (await buttons.all()).slice(1)) await button.click();
  await expect(chart.locator('.donut-total')).toHaveCount(0);
  await expect(chart.locator('.plot-message')).toContainText('No visible positive values');
  await buttons.first().click();
  await expect(chart.locator('.donut-total strong')).toHaveText('275');
  await expect(buttons.first()).toContainText('100%');
  for (const button of await buttons.all())
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(40);
  expect(errors).toEqual([]);
});

test('Sankey paints distinct stage colors and exposes a keyboard-scrollable mobile diagram', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/sankey');
  const chart = page.locator('nec-sankey-chart');
  await expect(chart.locator('canvas').first()).toBeVisible();
  await expect
    .poll(() =>
      chart.locator('canvas').evaluateAll((canvases) => {
        const wanted = ['16,185,129', '244,63,94', '96,165,250', '251,191,36'];
        const found = new Set<string>();
        for (const canvas of canvases as HTMLCanvasElement[]) {
          const pixels = canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] === 255) {
              const rgb = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`;
              if (wanted.includes(rgb)) found.add(rgb);
            }
          }
        }
        return found.size;
      }),
    )
    .toBe(4);
  await page.setViewportSize({ width: 320, height: 1000 });
  const viewport = chart.locator('.flow-viewport');
  await expect(chart.locator('.flow-scroll-hint')).toBeVisible();
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(0);
  await page.keyboard.press('End');
  await expect
    .poll(() => viewport.evaluate((el) => el.scrollLeft >= el.scrollWidth - el.clientWidth - 1))
    .toBe(true);
  await page.keyboard.press('Home');
  await expect.poll(() => viewport.evaluate((el) => el.scrollLeft)).toBe(0);
  expect(errors).toEqual([]);
});

test('the linked overview and detail share a desktop row and stack on mobile', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/linked');
  await expect(page.locator('.overview canvas')).toBeVisible();
  await expect(page.locator('.detail canvas')).toBeVisible();
  const overview = await page.locator('.overview').boundingBox();
  const detail = await page.locator('.detail').boundingBox();
  expect(Math.abs(overview!.y - detail!.y)).toBeLessThanOrEqual(1);
  expect(detail!.x).toBeGreaterThan(overview!.x + overview!.width);
  await expect(page.locator('.detail .donut-total strong')).toHaveText('11,463');
  await page.setViewportSize({ width: 320, height: 1000 });
  expect((await page.locator('.detail').boundingBox())!.y).toBeGreaterThan(
    (await page.locator('.overview').boundingBox())!.y,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect(errors).toEqual([]);
});

test('hiding every bar series explains the empty plot and keeps keyboard recovery available', async ({
  page,
}) => {
  await page.goto('/');
  const chart = page.locator('nec-bar-chart').first();
  await expect(chart.locator('canvas')).toBeVisible();
  const buttons = chart.locator('.legend button');
  for (const button of await buttons.all()) await button.click();
  await expect(chart.locator('.plot-message')).toHaveText(
    'All series are hidden. Choose a series below.',
  );
  await buttons.first().focus();
  await page.keyboard.press('Space');
  await expect(buttons.first()).toBeFocused();
  await expect(chart.locator('.plot-message')).toHaveCount(0);
});

test('confines Sankey tooltips to the visible mobile scrollport at both ends', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/sankey');
  const chart = page.locator('nec-sankey-chart');
  await expect(chart.locator('canvas').first()).toBeVisible();
  const viewport = chart.locator('.flow-viewport');
  const tooltip = chart.locator('[data-nec-tooltip]');
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['dark', 'light']) {
      const toggle = page.getByRole('button', { name: `Use ${theme} theme`, exact: true });
      if (await toggle.count()) await toggle.click();
      const colors =
        theme === 'dark'
          ? [
              [244, 63, 94],
              [251, 191, 36],
            ]
          : [
              [190, 18, 60],
              [161, 98, 7],
            ];
      for (const [index, key] of ['Home', 'End'].entries()) {
        await page.mouse.move(0, 0);
        await viewport.focus();
        await page.keyboard.press(key);
        await expect(tooltip).toBeHidden();
        let point: { x: number; y: number } | null = null;
        await expect
          .poll(async () => {
            point = await chart.locator('canvas').evaluateAll((canvases, color) => {
              for (const canvas of canvases as HTMLCanvasElement[]) {
                const pixels = canvas
                  .getContext('2d')!
                  .getImageData(0, 0, canvas.width, canvas.height).data;
                for (let x = 0; x < canvas.width; x++) {
                  const ys = [];
                  for (let y = 0; y < canvas.height; y++) {
                    const offset = (y * canvas.width + x) * 4;
                    if (
                      pixels[offset + 3] === 255 &&
                      color.every((v, i) => Math.abs(pixels[offset + i]! - v) <= 2)
                    )
                      ys.push(y);
                  }
                  if (ys.length > 60) {
                    const box = canvas.getBoundingClientRect();
                    return {
                      x: box.x + ((x + 5) * box.width) / canvas.width,
                      y: box.y + (ys[Math.floor(ys.length / 4)]! * box.height) / canvas.height,
                    };
                  }
                }
              }
              return null;
            }, colors[index]!);
            return point !== null;
          })
          .toBe(true);
        await page.mouse.move(point!.x, point!.y);
        await expect(tooltip).toBeVisible();
        await expect
          .poll(async () => {
            const box = await tooltip.locator('..').boundingBox();
            const bounds = (await viewport.boundingBox())!;
            return (
              !!box &&
              box.x >= bounds.x - 1 &&
              box.x + box.width <= bounds.x + bounds.width + 1 &&
              box.y >= bounds.y - 1 &&
              box.y + box.height <= bounds.y + bounds.height + 1
            );
          })
          .toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});
