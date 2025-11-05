import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/player.component')
      .then(m => m.PlayerComponent)
  }
];
