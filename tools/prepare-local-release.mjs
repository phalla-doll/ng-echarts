import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { command, inspectRelease, releaseRoot } from './local-release-artifact.mjs';
const directory = join(releaseRoot, 'dist/releases');
const expectedNode = (await readFile(join(releaseRoot, '.nvmrc'), 'utf8')).trim().replace(/^v/, '');
const npm = command('npm', ['--version']).trim();
assert.equal(process.versions.node, expectedNode, 'Use the pinned Node version');
assert.equal(npm, '11.19.1', 'Use the pinned npm version');
await mkdir(directory, { recursive: true });
// Pack outside the archive directory, then copy exclusively so an earlier candidate cannot be replaced.
const staging = await mkdtemp(join(tmpdir(), 'ng-echarts-release-'));
let artifact;
try {
  const packed = JSON.parse(
    command('npm', [
      'pack',
      './dist/chart-library',
      '--pack-destination',
      staging,
      '--ignore-scripts',
      '--json',
    ]),
  )[0];
  artifact = await inspectRelease(join(staging, packed.filename));
  await copyFile(
    join(staging, packed.filename),
    join(directory, packed.filename),
    constants.COPYFILE_EXCL,
  );
} finally {
  await rm(staging, { recursive: true, force: true });
}
const record = {
  preparedAt: new Date().toISOString(),
  toolchain: { node: process.version, npm, platform: process.platform, arch: process.arch },
  sourceBaseCommit: command('git', ['rev-parse', 'HEAD']).trim(),
  includesWorkingTree: Boolean(command('git', ['status', '--porcelain']).trim()),
  artifact,
  verification: { automatedArtifact: 'pending', humanInterpretation: 'pending', G4: 'pending' },
};
await writeFile(join(directory, 'release-manifest.json'), JSON.stringify(record, null, 2) + '\n');
await writeFile(
  join(directory, `${artifact.filename}.sha256`),
  `${artifact.sha256}  ${artifact.filename}\n`,
);
console.log(`Prepared ${artifact.filename} (${artifact.bytes} bytes), SHA-256 ${artifact.sha256}`);
