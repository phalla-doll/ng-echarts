import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'composed-benchmark',
    data: { family: 'composed' },
    loadComponent: () => import('./benchmark').then((m) => m.Benchmark),
  },
  {
    path: 'composed',
    data: { family: 'composed' },
    loadComponent: () => import('./gallery').then((m) => m.Gallery),
  },
  {
    path: 'composed-validation',
    loadComponent: () => import('./composed-validation').then((m) => m.ComposedValidation),
  },
  {
    path: 'pie',
    data: { family: 'pie' },
    loadComponent: () => import('./gallery').then((m) => m.Gallery),
  },
  {
    path: 'pie-validation',
    loadComponent: () => import('./pie-validation').then((m) => m.PieValidation),
  },
  {
    path: 'pie-comparison',
    loadComponent: () => import('./pie-comparison').then((m) => m.PieComparison),
  },
  {
    path: 'pie-benchmark',
    data: { family: 'pie' },
    loadComponent: () => import('./benchmark').then((m) => m.Benchmark),
  },
  {
    path: 'area',
    data: { family: 'area' },
    loadComponent: () => import('./gallery').then((module) => module.Gallery),
  },
  {
    path: 'area-validation',
    loadComponent: () => import('./area-validation').then((module) => module.AreaValidation),
  },
  {
    path: 'area-comparison',
    loadComponent: () => import('./area-comparison').then((module) => module.AreaComparison),
  },
  {
    path: 'area-benchmark',
    data: { family: 'area' },
    loadComponent: () => import('./benchmark').then((module) => module.Benchmark),
  },
  {
    path: 'line-comparison',
    loadComponent: () => import('./line-comparison').then((module) => module.LineComparison),
  },
  {
    path: 'line-benchmark',
    data: { family: 'line' },
    loadComponent: () => import('./benchmark').then((module) => module.Benchmark),
  },
  {
    path: 'line',
    data: { family: 'line' },
    loadComponent: () => import('./gallery').then((module) => module.Gallery),
  },
  {
    path: 'line-validation',
    loadComponent: () => import('./line-validation').then((module) => module.LineValidation),
  },
  {
    path: 'get-started',
    data: { page: 'get-started' },
    loadComponent: () => import('./documentation').then((module) => module.Documentation),
  },
  {
    path: 'installation',
    data: { page: 'installation' },
    loadComponent: () => import('./documentation').then((module) => module.Documentation),
  },
  {
    path: 'components',
    data: { page: 'components' },
    loadComponent: () => import('./documentation').then((module) => module.Documentation),
  },
  {
    path: 'formatting',
    loadComponent: () => import('./formatting').then((module) => module.Formatting),
  },
  {
    path: 'retention',
    loadComponent: () => import('./retention').then((module) => module.Retention),
  },
  {
    path: 'benchmark',
    loadComponent: () => import('./benchmark').then((module) => module.Benchmark),
  },
  { path: 'updates', loadComponent: () => import('./updates').then((module) => module.Updates) },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./gallery').then((module) => module.Gallery),
  },
  {
    path: 'playground',
    loadComponent: () => import('./app').then((module) => module.App),
  },
  {
    path: 'comparison',
    loadComponent: () => import('./comparison').then((module) => module.Comparison),
  },
  {
    path: 'validation',
    loadComponent: () => import('./validation').then((module) => module.Validation),
  },
  { path: 'away', loadComponent: () => import('./away').then((module) => module.Away) },
];
