import {
  ɵnormalizeCartesianData,
  ɵdefaultCartesianTheme,
  type ɵCartesianContext,
} from '@mantha911/ng-echarts/core';
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
    { ...series[1]!, kind: 'bar', smooth: undefined, showPoints: undefined, gradient: undefined },
    { ...series[0]!, kind: 'line', stack: undefined, showPoints: true, gradient: undefined },
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
  [{ kind: 'scatter' }, 'kind'],
  [{ kind: 'bar', smooth: false }, 'bar series'],
  [{ kind: 'line', smooth: 'yes' }, 'booleans'],
  [{ kind: 'line', showPoints: 0 }, 'booleans'],
  [{ kind: 'bar', stack: '' }, 'stack names'],
  [{ kind: 'bar', stack: '  ' }, 'stack names'],
  [{ kind: 'bar', stack: ' visits' }, 'stack names'],
  [{ kind: 'bar', stack: null }, 'stack names'],
  [{ kind: 'bar', stack: 1 }, 'stack names'],
  [{ kind: 'line', stack: 'nec-bar:visits' }, 'line series'],
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

it('stacks only named bar groups and caps each visible signed end without changing raw observations', () => {
  const rows = [
    { id: 'positive', category: 'P', first: 10, second: 20, other: 30, line: 60 },
    { id: 'negative', category: 'N', first: -10, second: -20, other: -30, line: -60 },
    { id: 'mixed', category: 'M', first: -10, second: 20, other: 0, line: 10 },
    { id: 'missing', category: 'X', first: 10, second: null, other: 0, line: null },
    { id: 'zero', category: 'Z', first: 0, second: 0, other: null, line: 0 },
  ];
  const descriptors: readonly ComposedSeries<(typeof rows)[number]>[] = [
    { id: 'first', key: 'first', label: 'First', kind: 'bar', stack: 'visits' },
    { id: 'second', key: 'second', label: 'Second', kind: 'bar', stack: 'visits' },
    { id: 'other', key: 'other', label: 'Other', kind: 'bar', stack: 'comparison' },
    { id: 'line', key: 'line', label: 'Line', kind: 'line' },
  ];
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', descriptors);
  if (model.kind === 'error') throw new Error(model.message);
  const input = { ...context(), model };
  const options = buildComposedOptions(input, descriptors);
  expect(options.series).toMatchObject([
    {
      id: 'first',
      stack: 'nec-bar:visits',
      stackStrategy: 'samesign',
      data: [
        { value: 10, itemStyle: { borderRadius: 0 } },
        { value: -10, itemStyle: { borderRadius: 0 } },
        { value: -10, itemStyle: { borderRadius: [0, 0, 2, 2] } },
        { value: 10, itemStyle: { borderRadius: [2, 2, 0, 0] } },
        { value: 0, itemStyle: { borderRadius: 0 } },
      ],
    },
    {
      id: 'second',
      stack: 'nec-bar:visits',
      data: [
        { value: 20, itemStyle: { borderRadius: [2, 2, 0, 0] } },
        { value: -20, itemStyle: { borderRadius: [0, 0, 2, 2] } },
        { value: 20 },
        { value: '-' },
        { value: 0 },
      ],
    },
    {
      id: 'other',
      stack: 'nec-bar:comparison',
      data: expect.arrayContaining([
        expect.objectContaining({ value: 30, itemStyle: { borderRadius: [2, 2, 0, 0] } }),
      ]),
    },
    {
      id: 'line',
      type: 'line',
      data: expect.arrayContaining([expect.objectContaining({ value: 60 })]),
    },
  ]);
  const rendered = options.series as { stack?: string }[];
  expect(rendered[3]?.stack).toBeUndefined();
  const hidden = buildComposedOptions({ ...input, hiddenIds: new Set(['second']) }, descriptors);
  expect((hidden.series as unknown[])[0]).toMatchObject({
    id: 'first',
    data: expect.arrayContaining([
      expect.objectContaining({ value: 10, itemStyle: { borderRadius: [2, 2, 0, 0] } }),
      expect.objectContaining({ value: -10, itemStyle: { borderRadius: [0, 0, 2, 2] } }),
    ]),
  });
  expect(model.rows[0]!.points[1]!.row).toBe(rows[0]);
  expect(model.rows[0]!.points[1]!.value).toBe(20);
  const grouped = descriptors.map((item) =>
    item.kind === 'bar' ? { ...item, stack: undefined } : item,
  );
  const unstacked = buildComposedOptions(input, grouped);
  expect((unstacked.series as { stack?: string }[]).every((item) => item.stack === undefined)).toBe(
    true,
  );
  expect((unstacked.series as unknown[])[0]).toMatchObject({
    data: expect.arrayContaining([expect.objectContaining({ id: 'positive', value: 10 })]),
    itemStyle: { borderRadius: 2 },
  });
});

