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
  styleUrls: ['./registrarse.component.scss'],
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
            <label for="cedula">Cédula / Documento de Identidad *</label>
            <input
              id="cedula"
              type="text"
              formControlName="cedula"
              class="input-innoad"
              placeholder="1234567890"
            />
            @if (formulario.get('cedula')?.invalid && formulario.get('cedula')?.touched) {
              @if (formulario.get('cedula')?.errors?.['required']) {
                <span class="texto-error">La cédula es requerida</span>
              }
              @if (formulario.get('cedula')?.errors?.['pattern']) {
                <span class="texto-error">Solo números, mínimo 5 dígitos</span>
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
  `
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
    cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{5,20}$/)]],
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
      cedula: valores.cedula,
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
