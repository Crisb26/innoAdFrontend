import { Routes } from '@angular/router';
import { RolGuard } from '../../core/guards/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./componentes/chat-lista.component').then(m => m.ChatListaComponent),
    canActivate: [RolGuard],
    data: { 
      rolesRequeridos: ['ADMINISTRADOR', 'TECNICO', 'USUARIO']
    }
  }
];