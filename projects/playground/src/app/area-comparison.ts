import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ComparisonAppearance } from './comparison-appearance';
import { AreaChart } from '@ng-echarts/chart-library/area';
import { areaBlocks } from './area-blocks';
@Component({
  selector: 'app-area-comparison',
  imports: [AreaChart],
  providers: [ComparisonAppearance],
  styleUrl: './comparison.css',
  template: `<main
    class="comparison-page"
    [class.utility-page]="!referenceMode"
    [class.reference-mode]="referenceMode"
    [class.dark]="theme() === 'dark'"
  >
    <header>
      <h1>Area visual comparison</h1>
      <p>
        Compare the same monthly observations across chart variants. Explore full values in the data
        table.
      </p>
      <div class="controls" role="group" aria-label="Chart variants">
        <button type="button" (click)="variant.set(0)" [attr.aria-pressed]="variant() === 0">
          Default area reference</button
        ><button type="button" (click)="variant.set(1)" [attr.aria-pressed]="variant() === 1">
          Stacked area reference</button
        ><button type="button" (click)="variant.set(2)" [attr.aria-pressed]="variant() === 2">
          Solid area reference</button
        ><button type="button" (click)="toggleTheme()" [hidden]="!referenceMode">
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
  private readonly appearance = inject(ComparisonAppearance);
  protected readonly referenceMode = this.appearance.referenceMode;
  protected readonly theme = this.appearance.theme;
  protected readonly variant = signal(0);
  protected readonly block = computed(() => areaBlocks[this.variant()]!);
  protected toggleTheme(): void {
    this.appearance.toggle();
  }
  protected readonly monthTick = (month: string) => month.slice(0, 3);
}
