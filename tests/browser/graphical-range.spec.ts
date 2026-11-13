import { expect, test, type Page } from '@playwright/test';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';
import { solidBarGroups } from './canvas-point';
declare global {
  interface Window {
    rangeGlobals: number;
  }
}

async function start(page: Page, from: number, to: number, count = 12) {
  await page.getByRole('button', { name: 'Select range', exact: true }).click();
  const surface = page.locator('.nec-range-surface');
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const box = (await surface.boundingBox())!;
  const point = (index: number) => ({
    x: box.x + box.width * ((index + 0.5) / count),
    y: box.y + box.height / 2,
  });
  await page.mouse.move(point(from).x, point(from).y);
  await page.mouse.down();
  await page.mouse.move(point(to).x, point(to).y, { steps: 8 });
  await expect(page.locator('.nec-range-draft')).toBeVisible();
  return box;
}

test('commits snapped forward/reverse drags once on release and synchronizes native bounds and both charts', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked');
  await expect(page.locator('canvas')).toHaveCount(2);
  const before = await page
    .locator('.plot')
    .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  await start(page, 1, 3);
  await expect(page.locator('.linked-status')).toContainText('All months: 11,463 visits');
  await page.mouse.up();
  await expect(page.locator('.linked-status')).toContainText('February–April: 3,189 visits');
  await expect(page.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('feb');
  await expect(page.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
  await expect(page.locator('.nec-range-surface')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Select range', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect.poll(() => solidBarGroups(page.locator('.overview nec-bar-chart'))).toBe(3);
  await page
    .locator('.overview')
    .getByRole('button', { name: 'Show data table', exact: true })
    .click();
  await expect(page.locator('.overview .selected-row')).toHaveCount(3);
  await expect(page.locator('.overview tr[aria-current]')).toHaveCount(0);
  await start(page, 3, 1);
  await page.mouse.up();
  await expect(page.locator('.linked-status')).toContainText('February–April: 3,189 visits');
  expect(
    await page
      .locator('.plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
  ).toEqual(before);
  expect(errors).toEqual([]);
});

test('cancels drafts on Escape, resize, data/native changes and interrupted pointers without replacing committed selection', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-validation');
  await expect(page.locator('canvas')).toHaveCount(2);
  const period = page.getByRole('combobox', { name: 'Period', exact: true });
  await period.selectOption('month:feb');
  await start(page, 0, 2, 4);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(period).toHaveValue('month:feb');
  await expect(page.locator('.nec-range-surface')).toHaveCount(0);
  await start(page, 0, 2, 4);
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect(page.locator('.nec-range-draft')).toBeHidden();
  await page.mouse.up();
  await expect(period).toHaveValue('month:feb');
  // Cancel the still-enabled mode before starting a fresh drag.
  await page.keyboard.press('Escape');
  await start(page, 0, 2, 4);
  await period.selectOption('month:mar');
  await page.mouse.up();
  await expect(period).toHaveValue('month:mar');
  await start(page, 0, 2, 4);
  await page
    .getByRole('button', { name: 'Reverse months', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator('.nec-range-surface')).toHaveCount(0);
  await page.mouse.up();
  await expect(period).toHaveValue('month:mar');
  await start(page, 0, 2, 4);
  await page.locator('.nec-range-surface').dispatchEvent('pointercancel');
  await expect(page.locator('.nec-range-draft')).toBeHidden();
  await page.mouse.up();
  await expect(period).toHaveValue('month:mar');
  expect(errors).toEqual([]);
});

test('retains usable range controls at all theme/width combinations, selects hidden/zero rows and cleans up armed gestures', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    window.rangeGlobals = 0;
    for (const [target, types] of [
      [window, ['keydown', 'blur', 'scroll']],
      [document, ['visibilitychange']],
    ] as const) {
      const add = target.addEventListener.bind(target),
        remove = target.removeEventListener.bind(target);
      const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
      target.addEventListener = (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) => {
        if ((types as readonly string[]).includes(type)) {
          const set = listeners.get(type) ?? new Set<EventListenerOrEventListenerObject>();
          listeners.set(type, set);
          if (!set.has(listener)) {
            set.add(listener);
            window.rangeGlobals++;
          }
        }
        add(type, listener, options);
      };
      target.removeEventListener = (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
      ) => {
        if (listeners.get(type)?.delete(listener)) window.rangeGlobals--;
        remove(type, listener, options);
      };
    }
  });
  await installResourceAudit(page);
  await page.goto('/linked');
  await expect(page.locator('canvas')).toHaveCount(2);
  const listeners = await page.evaluate(() => window.rangeGlobals);
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await start(page, 1, 2);
      await page.mouse.up();
      await expect.poll(() => page.evaluate(() => window.rangeGlobals)).toBe(listeners);
      await expect(page.locator('.linked-status')).toContainText('February–March: 2,169 visits');
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.overview .legend button').first().click();
  await page.locator('.overview .legend button').last().click();
  await start(page, 0, 2);
  await page.mouse.up();
  await expect(page.locator('.linked-status')).toContainText('January–March: 2,695 visits');
  await start(page, 1, 3);
  await page
    .getByRole('navigation', { name: 'Playground pages' })
    .getByRole('link', { name: 'Navigate away', exact: true })
    .evaluate((link: HTMLAnchorElement) => link.click());
  await page.mouse.up();
  await expect(page.locator('.nec-range-surface')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.rangeGlobals)).toBe(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  expect(errors).toEqual([]);
});

