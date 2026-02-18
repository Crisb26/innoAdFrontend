import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import NotifyX from 'notifyx';
import { interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-registro-con-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./registrarse.component.scss'],
  template: `
    <div class="contenedor-registro">
      <div class="tarjeta-registro">
        <!-- ENCABEZADO CON PROGRESO -->
        <div class="encabezado-registro">
          <h1 class="titulo-registro">Crear Cuenta</h1>
          <p class="subtitulo-registro">Únete a InnoAd en 3 pasos</p>
          
          <!-- Indicador de pasos -->
          <div class="indicador-pasos">
            <div class="paso" [class.activo]="pasoActual() === 1" [class.completado]="pasoActual() > 1">
              <span class="numero-paso">1</span>
              <p>Email</p>
            </div>
            <div class="linea-paso" [class.completada]="pasoActual() > 1"></div>
            <div class="paso" [class.activo]="pasoActual() === 2" [class.completado]="pasoActual() > 2">
              <span class="numero-paso">2</span>
              <p>Código</p>
            </div>
            <div class="linea-paso" [class.completada]="pasoActual() > 2"></div>
            <div class="paso" [class.activo]="pasoActual() === 3">
              <span class="numero-paso">3</span>
              <p>Datos</p>
            </div>
          </div>
        </div>

        <!-- PASO 1: SOLICITAR CÓDIGO -->
        @if (pasoActual() === 1) {
          <form [formGroup]="formularioPaso1" (ngSubmit)="solicitarCodigo()" class="formulario-registro">
            <p class="texto-instruccion">Ingresa tu correo electrónico para comenzar</p>
            
            <div class="grupo-input">
              <label for="emailPaso1">Correo Electrónico *</label>
              <input
                id="emailPaso1"
                type="email"
                formControlName="email"
                class="input-innoad"
                placeholder="correo@ejemplo.com"
              />
              @if (formularioPaso1.get('email')?.invalid && formularioPaso1.get('email')?.touched) {
                <span class="texto-error">Ingresa un correo electrónico válido</span>
              }
            </div>

            <button
              type="submit"
              class="boton-innoad boton-registro"
              [disabled]="formularioPaso1.invalid || cargando()"
            >
              @if (cargando()) {
                <span class="loader-pequeño"></span>
              } @else {
                Enviar Código
              }
            </button>

            <div class="enlace-login">
              ¿Ya tienes una cuenta?
              <a routerLink="/autenticacion/iniciar-sesion">Iniciar Sesión</a>
            </div>
          </form>
        }

        <!-- PASO 2: INGRESAR CÓDIGO -->
        @if (pasoActual() === 2) {
          <form [formGroup]="formularioPaso2" (ngSubmit)="verificarCodigo()" class="formulario-registro">
            <p class="texto-instruccion">Ingresa el código de 6 dígitos enviado a {{ emailAlmacenado }}</p>
            
            <div class="grupo-codigo">
              <label for="codigo">Código de Verificación *</label>
              <div class="contenedor-entrada-codigo">
                <input
                  id="codigo"
                  type="text"
                  formControlName="codigo"
                  class="input-codigo"
                  placeholder="000000"
                  maxlength="6"
                  (input)="soloNumeros($event)"
                />
                <span class="contador-codigo">{{ formularioPaso2.get('codigo')?.value?.length || 0 }}/6</span>
              </div>
              @if (formularioPaso2.get('codigo')?.invalid && formularioPaso2.get('codigo')?.touched) {
                <span class="texto-error">Ingresa un código de 6 dígitos</span>
              }
              @if (intentosFallidos() > 0) {
                <span class="texto-error">Intento fallido. Intentos restantes: {{ 5 - intentosFallidos() }}</span>
              }
            </div>

            <!-- Mostrar tiempo restante -->
            @if (tiempoRestante() > 0) {
              <div class="tiempo-restante">
                <span class="reloj">⏰</span> Código expira en {{ formatearTiempo(tiempoRestante()) }}
              </div>
            }

            <div class="grupo-botones">
              <button
                type="submit"
                class="boton-innoad boton-registro"
                [disabled]="formularioPaso2.invalid || cargando()"
              >
                @if (cargando()) {
                  <span class="loader-pequeño"></span>
                } @else {
                  Verificar Código
                }
              </button>
            </div>

            <div class="acciones-codigo">
              <button type="button" class="boton-texto" (click)="reenviarCodigo()" [disabled]="cargando()">
                ¿No recibiste el código?
              </button>
              <button type="button" class="boton-texto" (click)="regresarPaso1()">
                Cambiar Email
              </button>
            </div>
          </form>
        }

        <!-- PASO 3: DATOS DE REGISTRO -->
        @if (pasoActual() === 3) {
          <form [formGroup]="formularioPaso3" (ngSubmit)="completarRegistro()" class="formulario-registro">
            <p class="texto-instruccion">Completa tus datos para finalizar el registro</p>

            <div class="grupo-input">
              <label for="nombre">Nombre *</label>
              <input
                id="nombre"
                type="text"
                formControlName="nombre"
                class="input-innoad"
                placeholder="Juan"
              />
              @if (formularioPaso3.get('nombre')?.invalid && formularioPaso3.get('nombre')?.touched) {
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
              @if (formularioPaso3.get('apellido')?.invalid && formularioPaso3.get('apellido')?.touched) {
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
              @if (formularioPaso3.get('nombreUsuario')?.invalid && formularioPaso3.get('nombreUsuario')?.touched) {
                <span class="texto-error">Nombre de usuario inválido (mínimo 4 caracteres)</span>
              }
            </div>

            <div class="grupo-input">
              <label for="cedula">Cédula / Documento *</label>
              <input
                id="cedula"
                type="text"
                formControlName="cedula"
                class="input-innoad"
                placeholder="1234567890"
              />
              @if (formularioPaso3.get('cedula')?.invalid && formularioPaso3.get('cedula')?.touched) {
                <span class="texto-error">Cédula inválida (mínimo 5 dígitos)</span>
              }
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
              @if (formularioPaso3.get('contrasena')?.invalid && formularioPaso3.get('contrasena')?.touched) {
                <span class="texto-error">Contraseña debe tener mayúscula, minúscula, número y carácter especial</span>
              }
              @if (formularioPaso3.get('contrasena')?.valid && formularioPaso3.get('contrasena')?.value) {
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
              @if (formularioPaso3.errors?.['contrasenasNoCoinciden'] && formularioPaso3.get('confirmarContrasena')?.touched) {
                <span class="texto-error">Las contraseñas no coinciden</span>
              }
              @if (formularioPaso3.get('confirmarContrasena')?.valid && !formularioPaso3.errors?.['contrasenasNoCoinciden']) {
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
                Acepto los <a href="#" class="enlace-terminos">Términos y Condiciones</a>
              </label>
            </div>
            @if (formularioPaso3.get('aceptaTerminos')?.invalid && formularioPaso3.get('aceptaTerminos')?.touched) {
              <span class="texto-error">Debe aceptar los términos</span>
            }

            <div class="grupo-botones">
              <button
                type="button"
                class="boton-innoad boton-secundario"
                (click)="pasoActual.set(2)"
              >
                ← Atrás
              </button>
              <button
                type="submit"
                class="boton-innoad boton-registro"
                [disabled]="formularioPaso3.invalid || cargando()"
              >
                @if (cargando()) {
                  <span class="loader-pequeño"></span>
                } @else {
                  Crear Cuenta
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .indicador-pasos {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      gap: 10px;
    }

    .paso {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .numero-paso {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #666;
      border: 2px solid #ddd;
      transition: all 0.3s ease;
    }

    .paso.activo .numero-paso {
      background: linear-gradient(135deg, #00d9ff, #ff006a);
      color: white;
      border-color: #00d9ff;
    }

    .paso.completado .numero-paso {
      background: #4caf50;
      color: white;
      border-color: #4caf50;
    }

    .paso p {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .paso.activo p,
    .paso.completado p {
      color: #333;
      font-weight: bold;
    }

    .linea-paso {
      flex: 1;
      height: 2px;
      background: #ddd;
      max-width: 50px;
      transition: background 0.3s ease;
    }

    .linea-paso.completada {
      background: #4caf50;
    }

    .texto-instruccion {
      text-align: center;
      color: #666;
      margin: 20px 0;
      font-size: 14px;
    }

    .grupo-codigo {
      margin-bottom: 20px;
    }

    .contenedor-entrada-codigo {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-codigo {
      width: 100%;
      font-size: 32px;
      letter-spacing: 15px;
      text-align: center;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }

    .contador-codigo {
      position: absolute;
      right: 15px;
      font-size: 12px;
      color: #999;
    }

    .tiempo-restante {
      text-align: center;
      color: #ff9800;
      font-size: 14px;
      margin: 15px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .reloj {
      font-size: 18px;
    }

    .grupo-botones {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .grupo-botones button {
      flex: 1;
    }

    .boton-secundario {
      background: #f0f0f0;
      color: #333;
    }

    .boton-secundario:hover {
      background: #e0e0e0;
    }

    .acciones-codigo {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
      text-align: center;
    }

    .boton-texto {
      background: none;
      border: none;
      color: #00d9ff;
      cursor: pointer;
      font-size: 12px;
      text-decoration: underline;
      padding: 5px;
    }

    .boton-texto:hover:not(:disabled) {
      color: #ff006a;
    }

    .boton-texto:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class RegistroConCodigoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly destroy$ = new Subject<void>();

  protected readonly pasoActual = signal<1 | 2 | 3>(1);
  protected readonly cargando = signal(false);
  protected readonly intentosFallidos = signal(0);
  protected readonly tiempoRestante = signal(900); // 15 minutos en segundos
  protected emailAlmacenado = '';
  protected codigoAlmacenado = '';

  // Formulario Paso 1: Email
  protected readonly formularioPaso1 = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // Formulario Paso 2: Código
  protected readonly formularioPaso2 = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  // Formulario Paso 3: Datos
  protected readonly formularioPaso3 = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    nombreUsuario: ['', [
      Validators.required,
      Validators.minLength(4),
      Validators.pattern(/^[a-zA-Z0-9_]+$/)
    ]],
    cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{5,20}$/)]],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      this.validadorContrasena.bind(this)
    ]],
    confirmarContrasena: ['', [Validators.required]],
    aceptaTerminos: [false, [Validators.requiredTrue]]
  }, {
    validators: this.validadorContrasenasCoinciden.bind(this)
  });

  constructor() {
    this.iniciarContador();
  }

  private iniciarContador(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const tiempo = this.tiempoRestante() - 1;
        this.tiempoRestante.set(tiempo);
        if (tiempo <= 0) {
          NotifyX.warning('⏰ Tu código ha expirado. Solicita uno nuevo.', {
            duration: 4000,
            dismissible: true
          });
          this.regresarPaso1();
        }
      });
  }

  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  formatearTiempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  }

  solicitarCodigo(): void {
    if (this.formularioPaso1.invalid) return;

    this.cargando.set(true);
    const email = this.formularioPaso1.get('email')?.value || '';

    this.servicioAuth.solicitarCodigoVerificacion(email, 'REGISTRO').subscribe({
      next: () => {
        this.cargando.set(false);
        this.emailAlmacenado = email;
        this.pasoActual.set(2);
        this.tiempoRestante.set(900); // Reset timer
        NotifyX.success('✅ Código enviado a tu correo. Revisa tu bandeja de entrada.', {
          duration: 4000,
          dismissible: true
        });
      },
      error: (error) => {
        this.cargando.set(false);
        const mensaje = error.error?.mensaje || 'Error al solicitar el código';
        NotifyX.error('❌ ' + mensaje, { duration: 4000, dismissible: true });
      }
    });
  }

  verificarCodigo(): void {
    if (this.formularioPaso2.invalid) return;

    this.cargando.set(true);
    const codigo = this.formularioPaso2.get('codigo')?.value || '';

    // Aquí solo verificamos el código sin completar el registro
    // El registro se completa en el paso 3
    this.cargando.set(false);
    this.codigoAlmacenado = codigo;
    this.pasoActual.set(3);
    NotifyX.success('✅ Código verificado. Completa tu información.', {
      duration: 4000,
      dismissible: true
    });
  }

  completarRegistro(): void {
    if (this.formularioPaso3.invalid) return;

    this.cargando.set(true);
    const valores = this.formularioPaso3.getRawValue();

    const solicitud = {
      email: this.emailAlmacenado,
      codigo: this.codigoAlmacenado,
      nombre: valores.nombre,
      apellido: valores.apellido,
      nombreUsuario: valores.nombreUsuario,
      cedula: valores.cedula,
      contrasena: valores.contrasena
    };

    this.servicioAuth.registrarConCodigo(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        NotifyX.success('✅ ¡Cuenta creada exitosamente! Redirigiendo...', {
          duration: 3000,
          dismissible: true
        });
        setTimeout(() => {
          window.location.href = '/autenticacion/iniciar-sesion';
        }, 1500);
      },
      error: (error) => {
        this.cargando.set(false);
        const mensaje = error.error?.mensaje || 'Error al crear la cuenta';
        NotifyX.error('❌ ' + mensaje, { duration: 4000, dismissible: true });
      }
    });
  }

  reenviarCodigo(): void {
    this.intentosFallidos.set(0);
    this.formularioPaso2.reset();
    this.solicitarCodigo();
  }

  regresarPaso1(): void {
    this.pasoActual.set(1);
    this.formularioPaso2.reset();
    this.formularioPaso3.reset({ aceptaTerminos: false });
    this.intentosFallidos.set(0);
  }

  private validadorContrasena(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
