import { expect } from '@playwright/test';

/** Visit the examples as a reader would; deferred plots must be exercised before counting all. */
export async function renderGallery(page) {
  await page.locator('app-gallery').waitFor();
  await page.locator('app-bar-block, app-pie-block').first().waitFor();
  const position = await page.evaluate(() => scrollY);
  for (const block of await page.locator('app-bar-block, app-pie-block').all()) {
    await block.locator('.block-surface').scrollIntoViewIfNeeded();
    await expect(block.locator('canvas')).toHaveCount(1);
  }
  await page.evaluate((top) => scrollTo(0, top), position);
}

export async function renderConcepts(page) {
  const position = await page.evaluate(() => scrollY);
  const gallery = (await page.locator('app-chart-possibilities iframe').count())
    ? page.frameLocator('app-chart-possibilities iframe')
    : page;
  await gallery.locator('.card').first().waitFor();
  for (const card of await gallery.locator('.card:visible').all()) {
    await card.scrollIntoViewIfNeeded();
    const count = (await card.getAttribute('id')) === 'sparklines' ? 3 : 1;
    await expect(card.locator('.plot svg, .spark-plot svg')).toHaveCount(count);
  }
  await page.evaluate((top) => scrollTo(0, top), position);
}
