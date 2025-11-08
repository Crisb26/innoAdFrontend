import { Routes } from '@angular/router';

export const ASISTENTE_IA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/asistente-ia.component').then(m => m.AsistenteIAComponent)
  }
];