import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/lista-pantallas.component').then(m => m.ListaPantallasComponent)
  }
];
