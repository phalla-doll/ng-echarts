import {
  ɵnormalizeCartesianData,
  ɵdefaultCartesianTheme,
  type ɵCartesianContext,
} from '@ng-echarts/chart-library/core';
import { buildComposedOptions } from './composed-options';
import { composedSeriesError, type ComposedSeries } from './composed-types';
const rows = [
  { id: 'a', category: 'Same', visits: 10, trend: -3 },
  { id: 'b', category: 'Same', visits: null, trend: 0 },
  { id: 'c', category: 'Last', visits: 20, trend: null },
];
type Row = (typeof rows)[number];
const series: readonly ComposedSeries<Row>[] = [
  { id: 'visits', key: 'visits', label: '<Visits>', kind: 'bar' },
  { id: 'trend', key: 'trend', label: 'Trend', kind: 'line', smooth: true, showPoints: false },
];
function context(hidden: readonly string[] = []): ɵCartesianContext<Row> {
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', series);
  if (model.kind === 'error') throw new Error(model.message);
  return {
    model,
    hiddenIds: new Set(hidden),
    tokens: ɵdefaultCartesianTheme('dark'),
    animation: false,
    format: (value) => `${value} visits`,
    categoryTicks: ['S', 'S', 'L'],
  };
}
it('aligns bar and line categories, preserves signed/zero/missing values and stable IDs', () => {
  const input = context();
  const options = buildComposedOptions(input, series);
  expect(options.xAxis).toMatchObject({
    type: 'category',
    boundaryGap: true,
    data: ['a', 'b', 'c'],
  });
  expect(options.yAxis).toMatchObject({ type: 'value' });
  expect(options.series).toMatchObject([
    {
      id: 'visits',
      type: 'bar',
      z: 2,
      data: [
        { id: 'a', value: 10 },
        { id: 'b', value: '-' },
        { id: 'c', value: 20 },
      ],
    },
    {
      id: 'trend',
      type: 'line',
      z: 3,
      smooth: true,
      showSymbol: false,
      connectNulls: false,
      data: [
        { id: 'a', value: -3 },
        { id: 'b', value: 0 },
        { id: 'c', value: '-' },
      ],
    },
  ]);
  expect(input.model.series).toBe(series);
  expect(input.model.rows[0]!.points[0]!.row).toBe(rows[0]);
  const tooltip = Array.isArray(options.tooltip) ? options.tooltip[0] : options.tooltip;
  if (typeof tooltip?.formatter !== 'function') throw new Error('Missing formatter');
  const html = tooltip.formatter({ data: { id: 'b' } } as never, '', () => {});
  expect(html).toContain('Same');
  expect(html).toContain('&lt;Visits&gt;');
  expect(html).toContain('Missing');
  expect(html).toContain('0 visits');
});
it('retains category geometry and palette slots as bars/lines are hidden', () => {
  const options = buildComposedOptions(context(['visits']), series);
  expect(options.xAxis).toMatchObject({ boundaryGap: true });
  expect(options.series).toMatchObject([{ id: 'trend', lineStyle: { color: '#f43f5e' } }]);
  expect(buildComposedOptions(context(['visits', 'trend']), series).series).toEqual([]);
});
it('supports descriptor reordering and switching kind without retaining obsolete line settings', () => {
  const swapped: readonly ComposedSeries<Row>[] = [
    { ...series[1]!, kind: 'bar', smooth: undefined, showPoints: undefined },
    { ...series[0]!, kind: 'line', showPoints: true },
  ];
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', swapped);
  if (model.kind === 'error') throw new Error(model.message);
  const options = buildComposedOptions({ ...context(), model }, swapped);
  expect(options.series).toMatchObject([
    {
      id: 'trend',
      type: 'bar',
      data: [
        { id: 'a', value: -3 },
        { id: 'b', value: 0 },
        { id: 'c', value: '-' },
      ],
    },
    { id: 'visits', type: 'line', smooth: false, showSymbol: true },
  ]);
});
it.each([
  [{ kind: 'area' }, 'kind'],
  [{ kind: 'bar', smooth: false }, 'bar series'],
  [{ kind: 'line', smooth: 'yes' }, 'booleans'],
  [{ kind: 'line', showPoints: 0 }, 'booleans'],
])('rejects invalid mixed descriptors: %o', (settings, message) => {
  expect(
    composedSeriesError([
      { id: 'v', key: 'visits', label: 'V', ...settings } as unknown as ComposedSeries<Row>,
    ]),
  ).toContain(message);
});
it('accepts defaults and empty series', () => {
  expect(composedSeriesError([])).toBeNull();
  expect(composedSeriesError(series)).toBeNull();
});
