import { ɵnormalizeCartesianData, ɵdefaultCartesianTheme } from '@mantha911/ng-echarts/core';
import { composedAxesError, composedAxisFormatting } from './composed-axes';
import { buildComposedOptions } from './composed-options';
import type { ComposedSeries, ComposedValueAxis } from './composed-types';

const rows = [
  { id: 'a', month: 'January', revenue: 1200, rate: 0.12 },
  { id: 'b', month: 'February', revenue: 0, rate: null },
];
const series: readonly ComposedSeries<(typeof rows)[number]>[] = [
  { id: 'revenue', key: 'revenue', label: 'Revenue', kind: 'bar', stack: 'income' },
  { id: 'rate', key: 'rate', label: 'Conversion', kind: 'line', axisId: 'rate' },
];
const axes: readonly ComposedValueAxis[] = [
  {
    id: 'money',
    label: 'Revenue',
    unit: 'USD',
    numberFormatOptions: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
  },
  {
    id: 'rate',
    label: 'Conversion',
    unit: '%',
    numberFormatOptions: { style: 'percent', maximumFractionDigits: 0 },
  },
];

for (const layout of ['vertical', 'horizontal'] as const) {
  it(`binds independent ${layout} scales, units, tooltip values and raw data`, () => {
    const model = ɵnormalizeCartesianData(rows, 'id', 'month', series);
    if (model.kind === 'error') throw Error(model.message);
    const formats = composedAxisFormatting(axes, series, model, 'en-US');
    const options = buildComposedOptions(
      {
        model,
        tokens: ɵdefaultCartesianTheme('light'),
        hiddenIds: new Set(),
        animation: false,
        categoryTicks: ['Jan', 'Feb'],
        format: formats[0]!.format,
        pointFormat: (value, id) => formats[id === 'rate' ? 1 : 0]!.format(value),
      },
      series,
      layout,
      axes,
      formats,
    );
    const valueAxes = layout === 'vertical' ? options.yAxis : options.xAxis;
    expect(valueAxes).toMatchObject([
      { type: 'value', position: layout === 'vertical' ? 'left' : 'bottom' },
      {
        type: 'value',
        position: layout === 'vertical' ? 'right' : 'top',
        splitLine: { show: false },
      },
    ]);
    expect(options.series).toMatchObject([
      {
        id: 'revenue',
        [layout === 'vertical' ? 'yAxisIndex' : 'xAxisIndex']: 0,
        data: [{ value: 1200 }, { value: 0 }],
      },
      {
        id: 'rate',
        [layout === 'vertical' ? 'yAxisIndex' : 'xAxisIndex']: 1,
        data: [{ value: 0.12 }, { value: '-' }],
      },
    ]);
    const tooltip = Array.isArray(options.tooltip) ? options.tooltip[0] : options.tooltip;
    if (typeof tooltip?.formatter !== 'function') throw Error('Expected tooltip');
    const text = tooltip.formatter({ data: { id: 'a' } } as never, '', () => {});
    expect(text).toContain('$1,200');
    expect(text).toContain('12%');
    expect(text).toContain('USD');
    const hidden = buildComposedOptions(
      {
        model,
        tokens: ɵdefaultCartesianTheme('light'),
        hiddenIds: new Set(['revenue']),
        animation: false,
        categoryTicks: [],
        format: formats[0]!.format,
      },
      series,
      layout,
      axes,
      formats,
    );
    expect(layout === 'vertical' ? hidden.yAxis : hidden.xAxis).toMatchObject([
      { axisLabel: { show: false } },
      { axisLabel: { show: true } },
    ]);
  });
}

it('requires labeled axis identities and rejects unresolved assignments and cross-axis stacks', () => {
  expect(composedAxesError(axes, series)).toBeNull();
  expect(composedAxesError(null, series)).toContain('axisId');
  for (const bad of [
    [],
    [...axes, axes[0]!],
    [axes[0]!, axes[0]!],
    [{ ...axes[0]!, unit: '' }],
    [{ ...axes[0]!, label: ' Revenue' }],
  ])
    expect(composedAxesError(bad, series)).not.toBeNull();
  expect(composedAxesError(axes, [{ ...series[0]!, axisId: 'unknown' }])).toContain('axisId');
  expect(
    composedAxesError(axes, [
      series[0]!,
      { id: 'other', key: 'rate', label: 'Other', kind: 'bar', stack: 'income', axisId: 'rate' },
    ]),
  ).toContain('stack');
});

it('validates axis formatters against only their own observations and contains failures', () => {
  const model = ɵnormalizeCartesianData(rows, 'id', 'month', series);
  const money = vi.fn((value: number) => {
    if (value > 0 && value < 1) throw Error('Wrong unit');
    return `$${value}`;
  });
  const percent = vi.fn((value: number) => `${value * 100}%`);
  const result = composedAxisFormatting(
    [
      { ...axes[0]!, valueFormatter: money },
      { ...axes[1]!, valueFormatter: percent },
    ],
    series,
    model,
    'en-US',
  );
  expect(result.every((value) => value.error === null)).toBe(true);
  expect(money.mock.calls).toEqual([[1200], [0]]);
  expect(percent.mock.calls).toEqual([[0.12]]);
  expect(
    composedAxisFormatting(
      [
        {
          ...axes[0]!,
          valueFormatter: () => {
            throw Error();
          },
        },
        axes[1]!,
      ],
      series,
      model,
      'en-US',
    )[0]?.error,
  ).toContain('formatting');
});
