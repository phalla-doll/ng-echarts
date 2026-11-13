import assert from 'node:assert/strict';
import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, 'dist/pages/browser');
const config = JSON.parse(await readFile(join(root, 'angular.json'), 'utf8'));
const base = config.projects.playground.architect.build.configurations.pages.baseHref;
assert(base.startsWith('/') && base.endsWith('/'));
assert((await readFile(join(directory, 'index.html'), 'utf8')).includes(`<base href="${base}">`));
// Font URLs are deliberately external to Angular's CSS bundling and shared by
// SSR measurements. Prefix only the Pages artifact to retain that tested path.
async function prefixFonts(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) await prefixFonts(path);
    else if (/\.(css|html)$/.test(entry.name)) {
      // Prerendering also emits critical CSS and generated preload links in HTML.
      await writeFile(
        path,
        (await readFile(path, 'utf8')).replace(/(["'(])\/fonts\//g, `$1${base}fonts/`),
      );
    }
  }
}
await prefixFonts(directory);
await cp(join(root, 'projects/chart-library/third-party'), join(directory, 'third-party'), {
  recursive: true,
});
await cp(join(root, 'dist/pages/3rdpartylicenses.txt'), join(directory, '3rdpartylicenses.txt'));
await writeFile(join(directory, '.nojekyll'), '');
console.log(`Prepared static Pages artifact at ${directory} with base ${base}`);
