import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { renderConcepts, renderGallery } from '../../tools/browser-gallery.mjs';
import { collectBrowserErrors } from './resource-audit';

test('hydrates gallery plots near the viewport and creates full source only on demand', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/');
  const html = await response!.text();
  expect(html).toContain('Horizontal Comparison');
  expect(html).toContain('rel="modulepreload"');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.block-code')).toHaveCount(0);
  await renderGallery(page);
  await expect(page.locator('canvas')).toHaveCount(4);
  const first = page.locator('app-bar-block').first();
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(first.locator('.block-code .hljs-keyword').first()).toBeVisible();
  await first.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.block-code')).toHaveCount(0);
  await expect(first.locator('canvas')).toBeVisible();
  await page.goto('/installation');
  const hints = await page.locator('#demo-preloads').textContent();
  expect(JSON.parse(hints!).routes.installation).toBeUndefined();
  expect(errors).toEqual([]);
});

test('prepares offscreen Angular gallery plots for printing', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('canvas')).toHaveCount(4);
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await renderGallery(page);
  await expect(page.locator('canvas')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('keeps source readable and copyable when its optional highlighter cannot load', async ({
  page,
}) => {
  const stats = JSON.parse(await readFile('dist/playground/browser-stats.json', 'utf8')) as {
    outputs: Record<string, { entryPoint?: string }>;
  };
  const entry = Object.entries(stats.outputs).find(([, output]) =>
    output.entryPoint?.endsWith('/highlight-code.ts'),
  );
  expect(entry).toBeDefined();
  await page.route(`**/${entry![0]}`, (route) => route.abort());
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { performanceCodeCopy: string }).performanceCodeCopy = text;
        },
      },
    }),
  );
  await page.goto('/');
  await expect(page.locator('canvas').first()).toBeVisible();
  const first = page.locator('app-bar-block').first();
  await first.getByRole('button', { name: 'Code', exact: true }).click();
  const code = first.locator('.block-code code');
  await expect(code).toContainText('export class DeviceVisits');
  await expect(code.locator('.hljs-keyword')).toHaveCount(0);
  await first.getByRole('button', { name: 'Copy code', exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { performanceCodeCopy: string }).performanceCodeCopy,
    ),
  ).toBe(await code.textContent());
});

test('loads the concept frame before Angular and recovers the late parent handshake without redrawing', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  const documents: string[] = [];
  page.on('request', (request) => {
    if (
      request.isNavigationRequest() &&
      request.url().includes('/concepts/chart-style-gallery-embedded.html')
    )
      documents.push(request.url());
  });
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/main-*.js', async (route) => {
    await held;
    await route.continue();
  });
  try {
    const response = await page.goto('/chart-possibilities', { waitUntil: 'commit' });
    expect(await response!.text()).toContain('concepts/chart-style-gallery-embedded.html?v=');
    const gallery = page.frameLocator('app-chart-possibilities iframe');
    await expect(gallery.locator('#plot-calendar svg')).toHaveCount(1);
    await expect(gallery.locator('#plot-calendar')).toHaveAttribute('data-render-count', '1');
    const frameOrigin = await gallery.locator('html').evaluate(() => performance.timeOrigin);
    release();
    await expect(page.locator('.loading-note')).toBeHidden();
    await expect
      .poll(() =>
        page
          .locator('iframe')
          .evaluate((el: HTMLIFrameElement) =>
            Math.abs(
              el.getBoundingClientRect().height -
                el.contentDocument!.body.getBoundingClientRect().height,
            ),
          ),
      )
      .toBeLessThanOrEqual(1);
    await expect(gallery.locator('#plot-calendar')).toHaveAttribute('data-render-count', '1');
    expect(documents).toHaveLength(1);
    expect(await gallery.locator('html').evaluate(() => performance.timeOrigin)).toBe(frameOrigin);
    const height = await page.locator('iframe').getAttribute('style');
    await page.evaluate(() =>
      dispatchEvent(
        new MessageEvent('message', {
          origin: location.origin,
          source: window,
          data: { type: 'chart-possibilities:resize', height: 1, ready: true },
        }),
      ),
    );
    expect(await page.locator('iframe').getAttribute('style')).toBe(height);
    expect(errors).toEqual([]);
  } finally {
    release();
  }
});

test('renders concept charts progressively, keeps data available, and retains a self-contained offline edition', async ({
  page,
  context,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/chart-possibilities');
  const gallery = page.frameLocator('app-chart-possibilities iframe');
  await expect(gallery.locator('#plot-calendar svg')).toHaveCount(1);
  await expect(gallery.locator('#plot-treemap svg')).toHaveCount(0);
  await expect(gallery.locator('#plot-calendar')).toHaveAttribute('data-render-count', '1');
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await expect(gallery.locator('#plot-calendar')).toHaveAttribute('data-render-count', '2');
  await gallery.locator('#treemap').scrollIntoViewIfNeeded();
  await expect(gallery.locator('#plot-treemap svg')).toHaveCount(1);
  await gallery.locator('#treemap summary').click();
  await expect(gallery.locator('#treemap table')).toBeVisible();
  await renderConcepts(page);
  await expect(gallery.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  const standalone = await page
    .getByRole('link', { name: 'Open standalone gallery', exact: true })
    .getAttribute('href');
  const response = await page.goto(`/${standalone}`);
  const html = await response!.text();
  expect(html).toContain('data:font/woff2;base64,');
  expect(html).toContain('var echarts=');
  await expect(page.locator('#plot-calendar svg')).toHaveCount(1);
  await context.setOffline(true);
  await renderConcepts(page);
  await expect(page.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  await page.getByRole('button', { name: /theme$/ }).click();
  await page.getByRole('button', { name: 'Find patterns', exact: true }).click();
  await page.getByRole('button', { name: 'Bubble', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bubble', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(errors).toEqual([]);
});

test('keeps deferred concepts usable in cached wrappers without viewport messages', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/legacy-gallery-host', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><style>body{margin:0}iframe{display:block;width:100%;height:12000px;border:0}</style><app-chart-possibilities><iframe title="Legacy concept host" src="/concepts/chart-style-gallery.html?embedded=1&theme=dark"></iframe></app-chart-possibilities>`,
    }),
  );
  await page.goto('/legacy-gallery-host');
  const gallery = page.frameLocator('iframe');
  await expect(gallery.locator('#plot-calendar svg')).toHaveCount(1);
  await expect(gallery.locator('#plot-treemap svg')).toHaveCount(0);
  await renderConcepts(page);
  await expect(gallery.locator('.plot svg,.spark-plot svg')).toHaveCount(14);
  expect(errors).toEqual([]);
});

test('starts embedded concepts when WebKit leaves whole-set font readiness pending', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    if (window === parent) return;
    Object.defineProperty(document.fonts, 'ready', {
      configurable: true,
      get: () => new Promise(() => {}),
    });
  });
  await page.goto('/chart-possibilities', { waitUntil: 'domcontentloaded' });
  const gallery = page.frameLocator('app-chart-possibilities iframe');
  await expect(gallery.locator('#plot-calendar svg')).toHaveCount(1);
  await expect(page.locator('.loading-note')).toBeHidden();
  await renderConcepts(page);
  await expect(gallery.locator('.plot svg, .spark-plot svg')).toHaveCount(14);
  await gallery.getByRole('button', { name: 'Find patterns', exact: true }).click();
  await expect(gallery.locator('.card:visible')).toHaveCount(2);
  expect(errors).toEqual([]);
});
