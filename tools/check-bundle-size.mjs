import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { transformAsync } from '@babel/core';
import angularLinker from '@angular/compiler-cli/linker/babel';
import { mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = join(import.meta.dirname, '..');
const directory = join(root, 'dist/linked-package-budget');
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
await build({
  entryPoints: [join(root, 'dist/chart-library/fesm2022/ng-echarts-chart-library.mjs')],
  outdir: directory,
  bundle: true,
  minify: true,
  splitting: true,
  format: 'esm',
  target: 'es2022',
  external: ['@angular/*', 'rxjs', 'rxjs/*'],
  legalComments: 'eof',
  plugins: [
    {
      name: 'angular-package-linker',
      setup(builder) {
        builder.onLoad({ filter: /chart-library\/fesm2022\/.*\.mjs$/ }, async ({ path }) => ({
          contents: (
            await transformAsync(await readFile(path, 'utf8'), {
              filename: path,
              configFile: false,
              babelrc: false,
              plugins: [angularLinker],
            })
          ).code,
          loader: 'js',
        }));
      },
    },
  ],
});
const files = [];
for (const name of (await readdir(directory)).filter((name) => name.endsWith('.js'))) {
  const bytes = await readFile(join(directory, name));
  files.push({
    name,
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes).length,
  });
}
const total = files.reduce(
  (sum, file) => ({
    raw: sum.raw + file.raw,
    gzip: sum.gzip + file.gzip,
    brotli: sum.brotli + file.brotli,
  }),
  { raw: 0, gzip: 0, brotli: 0 },
);
const budget = { gzip: 200_000, brotli: 175_000 };
const evidence = {
  recordedAt: new Date().toISOString(),
  method:
    'Link the production Angular package, bundle/minify/split its public entry; Angular and RxJS peers external; includes bar adapter/controls and modular Canvas engine; sums independently compressed JavaScript chunks',
  files,
  total,
  budget,
  passed: total.gzip <= budget.gzip && total.brotli <= budget.brotli,
};
await writeFile(
  join(root, 'docs/experiments/data/bar-bundle-size.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
);
assert(evidence.passed, `Bar package exceeded its measured budget: ${JSON.stringify(evidence)}`);
console.log(
  `PASS: linked bar package + Canvas ${total.gzip} gzip bytes / ${total.brotli} Brotli bytes; budgets ${budget.gzip}/${budget.brotli}.`,
);
