import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { SolicitudLogin } from '@core/modelos';
import { HttpClient } from '@angular/common/http';
import NotifyX from 'notifyx';

interface TutorialPaso {
  paso: number;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./iniciar-sesion.component.scss'],
  template: `
    <div class="contenedor-login">
      <!-- Tutorial Modal -->
      <div class="tutorial-modal" *ngIf="mostrarTutorial()" [@slideIn]>
        <div class="tutorial-contenido">
          <button class="cerrar-tutorial" (click)="cerrarTutorial()">x</button>

          <h2>Guia Rapida</h2>

          <div class="tutorial-pasos">
            <div class="paso">
              <h3>Credenciales de Prueba</h3>
              <p>Usa estas cuentas para empezar:</p>
              <div class="credenciales">
                <div class="cred-item">
                  <strong>Admin</strong><br/>
                  Usuario: <code>admin</code><br/>
                  Contrasena: <code>admin</code>
                </div>
                <div class="cred-item">
                  <strong>Tecnico</strong><br/>
                  Usuario: <code>tecnico</code><br/>
                  Contrasena: <code>tecnico</code>
                </div>
                <div class="cred-item">
                  <strong>Usuario</strong><br/>
                  Usuario: <code>usuario</code><br/>
                  Contrasena: <code>usuario</code>
                </div>
              </div>
            </div>

            <div class="paso">
              <h3>Navegacion Rapida</h3>
              <ul>
                <li><strong>Dashboard:</strong> Panel de control principal</li>
                <li><strong>Campanas:</strong> Gestiona tus campanas publicitarias</li>
                <li><strong>Contenido:</strong> Sube y organiza archivos multimedia</li>
                <li><strong>Pantallas:</strong> Controla tus dispositivos IoT</li>
                <li><strong>Reportes:</strong> Analiza metricas y datos</li>
              </ul>
            </div>

            <div class="paso">
              <h3>Consejos Utiles</h3>
              <ul>
                <li>Si la contrasena es incorrecta, permaneceras en la pantalla de login</li>
                <li>Puedes ver este tutorial en cualquier momento</li>
                <li>Todos los cambios se guardan automaticamente</li>
                <li>Hace clic en ? en cualquier pantalla para ayuda</li>
              </ul>
            </div>
          </div>

          <button class="boton-innoad boton-iniciar" (click)="cerrarTutorial()">
            Entendido, Iniciar
          </button>
        </div>
      </div>

      <!-- Login Form -->
      <div class="tarjeta-login">
        <div class="encabezado-login">
          <h1 class="titulo-login">InnoAd</h1>
          <p class="subtitulo-login">Sistema de Gestion de Publicidad Digital</p>
          <button class="btn-tutorial" (click)="mostrarTutorial.set(true)" title="Ver guia de usuario">
            Guia
          </button>
        </div>

        <!-- Mensajes de Error -->
        <div *ngIf="mensajeError()" class="alerta-error" [@slideDown]>
          <span class="icono-error">!</span>
          <span class="texto-alerta">{{ mensajeError() }}</span>
          <button class="btn-cerrar-alerta" (click)="mensajeError.set(null)">x</button>
        </div>

        <!-- Mensajes de Exito -->
        <div *ngIf="mensajeExito()" class="alerta-exito" [@slideDown]>
          <span class="icono-exito">OK</span>
          <span class="texto-alerta">{{ mensajeExito() }}</span>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="iniciarSesion()" class="formulario-login">
          <div class="grupo-input">
            <label for="nombreUsuarioOEmail">Email o Usuario</label>
            <input
              id="nombreUsuarioOEmail"
              type="text"
              formControlName="nombreUsuarioOEmail"
              class="input-innoad"
              placeholder="correo@ejemplo.com"
              (blur)="formulario.get('nombreUsuarioOEmail')?.markAsTouched()"
            />
            @if (formulario.get('nombreUsuarioOEmail')?.invalid && formulario.get('nombreUsuarioOEmail')?.touched) {
              <span class="texto-error">Este campo es requerido</span>
            }
          </div>

          <div class="grupo-input">
            <label for="contrasena">Contrasena</label>
            <input
              id="contrasena"
              type="password"
              formControlName="contrasena"
              class="input-innoad"
              placeholder="********"
              autocomplete="current-password"
              (blur)="formulario.get('contrasena')?.markAsTouched()"
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
              <span class="loader-pequeno"></span>
            } @else {
              Iniciar Sesion
            }
          </button>

          <div class="enlaces-adicionales">
            <a routerLink="/autenticacion/recuperar-contrasena">Olvidaste tu contrasena?</a>
            <a routerLink="/autenticacion/registrarse">Crear cuenta nueva</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class IniciarSesionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly cargando = signal(false);
  protected readonly mostrarTutorial = signal(false);
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombreUsuarioOEmail: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
    recordarme: [false]
  });

  cerrarTutorial(): void {
    this.mostrarTutorial.set(false);
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) return;

    this.cargando.set(true);
    this.mensajeError.set(null);

    const solicitud: SolicitudLogin = this.formulario.getRawValue();

    this.servicioAuth.iniciarSesion(solicitud).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso', respuesta);
        this.cargando.set(false);
        this.mensajeExito.set('Bienvenido! Navegando al dashboard...');

        setTimeout(() => {
          this.router.navigate(['/dashboard']).catch(error => {
            console.error('Error al navegar:', error);
            this.mensajeError.set('Error al acceder al dashboard');
          });
        }, 500);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.cargando.set(false);

        const mensajeError = this.detectarTipoError(error);
        this.mensajeError.set(mensajeError);
      }
    });
  }

  /**
   * Detecta el tipo de error y retorna un mensaje especifico
   */
  private detectarTipoError(error: any): string {
    console.log('Error detectado:', error.status);

    if (!error.status || error.status === 0) {
      if (error.name === 'TimeoutError') {
        return 'Conexion agotada. Intenta nuevamente.';
      }
      return 'No hay conexion con el servidor. Verifica tu conexion a internet.';
    }

    if (error.status === 401) {
      return 'Usuario o contrasena incorrectos.';
    }

    if (error.status === 403) {
      return 'Tu cuenta esta desactivada.';
    }

    if (error.status === 404) {
      return 'Usuario no encontrado.';
    }

    if (error.status === 429) {
      return 'Demasiados intentos. Intenta mas tarde.';
    }

    if (error.status && error.status >= 500) {
      return 'Error del servidor. Intenta mas tarde.';
    }

    return 'Error al iniciar sesion.';
  }
}
