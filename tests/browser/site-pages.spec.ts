import { expect, test } from '@playwright/test';
import { collectBrowserErrors } from './resource-audit';

declare global {
  interface Window {
    documentationClipboard: string;
  }
}

test('renders honest component availability and navigates copyable setup documentation', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() => {
    window.documentationClipboard = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.documentationClipboard = text;
        },
      },
    });
  });
  const response = await page.goto('/components');
  const html = await response!.text();
  expect(html).toContain('Components');
  expect(html).toContain('Planned');
  expect(html).not.toContain('<canvas');
  await expect(page.locator('.component-card')).toHaveCount(4);
  await expect(page.locator('a.component-card')).toHaveCount(3);
  await expect(page.locator('.component-card.planned')).toHaveCount(1);
  await expect(
    page.locator('.component-card.planned a, .component-card.planned button'),
  ).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Playground pages' });
  await nav.getByRole('link', { name: 'Get Started', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Get Started', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy TypeScript example', exact: true }).click();
  expect(await page.evaluate(() => window.documentationClipboard)).toContain('export class Visits');
  await page.getByRole('button', { name: 'Copy Page', exact: true }).click();
  expect(await page.evaluate(() => window.documentationClipboard)).toContain('# Get Started');
  await nav.getByRole('link', { name: 'Installation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Installation', exact: true })).toBeVisible();
  await expect(page.locator('article')).toContainText('The package has not been published');
  await page.getByRole('button', { name: 'Copy Terminal example', exact: true }).first().click();
  expect(await page.evaluate(() => window.documentationClipboard)).toContain(
    'npm start -- --port 4310',
  );
  await nav.getByRole('link', { name: 'Components', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Components', exact: true })).toBeVisible();
  await page.locator('a.component-card').filter({ hasText: 'Bar Chart' }).click();
  await expect(page.getByRole('heading', { name: 'Bar Blocks', exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('preserves site theme across docs and tools and applies it when deferred charts hydrate', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto('/components');
  await expect(page.locator('.site-shell')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  const nav = page.getByRole('navigation', { name: 'Playground pages' });
  for (const name of ['Installation', 'Get Started', 'Components', 'Bar Blocks', 'Playground']) {
    await nav.getByRole('link', { name, exact: true }).click();
    await expect(page.locator('.site-shell')).not.toHaveClass(/\bdark\b/);
    await expect(page.getByRole('button', { name: 'Use dark theme', exact: true })).toBeVisible();
  }
  await expect(page.locator('nec-bar-chart canvas')).toHaveCount(1);
  await expect(page.locator('nec-bar-chart .chart-frame')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click();
  await expect(page.locator('.legend .swatch').first()).toHaveCSS(
    'background-color',
    'rgb(16, 185, 129)',
  );
  for (const name of [
    'Input updates',
    'Value formatting',
    'Lifecycle validation',
    'Navigate away',
  ]) {
    await nav.getByRole('link', { name, exact: true }).click();
    await expect(page.locator('.site-shell')).toHaveClass(/\bdark\b/);
    await expect(page.locator('.site-shell')).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  }
  // A fresh document has the deterministic dark initial theme; change it before hydrating a block.
  await page.goto('/validation');
  await expect(page.getByTestId('primary').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('deferred').locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
  await page
    .getByTestId('deferred')
    .getByRole('button', { name: 'Show data table', exact: true })
    .click();
  await expect(page.getByTestId('deferred').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('deferred').locator('table')).toBeVisible();
  await expect(page.getByTestId('deferred').locator('.chart-frame')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  expect(errors).toEqual([]);
});

test('keeps every documentation and tool page usable at narrow widths in both themes', async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard disabled for test');
        },
      },
    }),
  );
  for (const route of [
    '/get-started',
    '/installation',
    '/components',
    '/playground',
    '/formatting',
    '/updates',
    '/validation',
    '/retention',
    '/away',
    '/benchmark',
    '/comparison',
  ]) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    for (const light of [false, true]) {
      if (light) await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
          .toBeLessThanOrEqual(width);
      }
    }
  }
  await page.goto('/get-started');
  await page.getByRole('button', { name: 'Copy TypeScript example', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Clipboard access is unavailable' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#page-content')).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const nav = page.getByRole('navigation', { name: 'Playground pages' });
  await nav.getByRole('link', { name: 'Installation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Installation', exact: true })).toBeVisible();
  await expect(nav).toBeHidden();
  expect(errors).toEqual([]);
});
