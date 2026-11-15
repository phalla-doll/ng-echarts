import assert from 'node:assert/strict';
import test from 'node:test';
import { releaseRequest, verifiedRun, verifiedCandidate } from './prerelease-guards.mjs';
const manifest = { name: '@mantha911/ng-echarts', version: '0.1.0-rc.22' };
const env = {
  GITHUB_REPOSITORY: 'phalla-doll/ng-echarts',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_WORKFLOW_REF:
    'phalla-doll/ng-echarts/.github/workflows/publish-prerelease.yml@refs/heads/main',
  GITHUB_SHA: 'a'.repeat(40),
  RELEASE_VERSION: manifest.version,
  RELEASE_SHA256: 'b'.repeat(64),
  RELEASE_CI_RUN: '123',
};
const stages = [
  'check-consumer.mjs',
  'check-documentation-consumer.mjs',
  'check-runtime-consumer.mjs',
].map((script) => ({ script, passed: true, candidateSha256: env.RELEASE_SHA256 }));
const run = {
  id: 123,
  repository: { full_name: env.GITHUB_REPOSITORY },
  path: '.github/workflows/ci.yml',
  event: 'push',
  head_branch: 'main',
  head_sha: env.GITHUB_SHA,
  status: 'completed',
  conclusion: 'success',
};
test('binds a manual release to the reviewed version, hash, main source and complete CI run', () => {
  const request = releaseRequest(env, manifest);
  verifiedRun(run, request);
  verifiedCandidate(
    {
      sourceBaseCommit: env.GITHUB_SHA,
      results: stages,
      artifact: { version: manifest.version, sha256: env.RELEASE_SHA256 },
      verification: { automatedArtifact: 'passed' },
    },
    { version: manifest.version, sha256: env.RELEASE_SHA256 },
    request,
  );
});
for (const [field, value] of [
  ['GITHUB_REPOSITORY', 'someone/else'],
  ['GITHUB_REF', 'refs/heads/topic'],
  ['GITHUB_WORKFLOW_REF', 'phalla-doll/ng-echarts/.github/workflows/other.yml@refs/heads/main'],
  ['RELEASE_VERSION', '1.0.0'],
  ['RELEASE_VERSION', '0.1.0-rc.23'],
  ['RELEASE_SHA256', ''],
  ['RELEASE_SHA256', 'x'.repeat(64)],
  ['RELEASE_CI_RUN', '1;echo bad'],
])
  test(`rejects invalid request ${field}=${value}`, () =>
    assert.throws(() => releaseRequest({ ...env, [field]: value }, manifest)));
for (const change of [
  { head_sha: 'c'.repeat(40) },
  { conclusion: 'failure' },
  { conclusion: 'cancelled' },
  { status: 'in_progress' },
  { event: 'pull_request' },
  { head_branch: 'topic' },
  { path: '.github/workflows/other.yml' },
  { repository: { full_name: 'someone/else' } },
])
  test(`rejects unaccepted CI ${JSON.stringify(change)}`, () =>
    assert.throws(() => verifiedRun({ ...run, ...change }, releaseRequest(env, manifest))));
test('rejects a changed archive and an unverified artifact manifest', () => {
  const request = releaseRequest(env, manifest);
  const candidate = {
    sourceBaseCommit: env.GITHUB_SHA,
    results: stages,
    artifact: { version: manifest.version, sha256: env.RELEASE_SHA256 },
    verification: { automatedArtifact: 'passed' },
  };
  assert.throws(
    () =>
      verifiedCandidate(candidate, { version: manifest.version, sha256: 'c'.repeat(64) }, request),
    /Downloaded archive/,
  );
  assert.throws(
    () =>
      verifiedCandidate(
        { ...candidate, verification: { automatedArtifact: 'failed' } },
        { version: manifest.version, sha256: env.RELEASE_SHA256 },
        request,
      ),
    /Exact candidate/,
  );
});
test('rejects manifest/source drift and missing exact-consumer stages', () => {
  const request = releaseRequest(env, manifest);
  const actual = { version: manifest.version, sha256: env.RELEASE_SHA256 };
  assert.throws(() => verifiedCandidate({ sourceBaseCommit: 'c'.repeat(40) }, actual, request));
  assert.throws(() =>
    verifiedCandidate({ sourceBaseCommit: env.GITHUB_SHA, results: [] }, actual, request),
  );
});
