import { normalizeBarData, resolveBarState } from './bar-model';
import { buildBarOptions, defaultBarTheme } from './bar-options';
import type { ChartSeries } from './chart-types';

interface Row {
  id: string;
  category: string;
  amount?: number | null;
  other: number;
}
const series: readonly ChartSeries<Row>[] = [
  { id: 'amount', key: 'amount', label: '<Amount>' },
  { id: 'other', key: 'other', label: 'Other' },
];
const rows: readonly Row[] = [
  { id: 'first', category: '<Same>', amount: 0, other: -2 },
  { id: 'second', category: '<Same>', amount: null, other: 3 },
];

describe('bar data contract', () => {
  it('keeps duplicate labels distinct, preserves order and zero/negative values, and marks gaps', () => {
    const model = normalizeBarData(rows, 'id', 'category', series);
    expect(model.kind).toBe('ready');
    if (model.kind === 'error') throw new Error(model.message);
    expect(model.rows.map((row) => row.id)).toEqual(['first', 'second']);
    expect(model.rows.map((row) => row.points.map((point) => point.value))).toEqual([
      [0, -2],
      [null, 3],
    ]);
    expect(model.rows[0]?.points[0]?.row).toBe(rows[0]);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, '12', false])(
    'rejects supplied nonnumeric/nonfinite value %s',
    (amount) => {
      const external = [
        { id: 'external', category: 'External', amount, other: 1 },
      ] as unknown as Row[];
      expect(normalizeBarData(external, 'id', 'category', series).kind).toBe('error');
    },
  );

  it('rejects duplicate row and series IDs but accepts all-zero Cartesian data', () => {
    expect(normalizeBarData([rows[0]!, rows[0]!], 'id', 'category', series).kind).toBe('error');
    expect(normalizeBarData(rows, 'id', 'category', [series[0]!, series[0]!]).kind).toBe('error');
    expect(
      normalizeBarData(
        [{ id: 'zero', category: 'Zero', amount: 0, other: 0 }],
        'id',
        'category',
        series,
      ).kind,
    ).toBe('ready');
  });

  it('uses an empty state for absent observations without inventing zero', () => {
    expect(normalizeBarData([], 'id', 'category', series).kind).toBe('empty');
    expect(
      normalizeBarData([{ id: 'gap', category: 'Gap', other: 0 }], 'id', 'category', [series[0]!])
        .kind,
    ).toBe('empty');
    expect(normalizeBarData(rows, 'id', 'category', []).kind).toBe('empty');
  });

  it('applies application-error, loading, validation/renderer-error, empty, ready precedence', () => {
    const invalid = { kind: 'error', message: 'Invalid data' } as const;
    expect(resolveBarState('App error', true, invalid, true, 'Bad height')).toEqual({
      kind: 'error',
      message: 'App error',
    });
    expect(resolveBarState(null, true, invalid, true, 'Bad height').kind).toBe('loading');
    expect(resolveBarState(null, false, invalid, true, null)).toEqual(invalid);
    expect(resolveBarState(null, false, { kind: 'empty' }, true, null).kind).toBe('error');
    expect(resolveBarState(null, false, { kind: 'empty' }, false, null).kind).toBe('empty');
    expect(resolveBarState(null, false, { kind: 'ready' }, false, null).kind).toBe('ready');
  });
});

describe('bar options boundary', () => {
  it('preserves stable identities and missing values and escapes tooltip labels', () => {
    const model = normalizeBarData(rows, 'id', 'category', series);
    if (model.kind === 'error') throw new Error(model.message);
    const options = buildBarOptions(
      model,
      new Set(),
      defaultBarTheme('light'),
      'vertical',
      false,
      false,
      false,
      String,
    );
    const serialized = JSON.stringify(options);
    expect(serialized).toContain('"id":"first","value":0');
    expect(serialized).toContain('"id":"second","value":"-"');
    expect(serialized).toContain('"value":-2');
    const tooltip = Array.isArray(options.tooltip) ? options.tooltip[0] : options.tooltip;
    const formatter = tooltip?.formatter;
    if (typeof formatter !== 'function') throw new Error('Expected tooltip callback');
    const html = formatter({ data: { id: 'first' } } as never, '', () => {});
    expect(html).toContain('&lt;Same&gt;');
    expect(html).toContain('&lt;Amount&gt;: 0');
    expect(html).not.toContain('<Amount>');
  });

  it('keeps the model intact when all series are hidden', () => {
    const model = normalizeBarData(rows, 'id', 'category', series);
    if (model.kind === 'error') throw new Error(model.message);
    const options = buildBarOptions(
      model,
      new Set(['amount', 'other']),
      defaultBarTheme('dark'),
      'horizontal',
      true,
      false,
      false,
      String,
    );
    expect(options.series).toEqual([]);
    expect(model.rows).toHaveLength(2);
    expect(model.kind).toBe('ready');
  });
});
