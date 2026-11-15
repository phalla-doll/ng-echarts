import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sankey',
    loadComponent: () => import('./gallery/sankey/sankey-blocks').then((m) => m.SankeyBlocks),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./gallery/calendar/calendar-blocks').then((m) => m.CalendarBlocks),
  },
  {
    path: 'radial',
    loadComponent: () => import('./gallery/radial/radial-blocks').then((m) => m.RadialBlocks),
  },
  {
    path: 'radar',
    loadComponent: () => import('./gallery/radar/radar-blocks').then((m) => m.RadarBlocks),
  },
  {
    path: 'chart-possibilities',
    loadComponent: () =>
      import('./chart-possibilities/chart-possibilities').then((m) => m.ChartPossibilities),
  },
  {
    path: 'linked-dashboard',
    loadComponent: () => import('./linked/linked-dashboard').then((m) => m.LinkedDashboard),
  },
  {
    path: 'linked',
    loadComponent: () => import('./linked/linked-charts').then((m) => m.LinkedCharts),
  },
  {
    path: 'linked-validation',
    loadComponent: () => import('./validation/linked-validation').then((m) => m.LinkedValidation),
  },
  {
    path: 'composed-benchmark',
    data: { family: 'composed' },
    loadComponent: () => import('./validation/benchmark').then((m) => m.Benchmark),
  },
  {
    path: 'composed',
    data: { family: 'composed' },
    loadComponent: () => import('./gallery/gallery').then((m) => m.Gallery),
  },
  {
    path: 'composed-validation',
    loadComponent: () =>
      import('./validation/composed-validation').then((m) => m.ComposedValidation),
  },
  {
    path: 'pie',
    data: { family: 'pie' },
    loadComponent: () => import('./gallery/gallery').then((m) => m.Gallery),
  },
  {
    path: 'pie-validation',
    loadComponent: () => import('./validation/pie-validation').then((m) => m.PieValidation),
  },
  {
    path: 'pie-comparison',
    loadComponent: () => import('./comparison/pie-comparison').then((m) => m.PieComparison),
  },
  {
    path: 'pie-benchmark',
    data: { family: 'pie' },
    loadComponent: () => import('./validation/benchmark').then((m) => m.Benchmark),
  },
  {
    path: 'area',
    data: { family: 'area' },
    loadComponent: () => import('./gallery/gallery').then((module) => module.Gallery),
  },
  {
    path: 'area-validation',
    loadComponent: () =>
      import('./validation/area-validation').then((module) => module.AreaValidation),
  },
  {
    path: 'area-comparison',
    loadComponent: () =>
      import('./comparison/area-comparison').then((module) => module.AreaComparison),
  },
  {
    path: 'area-benchmark',
    data: { family: 'area' },
    loadComponent: () => import('./validation/benchmark').then((module) => module.Benchmark),
  },
  {
    path: 'line-comparison',
    loadComponent: () =>
      import('./comparison/line-comparison').then((module) => module.LineComparison),
  },
  {
    path: 'line-benchmark',
    data: { family: 'line' },
    loadComponent: () => import('./validation/benchmark').then((module) => module.Benchmark),
  },
  {
    path: 'line',
    data: { family: 'line' },
    loadComponent: () => import('./gallery/gallery').then((module) => module.Gallery),
  },
  {
    path: 'line-validation',
    loadComponent: () =>
      import('./validation/line-validation').then((module) => module.LineValidation),
  },
  {
    path: 'get-started',
    data: { page: 'get-started' },
    loadComponent: () =>
      import('./documentation/documentation').then((module) => module.Documentation),
  },
  {
    path: 'installation',
    data: { page: 'installation' },
    loadComponent: () =>
      import('./documentation/documentation').then((module) => module.Documentation),
  },
  {
    path: 'components',
    data: { page: 'components' },
    loadComponent: () =>
      import('./documentation/documentation').then((module) => module.Documentation),
  },
  {
    path: 'formatting',
    loadComponent: () => import('./validation/formatting').then((module) => module.Formatting),
  },
  {
    path: 'retention',
    loadComponent: () => import('./validation/retention').then((module) => module.Retention),
  },
  {
    path: 'benchmark',
    loadComponent: () => import('./validation/benchmark').then((module) => module.Benchmark),
  },
  {
    path: 'updates',
    loadComponent: () => import('./validation/updates').then((module) => module.Updates),
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./gallery/gallery').then((module) => module.Gallery),
  },
  {
    path: 'playground',
    loadComponent: () => import('./validation/app').then((module) => module.App),
  },
  {
    path: 'comparison',
    loadComponent: () => import('./comparison/comparison').then((module) => module.Comparison),
  },
  {
    path: 'validation',
    loadComponent: () => import('./validation/validation').then((module) => module.Validation),
  },
  { path: 'away', loadComponent: () => import('./validation/away').then((module) => module.Away) },
];
