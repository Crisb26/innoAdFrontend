import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'iniciar-sesion', pathMatch: 'full' },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./componentes/iniciar-sesion.component').then(m => m.IniciarSesionComponent)
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./componentes/registrarse.component').then(m => m.RegistrarseComponent)
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./componentes/recuperar-contrasena.component').then(m => m.RecuperarContrasenaComponent)
  },
  {
    path: 'verificar-email',
    loadComponent: () => import('./componentes/verificar-email.component').then(m => m.VerificarEmailComponent)
  }
];
