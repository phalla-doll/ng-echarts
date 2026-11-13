// The standalone concept gallery's complete, offline-capable engine.
import { graphic, init, use } from 'echarts/core';
import {
  BarChart,
  CustomChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
} from 'echarts/charts';
import {
  CalendarComponent,
  GridComponent,
  TooltipComponent,
  VisualMapContinuousComponent,
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';

use([
  BarChart,
  CustomChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  TreemapChart,
  CalendarComponent,
  GridComponent,
  TooltipComponent,
  VisualMapContinuousComponent,
  LabelLayout,
  SVGRenderer,
]);

export { graphic, init };
