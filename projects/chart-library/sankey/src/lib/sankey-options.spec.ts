import { ɵdefaultCartesianTheme } from '@ng-echarts/chart-library/core';
import { normalizeSankey } from './sankey-model';
import { buildSankeyOptions } from './sankey-options';
it('normalizes visual weights without changing raw tooltip values; excludes zero and isolated nodes', () => {
  const model = normalizeSankey(
    [
      { id: 'a', label: '<script>A</script>' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    [
      { id: 'ab', source: 'a', target: 'b', value: 40 },
      { id: 'bc', source: 'b', target: 'c', value: 0 },
    ],
  );
  if (model.kind === 'error') throw Error(model.message);
  const option = buildSankeyOptions({
    ...model,
    tokens: ɵdefaultCartesianTheme('dark'),
    animation: false,
    format: (n) => `<b>${n}</b>`,
  });
  const series = (
    option.series as unknown as {
      data: { id: string }[];
      links: { value: number }[];
      draggable: boolean;
      layoutIterations: number;
    }[]
  )[0]!;
  expect(series.data.map((n) => n.id)).toEqual(['a', 'b']);
  expect(series.links).toEqual([{ id: 'ab', source: 'a', target: 'b', value: 1 }]);
  expect(series.draggable).toBe(false);
  expect(series.layoutIterations).toBe(0);
  const tooltip = (option.tooltip as { formatter: (p: unknown) => string }).formatter;
  expect(tooltip({ dataType: 'edge', data: { id: 'ab' } })).toContain('&lt;b&gt;40&lt;/b&gt;');
  expect(tooltip({ dataType: 'node', data: { id: 'a' } })).toContain('&lt;script&gt;');
  expect(tooltip(null)).toBe('');
  expect(tooltip({ data: { id: 'unknown' } })).toBe('');
});
