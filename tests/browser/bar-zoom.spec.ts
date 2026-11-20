import { expect, test } from '@playwright/test';
import { verifyBarZoomPage } from '../../tools/bar-zoom-flow.mjs';
import { collectBrowserErrors } from './resource-audit';

test('zooms and pans one chart and copies the verified Angular example', async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await verifyBarZoomPage(page, '/bar-zoom');
  expect(errors).toEqual([]);
});
