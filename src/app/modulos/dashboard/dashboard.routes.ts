import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard.component').then(m => m.DashboardComponent)
  }
];
