import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/biblioteca-contenidos.component').then(m => m.BibliotecaContenidosComponent)
  }
];
