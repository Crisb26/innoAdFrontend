import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard-admin.component').then(m => m.DashboardAdminComponent)
  },
  {
    path: 'mantenimiento',
    loadComponent: () => import('./componentes/modo-mantenimiento/modo-mantenimiento.component').then(m => m.ModoMantenimientoComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('./componentes/logs-auditoria.component').then(m => m.LogsAuditoriaComponent)
  }
];