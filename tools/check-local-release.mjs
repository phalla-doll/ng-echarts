import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectRelease, releaseRoot } from './local-release-artifact.mjs';
import { format, resolveConfig } from 'prettier';
const directory = join(releaseRoot, 'dist/releases');
const record = JSON.parse(await readFile(join(directory, 'release-manifest.json'), 'utf8'));
const tarball = join(directory, record.artifact.filename);
const actual = await inspectRelease(tarball);
assert.equal(actual.sha256, record.artifact.sha256, 'Candidate was changed after preparation');
const results = [];
delete record.failure;
record.consumerEvidence = {};
const run = async (script) => {
  const child = spawn(process.execPath, [join(releaseRoot, 'tools', script)], {
    cwd: releaseRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      CHART_LIBRARY_TARBALL: tarball,
      CHART_LIBRARY_TARBALL_SHA256: actual.sha256,
    },
  });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  assert.equal(code, 0, `${script} failed`);
  assert.equal(
    (await inspectRelease(tarball)).sha256,
    actual.sha256,
    'Candidate bytes changed during verification',
  );
  results.push({ script, candidateSha256: actual.sha256, passed: true });
};
try {
  for (const script of [
    'check-consumer.mjs',
    'check-documentation-consumer.mjs',
    'check-runtime-consumer.mjs',
  ])
    await run(script);
  for (const name of ['ng15-documentation-consumer.json', 'packed-runtime.json']) {
    const evidence = JSON.parse(
      await readFile(join(releaseRoot, 'docs/experiments/data', name), 'utf8'),
    );
    assert.equal(evidence.artifact.sha256, actual.sha256, `${name} checked a different artifact`);
    assert.equal(evidence.artifact.exactCandidate, true);
    assert(evidence.results.every((result) => result.passed));
    record.consumerEvidence[name] = evidence;
  }
  record.verification = {
    automatedArtifact: 'passed',
    humanInterpretation: 'pending',
    G4: 'pending',
  };
} catch (error) {
  record.failure = error.message;
  record.verification = {
    automatedArtifact: 'failed',
    humanInterpretation: 'pending',
    G4: 'pending',
  };
  throw error;
} finally {
  record.verifiedAt = new Date().toISOString();
  record.results = results;
  const options = { ...(await resolveConfig(join(releaseRoot, '.prettierrc'))), parser: 'json' };
  const json = await format(JSON.stringify(record), options);
  await writeFile(join(directory, 'release-manifest.json'), json);
  await writeFile(
    join(releaseRoot, `docs/experiments/data/local-release-${actual.version}.json`),
    json,
  );
}
console.log(
  `PASS: exact ${actual.filename} metadata/notices, strict declarations, fresh docs and three-engine CSR/SSR consumers. Human release gates remain pending.`,
);
