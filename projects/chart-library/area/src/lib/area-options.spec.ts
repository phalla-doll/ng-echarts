import {
  ɵnormalizeCartesianData,
  ɵdefaultCartesianTheme,
  type ChartSeries,
} from '@mantha911/ng-echarts/core';
import { buildAreaOptions } from './area-options';
const rows = [
  { id: 'a', category: 'Same', value: 10, other: 4 },
  { id: 'b', category: 'Same', value: null, other: 0 },
  { id: 'c', category: 'Last', value: -8, other: -3 },
];
const series: readonly ChartSeries<(typeof rows)[number]>[] = [
  { id: 'v', key: 'value', label: 'Value' },
  { id: 'o', key: 'other', label: 'Other' },
];
function context(hiddenIds = new Set<string>()) {
  const model = ɵnormalizeCartesianData(rows, 'id', 'category', series);
  if (model.kind === 'error') throw new Error(model.message);
  return {
    model,
    hiddenIds,
    tokens: ɵdefaultCartesianTheme('dark'),
    animation: false,
    format: String,
    categoryTicks: ['S', 'S', 'L'],
  };
}
for (const smooth of [false, true])
  for (const showPoints of [false, true])
    for (const stacked of [false, true])
      for (const gradient of [false, true]) {
        it(`preserves independent fills/IDs/raw gaps smooth=${smooth}, points=${showPoints}, stack=${stacked}, gradient=${gradient}`, () => {
          const options = buildAreaOptions(context(), smooth, showPoints, stacked, gradient);
          if (!Array.isArray(options.series)) throw new Error('Expected series');
          expect(options.series.map((item) => item.data)).toEqual([
            [
              { id: 'a', value: 10 },
              { id: 'b', value: '-' },
              { id: 'c', value: -8 },
            ],
            [
              { id: 'a', value: 4 },
              { id: 'b', value: 0 },
              { id: 'c', value: -3 },
            ],
          ]);
          for (const item of options.series)
            expect(item).toMatchObject({
              type: 'line',
              smooth,
              showSymbol: showPoints,
              stack: stacked ? 'total' : undefined,
              stackStrategy: 'samesign',
              connectNulls: false,
              triggerEvent: true,
              areaStyle: { opacity: 1 },
            });
          const colors = options.series.map((item) => item.areaStyle?.color);
          expect(colors[0]).not.toBe(colors[1]);
          if (gradient) {
            expect(colors[0]).toMatchObject({
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16,185,129,0.22)' },
                { offset: 1, color: 'rgba(16,185,129,0.04)' },
              ],
            });
          } else expect(colors).toEqual(['rgba(16,185,129,0.16)', 'rgba(244,63,94,0.16)']);
        });
      }
it('keeps hidden palette slots, multiplies existing alpha, and does not mutate models', () => {
  const ctx = context(new Set(['v']));
  ctx.tokens = { ...ctx.tokens, series: ['#10b981', 'rgba(100,50,20,0.5)'] };
  const options = buildAreaOptions(ctx, false, false, true, true);
  expect(options.series).toHaveLength(1);
  expect(options.series).toMatchObject([
    {
      id: 'o',
      areaStyle: {
        color: {
          colorStops: [
            { offset: 0, color: 'rgba(100,50,20,0.11)' },
            { offset: 1, color: 'rgba(100,50,20,0.02)' },
          ],
        },
      },
    },
  ]);
  expect(ctx.model.rows[1]?.points[0]?.value).toBeNull();
  expect(ctx.model.rows).toHaveLength(3);
});
