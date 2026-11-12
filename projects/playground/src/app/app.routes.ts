import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
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
