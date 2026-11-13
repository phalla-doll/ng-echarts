export interface RadialBlock {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly value: number;
  readonly max: number;
}
export const radialBlocks: readonly RadialBlock[] = [
  {
    id: 'monthly-goal',
    title: 'Monthly visit goal',
    description: 'Visits completed toward a monthly goal of 10,000.',
    value: 6800,
    max: 10000,
  },
  {
    id: 'launch-checklist',
    title: 'Launch checklist',
    description: 'Nine of twelve launch tasks are complete.',
    value: 9,
    max: 12,
  },
];
export function radialExampleSource(block: RadialBlock, dark: boolean): string {
  return `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RadialProgress } from '@ng-echarts/chart-library/radial';

@Component({
  selector: 'app-goal-progress',
  imports: [RadialProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<nec-radial-progress
    title="${block.title}"
    description="${block.description}"
    [value]="completed()" [max]="${block.max}" theme="${dark ? 'dark' : 'light'}"
  />\`,
})
export class GoalProgress {
  readonly completed = signal<number | null>(${block.value});
}`;
}
