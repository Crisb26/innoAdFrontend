import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { SolicitudLogin } from '@core/modelos';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
   template: `
    <div class="contenedor-login">
      <div class="tarjeta-login">
        <div class="encabezado-login">
          <h1 class="titulo-login">InnoAd</h1>
          <p class="subtitulo-login">Sistema de Gestión de Publicidad Digital</p>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="iniciarSesion()" class="formulario-login">
          @if (mensajeError()) {
            <div class="alerta alerta-error">{{ mensajeError() }}</div>
          }

          <div class="grupo-input">
            <label for="nombreUsuarioOEmail">Email o Usuario</label>
            <input
              id="nombreUsuarioOEmail"
              type="text"
              formControlName="nombreUsuarioOEmail"
              class="input-innoad"
              placeholder="correo@ejemplo.com"
            />
            @if (formulario.get('nombreUsuarioOEmail')?.invalid && formulario.get('nombreUsuarioOEmail')?.touched) {
              <span class="texto-error">Este campo es requerido</span>
            }
          </div>

          <div class="grupo-input">
            <label for="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              formControlName="contrasena"
              class="input-innoad"
              placeholder="••••••••"
            />
            @if (formulario.get('contrasena')?.invalid && formulario.get('contrasena')?.touched) {
              <span class="texto-error">Este campo es requerido</span>
            }
          </div>

          <div class="grupo-checkbox">
            <input
              id="recordarme"
              type="checkbox"
              formControlName="recordarme"
            />
            <label for="recordarme">Recordarme</label>
          </div>

          <button
            type="submit"
            class="boton-innoad boton-login"
            [disabled]="formulario.invalid || cargando()"
          >
            @if (cargando()) {
              <span class="loader-pequeño"></span>
            } @else {
              Iniciar Sesión
            }
          </button>

          <div class="enlaces-adicionales">
            <a routerLink="/autenticacion/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
            <a routerLink="/autenticacion/registrarse">Crear cuenta nueva</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .contenedor-login {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    }

    .tarjeta-login {
      background: rgba(26, 31, 58, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem;
      width: 100%;
      max-width: 450px;
      border: 1px solid rgba(0, 217, 255, 0.2);
      box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
    }

    .encabezado-login {
      text-align: center;
      margin-bottom: 2rem;
    }

    .titulo-login {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitulo-login {
      color: #b4b8d0;
      font-size: 0.9rem;
    }

    .formulario-login {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .grupo-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .grupo-input label {
      color: #b4b8d0;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .grupo-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .grupo-checkbox label {
      color: #b4b8d0;
      font-size: 0.9rem;
    }

    .boton-login {
      margin-top: 1rem;
      width: 100%;
    }

    .enlaces-adicionales {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }

    .enlaces-adicionales a {
      color: #00d9ff;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .enlaces-adicionales a:hover {
      color: #ff006a;
    }

    .alerta {
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .alerta-error {
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid rgba(255, 68, 68, 0.3);
      color: #ff4444;
    }

    .texto-error {
      color: #ff4444;
      font-size: 0.8rem;
    }

    .loader-pequeño {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }

    @keyframes girar {
      to { transform: rotate(360deg); }
    }
  `]
})
export class IniciarSesionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly mensajeError = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    nombreUsuarioOEmail: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
    recordarme: [false]
  });

  iniciarSesion(): void {
    if (this.formulario.invalid) return;

    this.cargando.set(true);
    this.mensajeError.set('');

  const solicitud: SolicitudLogin = this.formulario.getRawValue();

    this.servicioAuth.iniciarSesion(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(error.message || 'Error al iniciar sesión');
      }
    });
  }
}
