import { expect, test, type Page, type Locator } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';
import { verifyDashboardRange } from '../../tools/dashboard-range-flow.mjs';

const browserErrors = new WeakMap<Page, ReturnType<typeof collectBrowserErrors>>();
test.afterEach(({ page }) => expect(browserErrors.get(page) ?? []).toEqual([]));

async function start(page: Page) {
  browserErrors.set(page, collectBrowserErrors(page));
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/dashboard-validation');
  const dashboard = page.locator('app-composed-dashboard');
  await expect(dashboard.locator('canvas')).toHaveCount(2);
  return dashboard;
}

async function arm(page: Page, dashboard: Locator, detail = false) {
  const plot = dashboard.locator(detail ? 'nec-bar-chart .plot' : 'nec-composed-chart .plot');
  await dashboard
    .getByRole('button', {
      name: detail ? 'Select detail range' : 'Select overview range',
      exact: true,
    })
    .click();
  await expect(plot).toHaveAttribute('data-category-range', 'ready');
  await plot.scrollIntoViewIfNeeded();
  const box = (await plot.boundingBox())!;
  // First Cartesian grid uses left/right 12/16 with labels inside its allocated bounds.
  return { plot, box };
}

async function drag(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
  first: number,
  last: number,
  horizontal = false,
  release = true,
) {
  const point = (index: number) =>
    horizontal
      ? { x: box.x + box.width * 0.65, y: box.y + 12 + (box.height - 42) * ((index + 0.5) / 4) }
      : { x: box.x + 54 + (box.width - 70) * ((index + 0.5) / 4), y: box.y + box.height * 0.4 };
  const a = point(first),
    b = point(last);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  if (release) await page.mouse.up();
}

test('commits one overview range on release and updates both charts without selecting a point', async ({
  page,
}) => {
  const dashboard = await start(page);
  const { plot, box } = await arm(page, dashboard);
  await drag(page, box, 2, 1, false, false);
  await expect(plot.locator('.nec-category-range-draft')).toBeVisible();
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('jan');
  await page.mouse.up();
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('feb');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('mar');
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  await expect(dashboard.locator('.dashboard-window')).toHaveText(
    'Viewing February–March · 2 of 4 months.',
  );
  await expect(
    dashboard.getByRole('button', { name: 'Select overview range', exact: true }),
  ).toBeFocused();
  await expect(plot.locator('.nec-category-range-draft')).toHaveCount(0);
  await expect(dashboard.locator('nec-bar-chart')).toContainText('Visible months');
  // A valid drag within one category zooms to that month without disabling away native focus.
  await dashboard.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  const single = await arm(page, dashboard);
  const x = single.box.x + 54 + (single.box.width - 70) * 0.375;
  const y = single.box.y + single.box.height * 0.4;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 10, y, { steps: 4 });
  await page.mouse.up();
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('feb');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('feb');
  const button = dashboard.getByRole('button', { name: 'Select overview range', exact: true });
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(button).toBeFocused();
});

test('selects the shared range from horizontal device detail, retaining native reset and raw zero actions', async ({
  page,
}) => {
  const dashboard = await start(page);
  await dashboard.getByRole('combobox', { name: 'Device', exact: true }).selectOption('mobile');
  const { box } = await arm(page, dashboard, true);
  await drag(page, box, 0, 1, true);
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('jan');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('feb');
  await expect(
    dashboard.getByRole('button', { name: 'Select detail range', exact: true }),
  ).toBeFocused();
  await dashboard.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
  await dashboard
    .locator('nec-bar-chart')
    .getByRole('button', { name: 'Show data table', exact: true })
    .click();
  const zero = dashboard.getByRole('button', {
    name: 'Select Visits for February: 0',
    exact: true,
  });
  await zero.focus();
  await page.keyboard.press('Enter');
  await expect(zero).toBeFocused();
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('feb');
});

