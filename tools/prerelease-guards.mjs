import assert from 'node:assert/strict';

export const releaseRepository = 'phalla-doll/ng-echarts';
export function releaseRequest(env, manifest) {
  assert.equal(env.GITHUB_REPOSITORY, releaseRepository, 'Unexpected release repository');
  assert.equal(env.GITHUB_REF, 'refs/heads/main', 'Dispatch releases from main');
  assert.equal(
    env.GITHUB_WORKFLOW_REF,
    `${releaseRepository}/.github/workflows/publish-prerelease.yml@refs/heads/main`,
    'Use the authorized publishing workflow on main',
  );
  assert.match(env.GITHUB_SHA ?? '', /^[a-f0-9]{40}$/, 'Missing source commit');
  assert.match(
    env.RELEASE_VERSION ?? '',
    /^0\.1\.0-rc\.\d+$/,
    'Only experimental prereleases are supported',
  );
  assert.equal(env.RELEASE_VERSION, manifest.version, 'Version must match checked-out source');
  assert.equal(manifest.name, '@mantha911/ng-echarts');
  assert.match(env.RELEASE_SHA256 ?? '', /^[a-f0-9]{64}$/, 'Supply the reviewed artifact SHA-256');
  assert.match(env.RELEASE_CI_RUN ?? '', /^[1-9]\d*$/, 'Supply a completed CI run ID');
  return {
    version: env.RELEASE_VERSION,
    sha256: env.RELEASE_SHA256,
    runId: env.RELEASE_CI_RUN,
    commit: env.GITHUB_SHA,
  };
}

export function verifiedRun(run, request) {
  assert.equal(String(run.id), request.runId);
  assert.equal(run.repository?.full_name, releaseRepository);
  assert.equal(run.path, '.github/workflows/ci.yml', 'Use the full Workspace checks workflow');
  assert.equal(run.event, 'push', 'PR artifacts cannot be published');
  assert.equal(run.head_branch, 'main');
  assert.equal(run.head_sha, request.commit, 'CI must test this exact source commit');
  assert.equal(run.status, 'completed', 'CI is still running');
  assert.equal(run.conclusion, 'success', 'All CI jobs must pass');
}

export function verifiedCandidate(record, actual, request) {
  assert.equal(
    record.sourceBaseCommit,
    request.commit,
    'Candidate manifest must identify this exact source commit',
  );
  assert.deepEqual(
    record.results?.map((result) => result.script),
    ['check-consumer.mjs', 'check-documentation-consumer.mjs', 'check-runtime-consumer.mjs'],
  );
  assert(
    record.results.every(
      (result) => result.passed === true && result.candidateSha256 === request.sha256,
    ),
    'All exact artifact consumer stages must pass',
  );
  assert.equal(actual.version, request.version);
  assert.equal(actual.sha256, request.sha256, 'Downloaded archive differs from the reviewed bytes');
  assert.equal(record.artifact?.sha256, actual.sha256);
  assert.equal(record.artifact?.version, actual.version);
  assert.equal(
    record.verification?.automatedArtifact,
    'passed',
    'Exact candidate checks must pass',
  );
}
