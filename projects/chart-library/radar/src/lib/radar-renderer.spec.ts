import { createRadarRenderer } from './radar-renderer';
import type { RadarOption } from './radar-options';

const chart = vi.hoisted(() => ({
  setOption: vi.fn(),
  resize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('echarts/core', () => ({ init: () => chart, use: vi.fn() }));
vi.mock('echarts/lib/chart/radar', () => ({}));
vi.mock('echarts/components', () => ({ RadarComponent: {}, TooltipComponent: {} }));
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }));

it('keeps responsive radar sizing and skips stale options before a pending update', () => {
  vi.clearAllMocks();
  let width = 800;
  const host = {
    get clientWidth() {
      return width;
    },
    clientHeight: 320,
  } as HTMLElement;
  const options: RadarOption = {
    animation: true,
    radar: { indicator: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
  };
  const renderer = createRadarRenderer(host, vi.fn());
  renderer.update(options);
  const wideRadius = chart.setOption.mock.lastCall?.[0].radar.radius;
  chart.setOption.mockClear();
  width = 180;
  renderer.resize({ optionsPending: true });
  expect(chart.setOption).not.toHaveBeenCalled();
  renderer.update(options);
  expect(chart.setOption).toHaveBeenCalledTimes(1);
  expect(chart.setOption.mock.lastCall?.[0].radar.radius).toBeLessThan(wideRadius);
  expect(chart.setOption.mock.lastCall?.[0].animation).toBe(true);
  chart.setOption.mockClear();
  width = 800;
  renderer.resize();
  expect(chart.setOption).toHaveBeenCalledTimes(1);
  expect(chart.setOption.mock.lastCall?.[0].radar.radius).toBe(wideRadius);
  expect(chart.setOption.mock.lastCall?.[0].animation).toBe(false);
  renderer.dispose();
});
