import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'iniciar-sesion', pathMatch: 'full' },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./componentes/iniciar-sesion.component').then(m => m.IniciarSesionComponent)
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./componentes/registro-con-codigo.component').then(m => m.RegistroConCodigoComponent)
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./componentes/recuperar-contrasena-codigo.component').then(m => m.RecuperarContraseñaCodigoComponent)
  },
  {
    path: 'verificar-email',
    loadComponent: () => import('./componentes/verificar-email.component').then(m => m.VerificarEmailComponent)
  }
];