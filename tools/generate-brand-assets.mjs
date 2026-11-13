import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

// One editable vector supplies the site, browser icons and social preview.
const publicUrl = new URL('../projects/playground/public/', import.meta.url);
const mark = await readFile(new URL('brand/orbit-e.svg', publicUrl), 'utf8');
const paths = mark.slice(mark.indexOf('>') + 1, mark.lastIndexOf('</svg>'));
const blue = '#1439ed';
const font = await readFile(new URL('fonts/inter-latin.woff2', publicUrl));
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#fff"/>
  <g transform="translate(8 8) scale(.875)" fill="${blue}">${paths}</g>
</svg>\n`;
// Touch icons use an opaque square; the device supplies the corner mask.
const touchIcon = favicon.replace('rx="24" ', '');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fafaf9"/>
  <g transform="translate(108 133) scale(1.5)" fill="${blue}">${paths}</g>
  <g fill="#101114" font-family="Inter, sans-serif">
    <text x="338" y="276" font-size="100" font-weight="700" letter-spacing="-5">ng-echarts</text>
    <text x="120" y="404" font-size="40" font-weight="500" letter-spacing="-1.4">Charts for Angular, beautifully composed.</text>
    <text x="120" y="548" font-size="21" fill="#555b66">Bar · Line · Area · Pie · Composed</text>
    <text x="1080" y="548" font-size="21" text-anchor="end" fill="#555b66">Powered by Apache ECharts</text>
  </g>
  <path d="M120 497H1080" stroke="#dcdde0"/>
</svg>\n`;
await writeFile(new URL('brand/orbit-e-light.svg', publicUrl), mark.replaceAll(blue, '#9ba8ff'));
await writeFile(new URL('favicon.svg', publicUrl), favicon);
await writeFile(new URL('brand/og-image.svg', publicUrl), og);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const fontFace = `@font-face { font-family: Inter; src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2'); font-weight: 400 700; }`;
  async function render(svg, width, height) {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<style>${fontFace}html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block;width:100%;height:100%}</style>${svg}`,
    );
    await page.evaluate(() => document.fonts.ready);
    return page.screenshot({ omitBackground: true });
  }
  await writeFile(new URL('og-image.png', publicUrl), await render(og, 1200, 630));
  await writeFile(new URL('apple-touch-icon.png', publicUrl), await render(touchIcon, 180, 180));
  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes) {
    const png = await render(favicon, size, size);
    images.push(png);
    if (size === 32) await writeFile(new URL('favicon-32x32.png', publicUrl), png);
  }
  // ICO directory entries embed lossless PNGs at native tab/desktop sizes.
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((png, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  await writeFile(new URL('favicon.ico', publicUrl), Buffer.concat([header, ...images]));
} finally {
  await browser.close();
}
console.log(`Generated Orbit e icons and 1200 × 630 social image in ${fileURLToPath(publicUrl)}`);
