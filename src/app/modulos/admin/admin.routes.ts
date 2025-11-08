import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  }
];