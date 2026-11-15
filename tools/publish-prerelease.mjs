import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';
import { inspectRelease } from './local-release-artifact.mjs';
import {
  releaseRequest,
  releaseRepository,
  verifiedRun,
  verifiedCandidate,
} from './prerelease-guards.mjs';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(
  await readFile(join(root, 'projects/chart-library/package.json'), 'utf8'),
);
const request = releaseRequest(process.env, manifest);
const command = (name, args) => {
  const result = spawnSync(name, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${name} failed: ${result.stderr}`);
  return result.stdout;
};
const run = JSON.parse(
  command('gh', ['api', `repos/${releaseRepository}/actions/runs/${request.runId}`]),
);
verifiedRun(run, request);
if (process.argv[2] === 'request') {
  console.log(`Accepted source ${request.commit} and successful CI run ${request.runId}.`);
} else {
  assert.equal(process.argv[2], 'publish');
  assert(process.env.ACTIONS_ID_TOKEN_REQUEST_URL, 'GitHub OIDC endpoint is unavailable');
  assert(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN, 'GitHub OIDC request token is unavailable');
  const directory = await realpath(join(root, 'tmp/publish-artifact/dist/releases'));
  const tarball = await realpath(join(directory, `mantha911-ng-echarts-${request.version}.tgz`));
  const location = relative(directory, tarball);
  assert(
    !isAbsolute(location) && !location.startsWith('..'),
    'Artifact escaped its download directory',
  );
  const record = JSON.parse(await readFile(join(directory, 'release-manifest.json'), 'utf8'));
  const actual = await inspectRelease(tarball);
  verifiedCandidate(record, actual, request);
  const endpoint = `https://registry.npmjs.org/${encodeURIComponent(manifest.name)}`;
  const metadata = async () => {
    const response = await fetch(`${endpoint}?verified=${Date.now()}`, { cache: 'no-store' });
    assert(response.ok, `Registry metadata HTTP ${response.status}`);
    return response.json();
  };
  const before = await metadata();
  assert(!before.versions[request.version], 'Version already exists; never republish it');
  console.log(
    command('npm', [
      'publish',
      tarball,
      '--access',
      'public',
      '--tag',
      'next',
      '--provenance',
      '--ignore-scripts',
      '--registry=https://registry.npmjs.org/',
    ]),
  );
  let registered;
  for (let attempt = 0; attempt < 60; attempt++) {
    const current = await metadata();
    const version = current.versions[request.version];
    if (version) {
      const response = await fetch(version.dist.tarball, { cache: 'no-store' });
      assert(response.ok);
      const hash = createHash('sha256')
        .update(Buffer.from(await response.arrayBuffer()))
        .digest('hex');
      assert.equal(hash, request.sha256, 'Registry bytes differ from the reviewed candidate');
      assert.equal(current['dist-tags'].next, request.version);
      assert.equal(
        current['dist-tags'].latest,
        before['dist-tags'].latest,
        'Unexpected latest tag change',
      );
      registered = {
        verifiedAt: new Date().toISOString(),
        ...request,
        integrity: version.dist.integrity,
        distTags: current['dist-tags'],
        exactRegistryBytes: true,
        humanInterpretation: 'pending',
      };
      break;
    }
    await delay(5000);
  }
  assert(
    registered,
    'Upload submitted once; registry availability remains pending. Do not repeat publication.',
  );
  await mkdir(join(root, 'dist/published-release'), { recursive: true });
  await writeFile(
    join(root, 'dist/published-release/registry-verification.json'),
    JSON.stringify(registered, null, 2) + '\n',
  );
  console.log(
    `Verified registry bytes for ${request.version}; human release gates remain pending.`,
  );
}
