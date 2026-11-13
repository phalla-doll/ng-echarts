import type { BarLayout, ChartSeries, ChartTheme } from '@ng-echarts/chart-library/core';
import { normalizeBarData } from './bar-model';
import { buildBarOptions, defaultBarTheme } from './bar-options';

const rows = [
  { id: 'a', category: 'Same label', first: 40, second: -30 },
  { id: 'b', category: 'Same label', first: -20, second: 10 },
  { id: 'c', category: 'Zero and missing', first: 0, second: null },
] as const;
const series: readonly ChartSeries<(typeof rows)[number]>[] = [
  { id: 'first', key: 'first', label: 'First' },
  { id: 'second', key: 'second', label: 'Second' },
];
const variants = (['light', 'dark'] as const).flatMap((theme) =>
  (['vertical', 'horizontal'] as const).flatMap((layout) =>
    [false, true].flatMap((stacked) =>
      [false, true].map((gradient) => ({ theme, layout, stacked, gradient })),
    ),
  ),
);

function build(
  theme: ChartTheme,
  layout: BarLayout,
  stacked: boolean,
  gradient: boolean,
  selectedRowId: string | readonly string[] | null = null,
) {
  const model = normalizeBarData(rows, 'id', 'category', series);
  if (model.kind !== 'ready') throw new Error('Expected ready acceptance fixture');
  return buildBarOptions(
    model,
    new Set(),
    defaultBarTheme(theme),
    layout,
    stacked,
    gradient,
    false,
    String,
    undefined,
    new Set(typeof selectedRowId === 'string' ? [selectedRowId] : (selectedRowId ?? [])),
  );
}

it.each(variants)(
  'preserves signed data, gaps, identities, and fill direction: $theme/$layout stack=$stacked gradient=$gradient',
  ({ theme, layout, stacked, gradient }) => {
    const options = build(theme, layout, stacked, gradient);
    const category = layout === 'vertical' ? options.xAxis : options.yAxis;
    const value = layout === 'vertical' ? options.yAxis : options.xAxis;
    expect(category).toMatchObject({
      type: 'category',
      data: ['a', 'b', 'c'],
      inverse: layout === 'horizontal',
    });
    expect(value).toMatchObject({ type: 'value' });
    const rendered = options.series;
    if (!Array.isArray(rendered)) throw new Error('Expected bar series array');
    expect(rendered.map((item) => item.id)).toEqual(['first', 'second']);
    expect(rendered.map((item) => item.data)).toEqual([
      [
        { id: 'a', value: 40 },
        { id: 'b', value: -20 },
        { id: 'c', value: 0 },
      ],
      [
        { id: 'a', value: -30 },
        { id: 'b', value: 10 },
        { id: 'c', value: '-' },
      ],
    ]);
    expect(rendered.map((item) => item.stack)).toEqual(
      stacked ? ['total', 'total'] : [undefined, undefined],
    );
    const palette = defaultBarTheme(theme).series;
    for (const [index, item] of rendered.entries()) {
      expect(item.type).toBe('bar');
      expect(item.itemStyle?.borderRadius).toBe(2);
      const color = item.itemStyle?.color;
      if (gradient) {
        expect(color).toMatchObject({
          type: 'linear',
          x: 0,
          y: 0,
          x2: layout === 'horizontal' ? 1 : 0,
          y2: layout === 'vertical' ? 1 : 0,
        });
        if (typeof color !== 'object' || color === null || !('colorStops' in color))
          throw new Error('Expected gradient');
        expect(color.colorStops.slice(0, 2)).toEqual([
          { offset: 0, color: palette[index] },
          { offset: 0.2, color: palette[index] },
        ]);
        expect(color.colorStops.slice(2).map((stop) => stop.offset)).toEqual([0.9, 1]);
        expect(color.colorStops.slice(2).every((stop) => /,0\)$/.test(stop.color))).toBe(true);
      } else {
        expect(color).toBe(palette[index]);
      }
    }
    expect(rows[2].second).toBeNull();
    expect(options['animation']).toBe(false);
  },
);

it.each(variants)(
  'selects a stable row without changing values or fills: $theme/$layout stack=$stacked gradient=$gradient',
  ({ theme, layout, stacked, gradient }) => {
    const options = build(theme, layout, stacked, gradient, 'b');
    const axis = layout === 'vertical' ? options.xAxis : options.yAxis;
    expect(axis).toMatchObject({
      data: [
        { value: 'a' },
        { value: 'b', textStyle: { color: defaultBarTheme(theme).text, fontWeight: 600 } },
        { value: 'c' },
      ],
      splitArea: {
        show: true,
        interval: 0,
        areaStyle: { color: ['transparent', defaultBarTheme(theme).border, 'transparent'] },
      },
    });
    if (!Array.isArray(options.series)) throw new Error('Expected bar series');
    expect(options.series[0]).toMatchObject({
      data: [
        { id: 'a', value: 40, itemStyle: { opacity: 0.35 } },
        { id: 'b', value: -20, itemStyle: { opacity: 1 } },
        { id: 'c', value: 0, itemStyle: { opacity: 0.35 } },
      ],
    });
    expect(options.series[1]).toMatchObject({
      data: [
        { id: 'a', value: -30, itemStyle: { opacity: 0.35 } },
        { id: 'b', value: 10, itemStyle: { opacity: 1 } },
        { id: 'c', value: '-', itemStyle: { opacity: 0.35 } },
      ],
    });
    const unknown = build(theme, layout, stacked, gradient, 'removed');
    const reset = build(theme, layout, stacked, gradient);
    expect(unknown.series).toEqual(reset.series);
    expect(layout === 'vertical' ? unknown.xAxis : unknown.yAxis).not.toHaveProperty('splitArea');
  },
);

it.each(variants)(
  'highlights multiple row identities including zero/missing values: $theme/$layout stack=$stacked gradient=$gradient',
  ({ theme, layout, stacked, gradient }) => {
    const options = build(theme, layout, stacked, gradient, ['b', 'c', 'c', 'unknown']);
    expect(layout === 'vertical' ? options.xAxis : options.yAxis).toMatchObject({
      splitArea: {
        areaStyle: {
          color: ['transparent', defaultBarTheme(theme).border, defaultBarTheme(theme).border],
        },
      },
    });
    if (!Array.isArray(options.series)) throw new Error('Expected series');
    expect(options.series[0]).toMatchObject({
      data: [
        { id: 'a', itemStyle: { opacity: 0.35 } },
        { id: 'b', value: -20, itemStyle: { opacity: 1 } },
        { id: 'c', value: 0, itemStyle: { opacity: 1 } },
      ],
    });
    expect(options.series[1]).toMatchObject({
      data: [
        { id: 'a', itemStyle: { opacity: 0.35 } },
        { id: 'b', value: 10, itemStyle: { opacity: 1 } },
        { id: 'c', value: '-', itemStyle: { opacity: 1 } },
      ],
    });
  },
);