for (const gradient of [false, true])
  for (const smooth of [false, true])
    for (const showPoints of [false, true])
      for (const stacked of [false, true]) {
        it(`builds independent raw composed areas gradient=${gradient} smooth=${smooth} points=${showPoints} stack=${stacked}`, () => {
          const descriptors: readonly ComposedSeries<Row>[] = [
            {
              id: 'visits',
              key: 'visits',
              label: 'Visits',
              kind: 'area',
              gradient,
              smooth,
              showPoints,
              ...(stacked ? { stack: 'shared' } : {}),
            },
            { id: 'trend', key: 'trend', label: 'Trend', kind: 'line' },
          ];
          const model = ɵnormalizeCartesianData(rows, 'id', 'category', descriptors);
          if (model.kind === 'error') throw new Error(model.message);
          const options = buildComposedOptions({ ...context(), model }, descriptors);
          const rendered = options.series as {
            stack?: string;
            areaStyle?: unknown;
            data?: unknown[];
          }[];
          expect(rendered[0]).toMatchObject({
            id: 'visits',
            type: 'line',
            z: 1,
            smooth,
            showSymbol: showPoints,
            stack: stacked ? 'nec-area:shared' : undefined,
            connectNulls: false,
            triggerEvent: true,
            areaStyle: { opacity: 1 },
            data: [
              { id: 'a', value: 10 },
              { id: 'b', value: '-' },
              { id: 'c', value: 20 },
            ],
          });
          expect(rendered[0]?.areaStyle).toMatchObject({
            color: gradient
              ? {
                  type: 'linear',
                  colorStops: [
                    { offset: 0, color: 'rgba(16,185,129,0.22)' },
                    { offset: 1, color: 'rgba(16,185,129,0.04)' },
                  ],
                }
              : 'rgba(16,185,129,0.16)',
          });
          expect(rendered[1]?.areaStyle).toBeUndefined();
          expect(rendered[1]?.stack).toBeUndefined();
          expect(composedSeriesError(descriptors)).toBeNull();
          const switched: readonly ComposedSeries<Row>[] = [
            { id: 'visits', key: 'visits', label: 'Visits', kind: 'line' },
            descriptors[1]!,
          ];
          const replacement = buildComposedOptions({ ...context(), model }, switched);
          expect(
            (replacement.series as { areaStyle?: unknown; stack?: unknown }[])[0]?.areaStyle,
          ).toBeUndefined();
          expect((replacement.series as { stack?: unknown }[])[0]?.stack).toBeUndefined();
        });
      }
it('separates identically named area and bar stacks and excludes hidden areas without changing raw signs', () => {
  const descriptors: readonly ComposedSeries<Row>[] = [
    { id: 'visits', key: 'visits', label: 'Visits', kind: 'area', stack: 'same' },
    { id: 'trend', key: 'trend', label: 'Trend', kind: 'bar', stack: 'same' },
  ];
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', descriptors);
  if (model.kind === 'error') throw new Error(model.message);
  const options = buildComposedOptions({ ...context(), model }, descriptors);
  expect(options.series).toMatchObject([
    { stack: 'nec-area:same', data: [{ value: 10 }, { value: '-' }, { value: 20 }] },
    { stack: 'nec-bar:same', data: [{ value: -3 }, { value: 0 }, { value: '-' }] },
  ]);
  const hidden = buildComposedOptions(
    { ...context(), model, hiddenIds: new Set(['visits']) },
    descriptors,
  );
  expect(hidden.series).toHaveLength(1);
  expect(hidden.series).toMatchObject([{ id: 'trend' }]);
});
it.each([
  { kind: 'area', gradient: 'yes' },
  { kind: 'area', smooth: 1 },
  { kind: 'area', stack: ' ' },
  { kind: 'line', gradient: false },
  { kind: 'bar', gradient: true },
])('rejects invalid area/fill configuration %o', (settings) => {
  expect(
    composedSeriesError([
      { id: 'v', key: 'visits', label: 'V', ...settings } as unknown as ComposedSeries<Row>,
    ]),
  ).not.toBeNull();
});
