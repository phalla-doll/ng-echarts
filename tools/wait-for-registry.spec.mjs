import assert from 'node:assert/strict';
import test from 'node:test';
import { registryReady } from './wait-for-registry.mjs';

test('waits for metadata propagation before returning a successful npm download', async () => {
  let calls = 0;
  let pauses = 0;
  const result = await registryReady(
    async () =>
      ++calls < 3
        ? { status: 1, stderr: 'npm error code ETARGET' }
        : { status: 0, stdout: 'verified' },
    async () => {
      pauses++;
    },
  );
  assert.equal(result.stdout, 'verified');
  assert.equal(calls, 3);
  assert.equal(pauses, 2);
});
test('stops after the bounded read-only propagation attempts', async () => {
  let pauses = 0;
  await assert.rejects(
    () =>
      registryReady(
        async () => ({ status: 1, stderr: 'npm error E404' }),
        async () => {
          pauses++;
        },
        2,
      ),
    /never repeat publication/,
  );
  assert.equal(pauses, 1);
});
test('does not retry authentication or other unexpected npm failures', async () => {
  await assert.rejects(
    () =>
      registryReady(
        async () => ({ status: 1, stderr: 'npm error E401' }),
        async () => {
          assert.fail('Unexpected retry');
        },
      ),
    /Unexpected registry failure/,
  );
});
