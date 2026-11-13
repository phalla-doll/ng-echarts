import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, realpath, cp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  captureSource,
  artifactFingerprint,
  digest,
  validateReceipt,
  assertRemoteCommit,
  readMarker,
  receiptPath,
  publicReceiptName,
  validateBuild,
} from './pages-provenance.mjs';
import { withPagesLock } from './pages-lock.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
if (process.argv.includes('--preflight')) {
  const source = await captureSource(root);
  assert(
    !source.includesWorkingTree,
    'Publishing requires a clean committed build. Commit source changes first.',
  );
  assertRemoteCommit(
    source,
    run('git', ['ls-remote', '--heads', 'origin', 'main']).split(/\s+/)[0],
  );
  console.log(`Publish preflight passed for ${source.sourceBaseCommit}.`);
} else
  await withPagesLock(root, 'deploy', async () => {
    const artifact = join(root, 'dist/pages/browser');
    const marker = await validateBuild(root, artifact, { clean: true, verified: true });
    const currentMain = () =>
      run('git', ['ls-remote', '--heads', 'origin', 'main']).split(/\s+/)[0];
    assertRemoteCommit(marker, currentMain());
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
      await cp(artifact, directory, { recursive: true });
      assert.deepEqual(await readMarker(directory), marker, 'Copied build marker changed.');
      assert.deepEqual(
        await artifactFingerprint(directory),
        marker.artifact,
        'Copied artifact differs from the checked build.',
      );
      await cp(receiptPath(artifact), join(directory, publicReceiptName));
      validateReceipt(
        JSON.parse(await readFile(join(directory, publicReceiptName), 'utf8')),
        digest(await readFile(join(directory, 'preview-build.json'))),
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
        run(
          'git',
          ['commit', '-m', 'deploy: publish Angular chart demo to GitHub Pages'],
          directory,
        );
      await validateBuild(root, artifact, { clean: true, verified: true });
      assertRemoteCommit(marker, currentMain());
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
      console.log(
        JSON.stringify(
          {
            url: pages.html_url,
            branch: 'gh-pages',
            commit,
            sourceBaseCommit: marker.sourceBaseCommit,
            builtAt: marker.builtAt,
            artifactSha256: marker.artifact.sha256,
          },
          null,
          2,
        ),
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
