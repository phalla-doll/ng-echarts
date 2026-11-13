import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  return result.stdout;
};

/** All release consumers install a byte-for-byte copy of the supplied candidate, never a repack. */
export async function consumerArtifact(root, destination) {
  const candidate = process.env['CHART_LIBRARY_TARBALL'];
  if (!candidate) {
    const packed = JSON.parse(
      run(
        'npm',
        ['pack', join(root, 'dist/chart-library'), '--pack-destination', destination, '--json'],
        root,
      ),
    )[0];
    const bytes = await readFile(join(destination, packed.filename));
    return {
      ...packed,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      exactCandidate: false,
    };
  }
  const path = resolve(candidate);
  const bytes = await readFile(path);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (process.env['CHART_LIBRARY_TARBALL_SHA256'])
    assert.equal(sha256, process.env['CHART_LIBRARY_TARBALL_SHA256'], 'Candidate checksum changed');
  const entries = run('tar', ['-tzf', path], root).trim().split('\n');
  assert(
    entries.every((name) => name.startsWith('package/') && !name.split('/').includes('..')),
    'Invalid artifact paths',
  );
  const manifest = JSON.parse(run('tar', ['-xOzf', path, 'package/package.json'], root));
  const filename = basename(path);
  const installedCopy = join(destination, filename);
  if (resolve(installedCopy) !== path) await copyFile(path, installedCopy);
  assert.equal(
    createHash('sha256')
      .update(await readFile(installedCopy))
      .digest('hex'),
    sha256,
  );
  return {
    name: manifest.name,
    version: manifest.version,
    filename,
    files: entries
      .filter((name) => !name.endsWith('/'))
      .map((name) => ({ path: name.slice('package/'.length) })),
    sha256,
    exactCandidate: true,
  };
}
