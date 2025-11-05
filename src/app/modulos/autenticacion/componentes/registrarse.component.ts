import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { SolicitudRegistro } from '@core/modelos';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="contenedor-registro">
      <div class="tarjeta-registro">
        <div class="encabezado-registro">
          <h1 class="titulo-registro">Crear Cuenta</h1>
          <p class="subtitulo-registro">Únete a InnoAd y comienza a gestionar tu publicidad digital</p>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="registrarse()" class="formulario-registro">
          @if (mensajeError()) {
            <div class="alerta alerta-error">{{ mensajeError() }}</div>
          }

          @if (mensajeExito()) {
            <div class="alerta alerta-exito">{{ mensajeExito() }}</div>
          }

          <div class="grupo-input">
            <label for="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              formControlName="nombre"
              class="input-innoad"
              placeholder="Juan"
            />
            @if (formulario.get('nombre')?.invalid && formulario.get('nombre')?.touched) {
              <span class="texto-error">El nombre es requerido (mínimo 2 caracteres)</span>
            }
          </div>

          <div class="grupo-input">
            <label for="apellido">Apellido *</label>
            <input
              id="apellido"
              type="text"
              formControlName="apellido"
              class="input-innoad"
              placeholder="Pérez"
            />
            @if (formulario.get('apellido')?.invalid && formulario.get('apellido')?.touched) {
              <span class="texto-error">El apellido es requerido (mínimo 2 caracteres)</span>
            }
          </div>

          <div class="grupo-input">
            <label for="nombreUsuario">Nombre de Usuario *</label>
            <input
              id="nombreUsuario"
              type="text"
              formControlName="nombreUsuario"
              class="input-innoad"
              placeholder="juanperez"
            />
            @if (formulario.get('nombreUsuario')?.invalid && formulario.get('nombreUsuario')?.touched) {
              @if (formulario.get('nombreUsuario')?.errors?.['required']) {
                <span class="texto-error">El nombre de usuario es requerido</span>
              }
              @if (formulario.get('nombreUsuario')?.errors?.['minlength']) {
                <span class="texto-error">Mínimo 4 caracteres</span>
              }
              @if (formulario.get('nombreUsuario')?.errors?.['pattern']) {
                <span class="texto-error">Solo letras, números y guiones bajos</span>
              }
            }
          </div>

          <div class="grupo-input">
            <label for="email">Correo Electrónico *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="input-innoad"
              placeholder="correo@ejemplo.com"
            />
            @if (formulario.get('email')?.invalid && formulario.get('email')?.touched) {
              @if (formulario.get('email')?.errors?.['required']) {
                <span class="texto-error">El correo electrónico es requerido</span>
              }
              @if (formulario.get('email')?.errors?.['email']) {
                <span class="texto-error">Ingrese un correo electrónico válido</span>
              }
            }
          </div>

          <div class="grupo-input">
            <label for="telefono">Teléfono (opcional)</label>
            <input
              id="telefono"
              type="tel"
              formControlName="telefono"
              class="input-innoad"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div class="grupo-input">
            <label for="contrasena">Contraseña *</label>
            <input
              id="contrasena"
              type="password"
              formControlName="contrasena"
              class="input-innoad"
              placeholder="••••••••"
            />
            @if (formulario.get('contrasena')?.invalid && formulario.get('contrasena')?.touched) {
              @if (formulario.get('contrasena')?.errors?.['required']) {
                <span class="texto-error">La contraseña es requerida</span>
              }
              @if (formulario.get('contrasena')?.errors?.['minlength']) {
                <span class="texto-error">Mínimo 8 caracteres</span>
              }
              @if (formulario.get('contrasena')?.errors?.['patronContrasena']) {
                <span class="texto-error">Debe incluir mayúscula, minúscula, número y carácter especial</span>
              }
            }
            @if (formulario.get('contrasena')?.valid && formulario.get('contrasena')?.value) {
              <span class="texto-exito">✓ Contraseña segura</span>
            }
          </div>

          <div class="grupo-input">
            <label for="confirmarContrasena">Confirmar Contraseña *</label>
            <input
              id="confirmarContrasena"
              type="password"
              formControlName="confirmarContrasena"
              class="input-innoad"
              placeholder="••••••••"
            />
            @if (formulario.get('confirmarContrasena')?.invalid && formulario.get('confirmarContrasena')?.touched) {
              @if (formulario.get('confirmarContrasena')?.errors?.['required']) {
                <span class="texto-error">Debe confirmar la contraseña</span>
              }
            }
            @if (formulario.errors?.['contrasenasNoCoinciden'] && formulario.get('confirmarContrasena')?.touched) {
              <span class="texto-error">Las contraseñas no coinciden</span>
            }
            @if (formulario.get('confirmarContrasena')?.valid && !formulario.errors?.['contrasenasNoCoinciden'] && formulario.get('confirmarContrasena')?.value) {
              <span class="texto-exito">✓ Las contraseñas coinciden</span>
            }
          </div>

          <div class="grupo-checkbox">
            <input
              id="aceptaTerminos"
              type="checkbox"
              formControlName="aceptaTerminos"
            />
            <label for="aceptaTerminos">
              Acepto los <a href="#" class="enlace-terminos">Términos y Condiciones</a> y la
              <a href="#" class="enlace-terminos">Política de Privacidad</a>
            </label>
          </div>
          @if (formulario.get('aceptaTerminos')?.invalid && formulario.get('aceptaTerminos')?.touched) {
            <span class="texto-error">Debe aceptar los términos y condiciones</span>
          }

          <button
            type="submit"
            class="boton-innoad boton-registro"
            [disabled]="formulario.invalid || cargando()"
          >
            @if (cargando()) {
              <span class="loader-pequeño"></span>
            } @else {
              Crear Cuenta
            }
          </button>

          <div class="enlace-login">
            ¿Ya tienes una cuenta?
            <a routerLink="/autenticacion/iniciar-sesion">Iniciar Sesión</a>
          </div>
        </form>
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
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    }

    .tarjeta-registro {
      background: rgba(26, 31, 58, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem;
      width: 100%;
      max-width: 550px;
      border: 1px solid rgba(0, 217, 255, 0.2);
      box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
      max-height: 90vh;
      overflow-y: auto;
    }

    .encabezado-registro {
      text-align: center;
      margin-bottom: 2rem;
    }

    .titulo-registro {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .subtitulo-registro {
      color: #b4b8d0;
      font-size: 0.9rem;
    }

    .formulario-registro {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
      align-items: flex-start;
      gap: 0.5rem;
    }

    .grupo-checkbox input[type="checkbox"] {
      margin-top: 0.25rem;
    }

    .grupo-checkbox label {
      color: #b4b8d0;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .enlace-terminos {
      color: #00d9ff;
      text-decoration: none;
    }

    .enlace-terminos:hover {
      text-decoration: underline;
    }

    .boton-registro {
      margin-top: 0.5rem;
      width: 100%;
    }

    .enlace-login {
      text-align: center;
      color: #b4b8d0;
      font-size: 0.9rem;
    }

    .enlace-login a {
      color: #00d9ff;
      text-decoration: none;
      font-weight: 600;
    }

    .enlace-login a:hover {
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

    .alerta-exito {
      background: rgba(0, 217, 117, 0.1);
      border: 1px solid rgba(0, 217, 117, 0.3);
      color: #00d975;
    }

    .texto-error {
      color: #ff4444;
      font-size: 0.8rem;
    }

    .texto-exito {
      color: #00d975;
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

    /* Scrollbar personalizado */
    .tarjeta-registro::-webkit-scrollbar {
      width: 8px;
    }

    .tarjeta-registro::-webkit-scrollbar-track {
      background: rgba(26, 31, 58, 0.5);
      border-radius: 10px;
    }

    .tarjeta-registro::-webkit-scrollbar-thumb {
      background: rgba(0, 217, 255, 0.3);
      border-radius: 10px;
    }

    .tarjeta-registro::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 217, 255, 0.5);
    }

    @media (max-width: 768px) {
      .contenedor-registro {
        padding: 1rem;
      }

      .tarjeta-registro {
        padding: 2rem 1.5rem;
      }

      .titulo-registro {
        font-size: 2rem;
      }
    }
  `]
})
export class RegistrarseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);

  protected readonly cargando = signal(false);
  protected readonly mensajeError = signal('');
  protected readonly mensajeExito = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    nombreUsuario: ['', [
      Validators.required,
      Validators.minLength(4),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      this.validadorContrasena
    ]],
    confirmarContrasena: ['', [Validators.required]],
    aceptaTerminos: [false, [Validators.requiredTrue]]
  }, {
    validators: this.validadorContrasenasCoinciden
  });

  private validadorContrasena(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;

    // Al menos una mayúscula, una minúscula, un número y un carácter especial
    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneMinuscula = /[a-z]/.test(valor);
    const tieneNumero = /[0-9]/.test(valor);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(valor);

    const esValida = tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;

    return esValida ? null : { patronContrasena: true };
  }

  private validadorContrasenasCoinciden(control: AbstractControl): ValidationErrors | null {
    const contrasena = control.get('contrasena')?.value;
    const confirmar = control.get('confirmarContrasena')?.value;

    if (!contrasena || !confirmar) return null;

    return contrasena === confirmar ? null : { contrasenasNoCoinciden: true };
  }

  registrarse(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const valores = this.formulario.getRawValue();
    const solicitud: SolicitudRegistro = {
      nombre: valores.nombre,
      apellido: valores.apellido,
      nombreUsuario: valores.nombreUsuario,
      email: valores.email,
      contrasena: valores.contrasena,
      telefono: valores.telefono || undefined
    };

    this.servicioAuth.registrarse(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        this.mensajeExito.set(
          '¡Cuenta creada exitosamente! ' +
          'Te hemos enviado un correo electrónico de verificación. ' +
          'Por favor, revisa tu bandeja de entrada (y la carpeta de spam) ' +
          'y haz clic en el enlace para activar tu cuenta.'
        );
        // NO redirigir automáticamente - el usuario debe verificar su email primero
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(error.message || 'Error al crear la cuenta. Por favor, intente nuevamente.');
      }
    });
  }
}
