import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PieChart } from '@ng-echarts/chart-library/pie';
import { pieBlocks } from './pie-blocks';
import { visitorMeasure, browserPalette } from './fixtures/evilcharts-pie-fixture';
@Component({
  selector: 'app-pie-comparison',
  imports: [PieChart],
  styleUrl: './comparison.css',
  template: `<main [class.dark]="theme() === 'dark'">
    <header>
      <h1>Pie visual comparison</h1>
      <p>
        Pinned browser observations and neutral reference tokens. Native controls remain available
        below the plot.
      </p>
      <div class="controls">
        <button type="button" (click)="variant.set(0)">Default pie reference</button
        ><button type="button" (click)="variant.set(1)">Donut reference</button
        ><button type="button" (click)="variant.set(2)">Labeled donut reference</button
        ><button type="button" (click)="theme.set(theme() === 'light' ? 'dark' : 'light')">
          Toggle pie comparison theme
        </button>
      </div>
    </header>
    <div class="comparison-host">
      <nec-pie-chart
        title="Browser visitors"
        description="Visitor distribution across five browsers."
        [data]="block().rows"
        rowIdKey="id"
        categoryKey="browser"
        [measure]="measure"
        [innerRadius]="block().innerRadius"
        [showLabels]="block().showLabels"
        [theme]="theme()"
        [style.--nec-series-1]="palette()[0]"
        [style.--nec-series-2]="palette()[1]"
        [style.--nec-series-3]="palette()[2]"
        [style.--nec-series-4]="palette()[3]"
        [style.--nec-series-5]="palette()[4]"
        [height]="360"
        [animation]="false"
      />
    </div>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieComparison {
  protected readonly theme = signal<'light' | 'dark'>('light');
  protected readonly variant = signal(0);
  protected readonly block = computed(() => pieBlocks[this.variant()]!);
  protected readonly measure = visitorMeasure;
  protected readonly palette = computed(() => browserPalette[this.theme()]);
}
