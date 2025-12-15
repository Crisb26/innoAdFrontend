import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/asistente-ia.component').then(m => m.AsistenteIAComponent)
  }
];