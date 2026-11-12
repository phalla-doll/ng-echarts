import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const revision = '4c2dd7c9bae780703244265c9a4b509d40c055ad';
const archive = join(root, 'upstream.tar.gz');
if (process.env['UPSTREAM_ARCHIVE']) {
  await writeFile(archive, await readFile(process.env['UPSTREAM_ARCHIVE']));
} else {
  const response = await fetch(
    `https://codeload.github.com/legions-developer/evilcharts/tar.gz/${revision}`,
  );
  if (!response.ok) throw new Error(`Upstream download failed: ${response.status}`);
  await writeFile(archive, new Uint8Array(await response.arrayBuffer()));
}
await mkdir(join(root, 'upstream'), { recursive: true });
const extracted = spawnSync(
  'tar',
  ['-xzf', archive, '--strip-components=1', '-C', join(root, 'upstream')],
  { encoding: 'utf8' },
);
if (extracted.status !== 0) throw new Error(extracted.stderr);
const css = await readFile(join(root, 'upstream/src/app/globals.css'), 'utf8');
const tokens = [css.match(/:root\s*\{[^}]+\}/)?.[0], css.match(/\.dark\s*\{[^}]+\}/)?.[0]];
if (tokens.some((block) => !block)) throw new Error('Unable to locate pinned theme tokens');
await writeFile(join(root, 'tokens.css'), `${tokens.join('\n')}\n`);
const sources = [
  'src/registry/examples/echarts/ex-stacked-type-echarts-bar-chart.tsx',
  'src/registry/examples/echarts/ex-horizontal-layout-echarts-bar-chart.tsx',
  'src/registry/examples/echarts/ex-gradient-variant-echarts-bar-chart.tsx',
  'src/registry/examples/echarts/ex-echarts-bar-chart.tsx',
  'src/registry/charts/echarts-bar-chart.tsx',
  'src/registry/examples/echarts/ex-echarts-line-chart.tsx',
  'src/registry/examples/echarts/ex-solid-stroke-echarts-line-chart.tsx',
  'src/registry/examples/echarts/ex-monotoney-curve-type-echarts-line-chart.tsx',
  'src/registry/charts/echarts-line-chart.tsx',
  'src/app/globals.css',
];
const hashes = {};
for (const path of sources)
  hashes[path] = createHash('sha256')
    .update(await readFile(join(root, 'upstream', path)))
    .digest('hex');
await writeFile(
  join(root, 'source-manifest.json'),
  `${JSON.stringify({ revision, hashes }, null, 2)}\n`,
);
console.log(
  `Prepared unmodified upstream source at ${revision}; system font is the explicit harness override.`,
);
