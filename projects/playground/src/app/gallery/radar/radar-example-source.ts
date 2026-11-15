export interface Capability {
  readonly id: string;
  readonly dimension: string;
  readonly max: number;
  readonly current: number | null;
  readonly target: number | null;
}
export const capabilityRows: readonly Capability[] = [
  { id: 'speed', dimension: 'Speed', max: 100, current: 78, target: 92 },
  { id: 'reliability', dimension: 'Reliability', max: 100, current: 90, target: 95 },
  { id: 'usability', dimension: 'Usability', max: 100, current: 72, target: 88 },
  { id: 'coverage', dimension: 'Coverage', max: 100, current: 65, target: 85 },
  { id: 'support', dimension: 'Support', max: 100, current: 85, target: 90 },
  { id: 'value', dimension: 'Value', max: 100, current: 82, target: 90 },
];
export const radarExampleSource = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RadarChart, type ChartSeries } from '@mantha911/ng-echarts/radar';

interface Capability {
  id: string; dimension: string; max: number;
  current: number | null; target: number | null;
}
@Component({
  selector: 'app-capability-profile',
  imports: [RadarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<nec-radar-chart
    title="Capability profile"
    description="Current and target scores, each out of 100."
    [data]="rows" rowIdKey="id" categoryKey="dimension" maxKey="max"
    [series]="series" [height]="320"
  />\`,
})
export class CapabilityProfile {
  readonly rows: readonly Capability[] = ${JSON.stringify(capabilityRows, null, 2)};
  readonly series: readonly ChartSeries<Capability>[] = [
    { id: 'current', key: 'current', label: 'Current' },
    { id: 'target', key: 'target', label: 'Target' },
  ];
}`;
