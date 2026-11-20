import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

const root = join(import.meta.dirname, '..');
const directory = join(root, 'projects/playground/src/app/bar-zoom');
const guide = await readFile(join(root, 'docs/BAR_ZOOM_PROTOTYPE.md'), 'utf8');
const source = guide.match(/^\x60\x60\x60ts\n([\s\S]*?)\n\x60\x60\x60/m)?.[1];
assert(source?.includes("selector: 'app-root'"), 'Bar zoom guide must contain its standalone App');

const header = '// Generated from docs/BAR_ZOOM_PROTOTYPE.md by npm run bar-zoom:source.\n';
const outputs = {
  'bar-zoom-example.ts': source.replace("selector: 'app-root'", "selector: 'app-bar-zoom-example'"),
  'bar-zoom-example-source.ts': `export const barZoomExampleSource = ${JSON.stringify(source)};\n`,
};
for (const [name, contents] of Object.entries(outputs)) {
  const path = join(directory, name);
  const generated = await format(header + contents, {
    ...(await resolveConfig(path)),
    filepath: path,
  });
  if (process.argv.includes('--check')) {
    assert(
      (await readFile(path, 'utf8')) === generated,
      'Run npm run bar-zoom:source to synchronize the live chart and its copyable example.',
    );
  } else {
    await writeFile(path, generated);
  }
}
