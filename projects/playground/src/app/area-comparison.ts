import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AreaChart } from '@ng-echarts/chart-library/area';
import { areaBlocks } from './area-blocks';
@Component({
  selector: 'app-area-comparison',
  imports: [AreaChart],
  styleUrl: './comparison.css',
  template: `<main [class.dark]="theme() === 'dark'">
    <header>
      <h1>Area visual comparison</h1>
      <p>
        Pinned monthly observations and neutral reference tokens. Native controls remain available
        below the plot.
      </p>
      <div class="controls">
        <button type="button" (click)="variant.set(0)">Default area reference</button
        ><button type="button" (click)="variant.set(1)">Stacked area reference</button
        ><button type="button" (click)="variant.set(2)">Solid area reference</button
        ><button type="button" (click)="theme.set(theme() === 'light' ? 'dark' : 'light')">
          Toggle area comparison theme
        </button>
      </div>
    </header>
    <div class="comparison-host">
      <nec-area-chart
        title="Device visits by month"
        description="Desktop and mobile visits across twelve months."
        [data]="block().rows"
        rowIdKey="id"
        categoryKey="month"
        [series]="block().series"
        [smooth]="block().smooth"
        [showPoints]="block().showPoints"
        [stacked]="block().stacked"
        [gradient]="block().gradient"
        [theme]="theme()"
        [categoryTickFormatter]="monthTick"
        [height]="360"
        [animation]="false"
      />
    </div>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaComparison {
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly variant = signal(0);
  protected readonly block = computed(() => areaBlocks[this.variant()]!);
  protected readonly monthTick = (month: string) => month.slice(0, 3);
}
