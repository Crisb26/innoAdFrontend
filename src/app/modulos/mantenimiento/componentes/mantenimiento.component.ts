import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./mantenimiento.component.scss'],
  template: `
    <div class="contenedor-mantenimiento">
      <div class="fondo-animado">
        <div class="circulo circulo-1"></div>
        <div class="circulo circulo-2"></div>
        <div class="circulo circulo-3"></div>
      </div>

      <div class="tarjeta-mantenimiento">
        <div class="logo-animado">
          <svg class="icono-engranaje" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m4.22-13a10 10 0 0 1 0 14M7.78 3a10 10 0 0 0 0 14m9.9-11.31 4.24-4.24m-14.14 0L3.54 5.69m14.14 14.14 4.24 4.24m-14.14 0-4.24-4.24"></path>
          </svg>
          <div class="logo-texto">
            <h1>InnoAd</h1>
          </div>
        </div>

        <h2 class="titulo-principal">Sistema en Mantenimiento</h2>
        <p class="mensaje-principal">Estamos realizando mejoras para ofrecerte una mejor experiencia</p>

        <div class="barra-progreso">
          <div class="barra-progreso-fill"></div>
        </div>

        <div class="info-contacto">
          <p class="subtexto">Tiempo estimado: 30 minutos</p>
          <div class="contacto-items">
            <div class="contacto-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>soporte&#64;innoad.com</span>
            </div>
            <div class="contacto-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>

        <p class="mensaje-final">Gracias por tu paciencia</p>
      </div>
    </div>
  `
})
export class MantenimientoComponent {}

