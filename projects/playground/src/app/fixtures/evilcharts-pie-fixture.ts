// Browser observations and colors adapted from EvilCharts (2026 Gurbinder, MIT).
// Pinned ex-echarts-pie-chart.tsx; see docs/UPSTREAM_PROVENANCE.md and package notice.
import type { ChartMeasure } from '@ng-echarts/chart-library/pie';
export interface BrowserRow {
  readonly id: string;
  readonly browser: string;
  readonly visitors: number | null;
}
export const browserRows: readonly BrowserRow[] = [
  { id: 'chrome', browser: 'Chrome', visitors: 275 },
  { id: 'safari', browser: 'Safari', visitors: 200 },
  { id: 'firefox', browser: 'Firefox', visitors: 187 },
  { id: 'edge', browser: 'Edge', visitors: 173 },
  { id: 'other', browser: 'Other', visitors: 90 },
];
export const visitorMeasure: ChartMeasure<BrowserRow> = {
  id: 'visitors',
  key: 'visitors',
  label: 'Visitors',
};
export const browserPalette = {
  light: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'],
  dark: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#9ca3af'],
} as const;
