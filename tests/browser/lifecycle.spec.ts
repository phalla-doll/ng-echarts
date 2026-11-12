import { expect, test } from '@playwright/test';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

test('exposes named keyboard controls and readable values in the accessibility tree', async ({
  page,
  browserName,
}, testInfo) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/validation');
  const primary = page.getByTestId('primary');
  await expect(primary.locator('canvas')).toHaveCount(1);
  await primary.getByRole('button', { name: 'Show data table', exact: true }).click();
  const action = primary.getByRole('button', {
    name: 'Select Desktop for January: 342',
    exact: true,
  });
  await action.focus();
  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(nextControl);
  const mobileAction = primary.getByRole('button', {
    name: 'Select Mobile for January: 184',
    exact: true,
  });
  await expect(mobileAction).toBeFocused();
  await expect(mobileAction).toHaveCSS('outline-style', 'solid');
  const snapshot = await primary.ariaSnapshot();
  expect(snapshot).toContain('heading "Primary visits"');
  expect(snapshot).toContain('button "Desktop Visible" [pressed]');
  expect(snapshot).toContain('button "Select Desktop for January: 342"');
  const path = testInfo.outputPath('accessibility.yml');
  await writeFile(path, snapshot);
  await testInfo.attach('accessibility.yml', { path, contentType: 'text/yaml' });
  expect(errors).toEqual([]);
});

test('hydrates multiple, loading, hidden, and deferred charts and cleans up on navigation', async ({
  page,
  request,
}) => {
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  const response = await request.get('/validation');
  const markup = await response.text();
  expect(response.status()).toBe(200);
  expect(markup).toContain('Deferred visits');
  expect(markup).toContain('Loading chart');
  expect(markup).not.toContain('<canvas');
  await page.goto('/validation');
  await expect(page.getByTestId('primary').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('hidden').locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('loading').locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('deferred').locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reveal hidden chart', exact: true }).click();
  await expect(page.getByTestId('hidden').locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Finish loading', exact: true }).click();
  await expect(page.getByTestId('loading').locator('canvas')).toHaveCount(1);
  // This button is present in dehydrated SSR markup. Its event triggers incremental hydration.
  await page
    .getByTestId('deferred')
    .getByRole('button', { name: 'Show data table', exact: true })
    .click();
  await expect(page.getByTestId('deferred').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('deferred').locator('table')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(4);
  await page.getByRole('link', { name: 'Navigate away', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Navigation cleanup fixture' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.chartAudit))
    .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
  await page.getByRole('link', { name: 'Lifecycle validation', exact: true }).click();
  await expect(page.getByTestId('primary').locator('canvas')).toHaveCount(1);
  // Client navigation creates the defer block later; it has not been activated on this route yet.
  expect(errors).toEqual([]);
});

test('removes series, retains legend focus, refreshes explicit palette tokens, and changes motion preference', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/validation');
  const primary = page.getByTestId('primary');
  await expect(primary.locator('canvas')).toHaveCount(1);
  const desktop = primary.locator('.legend button').filter({ hasText: 'Desktop' });
  await desktop.focus();
  await page.keyboard.press('Space');
  await expect(desktop).toBeFocused();
  await page.getByRole('button', { name: 'Mobile series', exact: true }).click();
  await expect(primary.locator('.legend button')).toHaveCount(1);
  await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Mobile series', exact: true }).click();
  await expect(primary.locator('.legend button').filter({ hasText: 'Mobile' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Refresh palette', exact: true }).click();
  await expect(primary.locator('.swatch').first()).toHaveCSS(
    'background-color',
    'rgb(37, 99, 235)',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(primary.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('releases native resources across repeated real chart mount/destroy cycles', async ({
  page,
  browserName,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  await page.goto('/playground');
  await expect(page.locator('canvas')).toHaveCount(1);
  const cycles = browserName === 'chromium' ? 100 : 10;
  const samples: unknown[] = [];
  const client = browserName === 'chromium' ? await page.context().newCDPSession(page) : null;
  for (let index = 0; index < cycles; index++) {
    await page.getByRole('button', { name: 'Show chart', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    if (client && [0, 9, 49, 99].includes(index)) {
      await client.send('HeapProfiler.collectGarbage');
      samples.push({
        cycle: index + 1,
        ...(await client.send('Memory.getDOMCounters')),
        ...(await client.send('Runtime.getHeapUsage')),
      });
    }
    await page.getByRole('button', { name: 'Show chart', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(1);
  }
  const evidence = testInfo.outputPath('resource-audit.json');
  await writeFile(evidence, JSON.stringify({ browserName, cycles, samples }, null, 2));
  await testInfo.attach('resource-audit.json', { path: evidence, contentType: 'application/json' });
  expect(errors).toEqual([]);
});

async function rendererAsset(): Promise<string> {
  const directory = 'dist/playground/browser';
  const files = await readdir(directory);
  const candidates: string[] = [];
  for (const file of files) {
    if (
      file.startsWith('chunk-') &&
      file.endsWith('.js') &&
      /export\s*\{[^}]*\bcreateBarRenderer\b/.test(await readFile(join(directory, file), 'utf8'))
    )
      candidates.push(file);
  }
  expect(candidates, 'Expected one lazy module exporting the Canvas renderer factory').toHaveLength(
    1,
  );
  return candidates[0]!;
}

test('recovers from a failed browser renderer import without exposing the exception', async ({
  page,
}) => {
  const asset = await rendererAsset();
  const errors = collectBrowserErrors(page, asset);
  await page.route(`**/${asset}`, (route) => route.abort('failed'));
  await page.goto('/playground');
  await expect(page.getByRole('alert')).toHaveText(
    'Unable to render chart. Try again or update the data.',
  );
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.unroute(`**/${asset}`);
  await page.getByRole('button', { name: 'Retry chart', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('ignores a renderer import that finishes after its chart is destroyed', async ({ page }) => {
  const asset = await rendererAsset();
  const errors = collectBrowserErrors(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested!: () => void;
  const started = new Promise<void>((resolve) => {
    requested = resolve;
  });
  await page.route(`**/${asset}`, async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  // The intentionally held script can delay Firefox's load event until it is released.
  await page.goto('/playground', { waitUntil: 'domcontentloaded' });
  await started;
  await page.getByRole('button', { name: 'Update values', exact: true }).click();
  await page.getByRole('button', { name: 'Show chart', exact: true }).click();
  const finished = page.waitForResponse((response) => response.url().endsWith(asset));
  release();
  await finished;
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show chart', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show data table', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Select Desktop for January: 442', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
