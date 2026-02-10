import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { GuiaServicio } from '@core/servicios/guia.servicio';
import { SolicitudLogin } from '@core/modelos';
import NotifyX from 'notifyx';

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
          <button
            type="button"
            title="Mostrar guía"
            style="position:absolute;right:12px;top:12px;width:36px;height:36px;border-radius:50%;border:none;background:#007bff;color:#fff;font-weight:bold;"
            (click)="iniciarGuia()"
          >?</button>
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
  private readonly guia = inject(GuiaServicio);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    nombreUsuarioOEmail: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
    recordarme: [false]
  });

  iniciarSesion(): void {
    if (this.formulario.invalid) return;

    this.cargando.set(true);

    const solicitud: SolicitudLogin = this.formulario.getRawValue();

    this.servicioAuth.iniciarSesion(solicitud).subscribe({
      next: (respuesta) => {
        console.log('Login exitoso, navegando a dashboard...', respuesta);
        this.cargando.set(false);
        
        // Obtener el rol del usuario para mostrar en el mensaje
        const rol = this.obtenerNombreRol(respuesta.usuario.rol);
        
        // Navegar al dashboard después de un breve delay para asegurar que todo se guarde
        setTimeout(() => {
          this.router.navigate(['/dashboard']).then(navegado => {
            console.log('✅ Navegación completada:', navegado);
            
            // Mostrar notificación verde de bienvenida con el rol
            NotifyX.success(`🎉 ¡Bienvenido! Iniciaste sesión como ${rol}`, {
              duration: 4000,
              dismissible: true
            });
          }).catch(error => {
            console.error('❌ Error al navegar:', error);
            NotifyX.error('Error al acceder al dashboard', {
              duration: 3000,
              dismissible: true
            });
          });
        }, 100);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.cargando.set(false);
        
        // Detectar tipo de error y mostrar mensaje específico
        const mensajeError = this.detectarTipoError(error);
        
        NotifyX.error(mensajeError, {
          duration: 4000,
          dismissible: true
        });
      }
    });
  }

  iniciarGuia(): void {
    const steps = [
      { element: '#nombreUsuarioOEmail', intro: 'Ingresa tu correo o nombre de usuario aquí.' },
      { element: '#contrasena', intro: 'Introduce tu contraseña. Usa las credenciales offline si el backend está apagado.' },
      { element: '.boton-login', intro: 'Haz clic aquí para iniciar sesión.' },
      { intro: 'Si necesitas crear una cuenta, usa el enlace "Crear cuenta nueva".' }
    ];

    this.guia.startTour(steps);
  }

  /**
   * Obtiene el nombre del rol desde el objeto rol
   */
  private obtenerNombreRol(rol: any): string {
    if (!rol) return 'Usuario';
    
    // Si el rol es un objeto con propiedad nombre
    if (typeof rol === 'object' && rol.nombre) {
      return this.formatearNombreRol(rol.nombre);
    }
    
    // Si el rol es un string directo
    if (typeof rol === 'string') {
      return this.formatearNombreRol(rol);
    }
    
    return 'Usuario';
  }

  /**
   * Formatea el nombre del rol para mostrar correctamente
   */
  private formatearNombreRol(nombre: string): string {
    // Convertir a título apropiado
    const rolesMap: { [key: string]: string } = {
      'administrador': 'Administrador',
      'admin': 'Administrador',
      'developer': 'Developer',
      'desarrollador': 'Developer',
      'tecnico': 'Técnico',
      'técnico': 'Técnico',
      'usuario': 'Usuario',
      'user': 'Usuario'
    };
    
    const nombreLower = nombre.toLowerCase();
    return rolesMap[nombreLower] || nombre;
  }

  /**
   * Detecta el tipo de error y retorna un mensaje específico
   */
  private detectarTipoError(error: any): string {
    console.log('Analizando error:', error);

    // 1️⃣ Error de conexión (No hay conexión con backend)
    if (!error.status || error.status === 0) {
      if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        return '⏱️ Conexión agotada. El servidor tarda demasiado en responder. Intenta nuevamente.';
      }
      return '🌐 No hay conexión con el servidor. Verifica tu conexión a internet.';
    }

    // 2️⃣ Error 401 (Credenciales incorrectas)
    if (error.status === 401) {
      return '🔒 Las credenciales son incorrectas. Verifica tu usuario y contraseña.';
    }

    // 3️⃣ Error 403 (Prohibido - Usuario inactivo o sin permisos)
    if (error.status === 403) {
      return '🚫 Tu cuenta está desactivada o no tienes permisos. Contacta al administrador.';
    }

    // 4️⃣ Error 404 (Usuario no encontrado)
    if (error.status === 404) {
      return '👤 Usuario no encontrado. Verifica que el usuario exista.';
    }

    // 5️⃣ Error 429 (Demasiados intentos)
    if (error.status === 429) {
      return '⏸️ Demasiados intentos fallidos. Intenta más tarde.';
    }

    // 6️⃣ Error 500+ (Error del servidor)
    if (error.status && error.status >= 500) {
      return '⚠️ Error del servidor. Por favor, intenta más tarde.';
    }

    // 7️⃣ Mensaje personalizado del backend (si viene en error.error.mensaje)
    if (error.error?.mensaje) {
      return error.error.mensaje;
    }

    // 8️⃣ Mensaje de error genérico
    if (error.message) {
      return error.message;
    }

    return '❌ Error al iniciar sesión. Intenta nuevamente.';
  }
}
