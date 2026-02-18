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
  selector: 'app-recuperar-contrasena-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrls: ['./recuperar-contrasena.component.scss'],
  template: `
    <div class="contenedor-recuperacion">
      <div class="tarjeta-recuperacion">
        <!-- ENCABEZADO -->
        <div class="encabezado-recuperacion">
          <h1 class="titulo-recuperacion">Recuperar Contraseña</h1>
          <p class="subtitulo-recuperacion">Recupera el acceso a tu cuenta en 3 pasos</p>

          <!-- Indicador de pasos similar al registro -->
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
              <p>Nueva Contraseña</p>
            </div>
          </div>
        </div>

        <!-- PASO 1: SOLICITAR CÓDIGO -->
        @if (pasoActual() === 1) {
          <form [formGroup]="formularioPaso1" (ngSubmit)="solicitarCodigo()" class="formulario-recuperacion">
            <p class="texto-instruccion">Ingresa el correo electrónico asociado a tu cuenta</p>

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
              class="boton-innoad boton-recuperacion"
              [disabled]="formularioPaso1.invalid || cargando()"
            >
              @if (cargando()) {
                <span class="loader-pequeño"></span>
              } @else {
                Enviar Código
              }
            </button>

            <div class="enlace-login">
              Recuerda tu contraseña?
              <a routerLink="/autenticacion/iniciar-sesion">Inicia Sesión</a>
            </div>
          </form>
        }

        <!-- PASO 2: INGRESAR CÓDIGO -->
        @if (pasoActual() === 2) {
          <form [formGroup]="formularioPaso2" (ngSubmit)="verificarCodigo()" class="formulario-recuperacion">
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
                class="boton-innoad boton-recuperacion"
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

        <!-- PASO 3: NUEVA CONTRASEÑA -->
        @if (pasoActual() === 3) {
          <form [formGroup]="formularioPaso3" (ngSubmit)="finalizarRecuperacion()" class="formulario-recuperacion">
            <p class="texto-instruccion">Ingresa tu nueva contraseña</p>

            <div class="grupo-input">
              <label for="contrasenaNueva">Nueva Contraseña *</label>
              <input
                id="contrasenaNueva"
                type="password"
                formControlName="contrasenaNueva"
                class="input-innoad"
                placeholder="••••••••"
              />
              @if (formularioPaso3.get('contrasenaNueva')?.invalid && formularioPaso3.get('contrasenaNueva')?.touched) {
                <span class="texto-error">Contraseña debe tener mayúscula, minúscula, número y carácter especial</span>
              }
              @if (formularioPaso3.get('contrasenaNueva')?.valid && formularioPaso3.get('contrasenaNueva')?.value) {
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
                class="boton-innoad boton-recuperacion"
                [disabled]="formularioPaso3.invalid || cargando()"
              >
                @if (cargando()) {
                  <span class="loader-pequeño"></span>
                } @else {
                  Guardar Nueva Contraseña
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .contenedor-recuperacion {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    }

    .tarjeta-recuperacion {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      padding: 40px;
      max-width: 500px;
      width: 100%;
    }

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
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
      color: #ff006a;
      border-color: #ff006a;
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
      color: #ff006a;
      cursor: pointer;
      font-size: 12px;
      text-decoration: underline;
      padding: 5px;
    }

    .boton-texto:hover:not(:disabled) {
      color: #00d9ff;
    }

    .boton-texto:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class RecuperarContraseñaCodigoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly destroy$ = new Subject<void>();

  protected readonly pasoActual = signal<1 | 2 | 3>(1);
  protected readonly cargando = signal(false);
  protected readonly intentosFallidos = signal(0);
  protected readonly tiempoRestante = signal(900); // 15 minutos
  protected emailAlmacenado = '';
  protected codigoAlmacenado = '';

  // Formularios
  protected readonly formularioPaso1 = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly formularioPaso2 = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  protected readonly formularioPaso3 = this.fb.nonNullable.group({
    contrasenaNueva: ['', [
      Validators.required,
      Validators.minLength(8),
      this.validadorContrasena.bind(this)
    ]],
    confirmarContrasena: ['', [Validators.required]]
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

    this.servicioAuth.solicitarCodigoVerificacion(email, 'RECUPERACION').subscribe({
      next: () => {
        this.cargando.set(false);
        this.emailAlmacenado = email;
        this.pasoActual.set(2);
        this.tiempoRestante.set(900);
        this.iniciarContador();
        NotifyX.success('✅ Código enviado a tu correo.', {
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

    this.cargando.set(false);
    const codigo = this.formularioPaso2.get('codigo')?.value || '';
    this.codigoAlmacenado = codigo;
    this.pasoActual.set(3);
    NotifyX.success('✅ Código verificado. Ingresa tu nueva contraseña.', {
      duration: 4000,
      dismissible: true
    });
  }

  finalizarRecuperacion(): void {
    if (this.formularioPaso3.invalid) return;

    this.cargando.set(true);
    const valores = this.formularioPaso3.getRawValue();

    const solicitud = {
      email: this.emailAlmacenado,
      codigo: this.codigoAlmacenado,
      contrasenaNueva: valores.contrasenaNueva
    };

    this.servicioAuth.recuperarContraseñaConCodigo(solicitud).subscribe({
      next: () => {
        this.cargando.set(false);
        NotifyX.success('✅ Contraseña actualizada exitosamente. Redirigiendo...', {
          duration: 3000,
          dismissible: true
        });
        setTimeout(() => {
          window.location.href = '/autenticacion/iniciar-sesion';
        }, 1500);
      },
      error: (error) => {
        this.cargando.set(false);
        const mensaje = error.error?.mensaje || 'Error al actualizar la contraseña';
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
    this.formularioPaso3.reset();
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
    const contrasena = control.get('contrasenaNueva')?.value;
    const confirmar = control.get('confirmarContrasena')?.value;

    if (!contrasena || !confirmar) return null;

    return contrasena === confirmar ? null : { contrasenasNoCoinciden: true };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
