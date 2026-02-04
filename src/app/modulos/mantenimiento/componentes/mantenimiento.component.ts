import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioMantenimiento } from '../../../core/servicios/mantenimiento.servicio';

interface InfoMantenimiento {
  activo: boolean;
  mensaje: string;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: 'EMERGENCIA' | 'PROGRAMADO' | 'CRITICA';
  urlContacto: string;
  tiempoRestante: string;
}

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./mantenimiento.component.scss'],
  template: `
    <div class="contenedor-mantenimiento" [class]="'tipo-' + info.tipoMantenimiento.toLowerCase()">
      <!-- Fondo Animado -->
      <div class="fondo-animado">
        <div class="particulas">
          <div class="particula" *ngFor="let p of particulas"></div>
        </div>
        <svg class="fondo-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)"/>
        </svg>
      </div>

      <!-- Contenido Principal -->
      <div class="contenido-principal">
        
        <!-- Icono/Badge de Tipo -->
        <div class="badge-tipo" [class]="'badge-' + info.tipoMantenimiento.toLowerCase()">
          <span class="icono">
            {{ info.tipoMantenimiento === 'EMERGENCIA' ? '⚡' : 
               info.tipoMantenimiento === 'CRITICA' ? '⚠️' : '🔧' }}
          </span>
          <span class="texto">{{ info.tipoMantenimiento }}</span>
        </div>

        <!-- Logo Animado -->
        <div class="logo-animado">
          <svg class="engranajes-rotando" width="200" height="200" viewBox="0 0 200 200">
            <!-- Engranaje principal -->
            <g class="engranaje principal">
              <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="3"/>
              <circle cx="100" cy="100" r="8" fill="currentColor"/>
              <g class="dientes">
                <rect x="95" y="40" width="10" height="15" rx="2"/>
                <rect x="95" y="145" width="10" height="15" rx="2"/>
                <rect x="40" y="95" width="15" height="10" rx="2"/>
                <rect x="145" y="95" width="15" height="10" rx="2"/>
              </g>
            </g>
            
            <!-- Engranajes secundarios -->
            <g class="engranaje secundario-1" transform="translate(140, 70)">
              <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="0" cy="0" r="5" fill="currentColor"/>
            </g>
            <g class="engranaje secundario-2" transform="translate(60, 140)">
              <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="2"/>
              <circle cx="0" cy="0" r="5" fill="currentColor"/>
            </g>
          </svg>
          <div class="logo-innoad">InnoAd</div>
        </div>

        <!-- Título Principal -->
        <h1 class="titulo-principal">
          Sistema en Mantenimiento
        </h1>

        <!-- Mensaje Personalizado -->
        <p class="mensaje-personalizado">{{ info.mensaje }}</p>

        <!-- Información de Tiempo -->
        <div class="info-tiempo">
          <div class="tiempo-item">
            <span class="label">Inicio:</span>
            <span class="valor">{{ info.fechaInicio | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="separador">•</div>
          <div class="tiempo-item">
            <span class="label">Fin:</span>
            <span class="valor">{{ info.fechaFin | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>
        </div>

        <!-- Barra de Progreso -->
        <div class="barra-progreso-contenedor">
          <div class="barra-progreso">
            <div class="barra-relleno" [style.width]="calcularProgreso() + '%'"></div>
          </div>
          <div class="tiempo-restante">{{ info.tiempoRestante }}</div>
        </div>

        <!-- Contacto de Soporte -->
        <div class="seccion-soporte">
          <div class="titulo-soporte">¿Necesitas ayuda?</div>
          <a [href]="'mailto:' + info.urlContacto" class="enlace-soporte">
            📧 {{ info.urlContacto }}
          </a>
          <div class="soporte-disponible">Disponible 24/7</div>
        </div>

        <!-- Mensaje Final -->
        <p class="mensaje-final">✨ Volveremos más fuertes ✨</p>
      </div>
    </div>
  `
})
export class MantenimientoComponent implements OnInit {
  private servicioMantenimiento = inject(ServicioMantenimiento);
  
  particulas = Array.from({ length: 8 }, (_, i) => i);

  info: InfoMantenimiento = {
    activo: true,
    mensaje: 'Estamos mejorando nuestro sistema',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    tipoMantenimiento: 'PROGRAMADO',
    urlContacto: 'soporte&#64;innoad.com',
    tiempoRestante: '2 horas'
  };

  ngOnInit() {
    this.cargarInfoMantenimiento();
    // Actualizar tiempo cada minuto
    setInterval(() => this.actualizarTiempoRestante(), 60000);
  }

  cargarInfoMantenimiento() {
    this.servicioMantenimiento.obtenerInformacion().subscribe({
      next: (response: any) => {
        const datos = response.datos;
        this.info = {
          activo: datos.modoMantenimientoActivo,
          mensaje: datos.mensajeMantenimiento,
          fechaInicio: datos.fechaInicioMantenimiento,
          fechaFin: datos.fechaFinEstimadaMantenimiento,
          tipoMantenimiento: datos.tipoMantenimiento || 'PROGRAMADO',
          urlContacto: datos.urlContactoSoporte,
          tiempoRestante: datos.tiempoRestante || 'Duración indefinida'
        };
      },
      error: (e) => {
        console.error('Error cargando mantenimiento:', e);
      }
    });
  }

  actualizarTiempoRestante() {
    this.servicioMantenimiento.obtenerInformacion().subscribe({
      next: (response: any) => {
        this.info.tiempoRestante = response.datos.tiempoRestante || 'Duración indefinida';
      }
    });
  }

  calcularProgreso(): number {
    const inicio = new Date(this.info.fechaInicio).getTime();
    const fin = new Date(this.info.fechaFin).getTime();
    const ahora = new Date().getTime();

    if (fin <= inicio) return 0;
    if (ahora >= fin) return 100;

    return Math.round(((ahora - inicio) / (fin - inicio)) * 100);
  }
}

