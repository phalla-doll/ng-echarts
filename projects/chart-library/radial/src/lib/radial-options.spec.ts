import { ɵdefaultCartesianTheme } from '@mantha911/ng-echarts/core';
import { normalizeRadialProgress } from './radial-model';
import { buildRadialOptions } from './radial-options';
it.each([0, 0.68, 1])(
  'draws normalized progress %s with no synthetic interaction or tooltip',
  (ratio) => {
    const model = normalizeRadialProgress(ratio * Number.MAX_VALUE, Number.MAX_VALUE);
    if (model.kind !== 'ready') throw new Error('Invalid fixture');
    const tokens = ɵdefaultCartesianTheme('dark');
    const options = buildRadialOptions(model, tokens, false);
    expect(options.animation).toBe(false);
    expect(options).not.toHaveProperty('tooltip');
    const series = Array.isArray(options.series) ? options.series[0]! : options.series!;
    expect(series).toMatchObject({
      type: 'pie',
      silent: true,
      startAngle: 90,
      clockwise: true,
      emphasis: { disabled: true },
    });
    expect(series.data).toEqual([
      { id: 'completed', value: ratio, itemStyle: { color: tokens.series[0] } },
      { id: 'remaining', value: 1 - ratio, itemStyle: { color: tokens.border } },
    ]);
  },
);
