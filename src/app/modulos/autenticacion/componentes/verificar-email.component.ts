import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./verificar-email.component.scss'],
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
  `
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