test('Escape cancels a draft; plain click and immutable context changes never commit a range', async ({
  page,
}) => {
  const dashboard = await start(page);
  let armed = await arm(page, dashboard);
  await page.mouse.click(armed.box.x + armed.box.width * 0.5, armed.box.y + armed.box.height * 0.4);
  await expect(dashboard.getByRole('combobox', { name: 'Month', exact: true })).toHaveValue('');
  await drag(page, armed.box, 0, 2, false, false);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(armed.plot).not.toHaveAttribute('data-category-range', 'ready');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
  armed = await arm(page, dashboard);
  await drag(page, armed.box, 0, 2, false, false);
  await page
    .getByRole('button', { name: 'Reverse months', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await page.mouse.up();
  await expect(armed.plot).not.toHaveAttribute('data-category-range', 'ready');
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('apr');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('jan');
});

test('cancels resize and pointer interruption, restores plot styles, and preserves chart instances', async ({
  page,
}) => {
  const dashboard = await start(page);
  const instances = await dashboard
    .locator('.plot')
    .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_')));
  let armed = await arm(page, dashboard);
  await drag(page, armed.box, 0, 2, false, false);
  await page.setViewportSize({ width: 1100, height: 1200 });
  await page.mouse.up();
  await expect(armed.plot).not.toHaveAttribute('data-category-range', 'ready');
  armed = await arm(page, dashboard);
  await page.evaluate(() =>
    window.addEventListener(
      'pointerdown',
      (event) => {
        document.documentElement.dataset['testPointer'] = String(event.pointerId);
      },
      { once: true, capture: true },
    ),
  );
  await drag(page, armed.box, 0, 2, false, false);
  await page.evaluate(() =>
    window.dispatchEvent(
      new PointerEvent('pointercancel', {
        pointerId: Number(document.documentElement.dataset['testPointer']),
      }),
    ),
  );
  await page.mouse.up();
  await expect(armed.plot).not.toHaveAttribute('data-category-range', 'ready');
  await expect(armed.plot).toHaveCSS('cursor', 'auto');
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
  expect(
    await dashboard
      .locator('.plot')
      .evaluateAll((plots) => plots.map((plot) => plot.getAttribute('_echarts_instance_'))),
  ).toEqual(instances);
});

test('keeps dark area ranges visible in forced colors and cancels internal legend changes', async ({
  page,
}) => {
  const dashboard = await start(page);
  const dark = page.getByRole('button', { name: 'Dark theme', exact: true });
  if ((await dark.getAttribute('aria-pressed')) !== 'true') await dark.click();
  await expect(dashboard).toHaveAttribute('data-theme', 'dark');
  await dashboard
    .getByRole('combobox', { name: 'Overview style', exact: true })
    .selectOption('area');
  await page.emulateMedia({ forcedColors: 'active' });
  const { plot, box } = await arm(page, dashboard);
  await drag(page, box, 0, 2, false, false);
  const band = plot.locator('.nec-category-range-draft');
  await expect(band).toBeVisible();
  await expect(band).toHaveCSS('border-top-width', '1px');
  const bounds = (await band.boundingBox())!;
  expect(bounds.x).toBeGreaterThan(box.x);
  expect(bounds.y).toBeGreaterThan(box.y);
  expect(bounds.y + bounds.height).toBeLessThan(box.y + box.height);
  await dashboard
    .locator('nec-composed-chart .legend button')
    .first()
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(plot).not.toHaveAttribute('data-category-range', 'ready');
  await page.mouse.up();
  await expect(dashboard.getByRole('combobox', { name: 'To', exact: true })).toHaveValue('apr');
});

test('preserves the native touch/keyboard range at 390px and cancels lost pointer capture', async ({
  page,
}) => {
  const dashboard = await start(page);
  await page.setViewportSize({ width: 390, height: 1200 });
  const { plot, box } = await arm(page, dashboard);
  await expect(plot).toHaveCSS('touch-action', 'pan-y pinch-zoom');
  await plot.dispatchEvent('pointerdown', {
    pointerId: 40,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX: box.x + box.width * 0.5,
    clientY: box.y + box.height * 0.4,
  });
  await plot.dispatchEvent('lostpointercapture', { pointerId: 40 });
  await expect(plot).not.toHaveAttribute('data-category-range', 'ready');
  const from = dashboard.getByRole('combobox', { name: 'From', exact: true });
  const to = dashboard.getByRole('combobox', { name: 'To', exact: true });
  await from.focus();
  await page.keyboard.press('f');
  await page.keyboard.press('Tab');
  await expect(from).toHaveValue('feb');
  await to.selectOption('mar');
  await expect(dashboard.locator('.dashboard-window')).toHaveText(
    'Viewing February–March · 2 of 4 months.',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('cleans repeated enablement and destruction during an active gesture', async ({ page }) => {
  const dashboard = await start(page);
  await page.evaluate(() => {
    const types = new Set([
      'pointermove',
      'pointerup',
      'pointercancel',
      'keydown',
      'scroll',
      'blur',
    ]);
    const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
    const add = window.addEventListener.bind(window),
      remove = window.removeEventListener.bind(window);
    const key = (type: string, options?: boolean | AddEventListenerOptions) =>
      `${type}/${typeof options === 'boolean' ? options : !!options?.capture}`;
    window.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      // Playwright installs its own hit-target interceptor during mouse actions; it is not
      // an application subscription (the recorded diagnostic identifies this exact callback).
      if (types.has(type) && listener && !String(listener).includes('_hitTargetInterceptor')) {
        const id = key(type, options),
          current = listeners.get(id) ?? new Set<EventListenerOrEventListenerObject>();
        current.add(listener);
        listeners.set(id, current);
      }
      add(type, listener, options);
    };
    window.removeEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) => {
      listeners.get(key(type, options))?.delete(listener);
      remove(type, listener, options);
    };
    Object.defineProperty(window, 'rangeListenerCount', {
      get: () => [...listeners.values()].reduce((count, current) => count + current.size, 0),
    });
  });
  for (let index = 0; index < 12; index++) {
    const { plot } = await arm(page, dashboard);
    await expect.poll(() => page.evaluate('window.rangeListenerCount')).toBe(6);
    await page.keyboard.press('Escape');
    await expect(plot.locator('.nec-category-range-draft')).toHaveCount(0);
    await expect(plot).toHaveCSS('cursor', 'auto');
    await expect.poll(() => page.evaluate('window.rangeListenerCount')).toBe(0);
  }
  const { box } = await arm(page, dashboard);
  await drag(page, box, 0, 2, false, false);
  await page
    .getByRole('link', { name: 'Navigate away', exact: true })
    .evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/away$/);
  await page.mouse.up();
  await expect(page.locator('.nec-category-range-draft')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate('window.rangeListenerCount')).toBe(0);
  await page.goto('/dashboard-validation');
  await expect(dashboard.locator('canvas')).toHaveCount(2);
  await expect(dashboard.getByRole('combobox', { name: 'From', exact: true })).toHaveValue('jan');
  await expect(
    dashboard.getByRole('button', { name: 'Select overview range', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
});

test('can immediately rearm by keyboard after reset and drives the installed-consumer journey', async ({
  page,
}) => {
  await start(page);
  await verifyDashboardRange(page);
});
