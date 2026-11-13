import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, realpath, cp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const repo = JSON.parse(run('gh', ['repo', 'view', '--json', 'nameWithOwner,url']));
assert.equal(
  repo.nameWithOwner,
  'phalla-doll/ng-echarts',
  'Deployment target must match the demo repository',
);
const assertSource = (pages) =>
  assert(
    pages.build_type === 'legacy' &&
      pages.source?.branch === 'gh-pages' &&
      pages.source?.path === '/',
    'Existing Pages source differs; refusing to replace another deployment setup',
  );
let pages;
try {
  pages = JSON.parse(run('gh', ['api', `repos/${repo.nameWithOwner}/pages`]));
  assertSource(pages);
} catch (error) {
  if (!String(error.stderr).includes('404')) throw error;
}
const directory = await realpath(await mkdtemp(join(tmpdir(), 'ng-echarts-pages-')));
try {
  const head = run('git', ['rev-parse', 'HEAD']);
  await cp(join(root, 'dist/pages/browser'), directory, { recursive: true });
  await writeFile(
    join(directory, 'preview-build.json'),
    JSON.stringify(
      {
        builtAt: new Date().toISOString(),
        sourceBaseCommit: head,
        includesWorkingTree: Boolean(run('git', ['status', '--porcelain'])),
      },
      null,
      2,
    ) + '\n',
  );
  run('git', ['init', '--initial-branch=gh-pages'], directory);
  run('git', ['remote', 'add', 'origin', repo.url + '.git'], directory);
  const previous = run('git', ['ls-remote', '--heads', 'origin', 'gh-pages'], directory);
  if (previous) {
    run('git', ['fetch', '--depth=1', 'origin', 'gh-pages'], directory);
    run('git', ['reset', '--soft', 'FETCH_HEAD'], directory);
  }
  run('git', ['config', 'user.name', run('git', ['config', 'user.name'])], directory);
  run('git', ['config', 'user.email', run('git', ['config', 'user.email'])], directory);
  run('git', ['add', '--all'], directory);
  if (run('git', ['status', '--porcelain'], directory))
    run('git', ['commit', '-m', 'deploy: publish Angular chart demo to GitHub Pages'], directory);
  run('git', ['push', 'origin', 'HEAD:gh-pages'], directory);
  const commit = run('git', ['rev-parse', 'HEAD'], directory);
  const settings = { build_type: 'legacy', source: { branch: 'gh-pages', path: '/' } };
  if (!pages) {
    try {
      pages = JSON.parse(
        execFileSync(
          'gh',
          ['api', '--method', 'POST', `repos/${repo.nameWithOwner}/pages`, '--input', '-'],
          { cwd: root, input: JSON.stringify(settings), encoding: 'utf8' },
        ),
      );
    } catch (error) {
      // GitHub can auto-enable Pages immediately after the first gh-pages push.
      if (!String(error.stderr).includes('409')) throw error;
      pages = JSON.parse(run('gh', ['api', `repos/${repo.nameWithOwner}/pages`]));
    }
  }
  assertSource(pages);
  console.log(JSON.stringify({ url: pages.html_url, branch: 'gh-pages', commit }, null, 2));
} finally {
  await rm(directory, { recursive: true, force: true });
}
