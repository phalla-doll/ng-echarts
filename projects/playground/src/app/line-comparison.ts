import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LineChart } from '@ng-echarts/chart-library/line';
import { lineBlocks } from './line-blocks';
@Component({
  selector: 'app-line-comparison',
  imports: [LineChart],
  styleUrl: './comparison.css',
  template: `<main [class.dark]="theme() === 'dark'">
    <header>
      <h1>Line visual comparison</h1>
      <p>
        Pinned monthly observations and neutral reference tokens. Native controls remain available
        below the plot.
      </p>
      <div class="controls">
        <button type="button" (click)="variant.set(0)">Straight reference</button
        ><button type="button" (click)="variant.set(1)">Smooth reference</button
        ><button type="button" (click)="variant.set(2)">Minimal reference</button
        ><button type="button" (click)="theme.set(theme() === 'light' ? 'dark' : 'light')">
          Toggle line comparison theme
        </button>
      </div>
    </header>
    <div class="comparison-host">
      <nec-line-chart
        title="Device visits by month"
        description="Desktop and mobile visits across twelve months."
        [data]="block().rows"
        rowIdKey="id"
        categoryKey="month"
        [series]="block().series"
        [smooth]="block().smooth"
        [showPoints]="block().showPoints"
        [theme]="theme()"
        [categoryTickFormatter]="monthTick"
        [height]="360"
        [animation]="false"
      />
    </div>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineComparison {
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly variant = signal(0);
  protected readonly block = computed(() => lineBlocks[this.variant()]!);
  protected readonly monthTick = (month: string) => month.slice(0, 3);
}
