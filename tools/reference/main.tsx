import { createRoot } from 'react-dom/client';
import { EChartsExampleBarChart } from './upstream/src/registry/examples/echarts/ex-echarts-bar-chart';
import './reference.css';

const parameters = new URLSearchParams(location.search);
document.documentElement.classList.toggle('dark', parameters.get('theme') === 'dark');
const host = document.getElementById('reference')!;
host.style.width = `${Number(parameters.get('width') ?? 768)}px`;
host.style.height = '360px';
createRoot(host).render(<EChartsExampleBarChart />);
