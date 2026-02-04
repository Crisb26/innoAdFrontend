import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-permisos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./sin-permisos.component.scss'],
  template: `
    <div class="contenedor-sin-permisos">
      <div class="tarjeta-sin-permisos">
        <svg class="icono-error" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 class="titulo-error">Acceso Denegado</h2>
        <p class="mensaje-error">No tienes permisos para acceder a este módulo.</p>
        <p class="submensaje">Si crees que esto es un error, contacta al administrador.</p>
        <a routerLink="/dashboard" class="boton-innoad">Volver al Dashboard</a>
      </div>
    </div>
  `
})
export class SinPermisosComponent {}
