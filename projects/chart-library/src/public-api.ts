export { AreaChart } from '@mantha911/ng-echarts/area';
export { LineChart } from '@mantha911/ng-echarts/line';
// Compatibility entry: prefer /bar or /core for focused imports.
export { BarChart, type BarRangeSelection } from '@mantha911/ng-echarts/bar';
export { ChartFrame } from '@mantha911/ng-echarts/core';
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
  PointPreview,
  StringKey,
  ValueFormatter,
} from '@mantha911/ng-echarts/core';

export { PieChart } from '@mantha911/ng-echarts/pie';

export {
  ComposedChart,
  type ComposedSeries,
  type ComposedBarSeries,
  type ComposedLineSeries,
} from '@mantha911/ng-echarts/composed';
