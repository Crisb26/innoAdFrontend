import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard-reportes.component').then(m => m.DashboardReportesComponent)
  }
];
