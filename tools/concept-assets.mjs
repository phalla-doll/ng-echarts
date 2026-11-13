import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
function engineBlock(source) {
  const start = source.indexOf('<!-- concept-engine:start -->');
  const marker = '<!-- concept-engine:end -->';
  const end = source.indexOf(marker, start);
  assert(start >= 0 && end > start, 'Missing generated concept engine markers.');
  const block = source.slice(start, end + marker.length);
  const scriptStart = block.indexOf('<script>');
  const scriptEnd = block.lastIndexOf('</script>');
  assert(scriptStart >= 0 && scriptEnd > scriptStart, 'Missing generated concept engine script.');
  return { block, engine: block.slice(scriptStart + '<script>'.length, scriptEnd).trim() };
}
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');

/** Derive the web edition from the same document; the standalone stays self-contained. */
export function conceptAssets(source) {
  const { block, engine } = engineBlock(source);
  assert(engine, 'Missing generated concept engine. Run npm run concepts:generate.');
  const engineName = `chart-gallery-engine-${sha256(engine).slice(0, 16)}.js`;
  const embedded = source
    .replace(block, () => `<script src="${engineName}"></script>`)
    .replace(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/u, '../fonts/inter-latin.woff2');
  assert(!embedded.includes('data:font/'), 'Embedded gallery must reuse the site font.');
  return {
    engineName,
    files: {
      'chart-style-gallery.html': source,
      'chart-style-gallery-embedded.html': embedded,
      [engineName]: engine,
    },
  };
}

export async function checkConceptEngine(generate = false) {
  const path = join(root, 'docs/experiments/chart-style-gallery.html');
  let source = await readFile(path, 'utf8');
  assert(
    source.includes('const embedded = document.documentElement.dataset.embedded'),
    'Missing gallery application script.',
  );
  const notices = await Promise.all(
    ['echarts-LICENSE.txt', 'echarts-NOTICE.txt', 'zrender-LICENSE.txt'].map((name) =>
      readFile(join(root, 'projects/chart-library/third-party', name), 'utf8'),
    ),
  );
  const result = await build({
    entryPoints: [join(root, 'tools/concept-engine.ts')],
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'echarts',
    target: 'es2022',
    legalComments: 'inline',
    banner: { js: `/*\n${notices.join('\n')}\n*/` },
    write: false,
  });
  const engine = result.outputFiles[0].text.trim();
  if (generate) {
    const { block } = engineBlock(source);
    source = source.replace(
      block,
      () =>
        `<!-- concept-engine:start -->\n    <!-- prettier-ignore -->\n    <script>\n${engine}\n    </script>\n    <!-- concept-engine:end -->`,
    );
    await writeFile(path, source);
    const wrapper = join(root, 'projects/playground/src/app/chart-possibilities.ts');
    await writeFile(
      wrapper,
      (await readFile(wrapper, 'utf8')).replace(
        /concepts\/chart-style-gallery\.html\?v=[a-f0-9]{12}/u,
        `concepts/chart-style-gallery.html?v=${sha256(source).slice(0, 12)}`,
      ),
    );
  } else {
    assert.equal(
      engineBlock(source).engine,
      engine,
      'Concept engine is stale. Run npm run concepts:generate and review the document.',
    );
  }
  const wrapper = await readFile(
    join(root, 'projects/playground/src/app/chart-possibilities.ts'),
    'utf8',
  );
  assert(
    wrapper.includes(`concepts/chart-style-gallery.html?v=${sha256(source).slice(0, 12)}`),
    'Gallery revision is stale. Run npm run concepts:generate.',
  );
  return conceptAssets(source);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const assets = await checkConceptEngine(process.argv.includes('--generate'));
  if (process.argv.includes('--prepare') || process.argv.includes('--generate')) {
    const directory = join(root, 'tmp/concept-assets');
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
    for (const [name, source] of Object.entries(assets.files)) {
      if (name !== 'chart-style-gallery.html') await writeFile(join(directory, name), source);
    }
  }
  console.log(`Verified concept engine and ${Object.keys(assets.files).length} gallery assets.`);
}
