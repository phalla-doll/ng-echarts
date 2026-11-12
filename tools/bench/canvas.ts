import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { startBenchmark } from './renderer-harness';

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);
startBenchmark('canvas');
