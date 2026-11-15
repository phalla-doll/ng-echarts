import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

export async function registryReady(attempt, pause, limit = 60) {
  for (let index = 0; index < limit; index++) {
    const result = await attempt();
    if (result.status === 0) return result;
    assert.match(result.stderr, /\b(?:ETARGET|E404)\b/, 'Unexpected registry failure');
    assert(index + 1 < limit, 'Registry propagation remains pending; never repeat publication');
    await pause();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const manifest = JSON.parse(
    await readFile(join(root, 'projects/chart-library/package.json'), 'utf8'),
  );
  assert.equal(process.env.RELEASE_VERSION, manifest.version);
  assert.equal(manifest.name, '@mantha911/ng-echarts');
  assert.match(process.env.RELEASE_SHA256 ?? '', /^[a-f0-9]{64}$/);
  const directory = await mkdtemp(join(tmpdir(), 'ng-echarts-registry-ready-'));
  try {
    const result = await registryReady(
      () =>
        spawnSync(
          'npm',
          [
            'pack',
            `${manifest.name}@${manifest.version}`,
            '--prefer-online',
            '--registry=https://registry.npmjs.org/',
            '--ignore-scripts',
            '--pack-destination',
            directory,
            '--json',
          ],
          { cwd: root, encoding: 'utf8' },
        ),
      () => delay(5000),
    );
    const packed = JSON.parse(result.stdout)[0];
    const sha256 = createHash('sha256')
      .update(await readFile(join(directory, packed.filename)))
      .digest('hex');
    assert.equal(sha256, process.env.RELEASE_SHA256, 'Registry bytes differ from reviewed archive');
    await mkdir(join(root, 'dist/published-release'), { recursive: true });
    await writeFile(
      join(root, 'dist/published-release/npm-resolution.json'),
      JSON.stringify(
        {
          verifiedAt: new Date().toISOString(),
          version: manifest.version,
          sha256,
          npmPackResolution: 'passed',
          uploads: 0,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(
      'PASS: normal npm resolution returns the reviewed registry archive; no upload attempted.',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
