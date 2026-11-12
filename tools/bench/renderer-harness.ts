import { init, type EChartsType } from 'echarts/core';
import { normalizeBarData } from '../../projects/chart-library/bar/src/lib/bar-model';
import {
  buildBarOptions,
  defaultBarTheme,
} from '../../projects/chart-library/bar/src/lib/bar-options';
import type { ChartSeries } from '../../projects/chart-library/core/src/lib/chart-types';

interface Row {
  id: string;
  category: string;
  first: number;
  second: number;
  third: number;
}
const series: readonly ChartSeries<Row>[] = [
  { id: 'first', key: 'first', label: 'First' },
  { id: 'second', key: 'second', label: 'Second' },
  { id: 'third', key: 'third', label: 'Third' },
];
declare global {
  interface Window {
    rendererBenchmark?: {
      run(count: number, mode: 'mount' | 'update'): Promise<number[]>;
      costs(count: number): Promise<{ resize: number; tooltip: number }>;
      render(theme: 'light' | 'dark'): void;
    };
  }
}

export function startBenchmark(renderer: 'canvas' | 'svg'): void {
  const host = document.getElementById('plot')!;
  let chart: EChartsType | undefined;
  const clear = () => {
    chart?.dispose();
    chart = undefined;
  };
  const options = (count: number, phase: number, theme: 'light' | 'dark' = 'light') => {
    const rows = Array.from({ length: count }, (_, index): Row => ({
      id: `row-${index}`,
      category: `Category ${index}`,
      first: phase + ((index * 13) % 500),
      second: (index * 17) % 400,
      third: (index * 23) % 300,
    }));
    const model = normalizeBarData(rows, 'id', 'category', series);
    if (model.kind === 'error') throw new Error(model.message);
    return buildBarOptions(
      model,
      new Set(),
      defaultBarTheme(theme),
      'vertical',
      false,
      false,
      false,
      new Intl.NumberFormat('en-US').format,
    );
  };
  const sample = (count: number, phase: number, mode: 'mount' | 'update'): Promise<number> => {
    if (mode === 'mount') clear();
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const data = options(count, phase);
      chart ??= init(host, undefined, { renderer });
      const instance = chart;
      const timeout = setTimeout(() => {
        instance.off('finished', done);
        reject(new Error('Renderer benchmark timed out'));
      }, 10_000);
      const done = () => {
        const end = performance.now();
        clearTimeout(timeout);
        instance.off('finished', done);
        resolve(end - start);
      };
      instance.on('finished', done);
      instance.setOption(data, { notMerge: true, lazyUpdate: false });
    });
  };
  window.rendererBenchmark = {
    async run(count, mode) {
      clear();
      if (mode === 'update') await sample(count, 1, 'mount');
      await sample(count, 2, mode);
      const samples = [];
      for (let index = 0; index < 30; index++) samples.push(await sample(count, index + 3, mode));
      clear();
      return samples;
    },
    async costs(count) {
      await sample(count, 1, 'mount');
      let start = performance.now();
      chart!.resize({ width: 640 });
      const resize = performance.now() - start;
      start = performance.now();
      chart!.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
      if (!host.querySelector('[data-nec-tooltip]')) throw new Error('Tooltip did not render');
      const tooltip = performance.now() - start;
      clear();
      return { resize, tooltip };
    },
    render(theme) {
      clear();
      chart = init(host, undefined, { renderer });
      chart.setOption(options(12, 1, theme));
    },
  };
}
