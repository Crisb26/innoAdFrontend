import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/dashboard.component').then(m => m.DashboardComponent)
  },
  // COMMENTED: graficos-analytics component has CSS parsing errors
  // {
  //   path: 'graficos',
  //   loadComponent: () => import('./componentes/graficos-analytics/graficos-analytics.component').then(m => m.GraficosAnalyticsComponent)
  // },
  // COMMENTED: usuario-dashboard component has CSS parsing errors
  // {
  //   path: 'usuario',
  //   loadComponent: () => import('./componentes/usuario-dashboard.component').then(m => m.UsuarioDashboardComponent)
  // }
];
