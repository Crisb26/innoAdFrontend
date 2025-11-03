import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServicioAutenticacion } from '@core/servicios/autenticacion.servicio';
import { ServicioEstadisticas } from '@core/servicios/estadisticas.servicio';
import { EstadisticasGenerales, MetricaKPI } from '@core/modelos';

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
              <span class="icono-acceso">📢</span>
              <h3>Campanas</h3>
              <p>Gestionar campanas publicitarias</p>
            </a>
            <a routerLink="/pantallas" class="tarjeta-innoad tarjeta-acceso">
              <span class="icono-acceso">📺</span>
              <h3>Pantallas</h3>
              <p>Administrar dispositivos</p>
            </a>
            <a routerLink="/contenidos" class="tarjeta-innoad tarjeta-acceso">
              <span class="icono-acceso">🎨</span>
              <h3>Contenidos</h3>
              <p>Biblioteca de medios</p>
            </a>
            <a routerLink="/reportes" class="tarjeta-innoad tarjeta-acceso">
              <span class="icono-acceso">📊</span>
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
    }

    .subtitulo {
      color: #b4b8d0;
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
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
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
            icono: '📢',
            color: '#00d9ff'
          },
          {
            nombre: 'Pantallas Conectadas',
            valor: stats.pantallasConectadas,
            unidad: '',
            variacion: 8,
            tendencia: 'subiendo',
            icono: '📺',
            color: '#ff006a'
          },
          {
            nombre: 'Impresiones Totales',
            valor: stats.impresionesTotales,
            unidad: 'K',
            variacion: 15,
            tendencia: 'subiendo',
            icono: '👁️',
            color: '#00ff88'
          },
          {
            nombre: 'Tasa de Éxito',
            valor: stats.tasaExito,
            unidad: '%',
            variacion: 5,
            tendencia: 'subiendo',
            icono: '📈',
            color: '#ffaa00'
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
