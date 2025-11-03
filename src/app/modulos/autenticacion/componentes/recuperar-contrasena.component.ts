import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-recuperar">
      <div class="tarjeta-recuperar">
        <h2 class="titulo-seccion">Recuperar Contraseña</h2>
        <p>Formulario de recuperación en desarrollo...</p>
        <a routerLink="/autenticacion/iniciar-sesion" class="boton-innoad">Volver al Login</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-recuperar {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .tarjeta-recuperar {
      text-align: center;
    }
  `]
})
export class RecuperarContrasenaComponent {}
