import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-verificacion">
      <div class="tarjeta-verificacion">
        @if (cargando()) {
          <div class="estado-cargando">
            <div class="spinner"></div>
            <h2>Verificando tu email...</h2>
            <p>Por favor espera un momento</p>
          </div>
        } @else if (exitoso()) {
          <div class="estado-exitoso">
            <div class="icono-exito">✓</div>
            <h2>¡Email verificado correctamente!</h2>
            <p>Tu cuenta ha sido activada exitosamente.</p>
            <p>Ahora puedes iniciar sesión en la plataforma.</p>
            <button class="boton-innoad" routerLink="/autenticacion/iniciar-sesion">
              Iniciar Sesión
            </button>
          </div>
        } @else {
          <div class="estado-error">
            <div class="icono-error">✕</div>
            <h2>Error al verificar email</h2>
            <p class="mensaje-error">{{ mensajeError() }}</p>
            <div class="acciones">
              <button class="boton-innoad boton-secundario" routerLink="/autenticacion/registrarse">
                Registrarse nuevamente
              </button>
              <button class="boton-innoad" routerLink="/autenticacion/iniciar-sesion">
                Iniciar Sesión
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .contenedor-verificacion {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    }

    .tarjeta-verificacion {
      background: rgba(26, 31, 58, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem;
      width: 100%;
      max-width: 500px;
      border: 1px solid rgba(0, 217, 255, 0.2);
      box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
      text-align: center;
    }

    .estado-cargando,
    .estado-exitoso,
    .estado-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(0, 217, 255, 0.2);
      border-top-color: #00d9ff;
      border-radius: 50%;
      animation: girar 1s linear infinite;
    }

    @keyframes girar {
      to { transform: rotate(360deg); }
    }

    .icono-exito {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d975, #00d9ff);
      color: white;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .icono-error {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff006a, #ff4444);
      color: white;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    h2 {
      color: #ffffff;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
    }

    p {
      color: #b4b8d0;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }

    .mensaje-error {
      color: #ff4444;
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid rgba(255, 68, 68, 0.3);
      padding: 1rem;
      border-radius: 8px;
    }

    .acciones {
      display: flex;
      gap: 1rem;
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .contenedor-verificacion {
        padding: 1rem;
      }

      .tarjeta-verificacion {
        padding: 2rem 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      .acciones {
        flex-direction: column;
      }

      .acciones button {
        width: 100%;
      }
    }
  `]
})
export class VerificarEmailComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly cargando = signal(true);
  protected readonly exitoso = signal(false);
  protected readonly mensajeError = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.cargando.set(false);
      this.mensajeError.set('Token de verificación no proporcionado');
      return;
    }

    this.verificar(token);
  }

  private verificar(token: string): void {
    this.servicioAuth.verificarEmail(token).subscribe({
      next: () => {
        this.cargando.set(false);
        this.exitoso.set(true);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError.set(
          error.message ||
          'El token es inválido o ha expirado. Por favor, solicita un nuevo enlace de verificación.'
        );
      }
    });
  }
}
