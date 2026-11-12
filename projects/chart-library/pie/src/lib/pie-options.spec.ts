import { ɵdefaultCartesianTheme } from '@ng-echarts/chart-library/core';
import { normalizePieData } from './pie-model';
import { buildPieOptions } from './pie-options';
const data = [
  { id: 'a', name: '<img src=x>', value: 10 },
  { id: 'b', name: '<img src=x>', value: 20 },
  { id: 'c', name: 'Zero', value: 0 },
  { id: 'd', name: 'Missing', value: null },
];
const model = normalizePieData(data, 'id', 'name', { id: 'v', key: 'value', label: 'Values' });
if (model.kind === 'error') throw new Error('Invalid fixture');
for (const innerRadius of [0, 0.6, 0.9])
  for (const showLabels of [false, true]) {
    it(`builds a safe independent ${innerRadius}/${showLabels} pie with raw values and retained palette slots`, () => {
      const tokens = ɵdefaultCartesianTheme('dark');
      const options = buildPieOptions({
        model,
        hiddenIds: new Set(['a']),
        tokens,
        animation: false,
        format: (v) => `<${v}>`,
        innerRadius,
        showLabels,
      });
      expect(options).not.toHaveProperty('xAxis');
      expect(options.series).toEqual([
        expect.objectContaining({ startAngle: 0, clockwise: false }),
      ]);
      const series = (
        options.series as unknown as {
          radius: string[];
          data: { id: string; value: number; itemStyle: { color: string } }[];
          stillShowZeroSum: boolean;
          showEmptyCircle: boolean;
        }[]
      )[0]!;
      expect(series.radius).toEqual([
        `${innerRadius * (showLabels ? 60 : 80)}%`,
        `${showLabels ? 60 : 80}%`,
      ]);
      expect(series.data.map((v) => [v.id, v.value])).toEqual([
        ['b', 20],
        ['c', 0],
      ]);
      expect(series.data[0]!.itemStyle.color).toBe(tokens.series[1]);
      expect(series.stillShowZeroSum).toBe(false);
      expect(series.showEmptyCircle).toBe(false);
      const formatter = (options.tooltip as { formatter: (p: unknown) => string }).formatter;
      expect(formatter({ data: { id: 'b' } })).toContain('&lt;img src=x&gt;');
      expect(formatter({ data: { id: 'b' } })).toContain('&lt;20&gt;');
      expect(formatter({ data: { id: 'a' } })).toBe('');
      expect(formatter(null)).toBe('');
    });
  }
