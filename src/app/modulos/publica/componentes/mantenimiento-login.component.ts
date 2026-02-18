import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import NotifyX from 'notifyx';

@Component({
  selector: 'app-mantenimiento-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./mantenimiento-login.component.scss'],
  template: `
    <div class="contenedor-mantenimiento">
      <div class="fondo-animado">
        <div class="bola bola-1"></div>
        <div class="bola bola-2"></div>
        <div class="bola bola-3"></div>
      </div>

      <div class="contenido-mantenimiento">
        <div class="header-mantenimiento">
          <div class="logo-mantenimiento">[]�</div>
          <h1>Modo Mantenimiento</h1>
          <p class="subtitulo">El sistema está en mantenimiento programado</p>
        </div>

        <div class="info-mantenimiento">
          <div class="icono-info">⚙[]</div>
          <h2>Estamos mejorando tu experiencia</h2>
          <p>Realizamos actualizaciones importantes para ofrecerte un mejor servicio.</p>
          <p class="tiempo-estimado">Tiempo estimado: 2-4 horas</p>
        </div>

        <div class="formulario-acceso">
          <h3>Acceso Administrativo</h3>
          
          <div class="grupo-input">
            <label>Contraseña Administrativa</label>
            <input 
              type="password"
              [(ngModel)]="contrasena"
              (keyup.enter)="verificarAcceso()"
              placeholder="Ingresa la contraseña"
              class="entrada-contrasena"
              [disabled]="cargando()"
            >
          </div>

          <button 
            (click)="verificarAcceso()"
            [disabled]="!contrasena || cargando()"
            class="boton-acceso"
          >
            @if (cargando()) {
              <span class="spinner-pequeno"></span>
              Verificando...
            } @else {
              Acceder al Panel
            }
          </button>
        </div>

        <div class="info-adicional">
          <div class="item-info">
            <span class="icono">[]�</span>
            <p>Te notificaremos cuando el sistema esté disponible</p>
          </div>
          <div class="item-info">
            <span class="icono">[]�</span>
            <p>Puedes revisar el estado en nuestras redes sociales</p>
          </div>
          <div class="item-info">
            <span class="icono">⏰</span>
            <p>Vuelve a intentar en unos momentos</p>
          </div>
        </div>

        <div class="footer-mantenimiento">
          <p>© 2025 InnoAd - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  `
})
export class MantenimientoLoginComponent {
  private router = inject(Router);
  
  contrasena = '';
  cargando = signal(false);
  
  // Contraseña: 93022611184
  CONTRASENA_CORRECTA = '93022611184';

  verificarAcceso() {
    if (this.contrasena !== this.CONTRASENA_CORRECTA) {
      NotifyX.error('Contraseña incorrecta', {
        duration: 3000,
        dismissible: true
      });
      return;
    }

    this.cargando.set(true);
    
    setTimeout(() => {
      localStorage.setItem('admin_mantenimiento', 'true');
      NotifyX.success('Acceso concedido', {
        duration: 2000,
        dismissible: true
      });
      
      setTimeout(() => {
        this.router.navigate(['/admin']);
        this.cargando.set(false);
      }, 500);
    }, 1000);
  }
}
