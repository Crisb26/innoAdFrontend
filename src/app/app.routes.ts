import { Routes } from '@angular/router';
import { guardAutenticacion } from './core/guards/autenticacion.guard';
import { guardPermisos } from './core/guards/permisos.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modulos/publica/publica.routes').then(m => m.routes)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./modulos/publica/publica.routes').then(m => m.routes)
  },
  {
    path: 'autenticacion',
    loadChildren: () => import('./modulos/autenticacion/autenticacion.routes').then(m => m.routes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modulos/dashboard/dashboard.routes').then(m => m.routes),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'campanas',
    loadChildren: () => import('./modulos/campanas/campanas.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, guardPermisos],
    data: { permisos: ['CAMPANAS_VER', 'CAMPANAS_CREAR'] }
  },
  {
    path: 'pantallas',
    loadChildren: () => import('./modulos/pantallas/pantallas.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, guardPermisos],
    data: { permisos: ['PANTALLAS_VER', 'PANTALLAS_ADMINISTRAR'] }
  },
  {
    path: 'contenidos',
    loadChildren: () => import('./modulos/contenidos/contenidos.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, guardPermisos],
    data: { permisos: ['CONTENIDOS_VER', 'CONTENIDOS_CREAR'] }
  },
  {
    path: 'reportes',
    loadChildren: () => import('./modulos/reportes/reportes.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, guardPermisos],
    data: { permisos: ['REPORTES_VER', 'ESTADISTICAS_VER'] }
  },
  {
    path: 'publicar',
    loadChildren: () => import('./modulos/publicacion/publicacion.routes').then(m => m.routes),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'player',
    loadChildren: () => import('./modulos/player/player.routes').then(m => m.routes)
  },
  {
    path: 'sin-permisos',
    loadComponent: () => import('./modulos/sin-permisos/componentes/sin-permisos.component')
      .then(m => m.SinPermisosComponent)
  },
  {
    path: 'mantenimiento',
    loadComponent: () => import('./modulos/mantenimiento/componentes/mantenimiento.component')
      .then(m => m.MantenimientoComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
