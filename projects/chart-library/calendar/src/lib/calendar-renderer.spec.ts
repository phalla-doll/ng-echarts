import { ɵdefaultCartesianTheme } from '@ng-echarts/chart-library/core';
import { createCalendarRenderer } from './calendar-renderer';
import { normalizeCalendarData } from './calendar-model';
import type { CalendarView } from './calendar-options';

const chart = vi.hoisted(() => ({
  setOption: vi.fn(),
  resize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('echarts/core', () => ({ init: () => chart, use: vi.fn() }));
vi.mock('echarts/lib/chart/heatmap', () => ({}));
vi.mock('echarts/components', () => ({
  CalendarComponent: {},
  TooltipComponent: {},
  VisualMapPiecewiseComponent: {},
}));
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }));

it('applies only the current calendar snapshot when resize and options change together', () => {
  vi.clearAllMocks();
  let width = 800;
  const host = {
    get clientWidth() {
      return width;
    },
  } as HTMLElement;
  const model = normalizeCalendarData(
    [{ date: '2024-01-01', value: 1 }],
    'date',
    'value',
    2024,
    40,
  );
  if (model.kind === 'error') throw Error(model.message);
  const view: CalendarView = {
    ...model,
    tokens: ɵdefaultCartesianTheme('light'),
    animation: true,
    format: String,
  };
  const renderer = createCalendarRenderer(host, vi.fn());
  renderer.update(view);
  chart.setOption.mockClear();
  width = 390;
  renderer.resize({ optionsPending: true });
  expect(chart.setOption).not.toHaveBeenCalled();
  renderer.update({ ...view, tokens: ɵdefaultCartesianTheme('dark') });
  expect(chart.setOption).toHaveBeenCalledTimes(1);
  expect(chart.setOption.mock.lastCall?.[0]).toMatchObject({ animation: true });
  expect(chart.setOption.mock.lastCall?.[0].calendar).toHaveLength(4);
  chart.setOption.mockClear();
  width = 800;
  renderer.resize({ optionsPending: false });
  expect(chart.setOption).toHaveBeenCalledTimes(1);
  expect(chart.setOption.mock.lastCall?.[0]).toMatchObject({ animation: false });
  expect(chart.setOption.mock.lastCall?.[0].calendar).toHaveLength(1);
  renderer.dispose();
});
