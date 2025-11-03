import { Routes } from '@angular/router';
import { guardAutenticacion } from './core/guards/autenticacion.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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
    canActivate: [guardAutenticacion]
  },
  {
    path: 'pantallas',
    loadChildren: () => import('./modulos/pantallas/pantallas.routes').then(m => m.routes),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'contenidos',
    loadChildren: () => import('./modulos/contenidos/contenidos.routes').then(m => m.routes),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'reportes',
    loadChildren: () => import('./modulos/reportes/reportes.routes').then(m => m.routes),
    canActivate: [guardAutenticacion]
  },
  {
    path: 'mantenimiento',
    loadComponent: () => import('./modulos/mantenimiento/componentes/mantenimiento.component')
      .then(m => m.MantenimientoComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
