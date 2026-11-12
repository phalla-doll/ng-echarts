import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BarChart } from '@ng-echarts/chart-library';

@Component({
  selector: 'app-retention',
  imports: [BarChart],
  template: `<h1>Retention validation</h1>
    <button type="button" (click)="toggle()">Toggle retained chart</button>
    @if (mounted()) {
      <nec-bar-chart
        title="Retention sample"
        [data]="rows()"
        rowIdKey="id"
        categoryKey="category"
        [series]="series"
        [animation]="false"
      />
    }`,
  styles: `
    :host {
      display: block;
      padding: 20px;
      max-width: 768px;
    }
    button {
      padding: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Retention {
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
