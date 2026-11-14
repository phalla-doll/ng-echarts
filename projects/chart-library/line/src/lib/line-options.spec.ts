import {
  ɵnormalizeCartesianData,
  ɵdefaultCartesianTheme,
  type ChartSeries,
} from '@mantha911/ng-echarts/core';
import { buildLineOptions } from './line-options';
const rows = [
  { id: 'a', category: 'Same', value: 10, other: -3 },
  { id: 'b', category: 'Same', value: null, other: 0 },
  { id: 'c', category: 'Last', value: 20, other: null },
];
const series: readonly ChartSeries<(typeof rows)[number]>[] = [
  { id: 'v', key: 'value', label: '<Value>' },
  { id: 'o', key: 'other', label: 'Other' },
];
for (const smooth of [false, true])
  for (const showPoints of [false, true]) {
    it(`retains signed/zero/gap data and stable identities with smooth=${smooth}, points=${showPoints}`, () => {
      const model = ɵnormalizeCartesianData(rows, 'id', 'category', series);
      if (model.kind === 'error') throw new Error(model.message);
      const options = buildLineOptions(
        {
          model,
          hiddenIds: new Set(),
          tokens: ɵdefaultCartesianTheme('dark'),
          animation: false,
          format: String,
          categoryTicks: ['S', 'S', 'L'],
        },
        smooth,
        showPoints,
      );
      expect(options.xAxis).toMatchObject({
        type: 'category',
        boundaryGap: false,
        data: ['a', 'b', 'c'],
      });
      expect(options.yAxis).toMatchObject({ type: 'value' });
      if (!Array.isArray(options.series)) throw new Error('Expected series');
      expect(options.series.map((item) => item.data)).toEqual([
        [
          { id: 'a', value: 10 },
          { id: 'b', value: '-' },
          { id: 'c', value: 20 },
        ],
        [
          { id: 'a', value: -3 },
          { id: 'b', value: 0 },
          { id: 'c', value: '-' },
        ],
      ]);
      for (const item of options.series)
        expect(item).toMatchObject({
          type: 'line',
          smooth,
          showSymbol: showPoints,
          connectNulls: false,
        });
      const tip = Array.isArray(options.tooltip) ? options.tooltip[0] : options.tooltip;
      if (typeof tip?.formatter !== 'function') throw new Error('Expected formatter');
      expect(tip.formatter({ data: { id: 'b' } } as never, '', () => {})).toContain('Missing');
      expect(tip.formatter({ data: { id: 'a' } } as never, '', () => {})).toContain(
        '&lt;Value&gt;',
      );
    });
  }
it('preserves original palette slots and the full model when filtering lines', () => {
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', series);
  if (model.kind === 'error') throw new Error(model.message);
  const options = buildLineOptions(
    {
      model,
      hiddenIds: new Set(['v']),
      tokens: ɵdefaultCartesianTheme('light'),
      animation: false,
      format: String,
      categoryTicks: ['A', 'B', 'C'],
    },
    false,
    true,
  );
  expect(options.series).toHaveLength(1);
  expect(options.series).toMatchObject([{ id: 'o', lineStyle: { color: '#be123c' } }]);
  expect(model.rows).toHaveLength(3);
});
