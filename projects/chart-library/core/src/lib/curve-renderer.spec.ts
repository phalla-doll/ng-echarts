import type { EChartsType } from 'echarts/core';
import { createCurveRenderer } from './curve-renderer';

it('keeps current options and category conversion isolated between curve instances and ignores disposed hits', () => {
  const fake = () => {
    let click: (event: unknown) => void = () => {};
    const chart = {
      on: vi.fn((_name, handler) => (click = handler)),
      off: vi.fn(),
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
      convertFromPixel: vi.fn((_axis, value) => (value === 10 ? 0 : 1)),
    };
    return { chart, click: (event: unknown) => click(event) };
  };
  const a = fake(),
    b = fake(),
    first = vi.fn(),
    second = vi.fn();
  const horizontal = createCurveRenderer(a.chart as unknown as EChartsType, first);
  const vertical = createCurveRenderer(b.chart as unknown as EChartsType, second);
  const series = [
    {
      id: 'value',
      data: [
        { id: 'a', value: 0 },
        { id: 'b', value: 20 },
      ],
    },
  ];
  horizontal.update({ yAxis: { type: 'category' }, series });
  vertical.update({ yAxis: [{ type: 'value' }, { type: 'value' }], series });
  const event = { selfType: 'area', seriesIndex: 0, event: { offsetX: 20, offsetY: 10 } };
  a.click(event);
  b.click(event);
  expect(first).toHaveBeenCalledWith({ rowId: 'a', seriesId: 'value' });
  expect(second).toHaveBeenCalledWith({ rowId: 'b', seriesId: 'value' });
  expect(a.chart.convertFromPixel).toHaveBeenCalledWith({ yAxisIndex: 0 }, 10);
  expect(b.chart.convertFromPixel).toHaveBeenCalledWith({ xAxisIndex: 0 }, 20);
  horizontal.dispose();
  a.click(event);
  expect(first).toHaveBeenCalledTimes(1);
  expect(a.chart.off).toHaveBeenCalledWith('click', expect.any(Function));
  expect(a.chart.dispose).toHaveBeenCalledTimes(1);
});
