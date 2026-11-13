import type { BarOption } from './bar-options';
export interface BarRangeOptions {
  readonly snapshot: unknown;
  readonly ids: readonly string[];
  readonly horizontal: boolean;
  readonly color: string;
  readonly fill: string;
}
/** Browser-only interaction metadata is never supplied to ECharts as chart options. */
export interface BarRenderOptions {
  readonly chart: BarOption;
  readonly range: BarRangeOptions | null;
}
