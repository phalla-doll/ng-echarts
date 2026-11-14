import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

type Stats = { outputs: Record<string, { entryPoint?: string }> };
async function componentEntries() {
  const { outputs } = JSON.parse(
    await readFile('dist/playground/browser-stats.json', 'utf8'),
  ) as Stats;
  return Object.fromEntries(
    ['bar', 'line', 'area', 'composed', 'pie'].map((family) => {
      const entry = Object.entries(outputs).find(([, output]) =>
        output.entryPoint?.endsWith(`/ng-echarts-chart-library-${family}.mjs`),
      );
      expect(entry, `${family} must retain a focused deferred component entry`).toBeDefined();
      return [family, entry![0]];
    }),
  );
}

for (const family of ['bar', 'line', 'area', 'composed']) {
  test(`loads only the ${family} gallery component on a fresh visit`, async ({ page }) => {
    const entries = await componentEntries();
    const requested = new Set<string>();
    page.on('request', (request) => requested.add(new URL(request.url()).pathname.slice(1)));
    const errors = collectBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(family === 'bar' ? '/' : `/${family}`);
    await expect(page.locator('canvas')).toHaveCount(1);
    expect(requested.has(entries[family]!)).toBe(true);
    for (const other of Object.keys(entries).filter((name) => name !== family))
      expect(requested.has(entries[other]!), `${family} fetched the ${other} facade`).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('warms sidebar destinations on pointer and keyboard intent before navigation', async ({
  page,
}) => {
  const entries = await componentEntries();
  const requested = new Set<string>();
  page.on('request', (request) => requested.add(new URL(request.url()).pathname.slice(1)));
  const errors = collectBrowserErrors(page);
  await page.goto('/installation');
  await expect(page.getByRole('heading', { name: 'Installation', exact: true })).toBeVisible();
  expect(requested.has(entries.pie!)).toBe(false);
  await page.getByRole('link', { name: 'Pie & Donut Blocks', exact: true }).hover();
  await expect.poll(() => requested.has(entries.pie!)).toBe(true);
  await expect(page).toHaveURL(/\/installation$/);
  await expect(page.locator('canvas')).toHaveCount(0);
  const line = page.getByRole('link', { name: 'Line Blocks', exact: true });
  await line.focus();
  await expect.poll(() => requested.has(entries.line!)).toBe(true);
  await line.press('Enter');
  await expect(page.getByRole('heading', { name: 'Line Blocks', exact: true })).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('keeps pie entrance animation progressing through repeated unchanged-size observer deliveries', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const repeats = new Map<Element, () => void>();
    const NativeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeObserver {
      private readonly targets = new Set<Element>();
      constructor(private readonly callback: ResizeObserverCallback) {
        super(callback);
      }
      override observe(target: Element, options?: ResizeObserverOptions) {
        this.targets.add(target);
        repeats.set(target, () => this.callback([], this));
        super.observe(target, options);
      }
      override disconnect() {
        for (const target of this.targets) repeats.delete(target);
        this.targets.clear();
        super.disconnect();
      }
    };
    const audit = { complete: false, deliveries: 0, distinctFrames: 0 };
    Object.assign(window, { demoAnimationAudit: audit });
    const observer = new MutationObserver(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('app-pie-block canvas');
      if (!canvas) return;
      observer.disconnect();
      const frames = new Set<string>();
      let start = 0;
      const sample = (time: number) => {
        start ||= time;
        if (time - start < 100) {
          const repeat = repeats.get(canvas.closest('.plot')!);
          if (repeat) {
            repeat();
            audit.deliveries++;
          }
        }
        frames.add(canvas.toDataURL());
        audit.distinctFrames = frames.size;
        if (time - start < 500) requestAnimationFrame(sample);
        else audit.complete = true;
      };
      requestAnimationFrame(sample);
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('/');
  await expect(page.locator('canvas').first()).toBeVisible();
  await page.getByRole('link', { name: 'Pie & Donut Blocks', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Pie & Donut Blocks', exact: true }),
  ).toBeVisible();
  await page.waitForFunction(
    () =>
      (window as unknown as { demoAnimationAudit: { complete: boolean } }).demoAnimationAudit
        .complete,
  );
  const audit = await page.evaluate(
    () =>
      (window as unknown as { demoAnimationAudit: { deliveries: number; distinctFrames: number } })
        .demoAnimationAudit,
  );
  expect(audit.deliveries).toBeGreaterThan(0);
  expect(audit.distinctFrames).toBeGreaterThan(3);
  expect(errors).toEqual([]);
});
