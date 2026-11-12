import { writeFile } from 'node:fs/promises';

export async function writeCaptureGallery(directory, captures) {
  const pairs = new Map();
  for (const capture of captures) {
    const key = `${capture.variant} · ${capture.theme} · ${capture.width}px · ${capture.tooltip ? 'tooltip' : 'plot'}`;
    const pair = pairs.get(key) ?? [];
    pair.push(capture);
    pairs.set(key, pair);
  }
  const rows = [...pairs]
    .map(
      ([title, pair]) =>
        `<section class="pair" data-theme="${pair[0].theme}" data-width="${pair[0].width}" data-tooltip="${Boolean(pair[0].tooltip)}"><h2>${title}</h2><div>${pair.map((capture) => `<figure><figcaption>${capture.implementation}</figcaption><a href="${capture.filename}"><img src="${capture.filename}" alt="${title}, ${capture.implementation}"></a></figure>`).join('')}</div></section>`,
    )
    .join('\n');
  await writeFile(
    new URL('index.html', directory),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bar comparison evidence</title><style>body{margin:24px;font:14px/1.5 system-ui;background:#eef0f3;color:#18202c}h1{font-size:24px}h2{font-size:16px}section{margin:24px 0;padding:16px;border:1px solid #bcc5d0;background:white}section>div{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}figure{margin:0;min-width:0}figcaption{font-weight:600;margin-bottom:8px}img{display:block;max-width:100%;height:auto}p{max-width:70ch}@media(max-width:700px){section>div{grid-template-columns:1fr}}</style><h1>Bar comparison evidence</h1><p>Pinned upstream examples alongside Angular. Thumbnails fit this gallery; click an image to inspect its original host width. Intentional differences and acceptance status are recorded in R03_VISUAL_REVIEW.md.</p>${rows}</html>\n`,
  );
}
