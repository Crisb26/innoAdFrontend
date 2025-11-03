import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-permisos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-sin-permisos">
      <div class="tarjeta-sin-permisos">
        <h1 class="icono-error">&#x1F512;</h1>
        <h2 class="titulo-error">Acceso Denegado</h2>
        <p class="mensaje-error">No tienes permisos para acceder a este módulo.</p>
        <p class="submensaje">Si crees que esto es un error, contacta al administrador.</p>
        <a routerLink="/dashboard" class="boton-innoad">Volver al Dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-sin-permisos {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .tarjeta-sin-permisos {
      text-align: center;
      max-width: 500px;
    }

    .icono-error {
      font-size: 5rem;
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.5));
    }

    .titulo-error {
      font-size: 2.5rem;
      color: var(--color-error);
      margin-bottom: 1rem;
    }

    .mensaje-error {
      font-size: 1.2rem;
      color: var(--color-texto-claro);
      margin-bottom: 0.5rem;
    }

    .submensaje {
      color: var(--color-texto-gris);
      margin-bottom: 2rem;
    }

    .boton-innoad {
      display: inline-block;
      margin-top: 1rem;
    }
  `]
})
export class SinPermisosComponent {}
