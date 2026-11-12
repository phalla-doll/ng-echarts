// Dataset and palette adapted from EvilCharts, copyright (c) 2026 Gurbinder, MIT.
// Source revision and per-file provenance: docs/UPSTREAM_PROVENANCE.md.
// Full license: projects/chart-library/third-party/evilcharts-LICENSE.txt.
import type { ChartSeries } from '@ng-echarts/chart-library/bar';

export interface DeviceRow {
  readonly id: string;
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number | null;
}

export const deviceRows: readonly DeviceRow[] = [
  { id: 'jan', month: 'January', desktop: 342, mobile: 184 },
  { id: 'feb', month: 'February', desktop: 876, mobile: 491 },
  { id: 'mar', month: 'March', desktop: 512, mobile: 290 },
  { id: 'apr', month: 'April', desktop: 629, mobile: 391 },
  { id: 'may', month: 'May', desktop: 458, mobile: 309 },
  { id: 'jun', month: 'June', desktop: 781, mobile: 449 },
  { id: 'jul', month: 'July', desktop: 394, mobile: 234 },
  { id: 'aug', month: 'August', desktop: 925, mobile: 557 },
  { id: 'sep', month: 'September', desktop: 647, mobile: 367 },
  { id: 'oct', month: 'October', desktop: 532, mobile: 357 },
  { id: 'nov', month: 'November', desktop: 803, mobile: 515 },
  { id: 'dec', month: 'December', desktop: 271, mobile: 149 },
];

export const deviceSeries: readonly ChartSeries<DeviceRow>[] = [
  { id: 'desktop', key: 'desktop', label: 'Desktop' },
  { id: 'mobile', key: 'mobile', label: 'Mobile' },
];
