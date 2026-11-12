import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { collectBrowserErrors, installResourceAudit } from './resource-audit';

test('collects obsolete row identities and keeps post-warm-up DOM ownership stable', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'Heap snapshots use Chromium CDP; native cleanup runs in all engines.',
  );
  test.setTimeout(120_000);
  const errors = collectBrowserErrors(page);
  await installResourceAudit(page);
  await page.goto('/retention');
  const client = await page.context().newCDPSession(page);
  await client.send('HeapProfiler.enable');
  const samples = [];
  for (let cycle = 1; cycle <= 100; cycle++) {
    await page
      .getByRole('button', { name: 'Toggle retained chart', exact: true })
      .evaluate((element: HTMLButtonElement) => element.click());
    await expect(page.locator('canvas')).toHaveCount(1);
    await page
      .getByRole('button', { name: 'Toggle retained chart', exact: true })
      .evaluate((element: HTMLButtonElement) => element.click());
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.chartAudit))
      .toEqual({ resizeObservers: 0, observedTargets: 0, motionListeners: 0, frames: 0 });
    if (![10, 100].includes(cycle)) continue;
    await client.send('HeapProfiler.collectGarbage');
    let snapshot = '';
    const append = ({ chunk }: { chunk: string }) => {
      snapshot += chunk;
    };
    client.on('HeapProfiler.addHeapSnapshotChunk', append);
    await client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false });
    client.off('HeapProfiler.addHeapSnapshotChunk', append);
    const heap = JSON.parse(snapshot);
    const fields: string[] = heap.snapshot.meta.node_fields;
    const types: string[] = heap.snapshot.meta.node_types[0];
    const retained = new Set<string>();
    const objects: Record<string, { count: number; bytes: number }> = {};
    const categories: Record<string, { count: number; bytes: number }> = {};
    const nameOffset = fields.indexOf('name'),
      typeOffset = fields.indexOf('type'),
      sizeOffset = fields.indexOf('self_size');
    for (let offset = 0; offset < heap.nodes.length; offset += fields.length) {
      const name: string = heap.strings[heap.nodes[offset + nameOffset]];
      const kind = types[heap.nodes[offset + typeOffset]]!;
      const category = (categories[kind] ??= { count: 0, bytes: 0 });
      category.count++;
      category.bytes += heap.nodes[offset + sizeOffset];
      if (/^ng-echarts-retention-\d+$/.test(name)) retained.add(name);
      if (types[heap.nodes[offset + typeOffset]] === 'object') {
        const value = (objects[name] ??= { count: 0, bytes: 0 });
        value.count++;
        value.bytes += heap.nodes[offset + sizeOffset];
      }
    }
    // Only the parent fixture's latest immutable input is expected to survive destruction.
    expect([...retained].sort()).toEqual([`ng-echarts-retention-${cycle}`]);
    samples.push({
      cycle,
      retainedIdentities: [...retained],
      dom: await client.send('Memory.getDOMCounters'),
      heap: await client.send('Runtime.getHeapUsage'),
      objects,
      categories,
    });
  }
  expect(samples[1]!.dom).toEqual(samples[0]!.dom);
  const before = samples[0]!.objects,
    after = samples[1]!.objects;
  const growth = Object.entries(after)
    .map(([name, value]) => ({
      name,
      count: value.count - (before[name]?.count ?? 0),
      bytes: value.bytes - (before[name]?.bytes ?? 0),
    }))
    .filter((value) => value.count > 0)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20);
  const path = testInfo.outputPath('retention-review.json');
  await writeFile(
    path,
    JSON.stringify(
      {
        browser: browserName,
        cycles: 100,
        method: 'CDP post-GC heap snapshot; unique flattened row IDs, constant display label',
        samples: samples.map(({ objects, ...sample }) => sample),
        topObjectGrowth: growth,
      },
      null,
      2,
    ),
  );
  await testInfo.attach('retention-review.json', { path, contentType: 'application/json' });
  expect(errors).toEqual([]);
});
