import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { SolicitudRecuperarContrasena, SolicitudRestablecerContrasena } from '@core/modelos';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./recuperar-contrasena.component.scss'],
  template: `
    <div class="contenedor-recuperar">
      <div class="tarjeta-recuperar">
        @if (!modoRestablecer()) {
          <!-- Modo: Solicitar recuperación -->
          <div class="encabezado-recuperar">
            <svg class="icono-recuperar" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
            <h1 class="titulo-recuperar">Recuperar Contraseña</h1>
            <p class="subtitulo-recuperar">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form [formGroup]="formularioRecuperar" (ngSubmit)="solicitarRecuperacion()" class="formulario-recuperar">
            @if (mensajeError()) {
              <div class="alerta alerta-error">{{ mensajeError() }}</div>
            }

            @if (mensajeExito()) {
              <div class="alerta alerta-exito">
                <div class="icono-exito">✓</div>
                <div>
                  <strong>Correo enviado exitosamente</strong>
                  <p>Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.</p>
                </div>
              </div>
            }

            <div class="grupo-input">
              <label for="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-innoad"
                placeholder="correo@ejemplo.com"
              />
              @if (formularioRecuperar.get('email')?.invalid && formularioRecuperar.get('email')?.touched) {
                @if (formularioRecuperar.get('email')?.errors?.['required']) {
                  <span class="texto-error">El correo electrónico es requerido</span>
                }
                @if (formularioRecuperar.get('email')?.errors?.['email']) {
                  <span class="texto-error">Ingrese un correo electrónico válido</span>
                }
              }
            </div>

            <button
              type="submit"
              class="boton-innoad boton-recuperar"
              [disabled]="formularioRecuperar.invalid || cargando()"
            >
              @if (cargando()) {
                <span class="loader-pequeño"></span>
              } @else {
                Enviar Enlace de Recuperación
              }
            </button>

            <div class="enlace-login">
              <a routerLink="/autenticacion/iniciar-sesion">← Volver al inicio de sesión</a>
            </div>
          </form>
        } @else {
          <!-- Modo: Restablecer contraseña con token -->
          <div class="encabezado-recuperar">
            <svg class="icono-recuperar" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
            <h1 class="titulo-recuperar">Nueva Contraseña</h1>
            <p class="subtitulo-recuperar">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <form [formGroup]="formularioRestablecer" (ngSubmit)="restablecerContrasena()" class="formulario-recuperar">
            @if (mensajeError()) {
              <div class="alerta alerta-error">{{ mensajeError() }}</div>
            }

            @if (mensajeExito()) {
              <div class="alerta alerta-exito">
                <div class="icono-exito">✓</div>
                <div>
                  <strong>Contraseña restablecida exitosamente</strong>
                  <p>Ahora puedes iniciar sesión con tu nueva contraseña.</p>
                </div>
              </div>
            }

            <div class="grupo-input">
              <label for="contrasenaNueva">Nueva Contraseña</label>
              <input
                id="contrasenaNueva"
                type="password"
                formControlName="contrasenaNueva"
                class="input-innoad"
                placeholder="••••••••"
              />
              @if (formularioRestablecer.get('contrasenaNueva')?.invalid && formularioRestablecer.get('contrasenaNueva')?.touched) {
                @if (formularioRestablecer.get('contrasenaNueva')?.errors?.['required']) {
                  <span class="texto-error">La contraseña es requerida</span>
                }
                @if (formularioRestablecer.get('contrasenaNueva')?.errors?.['minlength']) {
                  <span class="texto-error">Mínimo 8 caracteres</span>
                }
              }
              @if (formularioRestablecer.get('contrasenaNueva')?.valid && formularioRestablecer.get('contrasenaNueva')?.value) {
                <span class="texto-exito">✓ Contraseña válida</span>
              }
            </div>

            <div class="grupo-input">
              <label for="confirmarContrasena">Confirmar Contraseña</label>
              <input
                id="confirmarContrasena"
                type="password"
                formControlName="confirmarContrasena"
                class="input-innoad"
                placeholder="••••••••"
              />
              @if (formularioRestablecer.get('confirmarContrasena')?.invalid && formularioRestablecer.get('confirmarContrasena')?.touched) {
                @if (formularioRestablecer.get('confirmarContrasena')?.errors?.['required']) {
                  <span class="texto-error">Debe confirmar la contraseña</span>
                }
              }
              @if (formularioRestablecer.errors?.['contrasenasNoCoinciden'] && formularioRestablecer.get('confirmarContrasena')?.touched) {
                <span class="texto-error">Las contraseñas no coinciden</span>
              }
              @if (formularioRestablecer.get('confirmarContrasena')?.valid && !formularioRestablecer.errors?.['contrasenasNoCoinciden'] && formularioRestablecer.get('confirmarContrasena')?.value) {
                <span class="texto-exito">✓ Las contraseñas coinciden</span>
              }
            </div>

            <button
              type="submit"
              class="boton-innoad boton-recuperar"
              [disabled]="formularioRestablecer.invalid || cargando()"
            >
              @if (cargando()) {
                <span class="loader-pequeño"></span>
              } @else {
                Restablecer Contraseña
              }
            </button>

            <div class="enlace-login">
              <a routerLink="/autenticacion/iniciar-sesion">← Volver al inicio de sesión</a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class RecuperarContrasenaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly cargando = signal(false);
  protected readonly mensajeError = signal('');
  protected readonly mensajeExito = signal('');
  protected readonly modoRestablecer = signal(false);
  private tokenRecuperacion = signal<string | null>(null);

  protected readonly formularioRecuperar = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly formularioRestablecer = this.fb.nonNullable.group({
    contrasenaNueva: ['', [Validators.required, Validators.minLength(8)]],
    confirmarContrasena: ['', [Validators.required]]
  }, {
    validators: this.validadorContrasenasCoinciden.bind(this)
  });

  constructor() {
    // Verificar si hay un token en la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.modoRestablecer.set(true);
        this.tokenRecuperacion.set(token);
      }
    });
  }

  private validadorContrasenasCoinciden(control: any): { [key: string]: boolean } | null {
    const contrasena = control.get('contrasenaNueva')?.value;
    const confirmar = control.get('confirmarContrasena')?.value;

    if (!contrasena || !confirmar) return null;

    return contrasena === confirmar ? null : { contrasenasNoCoinciden: true };
  }

  solicitarRecuperacion(): void {
    if (this.formularioRecuperar.invalid) {
      this.formularioRecuperar.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const solicitud: SolicitudRecuperarContrasena = {
      email: this.formularioRecuperar.value.email!
    };

    this.servicioAuth.recuperarContrasena(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mensajeExito.set('Correo enviado');
        this.formularioRecuperar.reset();
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(error.message || 'Error al enviar el correo de recuperación. Por favor, intente nuevamente.');
      }
    });
  }

  restablecerContrasena(): void {
    if (this.formularioRestablecer.invalid) {
      this.formularioRestablecer.markAllAsTouched();
      return;
    }

    const token = this.tokenRecuperacion();
    if (!token) {
      this.mensajeError.set('Token de recuperación no válido');
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const valores = this.formularioRestablecer.getRawValue();
    const solicitud: SolicitudRestablecerContrasena = {
      token: token,
      contrasenaNueva: valores.contrasenaNueva,
      confirmarContrasena: valores.confirmarContrasena
    };

    this.servicioAuth.restablecerContrasena(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mensajeExito.set('Contraseña restablecida');
        setTimeout(() => {
          this.router.navigate(['/autenticacion/iniciar-sesion']);
        }, 3000);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(error.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
      }
    });
  }
}
