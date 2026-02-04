import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/lista-contenidos.component').then(m => m.ListaContenidosComponent)
  }
];
