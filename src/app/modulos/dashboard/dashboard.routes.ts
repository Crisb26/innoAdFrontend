import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'graficos',
    loadComponent: () => import('./componentes/graficos-analytics/graficos-analytics.component').then(m => m.GraficosAnalyticsComponent)
  },
  {
    path: 'usuario',
    loadComponent: () => import('./componentes/usuario-dashboard.component').then(m => m.UsuarioDashboardComponent)
  }
];
