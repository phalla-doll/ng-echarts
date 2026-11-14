// Adapted from EvilCharts ex-horizontal-layout-echarts-bar-chart.tsx at
// 4c2dd7c9bae780703244265c9a4b509d40c055ad (2026 Gurbinder, MIT).
// See docs/UPSTREAM_PROVENANCE.md and the preserved third-party notice.
import type { ChartSeries } from '@mantha911/ng-echarts/bar';
import type { DeviceRow } from './evilcharts-bar-fixture';

export const horizontalRows: readonly DeviceRow[] = [
  { id: 'jan', month: 'January', desktop: 186, mobile: null },
  { id: 'feb', month: 'February', desktop: 305, mobile: null },
  { id: 'mar', month: 'March', desktop: 237, mobile: null },
  { id: 'apr', month: 'April', desktop: 173, mobile: null },
  { id: 'may', month: 'May', desktop: 209, mobile: null },
  { id: 'jun', month: 'June', desktop: 214, mobile: null },
];
export const horizontalSeries: readonly ChartSeries<DeviceRow>[] = [
  { id: 'desktop', key: 'desktop', label: 'Desktop' },
];
