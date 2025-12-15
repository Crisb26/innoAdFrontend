import { Routes } from '@angular/router';
import { guardAutenticacion } from './core/guards/autenticacion.guard';
import { RolGuard } from './core/guards/rol.guard';

// Rutas de la aplicación InnoAd - Fase 4 completada
export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadChildren: () => import('./modulos/publica/publica.routes').then(m => m.routes)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./modulos/publica/publica.routes').then(m => m.routes)
  },
  {
    path: 'player',
    loadChildren: () => import('./modulos/player/player.routes').then(m => m.routes)
  },

  // Autenticación
  {
    path: 'autenticacion',
    loadChildren: () => import('./modulos/autenticacion/autenticacion.routes').then(m => m.routes)
  },

  // Rutas protegidas
  {
    path: 'dashboard',
    loadChildren: () => import('./modulos/dashboard/dashboard.routes').then(m => m.routes)
  },

  // Panel administrativo - ADMIN
  {
    path: 'admin',
    loadChildren: () => import('./modulos/admin/admin.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, RolGuard],
    data: { roles: ['ADMIN'] }
  },

  // Panel técnico - TECNICO
  {
    path: 'tecnico',
    loadChildren: () => import('./modulos/dashboard/dashboard.routes').then(m => m.routes)
  },

  // Panel desarrollador - DEVELOPER
  // COMMENTED: developer-dashboard component has CSS parsing errors
  // {
  //   path: 'developer',
  //   loadComponent: () => import('./modulos/dashboard/componentes/developer-dashboard.component')
  //     .then(m => m.DeveloperDashboardComponent)
  // },

  // Campañas
  {
    path: 'campanas',
    loadChildren: () => import('./modulos/campanas/campanas.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, RolGuard],
    data: { roles: ['ADMIN', 'TECNICO', 'DEVELOPER', 'USUARIO'] }
  },

  // Pantallas
  {
    path: 'pantallas',
    loadChildren: () => import('./modulos/pantallas/pantallas.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, RolGuard],
    data: { roles: ['ADMIN', 'TECNICO', 'DEVELOPER'] }
  },

  // Contenidos
  {
    path: 'contenidos',
    loadChildren: () => import('./modulos/contenidos/contenidos.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, RolGuard],
    data: { roles: ['ADMIN', 'TECNICO', 'DEVELOPER', 'USUARIO'] }
  },

  // Reportes
  {
    path: 'reportes',
    loadChildren: () => import('./modulos/reportes/reportes.routes').then(m => m.routes),
    canActivate: [guardAutenticacion, RolGuard],
    data: { roles: ['ADMIN', 'TECNICO', 'USUARIO'] }
  },

  // Publicación
  // {
  //   path: 'publicacion',
  //   loadChildren: () => import('./modulos/publicacion/publicacion.routes').then(m => m.routes),
  //   canActivate: [guardAutenticacion, RolGuard],
  //   data: { roles: ['USUARIO', 'ADMIN', 'TECNICO'] }
  // },

  // Usuario - USUARIO
  // {
  //   path: 'usuario',
  //   loadChildren: () => import('./modulos/dashboard/dashboard.routes').then(m => m.routes),
  //   canActivate: [guardAutenticacion, RolGuard],
  //   data: { roles: ['USUARIO'] }
  // },

  // Chat
  {
    path: 'chat',
    loadChildren: () => import('./modulos/chat/chat.routes').then(m => m.routes)
  },

  // IA
  {
    path: 'asistente-ia',
    loadChildren: () => import('./modulos/asistente-ia/asistente-ia.routes').then(m => m.routes)
  },

  // Usuario - USUARIO
  {
    path: 'usuario',
    loadChildren: () => import('./modulos/dashboard/dashboard.routes').then(m => m.routes)
  },

  // Publicación
  {
    path: 'publicacion',
    loadChildren: () => import('./modulos/publicacion/publicacion.routes').then(m => m.routes)
  },

  // Sin permisos
  {
    path: 'sin-permisos',
    loadComponent: () => import('./modulos/sin-permisos/componentes/sin-permisos.component')
      .then(m => m.SinPermisosComponent)
  },

  // Mantenimiento
  {
    path: 'mantenimiento',
    loadComponent: () => import('./modulos/pantallas/componentes/pagina-mantenimiento/pagina-mantenimiento.component')
      .then(m => m.PaginaMantenimientoComponent)
  },

  // Ruta por defecto
  { path: '**', redirectTo: 'inicio' }
];
