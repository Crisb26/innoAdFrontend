import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/publicar-contenido.component')
      .then(m => m.PublicarContenidoComponent)
  },
  // COMMENTED: seleccionar-ubicaciones component has CSS parsing errors
  // {
  //   path: 'seleccionar-ubicaciones',
  //   loadComponent: () => import('./componentes/seleccionar-ubicaciones.component')
  //     .then(m => m.SeleccionarUbicacionesComponent)
  // },
  // COMMENTED: publicacion-crear component has CSS parsing errors
  // {
  //   path: 'crear',
  //   loadComponent: () => import('./componentes/publicacion-crear.component')
  //     .then(m => m.PublicacionCrearComponent)
  // }
];
