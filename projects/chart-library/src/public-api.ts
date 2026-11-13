export { AreaChart } from '@ng-echarts/chart-library/area';
export { LineChart } from '@ng-echarts/chart-library/line';
// Compatibility entry: prefer /bar or /core for focused imports.
export { BarChart, type BarRangeSelection } from '@ng-echarts/chart-library/bar';
export { ChartFrame } from '@ng-echarts/chart-library/core';
export type {
  BarLayout,
  CategoryTickFormatter,
  ChartSeries,
  ChartMeasure,
  CategoryVisibilityChange,
  ChartTheme,
  LegendVisibilityChange,
  NumericKey,
  PointSelection,
  StringKey,
  ValueFormatter,
} from '@ng-echarts/chart-library/core';

export { PieChart } from '@ng-echarts/chart-library/pie';

export {
  ComposedChart,
  type ComposedSeries,
  type ComposedBarSeries,
  type ComposedLineSeries,
} from '@ng-echarts/chart-library/composed';
