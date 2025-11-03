import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-registro">
      <div class="tarjeta-registro">
        <h2 class="titulo-seccion">Crear Cuenta Nueva</h2>
        <p>Formulario de registro en desarrollo...</p>
        <a routerLink="/autenticacion/iniciar-sesion" class="boton-innoad">Volver al Login</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-registro {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .tarjeta-registro {
      text-align: center;
    }
  `]
})
export class RegistrarseComponent {}
