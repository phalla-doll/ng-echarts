import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library/bar';
import { SiteAppearance } from './site-appearance';

@Component({
  selector: 'app-retention',
  imports: [BarChart],
  template: `<main class="utility-page">
    <h1>Retention validation</h1>
    <p>Exercise chart removal and verify that previous data can be collected.</p>
    <div class="controls">
      <button type="button" (click)="toggle()">Toggle retained chart</button>
    </div>
    @if (mounted()) {
      <nec-bar-chart
        title="Retention sample"
        [theme]="theme()"
        [data]="rows()"
        rowIdKey="id"
        categoryKey="category"
        [series]="series"
        [animation]="false"
      />
    }
  </main>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Retention {
  protected readonly theme = inject(SiteAppearance).theme;
  protected readonly mounted = signal(false);
  protected readonly rows = signal<readonly { id: string; category: string; value: number }[]>([]);
  protected readonly series = [{ id: 'value', key: 'value', label: 'Value' }] as const;
  private iteration = 0;
  protected toggle(): void {
    if (!this.mounted()) {
      this.iteration++;
      // Flatten the unique identity so a heap snapshot can identify an obsolete model.
      this.rows.set(
        JSON.parse(
          JSON.stringify([
            { id: `ng-echarts-retention-${this.iteration}`, category: 'Constant label', value: 1 },
          ]),
        ),
      );
    }
    this.mounted.update((mounted) => !mounted);
  }
}
