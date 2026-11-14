import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ComparisonAppearance } from './comparison-appearance';
import { LineChart } from '@mantha911/ng-echarts/line';
import { lineBlocks } from './line-blocks';
@Component({
  selector: 'app-line-comparison',
  imports: [LineChart],
  providers: [ComparisonAppearance],
  styleUrl: './comparison.css',
  template: `<main
    class="comparison-page"
    [class.utility-page]="!referenceMode"
    [class.reference-mode]="referenceMode"
    [class.dark]="theme() === 'dark'"
  >
    <header>
      <h1>Line visual comparison</h1>
      <p>
        Compare the same monthly observations across chart variants. Explore full values in the data
        table.
      </p>
      <div class="controls" role="group" aria-label="Chart variants">
        <button type="button" (click)="variant.set(0)" [attr.aria-pressed]="variant() === 0">
          Straight reference</button
        ><button type="button" (click)="variant.set(1)" [attr.aria-pressed]="variant() === 1">
          Smooth reference</button
        ><button type="button" (click)="variant.set(2)" [attr.aria-pressed]="variant() === 2">
          Minimal reference</button
        ><button type="button" (click)="toggleTheme()" [hidden]="!referenceMode">
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
  private readonly appearance = inject(ComparisonAppearance);
  protected readonly referenceMode = this.appearance.referenceMode;
  protected readonly theme = this.appearance.theme;
  protected readonly variant = signal(0);
  protected readonly block = computed(() => lineBlocks[this.variant()]!);
  protected toggleTheme(): void {
    this.appearance.toggle();
  }
  protected readonly monthTick = (month: string) => month.slice(0, 3);
}
