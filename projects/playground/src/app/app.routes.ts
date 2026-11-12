import { Routes } from '@angular/router';

export const routes: Routes = [
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
