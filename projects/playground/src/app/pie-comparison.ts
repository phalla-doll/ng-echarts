import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ComparisonAppearance } from './comparison-appearance';
import { PieChart } from '@ng-echarts/chart-library/pie';
import { pieBlocks } from './pie-blocks';
import { visitorMeasure, browserPalette } from './fixtures/evilcharts-pie-fixture';
@Component({
  selector: 'app-pie-comparison',
  imports: [PieChart],
  providers: [ComparisonAppearance],
  styleUrl: './comparison.css',
  template: `<main
    class="comparison-page"
    [class.utility-page]="!referenceMode"
    [class.reference-mode]="referenceMode"
    [class.dark]="theme() === 'dark'"
  >
    <header>
      <h1>Pie visual comparison</h1>
      <p>Compare browser shares as pies and donuts. Explore full values in the data table.</p>
      <div class="controls" role="group" aria-label="Chart variants">
        <button type="button" (click)="variant.set(0)" [attr.aria-pressed]="variant() === 0">
          Default pie reference</button
        ><button type="button" (click)="variant.set(1)" [attr.aria-pressed]="variant() === 1">
          Donut reference</button
        ><button type="button" (click)="variant.set(2)" [attr.aria-pressed]="variant() === 2">
          Labeled donut reference</button
        ><button type="button" (click)="toggleTheme()" [hidden]="!referenceMode">
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
  private readonly appearance = inject(ComparisonAppearance);
  protected readonly referenceMode = this.appearance.referenceMode;
  protected readonly theme = this.appearance.theme;
  protected readonly variant = signal(0);
  protected readonly block = computed(() => pieBlocks[this.variant()]!);
  protected toggleTheme(): void {
    this.appearance.toggle();
  }
  protected readonly measure = visitorMeasure;
  protected readonly palette = computed(() => browserPalette[this.theme()]);
}
