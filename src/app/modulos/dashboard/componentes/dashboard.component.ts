import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { ServicioEstadisticas } from '@core/servicios/estadisticas.servicio';
import { MetricaKPI } from '@core/modelos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="contenedor-dashboard">
      <header class="encabezado-dashboard">
        <div class="info-usuario">
          <h1 class="saludo">¡Hola, {{ usuarioNombre() }}!</h1>
          <p class="subtitulo">Bienvenido al sistema InnoAd</p>
        </div>
        <button (click)="cerrarSesion()" class="boton-innoad boton-cerrar">
          Cerrar Sesión
        </button>
      </header>

      @if (cargando()) {
        <div class="loader"></div>
      } @else {
        <div class="grid-metricas">
          @for (metrica of metricas(); track metrica.nombre) {
            <div class="tarjeta-innoad tarjeta-metrica">
              <div class="icono-metrica" [style.color]="metrica.color">
                {{ metrica.icono }}
              </div>
              <div class="contenido-metrica">
                <h3>{{ metrica.nombre }}</h3>
                <p class="valor-metrica">{{ metrica.valor }} {{ metrica.unidad }}</p>
                <span class="variacion" [class.positiva]="metrica.variacion > 0">
                  {{ metrica.variacion > 0 ? '↑' : '↓' }} {{ metrica.variacion }}%
                </span>
              </div>
            </div>
          }
        </div>

        <div class="seccion-accesos-rapidos">
          <h2 class="titulo-seccion">Accesos Rápidos</h2>
          <div class="grid-accesos">
            <a routerLink="/campanas" class="tarjeta-innoad tarjeta-acceso">
              <svg class="icono-acceso" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <h3>Campanas</h3>
              <p>Gestionar campanas publicitarias</p>
            </a>
            <a routerLink="/pantallas" class="tarjeta-innoad tarjeta-acceso">
              <svg class="icono-acceso" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <h3>Pantallas</h3>
              <p>Administrar dispositivos</p>
            </a>
            <a routerLink="/contenidos" class="tarjeta-innoad tarjeta-acceso">
              <svg class="icono-acceso" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <h3>Contenidos</h3>
              <p>Biblioteca de medios</p>
            </a>
            <a routerLink="/reportes" class="tarjeta-innoad tarjeta-acceso">
              <svg class="icono-acceso" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <h3>Reportes</h3>
              <p>Estadísticas y análisis</p>
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .encabezado-dashboard {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }

    .saludo {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #f7fafc;
    }

    .subtitulo {
      color: #718096;
    }

    .boton-cerrar {
      background: transparent;
      border: 2px solid #ff4444;
      color: #ff4444;
    }

    .boton-cerrar:hover {
      background: #ff4444;
      color: white;
    }

    .grid-metricas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .tarjeta-metrica {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .icono-metrica {
      font-size: 3rem;
    }

    .contenido-metrica h3 {
      color: #b4b8d0;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .valor-metrica {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .variacion {
      font-size: 0.9rem;
      color: #ff4444;
    }

    .variacion.positiva {
      color: #00ff88;
    }

    .seccion-accesos-rapidos {
      margin-top: 3rem;
    }

    .grid-accesos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .tarjeta-acceso {
      text-align: center;
      padding: 2.5rem;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .icono-acceso {
      width: 48px;
      height: 48px;
      display: block;
      margin: 0 auto 1rem auto;
      color: #667eea;
      transition: all 0.3s ease;
    }

    .tarjeta-acceso:hover .icono-acceso {
      color: #00d9ff;
      transform: scale(1.1);
    }

    .tarjeta-acceso h3 {
      margin-bottom: 0.5rem;
    }

    .tarjeta-acceso p {
      color: #b4b8d0;
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly servicioAuth = inject(ServicioAutenticacion);
  private readonly servicioEstadisticas = inject(ServicioEstadisticas);

  protected readonly cargando = signal(true);
  protected readonly usuarioNombre = signal('Usuario');
  protected readonly metricas = signal<MetricaKPI[]>([]);

  ngOnInit(): void {
    const usuario = this.servicioAuth.usuarioActual();
    if (usuario) {
      this.usuarioNombre.set(usuario.nombreCompleto);
    }

    this.cargarEstadisticas();
  }

  private cargarEstadisticas(): void {
    this.servicioEstadisticas.obtenerGenerales().subscribe({
      next: (stats) => {
        this.metricas.set([
          {
            nombre: 'Campanas Activas',
            valor: stats.campanasActivas,
            unidad: '',
            variacion: 12,
            tendencia: 'subiendo',
            icono: '▲',
            color: '#667eea'
          },
          {
            nombre: 'Pantallas Conectadas',
            valor: stats.pantallasConectadas,
            unidad: '',
            variacion: 8,
            tendencia: 'subiendo',
            icono: '●',
            color: '#764ba2'
          },
          {
            nombre: 'Impresiones Totales',
            valor: stats.impresionesTotales,
            unidad: 'K',
            variacion: 15,
            tendencia: 'subiendo',
            icono: '◆',
            color: '#00d9ff'
          },
          {
            nombre: 'Tasa de Éxito',
            valor: stats.tasaExito,
            unidad: '%',
            variacion: 5,
            tendencia: 'subiendo',
            icono: '■',
            color: '#00ff88'
          }
        ]);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  protected cerrarSesion(): void {
    this.servicioAuth.cerrarSesion();
  }
}
