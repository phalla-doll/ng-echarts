import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  inject,
  Injector,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { BarChart, type ChartSeries } from '@ng-echarts/chart-library';
import { registerPostInit, type EChartsType } from 'echarts/core';

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
let onFinished: ((chart: EChartsType) => void) | undefined;
// Public ECharts hook: subscribe before the library's first setOption, without changing its API.
registerPostInit((chart) => chart.on('finished', () => onFinished?.(chart)));

declare global {
  interface Window {
    angularBarBenchmark?: {
      run(mode: 'mount' | 'update', count: number): Promise<number[]>;
      table(count: number): Promise<number[]>;
      clear(): void;
    };
  }
}

@Component({
  selector: 'app-benchmark',
  template: `<h1>Bar benchmark fixture</h1>
    <p>Automated measurements run through the benchmark command.</p>
    <div data-benchmark-host><ng-container #charts /></div>`,
  styles: `
    :host {
      display: block;
      padding: 20px;
    }
    [data-benchmark-host] {
      width: 768px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Benchmark {
  private readonly charts = viewChild.required('charts', { read: ViewContainerRef });
  private readonly injector = inject(Injector);
  private readonly destroy = inject(DestroyRef);
  private reference: ComponentRef<BarChart<Row>> | null = null;

  constructor() {
    afterNextRender(() => {
      window.angularBarBenchmark = {
        run: (mode, count) => this.run(mode, count),
        table: (count) => this.table(count),
        clear: () => this.clear(),
      };
    });
    this.destroy.onDestroy(() => {
      onFinished = undefined;
      if (typeof window !== 'undefined') delete window.angularBarBenchmark;
    });
  }
  private clear(): void {
    this.charts().clear();
    this.reference = null;
    onFinished = undefined;
  }
  private data(count: number, phase: number): readonly Row[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `row-${index}`,
      category: `Category ${index}`,
      first: phase + ((index * 13) % 500),
      second: (index * 17) % 400,
      third: (index * 23) % 300,
    }));
  }
  private create(rows: readonly Row[]): void {
    this.reference = this.charts().createComponent(BarChart<Row>);
    for (const [key, value] of Object.entries({
      title: 'Benchmark',
      description: 'Deterministic three-series fixture.',
      data: rows,
      series,
      rowIdKey: 'id',
      categoryKey: 'category',
      animation: false,
      height: 320,
    }))
      this.reference.setInput(key, value);
  }
  private async sample(mode: 'mount' | 'update', count: number, phase: number): Promise<number> {
    if (mode === 'mount') this.clear();
    const rows = this.data(count, phase);
    return new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        onFinished = undefined;
        reject(new Error('Angular benchmark render timed out'));
      }, 10_000);
      const start = performance.now();
      onFinished = (chart) => {
        const end = performance.now();
        if (!chart.getDom().closest('[data-benchmark-host]')) return;
        const options = chart.getOption();
        const renderedSeries = options['series'] as { data?: { value?: number }[] }[] | undefined;
        if (
          renderedSeries?.[0]?.data?.length !== count ||
          renderedSeries[0]?.data?.[0]?.value !== phase
        )
          return;
        clearTimeout(timeout);
        onFinished = undefined;
        resolve(end - start);
      };
      if (mode === 'mount' || !this.reference) this.create(rows);
      else this.reference.setInput('data', rows);
    });
  }
  private async run(mode: 'mount' | 'update', count: number): Promise<number[]> {
    this.clear();
    if (mode === 'update') await this.sample('mount', count, 1);
    // One warm-up for the measured operation, followed by exactly thirty samples.
    await this.sample(mode, count, 2);
    const samples: number[] = [];
    for (let index = 0; index < 30; index++)
      samples.push(await this.sample(mode, count, index + 3));
    this.clear();
    return samples;
  }
  private rendered(): Promise<void> {
    return new Promise((resolve) => afterNextRender(() => resolve(), { injector: this.injector }));
  }
  private async table(count: number): Promise<number[]> {
    this.clear();
    await this.sample('mount', count, 1);
    const samples: number[] = [];
    for (let index = 0; index < 4; index++) {
      const host = this.reference!.location.nativeElement as HTMLElement;
      const toggle = host.querySelector<HTMLButtonElement>('.table-toggle')!;
      let painted = this.rendered();
      const start = performance.now();
      toggle.click();
      await painted;
      if (host.querySelectorAll('tbody td').length !== count * 3)
        throw new Error('Expanded table is incomplete');
      if (index > 0) samples.push(performance.now() - start);
      painted = this.rendered();
      toggle.click();
      await painted;
    }
    this.clear();
    return samples;
  }
}
