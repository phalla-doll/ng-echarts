import assert from 'node:assert/strict';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

/** Serialize build/check/upload against the same output, and recover dead-owner locks. */
export async function withPagesLock(root, operation, action) {
  await mkdir(join(root, 'dist'), { recursive: true });
  const path = join(root, 'dist/.pages-operation.lock');
  let handle;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      handle = await open(path, 'wx');
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const previous = await readFile(path, 'utf8');
      const owner = JSON.parse(previous);
      assert(Number.isInteger(owner.pid) && owner.pid > 0, `Invalid Pages lock: ${path}`);
      let dead = false;
      try {
        process.kill(owner.pid, 0);
      } catch (failure) {
        if (failure.code === 'ESRCH') dead = true;
        else throw failure;
      }
      assert(dead, `Pages ${owner.operation} is already running (PID ${owner.pid}).`);
      if ((await readFile(path, 'utf8')) === previous) await unlink(path);
    }
  }
  assert(handle, 'Unable to acquire Pages operation lock.');
  const token = JSON.stringify({
    pid: process.pid,
    operation,
    startedAt: new Date().toISOString(),
  });
  try {
    await handle.writeFile(token);
    return await action();
  } finally {
    await handle.close();
    if ((await readFile(path, 'utf8').catch(() => '')) === token) await unlink(path);
  }
}
