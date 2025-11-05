import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/landing.component')
      .then(m => m.LandingComponent)
  }
];
