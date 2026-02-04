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
  },
  {
    path: 'terminos-condiciones',
    loadComponent: () => import('./componentes/terminos-condiciones.component')
      .then(m => m.TerminosCondicionesComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./componentes/privacy-policy.component')
      .then(m => m.PrivacyPolicyComponent)
  }
];

