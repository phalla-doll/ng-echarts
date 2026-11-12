import { createRoot } from 'react-dom/client';
import { EChartsExampleBarChart } from './upstream/src/registry/examples/echarts/ex-echarts-bar-chart';
import { EChartsExampleBarChart as Stacked } from './upstream/src/registry/examples/echarts/ex-stacked-type-echarts-bar-chart';
import { EChartsExampleBarChart as Horizontal } from './upstream/src/registry/examples/echarts/ex-horizontal-layout-echarts-bar-chart';
import { EChartsExampleBarChart as Gradient } from './upstream/src/registry/examples/echarts/ex-gradient-variant-echarts-bar-chart';
import './reference.css';

const parameters = new URLSearchParams(location.search);
document.documentElement.classList.toggle('dark', parameters.get('theme') === 'dark');
const host = document.getElementById('reference')!;
host.style.width = `${Number(parameters.get('width') ?? 768)}px`;
host.style.height = '360px';
const Reference =
  { stacked: Stacked, horizontal: Horizontal, gradient: Gradient }[
    parameters.get('variant') ?? ''
  ] ?? EChartsExampleBarChart;
createRoot(host).render(<Reference />);
