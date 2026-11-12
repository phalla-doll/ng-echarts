import { createRoot } from 'react-dom/client';
import { EChartsExampleBarChart } from './upstream/src/registry/examples/echarts/ex-echarts-bar-chart';
import { EChartsExampleBarChart as Stacked } from './upstream/src/registry/examples/echarts/ex-stacked-type-echarts-bar-chart';
import { EChartsExampleBarChart as Horizontal } from './upstream/src/registry/examples/echarts/ex-horizontal-layout-echarts-bar-chart';
import { EChartsExampleBarChart as Gradient } from './upstream/src/registry/examples/echarts/ex-gradient-variant-echarts-bar-chart';
import { EChartsExampleLineChart as LineDefault } from './upstream/src/registry/examples/echarts/ex-echarts-line-chart';
import { EChartsExampleLineChart as LineSolid } from './upstream/src/registry/examples/echarts/ex-solid-stroke-echarts-line-chart';
import { EChartsExampleLineChart as LineSmooth } from './upstream/src/registry/examples/echarts/ex-monotoney-curve-type-echarts-line-chart';
import { EChartsExampleAreaChart as AreaDefault } from './upstream/src/registry/examples/echarts/ex-default-type-echarts-area-chart';
import { EChartsExampleAreaChart as AreaStacked } from './upstream/src/registry/examples/echarts/ex-stacked-type-echarts-area-chart';
import { EChartsExampleAreaChart as AreaSolid } from './upstream/src/registry/examples/echarts/ex-solid-area-variant-echarts-area-chart';
import { EChartsExamplePieChart as PieDefault } from './upstream/src/registry/examples/echarts/ex-echarts-pie-chart';
import { EChartsExamplePieChart as PieDonut } from './upstream/src/registry/examples/echarts/ex-donut-echarts-pie-chart';
import './reference.css';

const parameters = new URLSearchParams(location.search);
document.documentElement.classList.toggle('dark', parameters.get('theme') === 'dark');
const host = document.getElementById('reference')!;
host.style.width = `${Number(parameters.get('width') ?? 768)}px`;
host.style.height = '360px';
const Reference =
  {
    'pie-default': PieDefault,
    'pie-donut': PieDonut,
    stacked: Stacked,
    horizontal: Horizontal,
    gradient: Gradient,
    'line-default': LineDefault,
    'area-default': AreaDefault,
    'area-stacked': AreaStacked,
    'area-solid': AreaSolid,
    'line-solid': LineSolid,
    'line-smooth': LineSmooth,
  }[parameters.get('variant') ?? ''] ?? EChartsExampleBarChart;
createRoot(host).render(<Reference />);
