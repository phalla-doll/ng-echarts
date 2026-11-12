import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const server = spawn(process.execPath, ['dist/playground/server/server.mjs'], {
  env: { ...process.env, PORT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
server.stdout.on('data', (data) => {
  output += data;
});
server.stderr.on('data', (data) => {
  output += data;
});

try {
  const deadline = Date.now() + 30_000;
  let port;
  while (!(port = output.match(/http:\/\/localhost:(\d+)/)?.[1])) {
    assert(server.exitCode === null, `SSR server exited early:\n${output}`);
    assert(Date.now() < deadline, `SSR server failed to start:\n${output}`);
    await delay(100);
  }
  const response = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(15_000) });
  const html = await response.text();
  assert.equal(response.status, 200, `SSR response failed:\n${html}\n${output}`);
  assert(html.includes('ng-echarts playground'), 'Page heading must render on the server');
  assert(html.includes('Device visits by month'), 'Library component must render on the server');
  assert(html.includes('Show data table'), 'Accessible table control must render on the server');
  assert(!html.includes('<canvas'), 'The renderer must remain browser-only');
  assert(/ngh="/.test(html), 'Server must emit Angular hydration metadata');
  console.log(
    'PASS: production SSR returns library markup and hydration metadata. Browser hydration remains a separate check.',
  );
} finally {
  if (server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
}
