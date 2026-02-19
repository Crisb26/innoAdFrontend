import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./panel-tecnico.component').then(m => m.PanelTecnicoComponent)
  }
];
