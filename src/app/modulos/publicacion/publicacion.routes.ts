import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/publicar-contenido.component')
      .then(m => m.PublicarContenidoComponent)
  },
  {
    path: 'seleccionar-ubicaciones',
    loadComponent: () => import('./componentes/seleccionar-ubicaciones.component')
      .then(m => m.SeleccionarUbicacionesComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./componentes/publicacion-crear.component')
      .then(m => m.PublicacionCrearComponent)
  }
];
