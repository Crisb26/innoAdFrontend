import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/publicar-contenido.component')
      .then(m => m.PublicarContenidoComponent)
  }
];
