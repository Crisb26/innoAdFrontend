import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { ServicioAlerta } from '@core/servicios/alerta.servicio';
import { SolicitudLogin } from '@core/modelos';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./iniciar-sesion.component.scss'],
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
              autocomplete="current-password"
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
  `
})
export class IniciarSesionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly servicioAlerta = inject(ServicioAlerta);
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

    // Mostrar alerta de carga futurista
    this.servicioAlerta.cargando('Iniciando sesión', 'Verificando credenciales...');

    const solicitud: SolicitudLogin = this.formulario.getRawValue();

    this.servicioAuth.iniciarSesion(solicitud).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso, navegando a dashboard...', respuesta);
        this.cargando.set(false);
        
        // Cerrar alerta de carga y mostrar éxito
        this.servicioAlerta.cerrar();
        this.servicioAlerta.exito('Acceso Concedido', 'Bienvenido a InnoAd');
        
        // Navegar al dashboard después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']).then(navegado => {
            console.log('Navegación completada:', navegado);
          }).catch(error => {
            console.error('Error al navegar:', error);
            this.servicioAlerta.error('Error', 'No se pudo acceder al dashboard');
          });
        }, 1500);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.cargando.set(false);
        
        // Cerrar alerta de carga y mostrar error
        this.servicioAlerta.cerrar();
        const mensajeError = error.message || 'Credenciales inválidas';
        this.servicioAlerta.error('Error de Autenticación', mensajeError);
        this.mensajeError.set(mensajeError);
      }
    });
  }
}
