import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/landing.component')
      .then(m => m.LandingComponent)
  },
  {
    path: 'mantenimiento',
    loadComponent: () => import('./componentes/mantenimiento-login.component')
      .then(m => m.MantenimientoLoginComponent)
  }
];