test('selects the same inclusive identities in every layout/stack/fill/theme and clips release outside the grid', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-validation');
  await expect(page.locator('canvas')).toHaveCount(2);
  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
    for (const horizontal of [false, true]) {
      const layout = page.getByRole('button', { name: 'Horizontal overview', exact: true });
      if ((await layout.getAttribute('aria-pressed')) !== String(horizontal)) await layout.click();
      for (const stacked of [false, true]) {
        const stack = page.getByRole('button', { name: 'Stack overview', exact: true });
        if ((await stack.getAttribute('aria-pressed')) !== String(stacked)) await stack.click();
        for (const gradient of [false, true]) {
          const fill = page.getByRole('button', { name: 'Gradient overview', exact: true });
          if ((await fill.getAttribute('aria-pressed')) !== String(gradient)) await fill.click();
          await page.getByRole('button', { name: 'Select range', exact: true }).click();
          const surface = page.locator('.nec-range-surface');
          await expect(surface).toBeVisible();
          await surface.scrollIntoViewIfNeeded();
          const box = (await surface.boundingBox())!;
          const point = (index: number) =>
            horizontal
              ? { x: box.x + box.width / 2, y: box.y + (box.height * (index + 0.5)) / 4 }
              : { x: box.x + (box.width * (index + 0.5)) / 4, y: box.y + box.height / 2 };
          const a = point(1),
            b = point(2);
          await page.mouse.move(a.x, a.y);
          await page.mouse.down();
          await page.mouse.move(b.x, b.y, { steps: 5 });
          await page.mouse.up();
          await expect(page.locator('.linked-status')).toContainText('February–March: 240 visits');
          await expect(page.getByRole('combobox', { name: 'From', exact: true })).toHaveValue(
            'feb',
          );
          await expect(page.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('mar');
        }
      }
    }
  }
  await page.getByRole('button', { name: 'Horizontal overview', exact: true }).click();
  const box = await start(page, 1, 2, 4);
  await page.mouse.move(box.x + box.width + 60, box.y + box.height / 2);
  await page.mouse.up();
  await expect(page.locator('.linked-status')).toContainText('February–April: 300 visits');
  expect(errors).toEqual([]);
});

test('keeps a plain click inert in selection mode, preserves keyboard/reset focus and disables unavailable ranges', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/linked-validation');
  await expect(page.locator('canvas')).toHaveCount(2);
  const toggle = page.getByRole('button', { name: 'Select range', exact: true });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await page.locator('.nec-range-surface').click({ position: { x: 20, y: 40 } });
  await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toHaveValue('');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await start(page, 0, 1, 4);
  await page.mouse.up();
  await expect(toggle).toBeFocused();
  await page.getByRole('combobox', { name: 'From', exact: true }).focus();
  await page.keyboard.type('February');
  await page.keyboard.press('Enter');
  await expect(page.locator('.linked-status')).toContainText('February: 200 visits');
  await page.getByRole('button', { name: 'Reset period filter', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toBeFocused();
  await toggle.click();
  const headerTheme = page.getByRole('button', { name: 'Use light theme', exact: true });
  await headerTheme.focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(headerTheme).toBeFocused();
  await toggle.click();
  await page
    .getByRole('button', { name: 'Missing linked data', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('combobox', { name: 'Period', exact: true })).toBeFocused();
  await expect(toggle).toBeDisabled();
  await page.getByRole('button', { name: 'Empty linked data', exact: true }).click();
  await expect(toggle).toBeDisabled();
  expect(errors).toEqual([]);
});

test('supports a real horizontal touch drag while leaving vertical touch scrolling available', async ({
  page,
  browserName,
  baseURL,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Real swipe transport uses Chromium CDP; other engines retain real mouse/native-control coverage.',
  );
  const errors = collectBrowserErrors(page);
  const touch = await page
    .context()
    .browser()!
    .newContext({
      viewport: { width: 390, height: 900 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
  const phone = await touch.newPage();
  const phoneErrors = collectBrowserErrors(phone);
  const client = await touch.newCDPSession(phone);
  try {
    await phone.goto(new URL('/linked', baseURL!).href);
    await expect(phone.locator('canvas')).toHaveCount(2);
    const arm = async () => {
      await phone.getByRole('button', { name: 'Select range', exact: true }).tap();
      const surface = phone.locator('.nec-range-surface');
      await expect(surface).toBeVisible();
      await surface.scrollIntoViewIfNeeded();
      return (await surface.boundingBox())!;
    };
    let box = await arm();
    const x1 = box.x + (box.width * 1.5) / 12,
      x2 = box.x + (box.width * 3.5) / 12,
      y = box.y + box.height / 2;
    const send = async (type: string, x: number, y: number) =>
      client.send('Input.dispatchTouchEvent', {
        type: type as 'touchStart' | 'touchMove' | 'touchEnd',
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      });
    await send('touchStart', x1, y);
    for (let i = 1; i <= 8; i++) await send('touchMove', x1 + ((x2 - x1) * i) / 8, y);
    await send('touchEnd', x2, y);
    await expect(phone.locator('.linked-status')).toContainText('February–April: 3,189 visits');
    box = await arm();
    const scroll = await phone.evaluate(() => scrollY),
      x = box.x + box.width / 2,
      startY = box.y + box.height * 0.8;
    await send('touchStart', x, startY);
    for (let i = 1; i <= 8; i++) await send('touchMove', x, startY - i * 15);
    await send('touchEnd', x, startY - 120);
    await expect.poll(() => phone.evaluate(() => scrollY)).toBeGreaterThan(scroll + 20);
    await expect(phone.locator('.nec-range-draft')).toBeHidden();
    expect(phoneErrors).toEqual([]);
    await expect(phone.locator('.linked-status')).toContainText('February–April: 3,189 visits');
  } finally {
    await touch.close();
  }
  expect(errors).toEqual([]);
});
