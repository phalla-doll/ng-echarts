import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const out = resolve(process.argv[3] ?? 'dist/premium-refinement');
const base = new URL(process.argv[2] ?? 'http://localhost:4173/');
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
const records = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('response', (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});
try {
  for (const family of [
    'bar',
    'line',
    'area',
    'pie',
    'composed',
    'radar',
    'radial',
    'calendar',
    'sankey',
    'linked',
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(new URL(family === 'bar' ? '' : family, base).href);
    await page.locator('.gallery').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator(family === 'linked' ? '.linked-card' : '.block-card');
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await card.locator('canvas').first().waitFor();
    }
    for (const theme of ['dark', 'light']) {
      if (theme === 'light')
        await page.getByRole('button', { name: 'Use light theme', exact: true }).click();
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.waitForTimeout(350);
        await page.evaluate(() => scrollTo(0, 0));
        if (width !== 320)
          await page.screenshot({ path: `${out}/${family}-${theme}-${width}-page.png` });
        let i = 0;
        for (const card of await cards.all()) {
          await card.scrollIntoViewIfNeeded();
          await page.mouse.move(0, 0);
          await page.waitForTimeout(60);
          const name = `${family}-${theme}-${width}-${i}.png`;
          await card.screenshot({ path: `${out}/${name}` });
          records.push({
            family,
            theme,
            width,
            index: i,
            name,
            ...(await card.evaluate((el) => ({
              title:
                el.closest('.block-section')?.querySelector('h2')?.textContent.trim() ||
                el.getAttribute('aria-label'),
              rect: el.getBoundingClientRect().toJSON(),
              scrollWidth: document.documentElement.scrollWidth,
              canvases: [...el.querySelectorAll('canvas')].map((c) => ({
                width: c.width,
                height: c.height,
                css: c.getBoundingClientRect().toJSON(),
              })),
            }))),
          });
          const record = records.at(-1);
          assert(record.scrollWidth <= width, `${family}/${theme}/${width} overflows the page`);
          assert(record.canvases.length > 0, `${family} has no rendered plot`);
          for (const canvas of record.canvases)
            assert(
              Math.abs(canvas.width - canvas.css.width) < 1,
              `${family} has stale canvas sizing`,
            );
          i++;
        }
        if (family === 'linked' && width !== 320)
          await page
            .locator('app-linked-visits')
            .screenshot({ path: `${out}/linked-${theme}-${width}-pair.png` });
      }
    }
    console.log(family + ' captured ' + (await cards.count()) + ' cards');
  }
  await writeFile(
    `${out}/manifest.json`,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        base: base.href,
        browser: browser.version(),
        node: process.version,
        widths: [1440, 390, 320],
        reducedMotion: 'reduce',
        records,
        errors,
      },
      null,
      2,
    ),
  );
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
}
